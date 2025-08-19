import { IErrorResponse } from "./generic";
import { ISqlServerInstance } from "./generic";

export interface IapiControlDbUrl {
  Controldburl: string;
}

export interface IapiControlDbUrlWithSqlServer extends IapiControlDbUrl, ISqlServerInstance,IErrorResponse{}
