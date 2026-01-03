"use server"
export async function getNamespaces<T>(db:string, environment:string): Promise<T[]> {
  // Placeholder for actual implementation to fetch MongoDB server info

  const query = `
    query Namespaces($db: String!) {
      namespaces(db: $db) {
     ClientID
    Namespace
    ConstringDatabaseName
    ConstringServerName

      }
    }
  `;
  const variables = { db };
  console.log("Fetching namespaces from db:", db, "in environment:", environment);
  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/${environment}/dbaserver/MonolithConnectionStrings`,
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
  return data.data.namespaces as T[]


  //return Promise.resolve([] as T[]);
}  




// export async function fetchNamespace(db: string, namespace: string, environment: string) {
//   const query = `
//     query Namespace($db: String!, $namespace: String!) {
//       namespace(db: $db, namespace: $namespace) {
//         ClientID
//         Namespace
//         ConstringDatabaseName
//         ConstringServerName
//       }
//     }
//   `;
//   const variables = { db, namespace };
//   const res = await fetch(
//     `${process.env.APPDAPIROOT}/api/${environment}/dbaserver/MonolithConnectionStrings`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ query, variables }),
//     }
//   );
//   const data = await res.json();
//   if (data.errors) {
//     console.error(data.errors);
//     throw new Error(data.errors[0].message);
//   }
//   return data.data.namespace;
// }
