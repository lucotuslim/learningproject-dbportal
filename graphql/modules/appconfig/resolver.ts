// import { appConfigService } from "./service";

export interface GetAppConfigArgs {
  server: string;
  db: string;
  config: string;
}

export // 🧠 Resolvers
const resolvers = {
  Query: {
    GetAppConfig: async (
      _: unknown,
      { server, db, config }: { server: string; db: string; config: string }
    ) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
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

  Mutation: {
    AddAppConfig: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          server: string;
          db: string;
          configSection: string;
          configJson: string;
        };
      }
    ) => {
      const { server, db, configSection, configJson } = input;

      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
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
        });

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
      {
        input,
      }: {
        input: {
          server: string;
          db: string;
          configSection: string;
          configJson: string;
        };
      }
    ) => {
      const { server, db, configSection, configJson } = input;

      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
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
        });

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
      {
        input,
      }: {
        input: {
          server: string;
          db: string;
          configSection: string;
          configJson: string;
        };
      }
    ) => {
      const { server, db, configSection, configJson } = input;

      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
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
        });

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

    UpdateGlobalConfig: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          server: string;
          db: string;
          configSection: string;
          configKey: string;
          configJson: string;
        };
      }
    ) => {
      const { server, db, configSection, configKey, configJson } = input;

      const safeValue = configJson.replace(/'/g, "''");
      const safeSection = configSection.replace(/'/g, "''");
      const safeKey = configKey.replace(/'/g, "");

      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
          UPDATE dbo.AppConfig
          SET ConfigJson = JSON_MODIFY(
            ConfigJson,
            '$.${safeKey}',
            N'${safeValue}'
          ),
          UpdatedAt = SYSUTCDATETIME()
          OUTPUT inserted.*
          WHERE ConfigSection = '${safeSection}';
        `,
          }),
        });

        if (!res.ok) {
          throw new Error(`UpdateGlobalConfig failed: ${res.statusText}`);
        }

        const json = await res.json();
        return json[0];
      } catch (err) {
        console.error("UpdateGlobalConfig error:", err);
        throw err;
      }
    },
  },
};
