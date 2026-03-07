import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs, resolvers } from "./buildSchema";
import { NextRequest } from "next/server";
import { createContext } from "./context";

let handler: ReturnType<typeof startServerAndCreateNextHandler<NextRequest>> | null = null;

export function getApolloHandler() {
  if (!handler) {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    handler = startServerAndCreateNextHandler(server, {
      context: async () => createContext(),
    });
  }

  return handler;
}
