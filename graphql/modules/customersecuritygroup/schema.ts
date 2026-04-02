export const typeDefs = `#graphql
scalar JSON
scalar DateTime
scalar Date

type CustomerSecurityGroup {
  CustomerSecurityGroupsId: Int!
  GroupSID: String!
  Environment: String!
  Namespace: String!
  ClientId: Int!
  GroupName: String!
  MetaData: JSON
  CollectedTimestamp: DateTime!
  Permission: String!
  IsDeleted: Boolean!
}

type Query {
  customerSecurityGroups(
    server: String!
    db: String!
    environment: String!
    domainprefix: String!
  ): [CustomerSecurityGroup!]!

  customerSecurityGroupByClientIdName(
    server: String!
    db: String!
    environment: String!
    ClientId: Int!
    Namespace: String!
    domainprefix: String!
  ): [CustomerSecurityGroup!]!

  
}

`;
