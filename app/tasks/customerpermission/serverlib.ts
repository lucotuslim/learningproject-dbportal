"use server";

import {
  IHCMCore,
  IHCMCoreWithFound,
  IHCMCoreWithDbPermission,
  IPermissionMapping,
  IServerPrincipal,
  IDatabasePrincipal,
  IDatabaseUserMapping,
  ICustomerSecurityGroup,
  CustomerSecurityGroupMetaData,
} from "./interfaces";
import { from, toArray, lastValueFrom, mergeMap, map, of, forkJoin } from "rxjs";
import { catchError, groupBy, reduce, tap, filter } from "rxjs/operators";

type CombinedGroup = {
  Namespace: string;
  GroupName: string;
  Permission: string;
  ClientEnvironment: string;
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
  concurrency: number = 5
): Promise<IHCMCoreWithDbPermission[]> {
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
        `${g.Namespace ?? ""}|${g.GroupName ?? ""}|${g.Permission ?? ""} |${g.Environment ?? ""}`
    ),
    mergeMap((group$) =>
      group$.pipe(
        reduce(
          (
            acc: { ns?: string; gn?: string; perm?: string; custenv?: string; ids: Set<number> },
            curr
          ) => {
            // set bucket identifiers if not set yet
            if (!acc.ns) acc.ns = curr.Namespace;
            if (!acc.gn) acc.gn = curr.GroupName;
            if (!acc.perm) acc.perm = curr.Permission;
            if (!acc.custenv) acc.custenv = curr.Environment;
            tap(() => console.log(curr.MetaData.clientIDList));

            const clientIds = normalizeClientIdsFromMeta(curr.MetaData);
            for (const id of clientIds) acc.ids.add(id);

            return acc;
          },
          {
            ns: undefined as string | undefined,
            gn: undefined as string | undefined,
            perm: undefined as string | undefined,
            custenv: undefined as string | undefined,
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
              ClientEnvironment: acc.custenv,
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
          combined.ClientEnvironment,
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
type FailedInfo = {
  message: string;
  count: number;
};

const failedServers = new Map<string, FailedInfo>();
const failedDatabases = new Map<string, Map<string, FailedInfo>>();

export async function getclientdbpermissioninfo(
  db: string,
  clientid: number[],
  Namespace: string,
  name: string,
  clientpermission: string,
  environment: string,
  ClientEnvironment: string,
  concurrency: number = 1
): Promise<IHCMCoreWithDbPermission[]> {
  const PermissionMap: IPermissionMapping[] = [
    { permission: "Owner", dbPermission: ["db_owner"] },
    { permission: "ReadWrite", dbPermission: ["db_datawriter", "db_datareader"] },
    { permission: "ReadOnly", dbPermission: ["db_datareader"] },
  ];

  const dbpermission = PermissionMap.find((m) => m.permission === clientpermission)
    ?.dbPermission ?? ["N/A"];

  const obs$ = from(
    getClientWithDbInfo(db, clientid, Namespace, environment, ClientEnvironment)
  ).pipe(
    catchError((err) => {
      console.error(`getClientWithDbInfo failed`, err);
      return of([]);
    }),

    map((res) => (Array.isArray(res) ? res : [])),
    map((list) => list.filter((item) => item.HCMCoreFound)),

    mergeMap((items) =>
      from(items).pipe(
        mergeMap((item) => {
          const server = item.ConstringServerName;
          const database = item.ConstringDatabaseName;

          const failedserver = failedServers.get(server);
          const servererrorMessage = failedserver?.message;
          const servererrorCount = failedserver?.count;
          const faileddb = failedDatabases.get(server)?.get(database);
          const dberrorMessage = faileddb?.message;
          const dberrorCount = faileddb?.count;

          // 🔥 EARLY SKIP (cache)
          if (failedserver?.message || dberrorMessage) {
            console.log(
              `Skipping ${server}/${database} for ${item.ClientID} due to previous error:`,
              {
                servererrorMessage,
                servererrorCount,
                dberrorMessage,
                dberrorCount,
              }
            );
            return of({
              ...item,
              dbpermission,
              serverPrincipal: null,
              ServerPrincipalFound: null,
              databasePrincipal: null,
              DatabasePrincipalFound: null,
              DatabaseUserMappings: [] as string[],
              MissingRoleMappings: [] as string[],
              error: servererrorMessage ?? dberrorMessage ?? "Unknown previous error",
            } satisfies IHCMCoreWithDbPermission);
          }

          // ------------------------
          // STEP 1: SERVER PRINCIPAL
          // ------------------------
          return from(getServerPrincipal(server, "master", name)).pipe(
            map((rows) =>
              (rows ?? []).map((r) => ({
                ...r,
                servername: server,
              }))
            ),

            catchError((err) => {
              const msg = err?.message ?? "Unknown error";
              const existing = failedServers.get(server);

              if (existing) {
                existing.count += 1;
              } else {
                failedServers.set(server, { message: msg, count: 1 });
              }

              return of([
                {
                  servername: server,
                  name,
                  error: msg,
                },
              ]);
            }),

            // 🔥 STEP 2: CHECK SERVER RESULT
            mergeMap((sp) => {
              const spError = sp.find((s) => s.error)?.error;

              if (spError) {
                return of({
                  ...item,
                  dbpermission,
                  serverPrincipal: null,
                  ServerPrincipalFound: false,
                  databasePrincipal: null,
                  DatabasePrincipalFound: false,
                  DatabaseUserMappings: [] as string[],
                  MissingRoleMappings: [] as string[],
                  error: spError,
                } satisfies IHCMCoreWithDbPermission);
              }

              const serverPrincipal = sp[0]?.name ?? null;

              // ------------------------
              // STEP 3: DATABASE PRINCIPAL
              // ------------------------
              return from(getDatabasePrincipal(server, database, name)).pipe(
                map((rows) =>
                  (rows ?? []).map((r) => ({
                    ...r,
                    servername: server,
                    databasename: database,
                  }))
                ),

                catchError((err) => {
                  const msg = err?.message ?? "Unknown error";

                  if (!failedDatabases.has(server)) {
                    failedDatabases.set(server, new Map());
                  }
                  const dbMap = failedDatabases.get(server)!;
                  const existing = dbMap.get(database);
                  if (existing) {
                    existing.count += 1;
                  } else {
                    dbMap.set(database, { message: msg, count: 1 });
                  }

                  return of([
                    {
                      servername: server,
                      databasename: database,
                      name,
                      error: msg,
                    },
                  ]);
                }),

                // 🔥 STEP 4: CHECK DB RESULT
                mergeMap((dp) => {
                  const dpError = dp.find((d) => d.error)?.error;

                  if (dpError) {
                    return of({
                      ...item,
                      dbpermission,
                      serverPrincipal,
                      ServerPrincipalFound: true,
                      databasePrincipal: null,
                      DatabasePrincipalFound: false,
                      DatabaseUserMappings: [] as string[],
                      MissingRoleMappings: [] as string[],
                      error: dpError,
                    } satisfies IHCMCoreWithDbPermission);
                  }

                  const databasePrincipal = dp[0]?.name ?? null;

                  // ------------------------
                  // STEP 5: PERMISSION MAP
                  // ------------------------
                  return from(fetchPermissionMappings(server, database, name)).pipe(
                    catchError(() => of([])),

                    map((dpmap) => {
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
                        serverPrincipal,
                        ServerPrincipalFound: true,
                        databasePrincipal,
                        DatabasePrincipalFound: true,
                        DatabaseUserMappings: dbUserMappings,
                        MissingRoleMappings: missingRoleMappings,
                        error: undefined,
                      } satisfies IHCMCoreWithDbPermission;
                    })
                  );
                })
              );
            })
          );
        }, concurrency),

        toArray()
      )
    ),

    mergeMap((results) => from(results)),
    toArray()
  );

  return await lastValueFrom(obs$);
}
// export async function getclientdbpermissioninfo(
//   db: string,
//   clientid: number[],
//   Namespace: string,
//   name: string,
//   clientpermission: string,
//   environment: string,
//   ClientEnvironment: string,
//   concurrency: number = 5
// ): Promise<IHCMCoreWithDbPermission[]> {
//   const PermissionMap: IPermissionMapping[] = [
//     { permission: "Owner", dbPermission: ["db_owner"] },
//     { permission: "ReadWrite", dbPermission: ["db_datawriter", "db_datareader"] },
//     { permission: "ReadOnly", dbPermission: ["db_datareader"] },
//   ];

//   const dbpermission = PermissionMap.find((m) => m.permission === clientpermission)
//     ?.dbPermission ?? ["N/A"];

//   const obs$ = from(
//     getClientWithDbInfo(db, clientid, Namespace, environment, ClientEnvironment)
//   ).pipe(
//     // Protect upstream call: if getClientWithDbInfo rejects, log and continue with empty array
//     catchError((err) => {
//       console.error(`getClientWithDbInfo failed: for  ${Namespace} ${clientid}`, err);
//       return of([]); // keep typing: returns empty array
//     }),

//     tap((rawresult) =>
//       console.log("raw result count", Array.isArray(rawresult) ? rawresult.length : 0)
//     ),

//     map((res) => {
//       const list = Array.isArray(res) ? res : [];
//       console.log("rawCount", list.length, "raw sample", list.slice(0, 2));
//       const filtered = list.filter((item) => item.HCMCoreFound);
//       console.log("filteredCount", filtered.length);
//       return filtered;
//     }),

//     // For each item: call the three async functions in parallel but handle errors locally
//     mergeMap(
//       (items) =>
//         from(items).pipe(
//           mergeMap((item) => {
//             // turn each async call into an Observable and catch error to return a safe default
//             const sp$ = from(getServerPrincipal(item.ConstringServerName, "master", name)).pipe(
//               map((rows) =>
//                 (rows ?? []).map((r) => ({
//                   ...r,
//                   servername: item.ConstringServerName,
//                 }))
//               ),
//               catchError((err) => {
//                 console.error(
//                   `getServerPrincipal failed for ${item.ClientID} @ ${item.ConstringServerName}:`,
//                   err
//                 );
//                 return of([
//                   {
//                     servername: item.ConstringServerName,
//                     name: name,
//                     error: true,
//                     errorMessage: err instanceof Error ? err.message : "Unknown error",
//                   },
//                 ]);
//               })
//             );

//             const dp$ = from(
//               getDatabasePrincipal(item.ConstringServerName, item.ConstringDatabaseName, name)
//             ).pipe(
//               map((rows) =>
//                 (rows ?? []).map((r) => ({
//                   ...r,
//                   servername: item.ConstringServerName,
//                   databasename: item.ConstringDatabaseName,
//                 }))
//               ),
//               catchError((err) => {
//                 console.error(
//                   `getDatabasePrincipal failed for ${item.ClientID} @ ${item.ConstringServerName}/${item.ConstringDatabaseName}:`,
//                   err
//                 );
//                 return of([
//                   {
//                     servername: item.ConstringServerName,
//                     databasename: item.ConstringDatabaseName,
//                     name: name,
//                     error: true,
//                     errorMessage: err instanceof Error ? err.message : "Unknown error",
//                   },
//                 ]);
//               })
//             );

//             const dpPermissionMap$ = from(
//               fetchPermissionMappings(item.ConstringServerName, item.ConstringDatabaseName, name)
//             ).pipe(
//               catchError((err) => {
//                 console.error(
//                   `fetchPermissionMappings failed for ${item.ClientID} @ ${item.ConstringServerName}/${item.ConstringDatabaseName}:`,
//                   err
//                 );
//                 return of([]);
//               })
//             );

//             // run the three calls in parallel and build the result
//             return forkJoin({
//               sp: sp$,
//               dp: dp$,
//               dpmap: dpPermissionMap$,
//             }).pipe(
//               map(({ sp, dp, dpmap }) => {
//                 // console.log("SP RAW:", sp);
//                 // console.log("DP RAW:", dp);
//                 // const serverPrincipalName = sp?.[0]?.name ?? null;
//                 const spRow = sp.find((s) => s.servername === item.ConstringServerName && !s.error);
//                 const serverPrincipal = spRow?.name ?? null;
//                 const dpRow = dp.find(
//                   (d) =>
//                     d.servername === item.ConstringServerName &&
//                     d.databasename === item.ConstringDatabaseName &&
//                     !d.error
//                 );
//                 const databasePrincipal = dpRow?.name ?? null;

//                 const dbUserMappings = Array.isArray(dpmap)
//                   ? dpmap.map((d) => d.DatabaseRole).flat()
//                   : [];

//                 const missingRoleMappings = dbpermission.filter(
//                   (p) =>
//                     !dbUserMappings
//                       .map((r: string) => r?.toLowerCase?.() ?? "")
//                       .includes(p.toLowerCase())
//                 );

//                 return {
//                   ...item,
//                   dbpermission,
//                   //serverPrincipal: serverPrincipalName,
//                   // serverPrincipal:
//                   //   sp.find((s) => s.servername === item.ConstringServerName)?.name ?? null,
//                   serverPrincipal,
//                   ServerPrincipalFound: !!serverPrincipal,
//                   databasePrincipal: databasePrincipal,
//                   DatabasePrincipalFound: !!databasePrincipal,
//                   DatabaseUserMappings: dbUserMappings,
//                   MissingRoleMappings: missingRoleMappings,
//                   error: spRow?.error
//                     ? spRow.errorMessage
//                     : dp?.[0]?.error
//                       ? dp[0].errorMessage
//                       : null,
//                 } as IHCMCoreWithDbPermission;
//               }),

//               // If anything unexpected happens in mapping, return an error-annotated object
//               catchError((err) => {
//                 console.error("Mapping error for item", item.ClientID, err);
//                 return of({
//                   ...item,
//                   dbpermission,
//                   serverPrincipal: null,
//                   ServerPrincipalFound: null,
//                   databasePrincipal: null,
//                   DatabasePrincipalFound: null,
//                   DatabaseUserMappings: [],
//                   MissingRoleMappings: [],
//                   error: err instanceof Error ? err.message : "Unknown mapping error",
//                 } as IHCMCoreWithDbPermission);
//               })
//             );
//           }, concurrency),
//           toArray()
//         ),
//       1 // outer mergeMap concurrency - we only need 1 since inner controls concurrency
//     ),

//     // flatten the arrays emitted by per-chunk to a single array
//     mergeMap((results) => from(results || [])),
//     toArray(),
//     tap((final) => {
//       console.log("✅ FINAL RESULT COUNT:", final.length);
//       if (final.length) console.log("✅ FINAL SAMPLE:", final[0]);
//     })
//   );

//   return await lastValueFrom(obs$);
// }

export async function getClientWithDbInfo(
  db: string,
  clientid: number[],
  Namespace: string,
  selectedEnvironment: string,
  ClientEnvironment: string
): Promise<IHCMCoreWithFound[]> {
  if (clientid.length === 0) {
    return [];
  }

  console.log(ClientEnvironment);
  const obs$ = from(
    fetchHCMCoreByClientArrayName(db, clientid, Namespace, selectedEnvironment, ClientEnvironment)
  ).pipe(
    map((result: IHCMCore[]) => {
      const foundList = Array.isArray(result) ? result : [];

      // Build a Set of found ClientIDs
      const foundIdSet = new Set(foundList.map((item) => Number(item.ClientID)));

      // Mark all found records
      const foundWithFlag: IHCMCoreWithFound[] = foundList.map((item) => ({
        ...item,
        HCMCoreFound: true,
      }));

      // Build missing records using Set lookup (O(1))
      const missing: IHCMCoreWithFound[] = clientid
        .filter((c) => !foundIdSet.has(c))
        .map((c) => ({
          ClientID: c,
          Namespace,
          ConstringDatabaseName: "",
          ConstringServerName: "",
          ISBI: undefined,
          ConnectionType: "",
          IsDecomm: undefined,
          HCMCoreFound: false,
          HCMCoreEnvironment: undefined,
        }));

      return [...foundWithFlag, ...missing];
    })
  );

  return await lastValueFrom(obs$);
}

export async function getHCMCores<T>(db: string, environment: string): Promise<T[]> {
  const query = `
  query Query($db: String!, $environment: String!) {
  CoreHCMDatabaseInventory(db: $db, Environment: $environment) {
    ClientID
    Namespace
    ConstringDatabaseName
    ConstringServerName
    HCMCoreEnvironment
  }
}
`;
  const variables = { db, environment };
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
  return data.data.CoreHCMDatabaseInventory;
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

async function fetchHCMCoreByClientArrayName(
  db: string,
  ClientIds: number[],
  Namespace: string,
  environment: string,
  ClientEnvironment: string
): Promise<IHCMCore[]> {
  const query = `
  query CoreHCMDatabaseInventoryByClientIdArray($db: String!, $clientIds: [Int!]!, $environment: String!, $clientEnvironment: String!) {
  CoreHCMDatabaseInventoryByClientIdArray(db: $db, ClientIds: $clientIds, Environment: $environment, ClientEnvironment: $clientEnvironment) {
    ClientID
    Namespace
    ConstringDatabaseName
    ConstringServerName
    HCMCoreEnvironment
  }
}
  `;
  const variables = {
    db,
    clientIds: ClientIds,
    environment,
    clientEnvironment: ClientEnvironment,
  };
  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/graphql`,
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
  return data.data.CoreHCMDatabaseInventoryByClientIdArray;
}

// export async function getServerPrincipal(
//   server: string,
//   db: string,
//   name: string
// ): Promise<IServerPrincipal[]> {
//   try {
//     const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         server,
//         db,
//         q: `
//         select name , create_date, default_database_name  from sys.server_principals where name = '${name}'
//               `,
//       }),
//     });
//     if (!res.ok) {
//       let message = res.statusText;
//       try {
//         const resBody = await res.json();
//         message = resBody?.error ?? message;
//       } catch {}
//       throw new Error(`getServerPrincipal failed (${res.status}): ${message}`);
//     }
//     return await res.json();
//   } catch (err) {
//     console.error("getServerPrincipal error:", err);
//     throw err;
//   }
// }

export async function getServerPrincipal(
  server: string,
  db: string,
  name: string
): Promise<IServerPrincipal[]> {
  const query = `
query ServerprincipalByName($server: String!, $db: String!, $name: String!) {
  serverprincipalByName(server: $server, db: $db, name: $name) {
    name
    create_date
    default_database_name
  }
}
  `;
  const variables = {
    server,
    db,
    name,
  };

  try {
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
    return data.data.serverprincipalByName;
  } catch (err) {
    console.error("getServerPrincipal error:", err);
    throw err; // rethrow so caller can handle
  }
}

export async function getDatabasePrincipal(
  server: string,
  db: string,
  name: string
): Promise<IDatabasePrincipal[]> {
  const query = `
 query DatabaseprincipalByName($server: String!, $db: String!, $name: String!) {
  databaseprincipalByName(server: $server, db: $db, name: $name) {
    name
    type_desc
    default_schema_name
    create_date
    modify_date
  }
}
  `;
  const variables = {
    server,
    db,
    name,
  };

  try {
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
    return data.data.databaseprincipalByName;
  } catch (err) {
    console.error("getDatabasePrincipal error:", err);
    throw err; // rethrow so caller can handle
  }
}

// export async function getDatabasePrincipal(
//   server: string,
//   db: string,
//   name: string
// ): Promise<IDatabasePrincipal[]> {
//   try {
//     const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         server,
//         db,
//         q: `
//         select name, type_desc, create_date, modify_date
//         from sys.database_principals
//         where name = '${name}'
//       `,
//       }),
//     });

//     if (!res.ok) {
//       let message = res.statusText;
//       try {
//         const resBody = await res.json();
//         message = resBody?.error ?? message; // ✅ error is a string
//       } catch {}
//       throw new Error(`getDatabasePrincipal failed (${res.status}): ${message}`);
//     }
//     return await res.json();
//   } catch (err) {
//     console.error("getDatabasePrincipal error:", err);
//     throw err; // rethrow so caller can handle
//   }
// }

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
