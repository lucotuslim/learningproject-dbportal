export const typeDefs = `#graphql

scalar DateTime

type ServerPrincipal {
  name: String!
  create_date: DateTime!
  default_database_name: String!
}

type Query {
  serverprincipal(
    server: String!
    db: String!
  ): [ServerPrincipal!]!

  serverprincipalByName(
    server: String!
    db: String!
    name: String!
  ): [ServerPrincipal!]!

  
}


`;
