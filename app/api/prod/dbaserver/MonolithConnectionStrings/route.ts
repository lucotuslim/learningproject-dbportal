import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { getPool } from "@/lib/dbaserver"; // <-- from your previous setup

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql
  scalar Date

  type Namespace {
    ClientID: ID!
    Namespace: String!
    ConstringDatabaseName: String!
    ConstringServerName: String!
    CreatedDate: Date!
  }

  type Query {
    namespaces(db: String!): [Namespace!]!
    namespace(db: String!, ClientID: ID!): Namespace
  }

  type Mutation {
    addNamespace(
      db: String!,
      Namespace: String!,
      ConstringDatabaseName: String!,
      ConstringServerName: String!
    ): Namespace
  }
`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    // Fetch all namespaces
    namespaces: async (_: any, { db }: { db: string }) => {
      const pool = await getPool(db);
      const result = await pool.request().query(`
        SELECT 
          ClientID, 
          Namespace, 
          ConstringDatabaseName, 
          ConstringServerName, 
          CreatedDate 
        FROM Vw_MonolithConnectionStrings_Prod_Env
      `);
      return result.recordset;
    },

    // Fetch a single namespace by ClientID
    namespace: async (_: any, { db, ClientID }: { db: string; ClientID: string }) => {
      const pool = await getPool(db);
      const result = await pool
        .request()
        .input("ClientID", ClientID)
        .query(`
          SELECT 
            ClientID, 
            Namespace, 
            ConstringDatabaseName, 
            ConstringServerName, 
            CreatedDate 
          FROM Vw_MonolithConnectionStrings_Prod_Env
          WHERE ClientID = @ClientID
        `);
      return result.recordset[0] || null;
    },
  },

  Mutation: {
    addNamespace: async (
      _: any,
      {
        db,
        Namespace,
        ConstringDatabaseName,
        ConstringServerName,
      }: {
        db: string;
        Namespace: string;
        ConstringDatabaseName: string;
        ConstringServerName: string;
      }
    ) => {
      const pool = await getPool(db);
      const result = await pool
        .request()
        .input("Namespace", Namespace)
        .input("ConstringDatabaseName", ConstringDatabaseName)
        .input("ConstringServerName", ConstringServerName)
        .query(`
          INSERT INTO Vw_MonolithConnectionStrings_Prod_Env (Namespace, ConstringDatabaseName, ConstringServerName, CreatedDate)
          OUTPUT INSERTED.ClientID, INSERTED.Namespace, INSERTED.ConstringDatabaseName, INSERTED.ConstringServerName, INSERTED.CreatedDate
          VALUES (@Namespace, @ConstringDatabaseName, @ConstringServerName, GETDATE())
        `);
      return result.recordset[0];
    },
  },
};

// 🧠 Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 🧠 Next.js Route Handler (App Router)
const handler = startServerAndCreateNextHandler<NextRequest>(server);
export const GET = handler;
export const POST = handler;
