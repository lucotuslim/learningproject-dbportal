export interface IDocExportOutput {
  ExportGuid: string
  Filename: string
  Password?: string
  SftpUser: string
  sftppassword?: string
  ContainerName: string
  Namespace: string
  CreatedBy: string
}