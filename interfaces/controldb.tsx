import { IErrorResponse } from "./generic";
import { ISqlServerInstance } from "./generic";

export interface IapiControlDbUrl {
  apiurl: string;
}

export interface IapiControlDbUrlWithSqlServer extends IapiControlDbUrl, ISqlServerInstance,IErrorResponse{}
