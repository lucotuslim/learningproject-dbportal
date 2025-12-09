import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import graphqlFields from "graphql-fields";
import { NextRequest } from "next/server";
//import { getDbaServerPool } from "@/lib/dbaserver";
import {getDbaserverData} from "@/app/api/dbaserver/route"
import { GraphQLResolveInfo } from "graphql";

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql
  scalar DateTime
  type DocExportOutput {
    env: String
    ExportGuid: String
    Filename: String
    Password: String
    SftpUser: String
    sftppassword: String
    ContainerName: String
    Namespace: String
    CreatedBy: String
    CreatedDate: DateTime
  }

  type Query {
    _empty: String
    docExportOutputs(db: String!): [DocExportOutput!]!
  }

  input DocExportOutputInput {
  env: String
  ExportGuid: String
  Filename: String
  Password: String
  SftpUser: String
  sftppassword: String
  ContainerName: String
  Namespace: String
  CreatedBy: String
  }

  type Mutation {
    addDocExportOutput(db: String!, input: DocExportOutputInput!): DocExportOutput
  }
`;

// // helper to normalize record fields
// function normalizeRecord(row: any) {
//   return {
//     env: row.env ?? row.env,
//     ExportGuid: row.ExportGuid ?? row.ExportGuid,
//     Filename: row.Filename ?? row.Filename,
//     Password: row.Password ?? row.Password,
//     SftpUser: row.SftpUser ?? row.SftpUser,
//     sftppassword: row.sftppassword ?? row.sftppassword,
//     ContainerName: row.ContainerName ?? row.ContainerName,
//     Namespace: row.Namespace ?? row.Namespace,
//     CreatedBy: row.CreatedBy ?? row.CreatedBy,
//     CreatedDate : row.CreatedDate ?? row.CreatedDate
//   };
// }

// 🧠 Resolvers
const resolvers = {
  Query: {
    // query that requires explicit db param
    docExportOutputs: async (_: unknown, { db }: { db: string },__: unknown, info: GraphQLResolveInfo) => {
      const fields = Object.keys(graphqlFields(info));
      // const pool = await getDbaServerPool(db);
      // const result = await pool.request().query(`
      //   SELECT * FROM [dbo].[DocExportOutput]
      // `);
      const sqlColumns = fields.map(f => `[${f}]`).join(", ");
      const result = await getDbaserverData(db, `
        SELECT ${sqlColumns} FROM [dbo].[DocExportOutput]
      `);
      return result;
    },
  },

  Mutation: {
    addDocExportOutput: async (_: unknown, { db, input }: { db: string; input: Record<string, unknown> }) => {
    const formatValue = (val: unknown): string => {
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "number" || typeof val === "boolean") {
        return val.toString();
      }
      if (val instanceof Date) {
        return `'${val.toISOString()}'`;
      }
      // Treat all other values as strings
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    const columns = Object.keys(input).map(c => `[${c}]`);
    const values = Object.keys(input).map(c => formatValue(input[c]));
    const sql = `
      INSERT INTO [dbo].[DocExportOutput] (${columns.join(',')})
      OUTPUT INSERTED.ExportGuid, INSERTED.Filename,  INSERTED.ContainerName, INSERTED.CreatedBy, INSERTED.Namespace
      VALUES (${values.join(',')})
    `;
      const result = await getDbaserverData(db,sql)
      return result[0]
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest>(server);
export const GET = handler;
export const POST = handler;
