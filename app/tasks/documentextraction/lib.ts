
import { getApiToken } from "@/lib/utils";

function openExportReportInNewTab(exportStatus: any, failedDocuments: any[]) {
  const newWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!newWindow) return;

  // Convert ExportStatus to table rows
  const exportStatusRows = Object.entries(exportStatus)
    .map(
      ([key, value]) =>
        `<tr><td style="font-weight:bold; padding:4px 8px;">${key}</td><td style="padding:4px 8px;">${value}</td></tr>`
    )
    .join("");

  // Convert FailedDocuments to table rows
  const failedDocsRows = failedDocuments
    .map((doc) => {
      return `<tr>
        <td style="padding:4px 8px;">${doc.documentId}</td>
        <td style="padding:4px 8px;">${doc.reason}</td>
      </tr>`;
    })
    .join("");

  const html = `
    <html>
      <head>
        <title>Export Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin-bottom: 20px; }
          h2 { margin-top: 30px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>Export Report</h1>

        <h2>Export Status</h2>
        <table>
          <tbody>
            ${exportStatusRows}
          </tbody>
        </table>

        <h2>Failed Documents</h2>
        <table>
          <thead>
            <tr>
              <th>Document ID</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${failedDocsRows || `<tr><td colspan="2">No failed documents</td></tr>`}
          </tbody>
        </table>
      </body>
    </html>
  `;

  newWindow.document.write(html);
  newWindow.document.close();
}


interface IsubmitBulkExportParams {
  Url: string;
  Method: string;
  sftpHostName: string;
  ContentType: string;
  Token: string;
  ContainerName: string;
  ZipName: string;
  SftpUsername: string;
  sftppassword: string;
  DocumentsGUID: string[];
}
export async function checkexportStatus(
  env: string,
  Namespace: string,
  ExportGuid: string
) {

  const namespace = await fetchNamespace("ServerInventory", Namespace);
  const ContainerName = `${namespace.Namespace}-${namespace.ClientID}`;
  const token = await getApiToken({
    Url: process.env.NEXT_PUBLIC_DocApiTokenUrl!,
    Method: process.env.NEXT_PUBLIC_DocApiTokenMethod!,
    ContentType: process.env.NEXT_PUBLIC_DocApiTokenContentType!,
    GrantType: process.env.NEXT_PUBLIC_DocApiGrantType!,
    ClientId: process.env.NEXT_PUBLIC_DocApiClientId!,
    Scope: process.env.NEXT_PUBLIC_DocApiScope!,
    ClientSecret: process.env.NEXT_PUBLIC_DocApiClientSecret!,
  });

    console.log (   ({
    Url: process.env.NEXT_PUBLIC_GetDocBulkExportStatusUrl!,
    Method: process.env.NEXT_PUBLIC_GetDocBulkExportStatusMethod!,
    Token: token.access_token,
    ContainerName: ContainerName,
    ContentType: process.env.NEXT_PUBLIC_GetDocBulkExportStatusContentType!,
    ExportGuid: ExportGuid,
  })
 ) 
const getDocBulkExportStatusReport = await GetDocBulkExportStatusReport({
    Url: process.env.NEXT_PUBLIC_GetDocBulkExportStatusUrl!,
    Method: process.env.NEXT_PUBLIC_GetDocBulkExportStatusMethod!,
    Token: token.access_token,
    ContainerName: ContainerName,
    ContentType: process.env.NEXT_PUBLIC_GetDocBulkExportStatusContentType!,
    ExportGuid: ExportGuid,
  }); 
    console.log("Export Status:", getDocBulkExportStatusReport.ExportStatus);
    console.log("Failed Documents:", getDocBulkExportStatusReport.FailedDocuments);
    openExportReportInNewTab(getDocBulkExportStatusReport.ExportStatus, getDocBulkExportStatusReport.FailedDocuments);
  }

// GetDocBulkExportStatus.ts

interface DocBulkExportStatusParams {
  Url: string;
  Method: string;
  Token: string;
  ContainerName: string;
  ContentType: string;
  ExportGuid: string;
}

export async function GetDocBulkExportStatus(params: DocBulkExportStatusParams): Promise<any> {
  const { Url, Method, Token, ContainerName, ContentType, ExportGuid } = params;

  try {
    const headers = new Headers({
      "Content-Type": ContentType,
      "Authorization": `Bearer ${Token}`,
      "ContainerName": ContainerName,
      "exportGuid": ExportGuid
    });

    const response = await fetch(Url, {
      method: Method,
      headers
    });

    const content = await response.text();

    if (!response.ok) {
      // Mimic PowerShell’s catch: capture HTTP error body
      throw new Error(content || `HTTP error: ${response.status}`);
    }

    return content;
  } catch (error: any) {
    return error.message || String(error);
  }
}


interface DocBulkExportStatusReportParams {
  Url: string;
  Method: string;
  Token: string;
  ContainerName: string;
  ContentType: string;
  ExportGuid: string;
}

interface ExportStatus {
  exportComment?: string;
  totalDocumentsCount?: number;
  processedDocumentPercentage?: string;
  processedDocumentSuccessfulCount?: number;
  processedDocumentFailedCount?: number;
}

interface FailedDocument {
  [key: string]: any;
}

interface DocBulkExportStatusResponse {
  apiResult?: {
    exportStatus?: {
      exportComment?: string;
      totalDocumentsCount?: number;
      processedDocumentPercentage?: number;
      processedDocumentSuccessfulCount?: number;
      processedDocumentFailedCount?: number;
      failedDocuments?: FailedDocument[];
    };
  };
}

export async function GetDocBulkExportStatusReport(
  params: DocBulkExportStatusReportParams
): Promise<{ ExportStatus: ExportStatus; FailedDocuments: FailedDocument[] }> {
  const { Url, Method, Token, ContainerName, ContentType, ExportGuid } = params;

  try {
    const BulkExportStatusResRaw = await GetDocBulkExportStatus({
      Url,
      Method,
      Token,
      ContainerName,
      ContentType,
      ExportGuid,
    });
    console.log ("Raw Response:", BulkExportStatusResRaw);
    const BulkExportStatusRes = JSON.parse(BulkExportStatusResRaw);
//    const json: DocBulkExportStatusResponse = JSON.parse(rawResponse);

    const exportStatus = BulkExportStatusRes.ExportStatus ?? {};
    const failedDocuments = BulkExportStatusRes.FailedDocuments ?? [];

    const ExportStatus: ExportStatus = {
      exportComment: exportStatus.exportComment,
      totalDocumentsCount: exportStatus.totalDocumentsCount,
      processedDocumentPercentage: exportStatus.processedDocumentPercentage,
      processedDocumentSuccessfulCount: exportStatus.processedDocumentSuccessfulCount,
      processedDocumentFailedCount: exportStatus.processedDocumentFailedCount,
    };

    return { ExportStatus, FailedDocuments: failedDocuments };
  } catch (error: any) {
    throw new Error(`GetDocBulkExportStatusReport: ${error.message || error}`);
  }
}


export async function submitBulkExport(
  submitBulkExportParams: IsubmitBulkExportParams
): Promise<any> {
  //  $DocBulkExportResponse= Send-DocBulkExport -Url $CurrentSendDocBulkExportConfig.Url `
  // -Method $CurrentSendDocBulkExportConfig.Method `
  // -sftpHostName $CurrentSendDocBulkExportConfig.sftpHostName `
  // -ContentType $CurrentSendDocBulkExportConfig.ContentType `
  // -Token $Token.access_token  -ContainerName $ContainerName `
  // -ZipName $ZipName -SftpUsername $SftpUsername -SftpPassword $SftpPassword `
  // -DocumentsGUID $Documents | ConvertFrom-Json

  const headers = {
    "Content-Type": submitBulkExportParams.ContentType,
    Authorization: `Bearer ${submitBulkExportParams.Token}`,
    ContainerName: submitBulkExportParams.ContainerName,
    ZipName: submitBulkExportParams.ZipName,
    SftpUsername: submitBulkExportParams.SftpUsername,
    sftppassword: submitBulkExportParams.sftppassword,
    sftpHostName: submitBulkExportParams.sftpHostName,
  };

  const response = await fetch(submitBulkExportParams.Url, {
    method: submitBulkExportParams.Method,
    headers: headers,
    body: JSON.stringify({
      DocumentsGUID: submitBulkExportParams.DocumentsGUID,
    }),
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
    ContainerName: string;
  }
) {
  console.log(JSON.stringify(values));

  const mutation = `
    mutation AddDocExportOutput($db: String!, $input: DocExportOutputInput!) {
      addDocExportOutput(db: $db, input: $input) {
        env
        ExportGuid
        Filename
        Password
        SftpUser
        sftppassword
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
      sftppassword: values.sftppassword,
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
