
export interface IServerInfoDetails {
  BuildClrVersion?: string;
  Collation?: string;
  CollationID?: number;
  ComparisonStyle?: number;
  Edition?: string;
  EngineEdition?: number;
  InstanceDefaultDataPath?: string;
  InstanceDefaultLogPath?: string;
  InstanceName?: string;
  IsClustered?: boolean;
  IsHadrEnabled?: boolean;
  IsIntegratedSecurityOnly?: boolean;
  IsSingleUser?: boolean;
  LCID?: number;
  LicenseType?: string;
  MachineName?: string;
  NumLicenses?: number;
  ProcessID?: number;
  ProductBuild?: number;
  ProductBuildType?: string;
  ProductLevel?: string;
  ProductMajorVersion?: number;
  ProductMinorVersion?: number;
  ProductUpdateLevel?: string;
  ProductUpdateReference?: string;
  ProductVersion?: string;
  ResourceLastUpdateDateTime?: Date | string;
  ResourceVersion?: string;
  ServerName?: string;
  SqlCharSet?: number;
  SqlCharSetName?: string;
  SqlSortOrder?: number;
  SqlSortOrderName?: string;
  Version?: string;
  ClusterStatus?: string;
  AuthenticationMode?: string;
}

//export interface IapiSqlServerInfo extends ISqlServerInfo, IErrorResponse{}
