
export async function fetchNamespace(db: string, namespace: string) {
  const query = `
    query Namespace($db: String!, $namespace: String!) {
      namespace(db: $db, namespace: $namespace) {
        ClientID
        Namespace
        ConstringDatabaseName
        ConstringServerName
        CreatedDate
      }
    }
  `;

  const variables = { db, namespace };

  const res = await fetch("http://localhost:3000/api/prod/dbaserver/MonolithConnectionStrings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();

  if (data.errors) {
    console.error(data.errors);
    throw new Error(data.errors[0].message);
  }

  return data.data.namespace;
}

export async function addDocExportOutput(db:string, values: {
  env: string;
  Namespace: string;
  Zipname: string;
  SftpUsername: string;
  SftpPassword: string;
}) {
  const mutation = `
    mutation AddDocExportOutput($db: String!, $input: DocExportOutputInput!) {
      addDocExportOutput(db: $db, input: $input) {
        ExportGuid
        Filename
        Password
        SftpUser
        SftpPassword
        ContainerName
        Namespace
        CreatedBy
      }
    }
  `;

  const variables = {
    db: db,
    input: {
      Filename: values.Zipname,
      Password: values.SftpPassword,
      SftpUser: values.SftpUsername,
      SftpPassword: values.SftpPassword,
      ContainerName: values.env,
      Namespace: values.Namespace,
      CreatedBy: "Api",
    },
  };

  const res = await fetch("http://localhost:3000/api/prod/dbaserver/documentations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const data = await res.json();

  if (data.errors) {
    console.error(data.errors);
    throw new Error(data.errors[0].message);
  }
  return data.data.addDocExportOutput;
}

