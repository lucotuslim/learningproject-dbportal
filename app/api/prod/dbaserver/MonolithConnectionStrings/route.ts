import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import graphqlFields from "graphql-fields";
// import { getDbaServerPool } from "@/lib/dbaserver"; // <-- from your previous setup
import {getDbaserverData} from "@/app/api/dbaserver/route"

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
    namespace(db: String!, namespace: String!): Namespace
  }

  // type Mutation {
  //   addNamespace(
  //     db: String!,
  //     Namespace: String!,
  //     ConstringDatabaseName: String!,
  //     ConstringServerName: String!
  //   ): Namespace
  // }
`;

const resolvers = {
  Query: {
    // Fetch all namespaces
    namespaces: async (_: any, { db }: { db: string }) => {
      
      // const pool = await getDbaServerPool(db);
      // const result = await pool.request().query(`
      //   SELECT 
      //     ClientID, 
      //     Namespace, 
      //     ConstringDatabaseName, 
      //     ConstringServerName, 
      //     CreatedDate 
      //   FROM Vw_MonolithConnectionStrings_Prod_Env
      // `);
      const result =  await getDbaserverData(db,
      `    SELECT ClientID,  Namespace, 
          ConstringDatabaseName, 
          ConstringServerName, 
          CreatedDate 
        FROM Vw_MonolithConnectionStrings_Prod_Env `
      )
      return result.recordset;
    },

    // Fetch a single namespace by ClientID
    namespace: async (_: any, { db, namespace }: { db: string; namespace: string },__: any, info: any) => {
      console.log ("Fetching namespace:", namespace, "from db:", db);
      const fields = Object.keys(graphqlFields(info));
  //       const pool = await getDbaServerPool(db);
  // const result = await pool
  //   .request()
  //   .input("Namespace", namespace)
  //   .query(`
  //     SELECT 
  //       ClientID, 
  //       Namespace, 
  //       ConstringDatabaseName, 
  //       ConstringServerName, 
  //       CreatedDate 
  //     FROM Vw_MonolithConnectionStrings_Prod_Env
  //     WHERE Namespace = @Namespace
  //   `);
  const sqlColumns = fields.map(f => `[${f}]`).join(", ");
  const result = await getDbaserverData(db, 
    `
    SELECT 
         ${sqlColumns}
       FROM Vw_MonolithConnectionStrings_Prod_Env
       WHERE Namespace = '${namespace}'
    `
  )
 // console.log (JSON.stringify(result));
      return result[0] || null;
    },
  },

  // Mutation: {
  //   addNamespace: async (
  //     _: any,
  //     {
  //       db,
  //       Namespace,
  //       ConstringDatabaseName,
  //       ConstringServerName,
  //     }: {
  //       db: string;
  //       Namespace: string;
  //       ConstringDatabaseName: string;
  //       ConstringServerName: string;
  //     }
  //   ) => {
      
  //     // const pool = await getDbaServerPool(db);
  //     // const result = await pool
  //     //   .request()
  //     //   .input("Namespace", Namespace)
  //     //   .input("ConstringDatabaseName", ConstringDatabaseName)
  //     //   .input("ConstringServerName", ConstringServerName)
  //     //   .query(`
  //     //     INSERT INTO Vw_MonolithConnectionStrings_Prod_Env (Namespace, ConstringDatabaseName, ConstringServerName, CreatedDate)
  //     //     OUTPUT INSERTED.ClientID, INSERTED.Namespace, INSERTED.ConstringDatabaseName, INSERTED.ConstringServerName, INSERTED.CreatedDate
  //     //     VALUES (@Namespace, @ConstringDatabaseName, @ConstringServerName, GETDATE())
  //     //   `);
  //     const result = await getDbaserverData(db,
  //       `
  //        --INSERT INTO Vw_MonolithConnectionStrings_Prod_Env (Namespace, ConstringDatabaseName, ConstringServerName, CreatedDate)
  //        --  OUTPUT INSERTED.ClientID, INSERTED.Namespace, INSERTED.ConstringDatabaseName, INSERTED.ConstringServerName, INSERTED.CreatedDate
  //        --  VALUES (@Namespace, @ConstringDatabaseName, @ConstringServerName, GETDATE())
  //       `
  //     )
  //     return result.recordset[0];
  //   },
  // },
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
