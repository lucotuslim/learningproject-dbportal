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

  input UpdateAppConfigInput {
    configSection: String!
    configJson: String!
  }

  type Query {
    GetAppConfig(db: String!, config: String! ): [AppConfig!]!
  }

  type Mutation {
    AddAppConfig(input: AddAppConfigInput!): AppConfig
    DeleteAppConfig(input: DeleteAppConfigInput!): AppConfig
    UpdateAppConfig(input: UpdateAppConfigInput!): AppConfig
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
                  ISNULL(
                '[' + STRING_AGG(value, ',') + ']',
                '[]'
                )
                  FROM OPENJSON(ConfigJson)
                  WHERE JSON_VALUE(value, '$.env') <> '${JSON.parse(configJson).env}'
              ),
              UpdatedAt = SYSUTCDATETIME()
              OUTPUT inserted.*
              WHERE ConfigSection = '${configSection}';
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
    },

    UpdateAppConfig: async (
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
            DECLARE @ConfigSection NVARCHAR(100) = '${configSection}';
            DECLARE @ConfigJson NVARCHAR(MAX) = N'${configJson}';

            UPDATE ac
            SET ConfigJson =
              JSON_MODIFY(
                ac.ConfigJson,
                CONCAT('$[', j.[key], ']'),
                JSON_QUERY(@ConfigJson)
              ),
              UpdatedAt = SYSUTCDATETIME()
            OUTPUT inserted.*
            FROM dbo.AppConfig ac
            CROSS APPLY OPENJSON(ac.ConfigJson) j
            WHERE ac.ConfigSection = @ConfigSection
              AND JSON_VALUE(j.value, '$.env') = JSON_VALUE(@ConfigJson, '$.env');
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
