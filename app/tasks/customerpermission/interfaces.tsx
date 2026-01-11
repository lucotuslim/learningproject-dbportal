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
