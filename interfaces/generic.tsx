 
 export interface ApiInterface<T> { 
  items : T[];
  message? : string;
  error?: boolean;
  apiurl: string
 }

export interface ISqlServerInstance {
  MachineName?: string;
  ServerName?: string;
  Edition?: string;
  ProductVersion?: string;
  EngineEdition?: string;
  ClusterStatus?: string;
  AuthenticationMode?: string;
}

export interface IErrorResponse {
  message: string;
  error: boolean;
}

export interface IapiUrl {
  apiurl: string;
}

export type IapiInfo<T> = IErrorResponse & IapiUrl & Partial<T> & { type: string };