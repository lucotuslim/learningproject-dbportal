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

  const res = await fetch(
    "http://localhost:3001/api/prod/dbaserver/MonolithConnectionStrings",
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

  return data.data.namespace;
}

// [ExportGuid] [nvarchar](100) NULL,
// [Filename] [nvarchar](100) NULL,
// [Password] [nvarchar](100) NULL,
// [SftpUser] [nvarchar](100) NULL,
// [sftppassword] [nvarchar](100) NULL,
// [ContainerName] [nvarchar](100) NULL,
// [Namespace] [nvarchar](100) NULL,
// [CreatedBy] [nvarchar](100) NULL,
// [env] [varchar](50) NULL

export async function fetchDocuments(servername: string, dbname: string) {
  const query = `
query Query($servername: String!, $db: String!) {
  GetDocumentListAll(servername: $servername, db: $db) {
    DocumentGUID
  }
}
`;
  const variables = { servername: servername, db: dbname };

  const res = await fetch(
    "http://localhost:3001/api/prod/clientdb/getdocumentlistall",
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
  return data.data.GetDocumentListAll;

}

export async function addDocExportOutput(
  db: string,
  values: {
    ExportGuid: string;
    env: string;
    Namespace: string;
    Filename: string;
    SftpUser: string;
    sftppassword: string;
  }
) {
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
      ExportGuid: values.ExportGuid,
      Filename: values.Filename,
      //Password: values.,
      SftpUser: values.SftpUser,
      SftpPassword: values.sftppassword,
      ContainerName: values.env,
      Namespace: values.Namespace,
      CreatedBy: "Api",
    },
  };

  const res = await fetch(
    "http://localhost:3001/api/prod/dbaserver/documentations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation, variables }),
    }
  );

  const data = await res.json();
  console.log("Response data:", data);
  if (data.errors) {
    console.error(data.errors);
    throw new Error(data.errors[0].message);
  }
  return data.data.addDocExportOutput;
}
