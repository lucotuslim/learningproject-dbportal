import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
// import { getDbaServerPool } from "@/lib/dbaserver"; // <-- from your previous setup
//import {getDbaserverData} from "@/app/api/dbaserver/route"
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
    namespaces: async  (_: unknown, { db}: { db: string;},__: unknown, info: GraphQLResolveInfo) => {
      const fields = Object.keys(graphqlFields(info));
        const sqlColumns = fields.map(f => `[${f}]`).join(", ");
  const result: Namespace[] = await fetch(`${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/dbaserver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      db: db,
      q: `
      SELECT 
           ${sqlColumns}
         FROM Vw_MonolithConnectionStrings_Prod_Env
      `
     }),
  }).then(res => res.json()) as Namespace[];
      return result;
    },

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
  // const result: Namespace[] = await getDbaserverData<Namespace[]>(db, 
  //   `
  //   SELECT 
  //        ${sqlColumns}
  //      FROM Vw_MonolithConnectionStrings_Prod_Env
  //      WHERE Namespace = '${namespace}'
  //   `
  // )
  const result: Namespace[] = await fetch(`${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/dbaserver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      db: db,
      q: `
      SELECT 
           ${sqlColumns}
         FROM Vw_MonolithConnectionStrings_Prod_Env
         WHERE Namespace = '${namespace}'
      `
     }),
  }).then(res => res.json()) as Namespace[];
      
//      console.log ("Result:", JSON.stringify(result));   

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
export async function GET(req: NextRequest) {
  return handler(req);
}
export const POST = GET;
