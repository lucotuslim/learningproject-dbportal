export interface ICustomerPermissionConfig {
  customerdb: string
  customerdbserver: string
  monolilthconnectionstringdb: string
  domainprefix: string
  // notallowedlist: Record<Environment, NotAllowedUser[]>
}

export type Environment = "nonprod" | "preprod" | "prod"

export interface NotAllowedUser {
  name: string
  type_desc: "SQL_LOGIN" | "WINDOWS_LOGIN" | "WINDOWS_GROUP"
}

export interface CustomerSecurityGroupMetaData {
  clientIDList: string;
}

export interface ICustomerSecurityGroup {
  CustomerSecurityGroupsId: number;
  GroupSID: string;
  Environment: "Prod" | "PreProd" | "NonProd";
  Namespace: string;
  ClientId: number;
  GroupName: string;
  MetaData: CustomerSecurityGroupMetaData;
  CollectedTimestamp: string; // ISO datetime
  Permission: "Owner" | "Read" | "ReadOnly";
  IsDeleted: boolean;
}

export interface IHCMCore {
  ClientID: number;
  Namespace: string;
  ConstringDatabaseName: string;
  ConstringServerName: string;
  HCMCoreEnvironment: string;
}

export interface IHCMCoreWithFound extends IHCMCore {
  ConnectionStringFound: boolean;
}

export interface IHCMCoreWithDbPermission extends IHCMCoreWithFound {
  dbpermission: string[]
  serverPrincipal: string | null
  ServerPrincipalFound: boolean | null
  databasePrincipal: string | null
  DatabasePrincipalFound: boolean | null
  DatabaseUserMappings: string[]
  MissingRoleMappings: string[]
  error?: string
}

export interface IPermissionMapping {
  permission: "Owner" | "ReadWrite" | "ReadOnly";
  dbPermission: string[]
}

export interface IServerPrincipal {
  name: string;
  create_date: Date;
  default_database_name: string | null;
  error: string;
  errorMessage: string
}

export interface IDatabasePrincipal {
  name: string;
  type_desc: string;
  create_date: Date;
  modify_date: Date;
  error: string;
  errorMessage: string
}

export interface IDatabaseUserMapping {
  DatabaseUser: string;
  DatabaseRole: string[]
}