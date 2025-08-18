import { IErrorResponse } from "./generic";

export interface IapiControlDbUrl {
  Controldburl: string;
}

export interface ISqlServerInstance {
  MachineName: string;
  ServerName: string;
  Edition: string;
  ProductVersion: string;
  EngineEdition: string;
  ClusterStatus: string;
  AuthenticationMode: string;
}

export interface IapiControlDbUrlWithSqlServer extends IapiControlDbUrl, ISqlServerInstance {}
export interface IapiControlDbUrlWithError extends IapiControlDbUrl, IErrorResponse {}