interface IsubmitBulkExportParams {
  Url: string;
  Method: string;
  sftpHostName: string;
  ContentType: string;
  Token: string;
  ContainerName: string;
  ZipName: string;
  SftpUsername: string;
  SftpPassword: string;
  DocumentsGUID: string[];
}


export async function submitBulkExport(submitBulkExportParams: IsubmitBulkExportParams): Promise<any> {
    //  $DocBulkExportResponse= Send-DocBulkExport -Url $CurrentSendDocBulkExportConfig.Url `
    // -Method $CurrentSendDocBulkExportConfig.Method `
    // -sftpHostName $CurrentSendDocBulkExportConfig.sftpHostName `
    // -ContentType $CurrentSendDocBulkExportConfig.ContentType `
    // -Token $Token.access_token  -ContainerName $ContainerName `
    // -ZipName $ZipName -SftpUsername $SftpUsername -SftpPassword $SftpPassword `
    // -DocumentsGUID $Documents | ConvertFrom-Json

  
  const headers = {
    "Content-Type": submitBulkExportParams.ContentType,
    "Authorization": `Bearer ${submitBulkExportParams.Token}`,
    "ContainerName": submitBulkExportParams.ContainerName,
    "ZipName": submitBulkExportParams.ZipName,
    "SftpUsername": submitBulkExportParams.SftpUsername,
    "SftpPassword": submitBulkExportParams.SftpPassword,
    "sftpHostName": submitBulkExportParams.sftpHostName
  };

  const response = await fetch(submitBulkExportParams.Url, {
      method: submitBulkExportParams.Method,
      headers: headers,
      body: JSON.stringify({ DocumentsGUID: submitBulkExportParams.DocumentsGUID }),
    });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return await response.json();
}

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
    "http://localhost:3000/api/prod/dbaserver/MonolithConnectionStrings",
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
    "http://localhost:3000/api/prod/clientdb/getdocumentlistall",
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
    Password: string;
    ContainerName: string
  }
) {

  console.log (JSON.stringify(values));

  const mutation = `
    mutation AddDocExportOutput($db: String!, $input: DocExportOutputInput!) {
      addDocExportOutput(db: $db, input: $input) {
        env
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
      env: values.env,
      ExportGuid: values.ExportGuid,
      Filename: values.Filename,
      Password: values.Password,
      SftpUser: values.SftpUser,
      SftpPassword: values.sftppassword,
      ContainerName: values.ContainerName,
      Namespace: values.Namespace,
      CreatedBy: "Api",
    },
  };
  const res = await fetch(
    "http://localhost:3000/api/prod/dbaserver/documentations",
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
