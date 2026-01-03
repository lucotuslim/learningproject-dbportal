import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
//import { getClientPool } from "@/lib/clientdb";
//import {getClientData} from "@/app/api/clientdb/route"

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql
  type GetDocumentListAll {
    DocumentGUID: String!
  }
  type Query {
    GetDocumentListAll(servername: String!, db: String! ): [GetDocumentListAll!]!
  }
`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    GetDocumentListAll: async (
      _: unknown,
      { servername  ,db }: { servername: string ; db: string;  }
    ) => {
      try {
          const res = await fetch(  `${process.env.APPDAPIROOT}/api/clientdb`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ server: servername, db: db, q: "exec dbo.GetDocumentListAll @IsJson  = 0;" }),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`clientdb API failed: ${res.status} ${res.statusText} ${text}`);
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