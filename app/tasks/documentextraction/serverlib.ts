'use server';
import { getApiToken } from "@/lib/serverutils";
import { DocumentExtractionTasksSetting } from "@/app/tasks/documentextraction/appconfig";
import { DocBulkExportStatusParams, DocBulkExportStatusReportParams, ExportStatus, FailedDocument } from "./interfaces";
import {IDocBulkExportStatus} from "./interfaces"

export async function checkexportStatus(
  env: string,
  Namespace: string,
  ExportGuid: string, 
  environment: string
) {
  const DocumentConfig = await DocumentExtractionTasksSetting();
  const currentconfig = DocumentConfig.find( (e)  => e.env===env)
  const namespace = await fetchNamespace("ServerInventory", Namespace, environment);
  const ContainerName = `${namespace.Namespace}-${namespace.ClientID}`;
  if (!currentconfig) {return}
  const token = await getApiToken({
    Url: currentconfig.GetDocApiToken.Url,
    Method: currentconfig.GetDocApiToken.Method,
    ContentType: currentconfig.GetDocApiToken.ContentType,
    GrantType: currentconfig.GetDocApiToken.GrantType,
    ClientId: currentconfig.GetDocApiToken.ClientId,
    Scope: currentconfig.GetDocApiToken.Scope,
    ClientSecret: process.env.DocApiClientSecret!
    // ClientId: process.env.NEXT_PUBLIC_DocApiClientId!,
    // Scope: process.env.NEXT_PUBLIC_DocApiScope!,
    // ClientSecret: process.env.DocApiClientSecret!,
  });

//     console.log (   ({
//     Url: process.env.NEXT_PUBLIC_GetDocBulkExportStatusUrl!,
//     Method: process.env.NEXT_PUBLIC_GetDocBulkExportStatusMethod!,
//     Token: token.access_token,
//     ContainerName: ContainerName,
//     ContentType: process.env.NEXT_PUBLIC_GetDocBulkExportStatusContentType!,
//     ExportGuid: ExportGuid,
//   })
//  ) 
const getDocBulkExportStatusReport = await GetDocBulkExportStatusReport({
    Url: currentconfig.GetDocBulkExportStatus.Url,
    Method: currentconfig.GetDocBulkExportStatus.Method,
    Token: token.access_token,
    ContainerName: ContainerName,
    ContentType: currentconfig.GetDocBulkExportStatus.ContentType,
    ExportGuid: ExportGuid,
  }); 
  
    console.log("Export Status:", getDocBulkExportStatusReport.ExportStatus);
    console.log("Failed Documents:", getDocBulkExportStatusReport.FailedDocuments);
return getDocBulkExportStatusReport ;
    // Open new tab for result page
    //const newTab = window.open("./documentextraction/report", "_blank");

    // Wait a bit for the new tab to load, then send data
    // setTimeout(() => {
    //   newTab?.postMessage({ type: "RESULT_DATA", payload: getDocBulkExportStatusReport }, "*");
    // }, 500);
  }


export async function GetDocBulkExportStatus(params: DocBulkExportStatusParams): 
Promise<IDocBulkExportStatus> {
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

    const content :IDocBulkExportStatus=  await response.json()

    if (!response.ok) {
      // Mimic PowerShell’s catch: capture HTTP error body
      return (  {  message: response.statusText, error: true })
      //throw new Error(content || `HTTP error: ${response.status}`);
    }

    return {...content ,
      error: false , 
      message: ""
    }
  } catch (error: unknown) {
    return error instanceof Error ? {message: error.message, error : true } 
      : {message: "", error : true } 
  }
}

export async function GetDocBulkExportStatusReport(
  params: DocBulkExportStatusReportParams
): Promise<{ ExportStatus: ExportStatus; FailedDocuments: FailedDocument[] }> {
  const { Url, Method, Token, ContainerName, ContentType, ExportGuid } = params;

  try {
    const BulkExportStatusRes = await GetDocBulkExportStatus({
      Url,
      Method,
      Token,
      ContainerName,
      ContentType,
      ExportGuid,
    });
    console.log ("Raw Response:", BulkExportStatusRes);
    //const BulkExportStatusRes = JSON.parse(BulkExportStatusResRaw);
//    const json: DocBulkExportStatusResponse = JSON.parse(rawResponse);
    if (BulkExportStatusRes.error !== true) {
    const exportStatus = BulkExportStatusRes.apiResult!.exportStatus ?? {};
    const failedDocuments = BulkExportStatusRes.apiResult!.exportStatus.failedDocuments ?? [];

    const ExportStatus: ExportStatus = {
      exportComment: exportStatus.exportComment,
      totalDocumentsCount: exportStatus.totalDocumentsCount,
      processedDocumentPercentage: exportStatus.processedDocumentPercentage,
      processedDocumentSuccessfulCount: exportStatus.processedDocumentSuccessfulCount,
      processedDocumentFailedCount: exportStatus.processedDocumentFailedCount,
    };

    return { ExportStatus, FailedDocuments: failedDocuments };
    } else { 
      throw new Error(`GetDocBulkExportStatusReport: ${BulkExportStatusRes.message}`);  
    }
  } catch (error: unknown) {
    throw new Error(`GetDocBulkExportStatusReport: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// export async function submitBulkExport(
//   submitBulkExportParams: IsubmitBulkExportParams
// ): Promise<any> {

//   const headers = {
//     "Content-Type": submitBulkExportParams.ContentType,
//     Authorization: `Bearer ${submitBulkExportParams.Token}`,
//     ContainerName: submitBulkExportParams.ContainerName,
//     ZipName: submitBulkExportParams.ZipName,
//     SftpUsername: submitBulkExportParams.SftpUsername,
//     sftppassword: submitBulkExportParams.sftppassword,
//     sftpHostName: submitBulkExportParams.sftpHostName,
//   };
//   console.log(JSON.stringify(submitBulkExportParams))
//   const response = await fetch(submitBulkExportParams.Url, {
//     method: submitBulkExportParams.Method,
//     headers: headers,
//     body: JSON.stringify({
//       Data: submitBulkExportParams.DocumentsGUID,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`API error: ${response.status}`);
//   }
//   return await response.json();
// }

export async function fetchNamespace(db: string, namespace: string, environment: string) {
  const query = `
    query Namespace($db: String!, $namespace: String!) {
      namespace(db: $db, namespace: $namespace) {
        ClientID
        Namespace
        ConstringDatabaseName
        ConstringServerName
      }
    }
  `;
  const variables = { db, namespace };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/${environment}/dbaserver/MonolithConnectionStrings`,
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
    `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/prod/clientdb/getdocumentlistall`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    }
  );
  const data = await res.json();
  console.log (JSON.stringify(data));

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
    `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/prod/dbaserver/documentations`,
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
