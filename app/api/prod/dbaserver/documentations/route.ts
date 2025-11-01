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
    sftppassword: String
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
      const pool = await getPool(db);
      const result = await pool.request().query(`
        SELECT * FROM [dbo].[DocExportOutput]
      `);
      return result.recordset.map(normalizeRecord);
    },

    // convenience no-arg query that uses env default DB
    docExports: async () => {
      const db = process.env.DOCEXPORT_DB || process.env.DEFAULT_DB || "master";
      const pool = await getPool(db);
      const result = await pool.request().query(`
        SELECT * FROM [dbo].[DocExportOutput]
      `);
      return result.recordset.map(normalizeRecord);
    }
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

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:3000/api/prod/dbaserver/documentations";
const query = `query Query($db: String!) { docExportOutputs(db: $db) { ExportGuid Filename } }`;
const variables = { db: process.env.DOCEXPORT_DB || "master" };

try {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) throw new Error(`Network error: ${res.status} - ${JSON.stringify(json)}`);

  if (json?.errors?.length) {
    const msg = json.errors.map((e: any) => e.message ?? JSON.stringify(e)).join("; ");
    throw new Error(`GraphQL error: ${msg}`);
  }

  const items = json?.data?.docExportOutputs ?? [];
  // use items
} catch (err: any) {
  console.error("Query failed:", err);
  // set error state: err.message || String(err)
}
