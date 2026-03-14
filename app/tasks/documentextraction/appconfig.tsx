"use server";
import { IDocumentConfig } from "./interfaces";
const CONFIG_SECTION = "DocumentExtractionTasksSetting";

export async function UpdateDocumentExtractionTasksSetting(
  config: IDocumentConfig
): Promise<{ data: string }> {

  const updateQuery = `
    mutation ($input: UpdateAppConfigInput!) {
      UpdateAppConfig(input: $input) {
        ConfigSection
      }
    }
  `;

  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/appconfig`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: updateQuery,
        variables: {
          input: {
            server: process.env.APPCONFIGSERVER!,
            db: process.env.APPCONFIGDB!,
            configSection: CONFIG_SECTION,
            configJson: JSON.stringify(config),
          },
        },
      }),
    }
  );

  const result = await res.json();
  console.log("UpdateDocumentExtractionTasksSetting result:", result);
  return result;
}


export async function DeleteDocumentExtractionTasksSetting(
  config: IDocumentConfig
): Promise<{ data: string }> {

  const deleteQuery = `
    mutation ($input: DeleteAppConfigInput!) {
      DeleteAppConfig(input: $input) {
        ConfigSection
      }
    }
  `;

  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/appconfig`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: deleteQuery,
        variables: {
          input: {

            server: process.env.APPCONFIGSERVER!,
            db: process.env.APPCONFIGDB!,
            configSection: CONFIG_SECTION,
            configJson: JSON.stringify(config),
          },
        },
      }),
    }
  );

  const result = await res.json();
  console.log("DeleteDocumentExtractionTasksSetting result:", result);
  return result;

  if (!res.ok || result.errors?.length) {
    throw new Error(
      result.errors?.[0]?.message ??
      "Failed to delete DocumentExtractionTasksSetting"
    );
  }
}

export async function AddDocumentExtractionTasksSetting(
  config: IDocumentConfig
): Promise<{ data: string }> {

  const addQuery = `
    mutation ($input: AddAppConfigInput!) {
      AddAppConfig(input: $input) {
        ConfigSection
      }
    }
  `;

  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/appconfig`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: addQuery,
        variables: {
          input: {
            server: process.env.APPCONFIGSERVER!,
            db: process.env.APPCONFIGDB!,
            configSection: CONFIG_SECTION,
            configJson: JSON.stringify(config),
          },
        },
      }),
    }
  );

  const result = await res.json();
  console.log("AddDocumentExtractionTasksSetting result:", result);
  return result;

}

export async function DocumentExtractionTasksSetting(): Promise<IDocumentConfig[]> {
  const query = `
    query ExampleQuery($server: String!, $db: String!, $config: String!) {
      GetAppConfig(server: $server, db: $db, config: $config) {
        ConfigJson
      }
    }
  `;

  const variables = {
    server: process.env.APPCONFIGSERVER!,
    db: process.env.APPCONFIGDB!,
    config: "DocumentExtractionTasksSetting",
  };

  const res = await fetch(
    `${process.env.APPDAPIROOT}/api/graphql`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch DocumentExtractionTasksSetting");
  }

  const result = await res.json();

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  const rows = result?.data?.GetAppConfig;

  if (!Array.isArray(rows)) return [];

  const configs: IDocumentConfig[] = [];

  for (const row of rows) {
    if (!row?.ConfigJson) continue;

    const parsed: IDocumentConfig[] = JSON.parse(row.ConfigJson);

    for (const cfg of parsed) {
      configs.push({
        ...cfg,
      });
    }
  }

  // 🔒 Guarantee uniqueness (CRITICAL for Radix Select)
  return Array.from(
    new Map(configs.map(c => [c.env, c])).values()
  );
}
