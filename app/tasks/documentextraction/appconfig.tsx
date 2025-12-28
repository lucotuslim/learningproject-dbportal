"use server";
import { IDocumentConfig } from "./interfaces";
const CONFIG_SECTION = "DocumentExtractionTasksSetting";


export async function AddDocumentExtractionTasksSetting(
  config: IDocumentConfig
): Promise<{data: string}> {
  
  const addQuery = `
    mutation ($input: AddAppConfigInput!) {
      AddAppConfig(input: $input) {
        ConfigSection
      }
    }
  `;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/appconfig`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: addQuery,
        variables: {
          input: {
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
    
  if (!res.ok || result.errors?.length) {
    throw new Error(
      result.errors?.[0]?.message ??
        "Failed to update DocumentExtractionTasksSetting"
    );
  }
}

export async function DocumentExtractionTasksSetting(): Promise<IDocumentConfig[]> {
  const query = `
    query ExampleQuery($db: String!, $config: String!) {
      GetAppConfig(db: $db, config: $config) {
        ConfigJson
      }
    }
  `;

  const variables = {
    db: process.env.NEXT_PUBLIC_APPCONFIGDB,
    config: "DocumentExtractionTasksSetting",
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/appconfig`,
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
