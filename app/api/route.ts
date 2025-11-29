// app/api/graphql/route.ts
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const typeDefs = `#graphql
  type Query {
    hello: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello World",
  },
};

let handler: any;

export async function GET(req: NextRequest) {
  if (!handler) {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    handler = startServerAndCreateNextHandler<NextRequest>(server);
  }
  return handler(req);
}

export const POST = GET;
