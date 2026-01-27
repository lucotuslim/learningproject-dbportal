"use server";
import { ICustomerPermissionConfig } from "./interfaces";
const CONFIG_SECTION = "customerpermission";

export async function UpdateCustomerPermissionSetting(
    configKey: string,
    value: string
): Promise<{ data: string }> {

    const updateQuery = `
    mutation ($input: UpdateGlobalConfigInput!) {
      UpdateGlobalConfig(input: $input) {
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
                        configKey: configKey,
                        configJson: value,
                    },
                },
            }),
        }
    );

    const result = await res.json();
    console.log("UpdateGlobalSetting result:", result);
    return result;
}


export async function CustomerPermissionSetting(): Promise<ICustomerPermissionConfig> {
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

    const res = await fetch(
        `${process.env.APPDAPIROOT}/api/appconfig`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
            cache: "no-store",
        }
    );


    if (!res.ok) throw new Error("Failed to fetch CustomerPermissionSetting");

    const result = await res.json();
    if (result.errors?.length) {
        throw new Error(result.errors[0].message);
    }

    const rows = result?.data?.GetAppConfig as { ConfigJson: string }[] | undefined;
    if (!rows?.length || !rows[0]?.ConfigJson) {
        throw new Error("CustomerPermission settings not found");
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(rows[0].ConfigJson);
    } catch {
        throw new Error("ConfigJson is not valid JSON");
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("ConfigJson must be a single JSON object");
    }
    return parsed as ICustomerPermissionConfig

}
