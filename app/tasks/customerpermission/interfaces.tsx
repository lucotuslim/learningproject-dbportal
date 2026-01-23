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

export interface IConnectionString {
  ClientID: number;
  Namespace: string;
  ConstringDatabaseName: string;
  ConstringServerName: string;
  ConStringLogin?: string;
  ControlDBName?: string;
  ControlServerName?: string;
  Timeout?: number;
  Comment?: string;
  ISBI?: boolean;
  StandardQueryTimeout?: number;
  ClientTimeoutMinutes?: number;
  ConnectionType: string;
  DatabaseConnectionLastModifiedTimestamp?: string; // ISO datetime
  CollectedTimeStamp?: string; // ISO datetime
  IsDecomm: boolean;
}

export interface IConnectionStringWithFound extends IConnectionString {
  ConnectionStringFound: boolean;
}

export interface IConnectionStringWithDbPermission extends IConnectionStringWithFound {
  dbpermission: string[]
  serverPrincipal: string | null
  ServerPrincipalFound: boolean
  databasePrincipal: string | null
  DatabasePrincipalFound: boolean
  DatabaseUserMappings: string[]

}

export interface IPermissionMapping {
  permission: "Owner" | "ReadWrite" | "ReadOnly";
  dbPermission: string[]
}

export interface IServerPrincipal {
  name: string;
  create_date: Date;
  default_database_name: string | null;
}

export interface IDatabasePrincipal {
  name: string;
  type_desc: string;
  create_date: Date;
  modify_date: Date;
}

export interface IDatabaseUserMapping {
  DatabaseUser: string;
  DatabaseRole: string[]
}