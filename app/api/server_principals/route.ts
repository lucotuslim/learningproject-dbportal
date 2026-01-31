import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql

scalar DateTime

type ServerPrincipal {
  name: String!
  type_desc: String!
  create_date: DateTime
  modify_date: DateTime
  sid: String
}

type Query {
  serverprincipal(
    server: String!
    db: String!
  ): [ServerPrincipal!]!

  serverprincipalByName(
    server: String!
    db: String!
    name: String!
  ): [ServerPrincipal!]!

    serverprincipalByNameType(
    server: String!
    db: String!
    name: String!
    type: String!
  ): [ServerPrincipal!]!
}
`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    serverprincipal: async (_: unknown, { server, db }: { server: string; db: string }) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
            select name, type_desc, create_date, modify_date from sys.server_principals
              `,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(
            errBody?.error
              ? `ServerPrincipalApi failed: ${errBody.error}`
              : `ServerPrincipalApi failed with status ${res.status}`
          );
        }

        return await res.json();
      } catch (err) {
        console.error("ServerPrincipalApi error:", err);
        throw err;
      }
    },

    serverprincipalByName: async (
      _: unknown,
      { server, db, name }: { server: string; db: string; name: string }
    ) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
            select   name, type_desc, create_date, modify_date from sys.server_principals
            where name ='${name}'
              `,
          }),
        });
        if (!res.ok) {
          throw new Error(`ServerPrincipalApi failed: ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        console.error("ServerPrincipalApi error:", err);
        throw err;
      }
    },
    serverprincipalByNameType: async (
      _: unknown,
      { server, db, name, type }: { server: string; db: string; name: string; type: string }
    ) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
            select   name, type_desc, create_date, modify_date from sys.server_principals
            where name ='${name}'
            and type_desc = '${type}'
              `,
          }),
        });
        if (!res.ok) {
          throw new Error(`ServerPrincipalApi failed: ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        console.error("ServerPrincipalApi error:", err);
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
