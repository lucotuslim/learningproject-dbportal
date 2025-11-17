export interface IDocExportOutput {
  env: string
  ExportGuid: string
  Filename: string
  Password: string
  SftpUser: string
  sftppassword: string
  ContainerName: string
  Namespace: string
  CreatedBy: string
}


export interface IDocumentConfig {
  env: string;
  GetDocApiToken: {
    Url: string;
    Method: string;
    ContentType: string;
    GrantType: string;
    ClientSecret: string;
  };
  SendDocBulkExport: {
    Url: string;
    Method: string;
    ContentType: string;
    sftpHostName: string;
  };
  GetDocBulkExportStatus: {
    Url: string;
    Method: string;
    ContentType: string;
  };
}
