 
 export interface ApiInterface<T> { 
  items : T[];
  message? : string;
  error?: boolean;
  apiurl: string;
 }

export interface ISqlServerInstance {
  MachineName?: string;
  ServerName?: string;
  Edition?: string;
  ProductVersion?: string;
  EngineEdition?: string;
  ClusterStatus?: string;
  AuthenticationMode?: string;
    Version?: string;
}

export interface IErrorResponse {
  message: string;
  error: boolean;
}

export interface IapiUrl {
  apiurl: string;
  apitype: string
}

export type IapiInfo<T> = IErrorResponse & IapiUrl & Partial<T>;

export interface IApiTokenParams {
  Url: string;
  Method: string;
  ContentType: string;
  GrantType: string;
  ClientId: string;
  Scope: string;
  ClientSecret?: string;
}