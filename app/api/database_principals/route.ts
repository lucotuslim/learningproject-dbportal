import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql

scalar DateTime

type DatabasePrincipal {
  name: String!
  type_desc: String!
  default_schema_name: String
  create_date: DateTime
  modify_date: DateTime
  sid: String
}

type Query {
  databaseprincipal(
    server: String!
    db: String!
  ): [DatabasePrincipal!]!

  databaseprincipalByClientIdName(
    server: String!
    db: String!
    name: String!
  ): [DatabasePrincipal!]!
}
`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    databaseprincipal: async (_: unknown, { server, db }: { server: string; db: string }) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
            select name, type_desc , default_schema_name, create_date, modify_date, sid from sys.database_principals
              `,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(
            errBody?.error
              ? `GetAppConfig failed: ${errBody.error}`
              : `GetAppConfig failed with status ${res.status}`
          );
        }

        return await res.json();
      } catch (err) {
        console.error("GetAppConfig error:", err);
        throw err;
      }
    },

    databaseprincipalByClientIdName: async (
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
            select name, type_desc , default_schema_name, create_date, modify_date, sid from sys.database_principals
            where name ='${name}'
              `,
          }),
        });
        if (!res.ok) {
          throw new Error(`GetAppConfig failed: ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        console.error("GetAppConfig error:", err);
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
