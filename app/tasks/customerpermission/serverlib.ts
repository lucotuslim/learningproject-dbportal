"use server";
import { IConnectionString, IConnectionStringWithFound } from "./interfaces";
import { from, toArray, lastValueFrom, mergeMap, map } from "rxjs";

export async function getClientInfo(
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
                Found: false,
              } as IConnectionStringWithFound;
            }
            return result.map((r) => ({
              ...r,
              Found: true,
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
