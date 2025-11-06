import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { getClientPool } from "@/lib/clientdb";

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
      _: any,
      { servername  ,db }: { servername: string ; db: string;  }
    ) => {
      try {
        console.log(`Connecting to server ${servername} db ${db}`);
        const pool = await getClientPool(servername, db );
        const request = pool.request();

        // Call stored procedure (no JSON mode)
        // const result = await request.execute(" dbo.GetDocumentListAll @IsJson  = 0");
        const result = await request.query(`
  EXEC GetDocumentListAll @IsJson = 0;
`);
        // Return only DocumentGUID column
        return result.recordset.map((row: any) => ({
          DocumentGUID: row.DocumentGUID,
        }));
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
export const GET = handler;
export const POST = handler;
