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
  ConStringLogin: string;
  ControlDBName: string;
  ControlServerName: string;
  Timeout: number;
  Comment: string;
  ISBI: boolean;
  StandardQueryTimeout: number;
  ClientTimeoutMinutes: number;
  ConnectionType: string;
  DatabaseConnectionLastModifiedTimestamp: string; // ISO datetime
  CollectedTimeStamp: string; // ISO datetime
  IsDecomm: boolean;
}