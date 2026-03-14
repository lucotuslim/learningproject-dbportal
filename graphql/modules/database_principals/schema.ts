export const typeDefs = `#graphql

scalar DateTime

type DatabasePrincipal {
  name: String!
  type_desc: String!
  default_schema_name: String
  create_date: DateTime
  modify_date: DateTime
  sid: String
}

type Query {
  databaseprincipal(
    server: String!
    db: String!
  ): [DatabasePrincipal!]!

  databaseprincipalByName(
    server: String!
    db: String!
    name: String!
  ): [DatabasePrincipal!]!

    databaseprincipalByNameType(
    server: String!
    db: String!
    name: String!
    type: String!
  ): [DatabasePrincipal!]!
}


`;
