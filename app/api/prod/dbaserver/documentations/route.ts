import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { getPool } from "@/lib/dbaserver";

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql

  type DocExportOutput {
    ExportGuid: ID!
    Filename: String
    Password: String
    SftpUser: String
    SftpPassword: String
    ContainerName: String
    Namespace: String
    CreatedBy: String
  }

  type Query {
  _empty: String
}
  type Query {
  docExportOutputs(db: String!): [DocExportOutput!]!
}

  input DocExportOutputInput {
    Filename: String
    Password: String
    SftpUser: String
    SftpPassword: String
    ContainerName: String
    Namespace: String
    CreatedBy: String
  }

  type Mutation {
    addDocExportOutput(db: String!, input: DocExportOutputInput!): DocExportOutput
  }
`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    docExportOutputs: async (_: any, { db }: { db: string }) => {
      const pool = await getPool(db);
      const result = await pool.request().query(`
        SELECT * FROM [dbo].[DocExportOutput]
      `);
      return result.recordset;
    },
  },

  Mutation: {
    addDocExportOutput: async (_: any, { db, input }: { db: string; input: Record<string, any> }) => {
      const pool = await getPool(db);

      // Build dynamic column and parameter lists
      const columns = Object.keys(input);
      const params = columns.map((col) => `@${col}`);
      
      const request = pool.request();
      columns.forEach((col) => {
        request.input(col, input[col]);
      });


      const sql = `
        INSERT INTO [dbo].[DocExportOutput] (${columns.join(",")})
        OUTPUT INSERTED.*
        VALUES (${params.join(",")})
      `;
      console.log (sql)
      const result = await request.query(sql);

      return result.recordset[0];
    },
  },
};

// 🧠 Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// 🧠 Next.js Route Handler
const handler = startServerAndCreateNextHandler<NextRequest>(server);
export const GET = handler;
export const POST = handler;
