import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
//import { getClientPool } from "@/lib/clientdb";
//import {getClientData} from "@/app/api/clientdb/route"

// 🧠 GraphQL Schema Definition
const typeDefs = `#graphql

  type AppConfig {
    ConfigId: Int!
    ConfigSection: String!
    ConfigJson: String!
    CreatedAt: String!
    UpdatedAt: String!
  }

  input AddAppConfigInput {
    configSection: String!
    configJson: String!
  }

  input DeleteAppConfigInput {
    configSection: String!
    configJson: String!
  }

  type Query {
    GetAppConfig(db: String!, config: String! ): [AppConfig!]!
  }

  type Mutation {
    AddAppConfig(input: AddAppConfigInput!): AppConfig
    DeleteAppConfig(input: DeleteAppConfigInput!): AppConfig
  }

`;

// 🧠 Resolvers
const resolvers = {
  Query: {
    GetAppConfig: async (
      _: unknown,
      { db, config }: { db: string; config: string }
    ) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/dbaserver`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              db,
              q: `
                SELECT
                  ConfigId,
                  ConfigSection,
                  ConfigJson,
                  CreatedAt,
                  UpdatedAt
                FROM dbo.AppConfig
                WHERE ConfigSection = '${config}'
              `,
            }),
          }
        );

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

  Mutation: {
    AddAppConfig: async (
      _: unknown,
      { input }: { input: { configSection: string; configJson: string } }
    ) => {
      const { configSection, configJson } = input;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/dbaserver`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              db: process.env.NEXT_PUBLIC_APPCONFIGDB,
              q: `
              UPDATE dbo.AppConfig
              SET ConfigJson = JSON_MODIFY(
                  ConfigJson,
                  'append $',
              JSON_QUERY('${configJson}')
              )
              OUTPUT inserted.*
              WHERE ConfigSection = '${configSection}';
              `,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`AddAppConfig failed: ${res.statusText}`);
        }

        const json = await res.json();
        return json[0];
      } catch (err) {
        console.error("AddAppConfig error:", err);
        throw err;
      }
    },

    DeleteAppConfig: async (
      _: unknown,
      { input }: { input: { configSection: string; configJson: string } }
    ) => {
      const { configSection, configJson } = input;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/dbaserver`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              db: process.env.NEXT_PUBLIC_APPCONFIGDB,
              q: `
              UPDATE dbo.AppConfig
              SET ConfigJson =
              (
                  SELECT
                      '[' + STRING_AGG(value, ',') + ']'
                  FROM OPENJSON(ConfigJson)
                  WHERE JSON_VALUE(value, '$.env') <> '${JSON.parse(configJson).env}'
              ),
              UpdatedAt = SYSUTCDATETIME()
              OUTPUT inserted.*
              WHERE ConfigSection = 'DocumentExtractionTasksSetting';
              `,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`DeleteAppConfig failed: ${res.statusText}`);
        }

        const json = await res.json();
        return json[0];
      } catch (err) {
        console.error("DeleteAppConfig error:", err);
        throw err;
      }
    }
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
