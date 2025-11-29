import sql from "mssql";
import os from "os";
import { config as SQLConfig } from "mssql";

const baseConfig: Omit<SQLConfig, "database"> = {
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
  ...(process.env.DB_PASSWORD
    ? {
        user: process.env.DB_USER || "sa",
        password: process.env.DB_PASSWORD,
      }
    : {
        authentication: {
          type: "ntlm",
          options: {
            domain: process.env.DB_DOMAIN || os.hostname(),
            userName: process.env.DB_USER || os.userInfo().username,
            password: "",
          },
        },
      }),
};

const pools: Record<string, sql.ConnectionPool> = {};

export async function getDbaServerPool( dbName: string) {
  const poolKey = `${dbName}`.toLowerCase();
  //  const poolKey = "ClientPool";

  if (pools[poolKey]) {
    // 🧠 Reuse only if still connected
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
      delete pools[poolKey]; // broken connection → recreate
    }
  }

  const config: SQLConfig = {
    ...baseConfig,
    database: dbName,
  };

  // console.log(`Pool Action: Creating new`);
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(`Connected to server  ${config.server} database ${dbName}`);
    pools[poolKey] = pool;
    return pool;
  } catch (error) {
    //console.error(`Pool Error: Failed to connect ${}and create pool for ${poolKey}`, error);
    // 💡 Important: Throw the error so the calling function knows the DB is unreachable.
    const errMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(
      `Could not connect to server ${config.server} database ${dbName}: ${errMsg}`
    );
  }
}
