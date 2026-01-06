"use server";
import { AppConfigItem, GetAppConfigRow } from "./interfaces"
const CONFIG_SECTION = "Global";

export async function UpdateGlobalSetting(
  config: AppConfigItem
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
  console.log("UpdateGlobalSetting result:", result);
  return result;
}


// export async function DeleteGlobalSetting(
//   config: AppConfigItem
// ): Promise<{data: string}> {

//   const deleteQuery = `
//     mutation ($input: DeleteAppConfigInput!) {
//       DeleteAppConfig(input: $input) {
//         ConfigSection
//       }
//     }
//   `;

//   const res = await fetch(
//     `${process.env.APPDAPIROOT}/api/appconfig`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         query: deleteQuery,
//         variables: {
//           input: {

//     server: process.env.APPCONFIGSERVER!,
//     db: process.env.APPCONFIGDB!,
//                 configSection: CONFIG_SECTION,
//             configJson: JSON.stringify(config),
//           },
//         },
//       }),
//     }
//   );

//   const result = await res.json();
//   console.log("DeleteGlobalSetting result:", result);
//   return result;

//   if (!res.ok || result.errors?.length) {
//     throw new Error(
//       result.errors?.[0]?.message ??
//         "Failed to delete GlobalSetting"
//     );
//   }
// }

// export async function AddGlobalSetting(
//   config: AppConfigItem
// ): Promise<{data: string}> {

//   const addQuery = `
//     mutation ($input: AddAppConfigInput!) {
//       AddAppConfig(input: $input) {
//         ConfigSection
//       }
//     }
//   `;

//   const res = await fetch(
//     `${process.env.APPDAPIROOT}/api/appconfig`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         query: addQuery,
//         variables: {
//           input: {
//     server: process.env.APPCONFIGSERVER!,
//     db: process.env.APPCONFIGDB!,
//                 configSection: CONFIG_SECTION,
//             configJson: JSON.stringify(config),
//           },
//         },
//       }),
//     }
//   );

//   const result = await res.json();
//   console.log("AddGlobalSetting result:", result);
//   return result;

// }


export async function GlobalSetting(): Promise<AppConfigItem> {
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
    config: CONFIG_SECTION,
  };

  const res = await fetch(`${process.env.APPDAPIROOT}/api/appconfig`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch GlobalSetting");
  }

  const result = await res.json();
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  const rows = result?.data?.GetAppConfig as GetAppConfigRow[] | undefined;
  if (!rows?.length || !rows[0]?.ConfigJson) {
    return {} as AppConfigItem;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rows[0].ConfigJson);
  } catch {
    throw new Error("ConfigJson is not valid JSON");
  }

  /** 🚨 Enforce single-object format */
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("ConfigJson must be a single JSON object");
  }

  return parsed as AppConfigItem;
}
