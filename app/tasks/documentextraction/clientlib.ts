'use client';

import { getApiToken } from "@/lib/utils";
import {fetchNamespace} from "./serverlib"


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


