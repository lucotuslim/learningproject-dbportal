import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql

scalar JSON
scalar DateTime

type CustomerSecurityGroup {
  CustomerSecurityGroupsId: Int!
  GroupSID: String!
  Environment: String!
  Namespace: String!
  ClientId: Int!
  GroupName: String!
  MetaData: JSON
  CollectedTimestamp: DateTime!
  Permission: String!
  IsDeleted: Boolean!
}

type Query {
  customerSecurityGroups(
    server: String!
    db: String!
  ): [CustomerSecurityGroup!]!

  customerSecurityGroupByName(
    CustomerSecurityGroupsName: String!
  ): CustomerSecurityGroup
}

`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    customerSecurityGroups: async (_: unknown, { server, db }: { server: string; db: string }) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
                SELECT [CustomerSecurityGroupsId]
      ,[GroupSID]
      ,[Environment]
      ,[Namespace]
      ,[ClientId]
      ,[GroupName]
      ,[MetaData]
      ,[CollectedTimestamp]
      ,[Permission]
      ,[IsDeleted]
  FROM [CustomerPermissionDb].[dbo].[CustomerSecurityGroups]
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
