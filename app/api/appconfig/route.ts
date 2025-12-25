import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
//import { getClientPool } from "@/lib/clientdb";
//import {getClientData} from "@/app/api/clientdb/route"

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql
  type AppConfig {
    ConfigJson: String!
  }
  type Query {
    GetAppConfig(db: String!, config: String! ): [AppConfig!]!
  }
`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    GetAppConfig: async (
      _: unknown,
      { db , config}: {  db: string; config: string  }
    ) => {
      try {
        console.log("GetAppConfig called with:", {  db, config });
          const res = await fetch(  `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/dbaserver`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({  db: db, 
              q: ` SELECT [ConfigJson]
          FROM [dbo].[AppConfig]
          WHERE ConfigSection = '${config}' `}),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`GetConfig failed: ${res.status} ${res.statusText} ${text}`);
          }
          const json = await res.json();
          // return the JSON payload (expected array of { DocumentGUID: string })
          return json;
      } catch (err) {
        console.error("SQL error:", err);
        throw err;
      }
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
export async function GET(req: NextRequest) {
  return handler(req);
}
export const POST = GET;