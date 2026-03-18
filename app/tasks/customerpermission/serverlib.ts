"use server";
import {
  IConnectionString,
  IConnectionStringWithFound,
  IConnectionStringWithDbPermission,
  IPermissionMapping,
  IServerPrincipal,
  IDatabasePrincipal,
  IDatabaseUserMapping,
  ICustomerSecurityGroup,
  CustomerSecurityGroupMetaData,
} from "./interfaces";
import { from, toArray, lastValueFrom, mergeMap, map, of, forkJoin } from "rxjs";
import { catchError, groupBy, reduce, tap } from "rxjs/operators";

type CombinedGroup = {
  Namespace: string;
  GroupName: string;
  Permission: string;
  clientIds: number[];
};

function normalizeClientIdsFromMeta(metadata: CustomerSecurityGroupMetaData): number[] {
  let clientIDList: string | undefined;

  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);
      clientIDList = parsed?.clientIDList;
    } catch {
      console.error("Failed to parse MetaData string:", metadata);
      return [];
    }
  } else {
    clientIDList = metadata.clientIDList;
  }

  if (!clientIDList) {
    console.warn("No clientIDList found in MetaData:", metadata);
    return [];
  }

  const clientArray = clientIDList
    .split(",")
    .map((id) => Number(id.trim()))
    .filter(Boolean);

  if (clientArray.length === 0) {
    console.warn("No valid Client IDs found in MetaData:", metadata);
    return [];
  }

  return clientArray;
}

export async function getAllMissingDbPermissions(
  customerdbserver: string,
  customerdb: string,
  serverinventory: string,
  selectedEnvironment: string,
  domainprefix: string,
  concurrency: number = 50
): Promise<IConnectionStringWithDbPermission[]> {
  const obs$ = from(
    getCustomerSecurityGroups<ICustomerSecurityGroup>(
      customerdbserver,
      customerdb,
      selectedEnvironment,
      domainprefix
    )
  ).pipe(
    // 1️⃣ log groups
    tap((groups) => {
      console.log("🔹 CustomerSecurityGroups count:", groups.length);
      console.log("🔹 Sample group:", groups[0]);
    }),

    // flatten groups
    mergeMap((groups) => from(groups)),

    groupBy(
      (g: ICustomerSecurityGroup) =>
        `${g.Namespace ?? ""}|${g.GroupName ?? ""}|${g.Permission ?? ""}`
    ),

    mergeMap((group$) =>
      group$.pipe(
        reduce(
          (acc: { ns?: string; gn?: string; perm?: string; ids: Set<number> }, curr) => {
            // set bucket identifiers if not set yet
            if (!acc.ns) acc.ns = curr.Namespace;
            if (!acc.gn) acc.gn = curr.GroupName;
            if (!acc.perm) acc.perm = curr.Permission;
            tap(() => console.log(curr.MetaData.clientIDList));

            const clientIds = normalizeClientIdsFromMeta(curr.MetaData);
            for (const id of clientIds) acc.ids.add(id);

            return acc;
          },
          {
            ns: undefined as string | undefined,
            gn: undefined as string | undefined,
            perm: undefined as string | undefined,
            ids: new Set<number>(),
          }
        ),
        // map reduced accumulator to CombinedGroup
        map(
          (acc) =>
            ({
              Namespace: acc.ns,
              GroupName: acc.gn,
              Permission: acc.perm,
              clientIds: Array.from(acc.ids),
            }) as CombinedGroup
        )
      )
    ),

    // 2️⃣ per group
    mergeMap((combined) => {
      // ✅ extract client IDs properly
      // const clientIDList =
      //   typeof group.MetaData === "string"
      //     ? JSON.parse(group.MetaData).clientIDList
      //     : group.MetaData?.clientIDList;

      // const clientIds = clientIDList.split(",").map(Number).filter(Boolean);

      // console.log("➡️ Processing group with clientIds:", {
      //   GroupName: group.GroupName,
      //   clientIds,
      //   Namespace: group.Namespace,
      //   Permission: group.Permission,
      // });

      // ✅ MUST return an Observable here
      return from(
        getclientdbpermissioninfo(
          serverinventory,
          combined.clientIds,
          combined.Namespace,
          combined.GroupName,
          combined.Permission,
          selectedEnvironment,
          concurrency
        )
      ).pipe(
        map((results) =>
          results
            .filter(
              (item) =>
                !item.error &&
                (item.ServerPrincipalFound === false ||
                  item.DatabasePrincipalFound === false ||
                  item.MissingRoleMappings.length > 0)
            )
            .map((r) => ({
              ...r,
              GroupName: combined.GroupName,
            }))
        )
      );
    }, concurrency),

    // flatten arrays
    mergeMap((results) => from(results)),

    // collect final output
    toArray(),

    tap((final) => {
      console.log("✅ FINAL RESULT COUNT:", final.length);
      console.log("✅ FINAL SAMPLE:", final[0]);
    })
  );

  return await lastValueFrom(obs$);
}

export async function getclientdbpermissioninfo(
  db: string,
  clientid: number[],
  Namespace: string,
  name: string,
  clientpermission: string,
  environment: string,
  concurrency: number = 100
): Promise<IConnectionStringWithDbPermission[]> {
  const PermissionMap: IPermissionMapping[] = [
    { permission: "Owner", dbPermission: ["db_owner"] },
    { permission: "ReadWrite", dbPermission: ["db_datawriter", "db_datareader"] },
    { permission: "ReadOnly", dbPermission: ["db_datareader"] },
  ];

  const dbpermission = PermissionMap.find((m) => m.permission === clientpermission)
    ?.dbPermission ?? ["N/A"];

  const obs$ = from(getClientWithDbInfo(db, clientid, Namespace, environment)).pipe(
    // Protect upstream call: if getClientWithDbInfo rejects, log and continue with empty array
    catchError((err) => {
      console.error(`getClientWithDbInfo failed: for  ${Namespace} ${clientid}`, err);
      return of([]); // keep typing: returns empty array
    }),

    tap((rawresult) =>
      console.log("raw result count", Array.isArray(rawresult) ? rawresult.length : 0)
    ),

    map((res) => {
      const list = Array.isArray(res) ? res : [];
      console.log("rawCount", list.length, "raw sample", list.slice(0, 2));
      const filtered = list.filter((item) => item.ConnectionStringFound);
      console.log("filteredCount", filtered.length);
      return filtered;
    }),

    // For each item: call the three async functions in parallel but handle errors locally
    mergeMap(
      (items) =>
        from(items).pipe(
          mergeMap((item) => {
            // turn each async call into an Observable and catch error to return a safe default
            const sp$ = from(getServerPrincipal(item.ConstringServerName, "master", name)).pipe(
              map((rows) =>
                (rows ?? []).map((r) => ({
                  ...r,
                  servername: item.ConstringServerName,
                }))
              ),
              catchError((err) => {
                console.error(
                  `getServerPrincipal failed for ${item.ClientID} @ ${item.ConstringServerName}:`,
                  err
                );
                return of([
                  {
                    servername: item.ConstringServerName,
                    name: name,
                    error: true,
                    errorMessage: err instanceof Error ? err.message : "Unknown error",
                  },
                ]);
              })
            );

            const dp$ = from(
              getDatabasePrincipal(item.ConstringServerName, item.ConstringDatabaseName, name)
            ).pipe(
              map((rows) =>
                (rows ?? []).map((r) => ({
                  ...r,
                  servername: item.ConstringServerName,
                  databasename: item.ConstringDatabaseName,
                }))
              ),
              catchError((err) => {
                console.error(
                  `getDatabasePrincipal failed for ${item.ClientID} @ ${item.ConstringServerName}/${item.ConstringDatabaseName}:`,
                  err
                );
                return of([
                  {
                    servername: item.ConstringServerName,
                    databasename: item.ConstringDatabaseName,
                    name: name,
                    error: true,
                    errorMessage: err instanceof Error ? err.message : "Unknown error",
                  },
                ]);
              })
            );

            const dpPermissionMap$ = from(
              fetchPermissionMappings(item.ConstringServerName, item.ConstringDatabaseName, name)
            ).pipe(
              catchError((err) => {
                console.error(
                  `fetchPermissionMappings failed for ${item.ClientID} @ ${item.ConstringServerName}/${item.ConstringDatabaseName}:`,
                  err
                );
                return of([]);
              })
            );

            // run the three calls in parallel and build the result
            return forkJoin({
              sp: sp$,
              dp: dp$,
              dpmap: dpPermissionMap$,
            }).pipe(
              map(({ sp, dp, dpmap }) => {
                // console.log("SP RAW:", sp);
                // console.log("DP RAW:", dp);
                // const serverPrincipalName = sp?.[0]?.name ?? null;
                const spRow = sp.find((s) => s.servername === item.ConstringServerName && !s.error);
                const serverPrincipal = spRow?.name ?? null;
                const dpRow = dp.find(
                  (d) =>
                    d.servername === item.ConstringServerName &&
                    d.databasename === item.ConstringDatabaseName &&
                    !d.error
                );
                const databasePrincipal = dpRow?.name ?? null;

                const dbUserMappings = Array.isArray(dpmap)
                  ? dpmap.map((d) => d.DatabaseRole).flat()
                  : [];

                const missingRoleMappings = dbpermission.filter(
                  (p) =>
                    !dbUserMappings
                      .map((r: string) => r?.toLowerCase?.() ?? "")
                      .includes(p.toLowerCase())
                );

                return {
                  ...item,
                  dbpermission,
                  //serverPrincipal: serverPrincipalName,
                  // serverPrincipal:
                  //   sp.find((s) => s.servername === item.ConstringServerName)?.name ?? null,
                  serverPrincipal,
                  ServerPrincipalFound: !!serverPrincipal,
                  databasePrincipal: databasePrincipal,
                  DatabasePrincipalFound: !!databasePrincipal,
                  DatabaseUserMappings: dbUserMappings,
                  MissingRoleMappings: missingRoleMappings,
                  error: spRow?.error
                    ? spRow.errorMessage
                    : dp?.[0]?.error
                      ? dp[0].errorMessage
                      : null,
                } as IConnectionStringWithDbPermission;
              }),

              // If anything unexpected happens in mapping, return an error-annotated object
              catchError((err) => {
                console.error("Mapping error for item", item.ClientID, err);
                return of({
                  ...item,
                  dbpermission,
                  serverPrincipal: null,
                  ServerPrincipalFound: null,
                  databasePrincipal: null,
                  DatabasePrincipalFound: null,
                  DatabaseUserMappings: [],
                  MissingRoleMappings: [],
                  error: err instanceof Error ? err.message : "Unknown mapping error",
                } as IConnectionStringWithDbPermission);
              })
            );
          }, concurrency),
          toArray()
        ),
      1 // outer mergeMap concurrency - we only need 1 since inner controls concurrency
    ),

    // flatten the arrays emitted by per-chunk to a single array
    mergeMap((results) => from(results || [])),

    toArray(),

    tap((final) => {
      console.log("✅ FINAL RESULT COUNT:", final.length);
      if (final.length) console.log("✅ FINAL SAMPLE:", final[0]);
    })
  );

  return await lastValueFrom(obs$);
}

export async function getClientWithDbInfo(
  db: string,
  clientid: number[],
  Namespace: string,
  selectedEnvironment: string
): Promise<IConnectionStringWithFound[]> {
  if (clientid.length === 0) {
    return [];
  }

  const obs$ = from(
    fetchConnectionStringByClientArrayName(db, clientid, Namespace, selectedEnvironment)
  ).pipe(
    map((result: IConnectionString[]) => {
      const foundList = Array.isArray(result) ? result : [];
      const foundMap = new Map<number, IConnectionString>();
      for (const item of foundList) {
        foundMap.set(Number(item.ClientID), item);
      }
      // console.log("foundMap entries:", [...foundMap.entries()]);

      // result is an array of found rows — mark each as found
      return clientid.map((c) => {
        // console.log(
        //   typeof c,
        //   typeof Namespace,
        //   "looking for ClientID in foundMap:",
        //   c,
        //   foundMap.has(c)
        // );
        const found = foundMap.get(c);
        if (found) {
          return { ...found, ConnectionStringFound: true } as IConnectionStringWithFound;
        } else {
          return {
            ClientID: c,
            Namespace,
            ConstringDatabaseName: "",
            ConstringServerName: "",
            ISBI: undefined,
            ConnectionType: "",
            IsDecomm: undefined,
            ConnectionStringFound: false,
          } as IConnectionStringWithFound;
        }
      });
    })
  );
  return await lastValueFrom(obs$);
}

export async function getConnectionStrings<T>(db: string, environment: string): Promise<T[]> {
  const query = `
  query ConnectionStrings($db: String!) {
  ConnectionStrings(db: $db) {
  ClientID
  Namespace
  ConstringDatabaseName
  ConstringServerName
  ISBI
  ConnectionType
  IsDecomm
  }
}`;
  const variables = { db: db };
  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/${environment}/dbaserver/monolilthconnectionstring`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    }
  );
  const data = await res.json();
  if (data.errors) {
    console.error(data.errors);
    throw new Error(data.errors[0].message);
  }
  return data.data.ConnectionStrings;
}

export async function getCustomerSecurityGroups<T>(
  server: string,
  db: string,
  environment: string,
  domainprefix: string
): Promise<T[]> {
  const query = `
  query CustomerSecurityGroups($server: String!, $db: String!, $environment: String!, $domainprefix: String!) {
  customerSecurityGroups(server: $server, db: $db, environment: $environment, domainprefix: $domainprefix) {
    GroupSID
    Environment
    ClientId
    CollectedTimestamp
    Permission
    IsDeleted
    Namespace
    GroupName
    MetaData
  }
}
  `;
  const variables = {
    server: server,
    db: db,
    environment: environment,
    domainprefix: domainprefix ?? "",
  };
  const res = await fetch(`${process.env.APPDAPIROOT}/api/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) {
    console.error(data.errors);
    throw new Error(data.errors[0].message);
  }
  return data.data.customerSecurityGroups;
}

// async function fetchConnectionStringByClientIdName(
//   db: string,
//   ClientId: number,
//   Namespace: string,
//   environment: string
// ): Promise<IConnectionString[]> {
//   const query = `
//   query ConnectionStringByClientIdName($db: String!, $ClientId: Int!, $Namespace: String!) {
//     ConnectionStringByClientIdName(db: $db, ClientId: $ClientId, Namespace: $Namespace) {
//       ClientID
//       Namespace
//       ConstringDatabaseName
//       ConstringServerName
//       ISBI
//       ConnectionType
//       IsDecomm
//     }
//   }`;
//   const variables = { db: db, ClientId: ClientId, Namespace: Namespace };
//   const res = await fetch(
//     `${process.env.APPDAPIROOT}/api/${environment}/dbaserver/monolilthconnectionstring`,
//     // `/api/${environment}/dbaserver/monolilthconnectionstring`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ query, variables }),
//     }
//   );
//   const data = await res.json();

//   console.log("GraphQL raw response:", {
//     ok: res.ok,
//     status: res.status,
//     data,
//     variables,
//   });

//   if (data.errors) {
//     console.error(data.errors);
//     throw new Error(data.errors[0].message);
//   }
//   return data.data.ConnectionStringByClientIdName;
// }

async function fetchConnectionStringByClientArrayName(
  db: string,
  ClientIds: number[],
  Namespace: string,
  environment: string
): Promise<IConnectionString[]> {
  const query = `
  query ConnectionStringByClientArrayName($db: String!, $ClientIds: [Int!]!, $Namespace: String!) {
    ConnectionStringByClientArrayName(db: $db, ClientIds: $ClientIds, Namespace: $Namespace) {
      ClientID
      Namespace
      ConstringDatabaseName
      ConstringServerName
      ISBI
      ConnectionType
      IsDecomm
    }
  }`;
  const variables = { db: db, ClientIds: ClientIds, Namespace: Namespace };
  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/${environment}/dbaserver/monolilthconnectionstring`,
    // `/api/${environment}/dbaserver/monolilthconnectionstring`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    }
  );
  const data = await res.json();

  console.log("GraphQL raw response:", {
    ok: res.ok,
    status: res.status,
    data,
    variables,
  });

  if (data.errors) {
    console.error(data.errors);
    throw new Error(data.errors[0].message);
  }
  return data.data.ConnectionStringByClientArrayName;
}

export async function getServerPrincipal(
  server: string,
  db: string,
  name: string
): Promise<IServerPrincipal[]> {
  try {
    const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        server,
        db,
        q: `
        select name , create_date, default_database_name  from sys.server_principals where name = '${name}'
              `,
      }),
    });
    if (!res.ok) {
      let message = res.statusText;
      try {
        const resBody = await res.json();
        message = resBody?.error ?? message;
      } catch {}
      throw new Error(`getServerPrincipal failed (${res.status}): ${message}`);
    }
    return await res.json();
  } catch (err) {
    console.error("getServerPrincipal error:", err);
    throw err;
  }
}

export async function getDatabasePrincipal(
  server: string,
  db: string,
  name: string
): Promise<IDatabasePrincipal[]> {
  try {
    const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        server,
        db,
        q: `
        select name, type_desc, create_date, modify_date
        from sys.database_principals
        where name = '${name}'
      `,
      }),
    });

    if (!res.ok) {
      let message = res.statusText;
      try {
        const resBody = await res.json();
        message = resBody?.error ?? message; // ✅ error is a string
      } catch {}
      throw new Error(`getDatabasePrincipal failed (${res.status}): ${message}`);
    }
    return await res.json();
  } catch (err) {
    console.error("getDatabasePrincipal error:", err);
    throw err; // rethrow so caller can handle
  }
}

export async function fetchPermissionMappings(
  server: string,
  db: string,
  name: string
): Promise<IDatabaseUserMapping[]> {
  try {
    const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        server,
        db,
        q: `
        SELECT
            dp.name AS DatabaseUser,
            drp.name AS DatabaseRole
        FROM sys.database_principals dp
        JOIN sys.database_role_members drm
            ON dp.principal_id = drm.member_principal_id
        JOIN sys.database_principals drp
            ON drm.role_principal_id = drp.principal_id
        WHERE dp.name = '${name}'
              `,
      }),
    });
    if (!res.ok) {
      throw new Error(`getDatabasePrincipal failed: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("getDatabasePrincipal error:", err);
    throw err;
  }
}
