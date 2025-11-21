import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { getDbaServerPool } from "@/lib/dbaserver";
import {getDbaserverData} from "@/app/api/dbaserver/route"

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql

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
  }

  type Query {
    _empty: String
    docExportOutputs(db: String!): [DocExportOutput!]!
    docExports: [DocExportOutput!]!          # convenience no-arg query for clients
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

// helper to normalize record fields
function normalizeRecord(row: any) {
  return {
    env: row.env ?? row.env,
    ExportGuid: row.ExportGuid ?? row.ExportGuid,
    Filename: row.Filename ?? row.Filename,
    Password: row.Password ?? row.Password,
    SftpUser: row.SftpUser ?? row.SftpUser,
    sftppassword: row.sftppassword ?? row.sftppassword,
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
      // const pool = await getDbaServerPool(db);
      // const result = await pool.request().query(`
      //   SELECT * FROM [dbo].[DocExportOutput]
      // `);
      const result = await getDbaserverData(db, `
        SELECT * FROM [dbo].[DocExportOutput]
      `);
      return result.map(normalizeRecord);
    },

    // // convenience no-arg query that uses env default DB
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
      const formatValue = (val: any): string => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number' || typeof val === 'boolean') return val.toString();
      if (val instanceof Date) return `'${val.toISOString()}'`;
      // escape single quotes inside strings
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    // build column and value lists
    const columns = Object.keys(input).map(c => `[${c}]`);
    const values = Object.keys(input).map(c => formatValue(input[c]));


      // const request = pool.request();
      // columns.forEach((col) => {
      //   request.input(col, input[col]);
      // });
    const sql = `
      INSERT INTO [dbo].[DocExportOutput] (${columns.join(',')})
      OUTPUT INSERTED.ExportGuid, INSERTED.Filename,  INSERTED.ContainerName, INSERTED.CreatedBy, INSERTED.Namespace
      VALUES (${values.join(',')})
    `;

//      console.log(sql);
      
      const result = await getDbaserverData(db,sql)
           
      // normalize returned row
      //return normalizeRecord(result);
      console.log(result)
      return result[0]
      //return (result);
    },
  },
};

// 🧠 Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// 🧠 Next.js Route Handler
const handler = startServerAndCreateNextHandler<NextRequest>(server);
export const GET = handler;
export const POST = handler;
