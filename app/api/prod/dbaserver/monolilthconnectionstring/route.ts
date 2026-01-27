import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
// import { getDbaServerPool } from "@/lib/dbaserver"; // <-- from your previous setup
//import {getDbaserverData} from "@/app/api/dbaserver/route"
// 🧠 GraphQL Schema Definition

const typeDefs = `#graphql
  scalar Date

  type ConnectionString {
    ClientID: ID!
    Namespace: String!
    ConstringDatabaseName: String!
    ConstringServerName: String!
    ConStringLogin: String!
    ControlDBName: String!
    ControlServerName: String!
    Timeout: Int!
    Comment: String!
    ISBI: Boolean!
    StandardQueryTimeout: Int!
    ClientTimeoutMinutes: Int!
    ConnectionType: String!
    DatabaseConnectionLastModifiedTimestamp: Date!
    CollectedTimeStamp: Date!
    IsDecomm: Boolean!
 }

  type Query {
    ConnectionStrings(db: String!): [ConnectionString!]!
    ConnectionStringByClientIdName(db: String!, ClientId: Int!, Namespace: String!): [ConnectionString!]!
  }
`;

const resolvers = {
  Query: {
    ConnectionStrings: async (
      _: unknown,
      { db }: { db: string },
      __: unknown,
      info: GraphQLResolveInfo
    ) => {
      const fields = Object.keys(graphqlFields(info));
      const sqlColumns = fields.map((f) => `[${f}]`).join(", ");
      const result = await fetch(`${process.env.APPDAPIROOT}/api/dbaserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: db,
          q: `
      SELECT 
           ${sqlColumns}
         FROM MonolithConnectionStrings_prod
      `,
        }),
      }).then((res) => res.json());
      return result;
    },

    ConnectionStringByClientIdName: async (
      _: unknown,
      { db, ClientId, Namespace }: { db: string; ClientId: number; Namespace: string },
      __: unknown,
      info: GraphQLResolveInfo
    ) => {
      const fields = Object.keys(graphqlFields(info));
      const sqlColumns = fields.map((f) => `[${f}]`).join(", ");
      const result = await fetch(`${process.env.APPDAPIROOT}/api/dbaserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: db,
          q: `
      SELECT 
           ${sqlColumns}
         FROM MonolithConnectionStrings_prod
          WHERE ClientID = ${ClientId} AND Namespace = '${Namespace}'
      `,
        }),
      }).then((res) => res.json());
      return result;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 🧠 Next.js Route Handler (App Router)

const handler = startServerAndCreateNextHandler<NextRequest>(server);
export async function GET(req: NextRequest) {
  return handler(req);
}
export const POST = GET;
