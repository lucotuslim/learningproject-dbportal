export interface IsubmitBulkExportParams {
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

export interface DocBulkExportStatusParams {
  Url: string;
  Method: string;
  Token: string;
  ContainerName: string;
  ContentType: string;
  ExportGuid: string;
}

export interface DocBulkExportStatusReportParams {
  Url: string;
  Method: string;
  Token: string;
  ContainerName: string;
  ContentType: string;
  ExportGuid: string;
}

export interface ExportStatus {
  exportComment?: string;
  totalDocumentsCount?: number;
  processedDocumentPercentage?: string;
  processedDocumentSuccessfulCount?: number;
  processedDocumentFailedCount?: number;
}

export interface FailedDocument {
  documentId: string;
  reason: string;
}

export interface IDocBulkExportStatus {
  apiResult?: {
    exportStatus: {
  ExportGUID: string;
  ContainerName:string;
  ExportStatus	:string;
  exportComment:string;
  totalDocumentsCount	:number;
  processedDocumentPercentage:string;
  processedDocumentSuccessfulCount	:number;
  processedDocumentFailedCount:number;
  StartDateTime	:string;
  EndDateTime:string;
  TimeElapsed	:string;
  ExportSteps:string;
  failedDocuments	:FailedDocument[]
  }
  },
  error: boolean; 
  message: string;
}