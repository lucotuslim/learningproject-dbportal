export const typeDefs = `#graphql
scalar JSON
scalar DateTime
scalar Date

type CoreHCMDatabaseInventory {
    ClientID: ID!
    Namespace: String!
    ConstringDatabaseName: String!
    ConstringServerName: String!
    HCMCoreEnvironment: String
 }

type Query {
  CoreHCMDatabaseInventory(db: String!, Environment: String!): [CoreHCMDatabaseInventory!]!
  CoreHCMDatabaseInventoryByClientIdArray(db: String!, ClientIds: [Int!]!, Environment: String!,ClientEnvironment: String!): [CoreHCMDatabaseInventory!]!

}

`;
