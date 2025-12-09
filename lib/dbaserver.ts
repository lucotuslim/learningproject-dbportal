// db-dba-pool.ts
import sql from "mssql";
import type { config as SQLConfig } from "mssql";

/**
 * Common base config (server is provided here because your previous version had it)
 * Note: We avoid placing driver-specific keys into the typed object directly without casting,
 * because some versions of @types/mssql don't expose them.
 */
const baseConfigCommon: Omit<SQLConfig, "database"> = {
  server: process.env.DB_SERVER || "localhost",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 2,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

/**
 * Build the final SQLConfig depending on whether DB_PASSWORD is present.
 * - If DB_PASSWORD exists: use SQL Auth (user/password) with the default driver (tedious)
 * - Otherwise: use msnodesqlv8 with trustedConnection: true (Windows Integrated Auth)
 */
function buildConfigForDb(dbName: string): SQLConfig {
  const common = {
    ...baseConfigCommon,
    database: dbName,
  };

  if (process.env.DB_PASSWORD) {
    // SQL Authentication (typed)
    return {
      ...common,
      user: process.env.DB_USER || "sa",
      password: process.env.DB_PASSWORD,
    } as SQLConfig;
  }

  // No DB_PASSWORD -> use Windows Trusted Connection (msnodesqlv8)
  // msnodesqlv8 expects options.trustedConnection = true. Some typings do not include 'driver',
  // so we construct a small object and cast the authentication/driver portion into the SQLConfig type.
  const winConfig = {
    ...common,
    // driver isn't always present in types; cast below
    driver: "msnodesqlv8",
    options: {
      ...(common.options ?? {}),
      // msnodesqlv8 specific option to use Windows integrated auth
      trustedConnection: true,
    },
  };

  return winConfig as unknown as SQLConfig;
}

/* Pools cache */
const pools: Record<string, sql.ConnectionPool> = {};

/* Exported function */
export async function getDbaServerPool(dbName: string) {
  const poolKey = `${dbName}`.toLowerCase();

  if (pools[poolKey]) {
    console.log(`Pool Action:    Reused`);
    console.log("Current pools:", Object.keys(pools));
    if (pools[poolKey].connected) return pools[poolKey];
    try {
      await pools[poolKey].connect();
      console.log(`Pool Action:    Reconnect`);
      console.log(`--- Pool Request END ---`);
      return pools[poolKey];
    } catch (e) {
      console.error(
        `Pool Error:     Failed to reconnect ${poolKey}. Deleting pool.`,
        e
      );
      try {
        pools[poolKey].close?.();
      } catch { /* ignore */ }
      delete pools[poolKey]; // broken connection → recreate
    }
  }

  const config: SQLConfig = buildConfigForDb(dbName);

  try {
    config.user="custadds\\pv28925"
    
    console.log(JSON.stringify(config));
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
   // console.log(`Connected to server ${config.server} database ${dbName} (driver=${(config as any).driver ?? "tedious"})`);
    pools[poolKey] = pool;
    return pool;
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(
      `Could not connect to server ${config.server} database ${dbName}: ${errMsg}`
    );
  }
}
