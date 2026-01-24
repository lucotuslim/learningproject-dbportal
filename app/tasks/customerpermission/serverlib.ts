"use server";
import {
  IConnectionString,
  IConnectionStringWithFound,
  IConnectionStringWithDbPermission,
  IPermissionMapping,
  IServerPrincipal,
  IDatabasePrincipal,
  IDatabaseUserMapping,
} from "./interfaces";
import { from, toArray, lastValueFrom, mergeMap, map } from "rxjs";

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

  const obs$ = from(getClientWithDbInfo(db, clientid, Namespace, environment, concurrency)).pipe(
    map((res) => res.filter((item) => item.ConnectionStringFound)),
    mergeMap((items) =>
      from(items).pipe(
        mergeMap(async (item) => {
          try {
            const sp = await getServerPrincipal(item.ConstringServerName, "master", name);
            const dp = await getDatabasePrincipal(
              item.ConstringServerName,
              item.ConstringDatabaseName,
              name
            );
            const dppermissionmapping: IDatabaseUserMapping[] = await fetchPermissionMappings(
              item.ConstringServerName,
              item.ConstringDatabaseName,
              name
            );

            return {
              ...item,
              dbpermission: dbpermission,
              serverPrincipal: sp[0]?.name ?? null,
              ServerPrincipalFound: !!sp[0]?.name,
              databasePrincipal: dp[0]?.name ?? null,
              DatabasePrincipalFound: !!dp[0]?.name,
              DatabaseUserMappings: dppermissionmapping.map((d) => d.DatabaseRole).flat(),
            };
          } catch (err) {
            console.error("Item failed:", item.ClientID, err);

            return {
              ...item,
              dbpermission, // ✅ still required
              serverPrincipal: null, // ✅ required
              ServerPrincipalFound: null,
              databasePrincipal: null, // ✅ required
              DatabasePrincipalFound: null,
              DatabaseUserMappings: [],
              error: err instanceof Error ? err.message : "Unknown error",
            } as IConnectionStringWithDbPermission;
          }
        }, concurrency),
        toArray()
      )
    )
  );

  return await lastValueFrom(obs$);
}

export async function getClientWithDbInfo(
  db: string,
  clientid: number[],
  Namespace: string,
  environment: string,
  concurrency: number = 100
): Promise<IConnectionStringWithFound[]> {
  if (clientid.length === 0) {
    return [];
  }
  const obs$ = from(clientid).pipe(
    mergeMap(
      (id) =>
        from(fetchConnectionStringByClientIdName(db, id, Namespace, environment)).pipe(
          map((result) => {
            if (result.length === 0) {
              return {
                ClientID: id,
                Namespace: Namespace,
                ConstringDatabaseName: "N/A",
                ConstringServerName: "N/A",
                ISBI: false,
                ConnectionType: "N/A",
                IsDecomm: false,
                ConnectionStringFound: false,
              } as IConnectionStringWithFound;
            }
            return result.map((r) => ({
              ...r,
              ConnectionStringFound: true,
            }));
          })
        ),
      concurrency
    ),
    mergeMap((x) => (Array.isArray(x) ? x : [x])),
    toArray(),
    map((results) => results.sort((a, b) => a.ClientID - b.ClientID))
  );

  // For demonstration, returning a mock result here
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
  environment: string
): Promise<T[]> {
  const query = `
  query CustomerSecurityGroups($server: String!, $db: String!, $environment: String!) {
  customerSecurityGroups(server: $server, db: $db, environment: $environment) {
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
  const variables = { server: server, db: db, environment: environment };
  const res = await fetch(`${process.env.APPDAPIROOT}/api/customersecuritygroup`, {
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

async function fetchConnectionStringByClientIdName(
  db: string,
  ClientId: number,
  Namespace: string,
  environment: string
): Promise<IConnectionString[]> {
  const query = `
  query ConnectionStringByClientIdName($db: String!, $ClientId: Int!, $Namespace: String!) {
    ConnectionStringByClientIdName(db: $db, ClientId: $ClientId, Namespace: $Namespace) {
      ClientID
      Namespace
      ConstringDatabaseName
      ConstringServerName
      ISBI
      ConnectionType
      IsDecomm
    }
  }`;
  const variables = { db: db, ClientId: ClientId, Namespace: Namespace };
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
  return data.data.ConnectionStringByClientIdName;
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
