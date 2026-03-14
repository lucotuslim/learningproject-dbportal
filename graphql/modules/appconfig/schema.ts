export const typeDefs = `#graphql

  type AppConfig {
    ConfigId: Int!
    ConfigSection: String!
    ConfigJson: String!
    CreatedAt: String!
    UpdatedAt: String!
  }

  input AddAppConfigInput {
    server: String!
    db: String!
    configSection: String!
    configJson: String!
  }

  input DeleteAppConfigInput {
    server: String!
    db: String!
    configSection: String!
    configJson: String!
  }

  input UpdateAppConfigInput {
    server: String!
    db: String!
    configSection: String!
    configJson: String!
  }

  input UpdateGlobalConfigInput {
    server: String!
    db: String!
    configSection: String!
    configKey: String!
    configJson: String!
  }
  
  type Query {
    GetAppConfig(server: String!, db: String!, config: String! ): [AppConfig!]!
  }

  type Mutation {
    AddAppConfig(input: AddAppConfigInput!): AppConfig
    DeleteAppConfig(input: DeleteAppConfigInput!): AppConfig
    UpdateAppConfig(input: UpdateAppConfigInput!): AppConfig
    UpdateGlobalConfig(input: UpdateGlobalConfigInput!): AppConfig
  }

`;
