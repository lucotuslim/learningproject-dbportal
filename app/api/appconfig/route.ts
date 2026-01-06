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
    server: String!
    db: String!
    configSection: String!
    configJson: String!
  }

  input DeleteAppConfigInput {
    server: String!
    db: String!
    configSection: String!
    configJson: String!
  }

  input UpdateAppConfigInput {
    server: String!
    db: String!
    configSection: String!
    configJson: String!
  }

  type Query {
    GetAppConfig(server: String!, db: String!, config: String! ): [AppConfig!]!
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
      { server, db, config }: {server: string; db: string; config: string }
    ) => {
      try {
        const res = await fetch(
          `${process.env.APPDAPIROOT}/api/clientdb`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              server,
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
      { input }: { input: {server: string, db: string, configSection: string; configJson: string } }
    ) => {
      const {server, db, configSection, configJson } = input;

      try {
        const res = await fetch(
          `${process.env.APPDAPIROOT}/api/clientdb`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              server: server,
              db: db,
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
      { input }: { input: { server: string, db: string,configSection: string; configJson: string } }
    ) => {
      const { server, db,configSection, configJson } = input;

      try {
        const res = await fetch(
          `${process.env.APPDAPIROOT}/api/clientdb`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              server: server,
              db: db,
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
      { input }: { input: { server: string, db: string, configSection: string; configJson: string } }
    ) => {
      const { server, db, configSection, configJson } = input;

      try {
        const res = await fetch(
          `${process.env.APPDAPIROOT}/api/clientdb`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              server: server,
              db: db,
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
          throw new Error(`UpdateAppConfig failed: ${res.statusText}`);
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
