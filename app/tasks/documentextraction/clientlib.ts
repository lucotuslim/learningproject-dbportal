'use client';

import { getApiToken } from "@/lib/utils";
import {fetchNamespace} from "./serverlib"

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

    // Open new tab for result page
    const newTab = window.open("./documentextraction/report", "_blank");

    // Wait a bit for the new tab to load, then send data
    setTimeout(() => {
      newTab?.postMessage({ type: "RESULT_DATA", payload: getDocBulkExportStatusReport }, "*");
    }, 500);
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


