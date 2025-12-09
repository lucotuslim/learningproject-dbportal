import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
// import { getDbaServerPool } from "@/lib/dbaserver"; // <-- from your previous setup
import {getDbaserverData} from "@/app/api/dbaserver/route"
interface Namespace { 
      ClientID: number
    Namespace: string
    ConstringDatabaseName: string
    ConstringServerName: string
    CreatedDate: Date
}
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

`;

const resolvers = {
  Query: {
    // Fetch all namespaces
    // namespaces: async (_: unknown, { db }: { db: string }) => {
      
    //   // const pool = await getDbaServerPool(db);
    //   // const result = await pool.request().query(`
    //   //   SELECT 
    //   //     ClientID, 
    //   //     Namespace, 
    //   //     ConstringDatabaseName, 
    //   //     ConstringServerName, 
    //   //     CreatedDate 
    //   //   FROM Vw_MonolithConnectionStrings_Prod_Env
    //   // `);
    //   const result =  await getDbaserverData(db,
    //   `    SELECT ClientID,  Namespace, 
    //       ConstringDatabaseName, 
    //       ConstringServerName, 
    //       CreatedDate 
    //     FROM Vw_MonolithConnectionStrings_Prod_Env `
    //   )
    //   return result.recordset;
    // },
    // Fetch a single namespace by ClientID
    namespace: async (_: unknown, { db, namespace }: { db: string; namespace: string },__: unknown, info: GraphQLResolveInfo) => {
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
  const result: Namespace[] = await getDbaserverData<Namespace[]>(db, 
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

};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 🧠 Next.js Route Handler (App Router)
const handler = startServerAndCreateNextHandler<NextRequest>(server);
export const GET = handler;
export const POST = handler;
