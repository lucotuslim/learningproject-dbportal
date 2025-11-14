import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { getDbaServerPool } from "@/lib/dbaserver";
import { getConnection } from "@/lib/dbserver.js"
// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql

  type DocExportOutput {
    ExportGuid: String
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
    docExportOutputs(db: String!): [DocExportOutput!]!
    docExports: [DocExportOutput!]!          # convenience no-arg query for clients
  }

  input DocExportOutputInput {
  ExportGuid: String
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

// helper to normalize record fields
function normalizeRecord(row: any) {
  return {
    ExportGuid: row.ExportGuid ?? row.ExportGuid,
    Filename: row.Filename ?? row.Filename,
    Password: row.Password ?? row.Password,
    SftpUser: row.SftpUser ?? row.SftpUser,
    SftpPassword: row.SftpPassword ?? row.SftpPassword,
    sftppassword: row.SftpPassword ?? row.sftppassword ?? null,
    ContainerName: row.ContainerName ?? row.ContainerName,
    Namespace: row.Namespace ?? row.Namespace,
    CreatedBy: row.CreatedBy ?? row.CreatedBy,
  };
}

// 🧠 Resolvers
const resolvers = {
  Query: {
    // query that requires explicit db param
    docExportOutputs: async (_: any, { db }: { db: string }) => {
      const conn = await getDbaServerPool("ServerInventory");

      // const result = await pool.request().query(`
      //   SELECT * FROM [dbo].[DocExportOutput]
      // `);
      // return result.recordset.map(normalizeRecord);
      try {
        const query = `
      SELECT * FROM [dbo].[DocExportOutput]
    `;

        const result: any = await new Promise((resolve, reject) => {
          conn.query(query, (err: any, rows: any) => {
            if (err) return reject(err);
            resolve(rows);
          });
        });

        return result.map(normalizeRecord);
      } finally {
        // always close connection
        conn.close();
      }

    },

    // convenience no-arg query that uses env default DB
    // docExports: async () => {
    //   const db = process.env.DOCEXPORT_DB || process.env.DEFAULT_DB || "master";
    //   const pool = await getDbaServerPool(db);
    //   const result = await pool.request().query(`
    //     SELECT * FROM [dbo].[DocExportOutput]
    //   `);
    //   return result.recordset.map(normalizeRecord);
    // }
  },

  Mutation: {
    addDocExportOutput: async (_: any, { db, input }: { db: string; input: Record<string, any> }) => {
      const pool = await getConnection();

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
      console.log(sql);
      const result = await request.query(sql);

      // normalize returned row
      return normalizeRecord(result.recordset[0]);
    },
  },
};

// 🧠 Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// 🧠 Next.js Route Handler
const handler = startServerAndCreateNextHandler<NextRequest>(server);
export const GET = handler;
export const POST = handler;
