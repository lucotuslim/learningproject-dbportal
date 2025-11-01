import sql from "mssql";

// const baseConfig = {
//   user: process.env.DB_USER || "sa",
//   password: process.env.DB_PASSWORD || "YourStrong!Passw0rd",
//   server: process.env.DB_SERVER || "localhost",
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
// };


import os from "os";
import { config as SQLConfig } from "mssql";

const baseConfig: SQLConfig = {
  server: process.env.DB_SERVER || "localhost",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
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

export default baseConfig;

// Cache connections per database to reuse
const pools: Record<string, sql.ConnectionPool> = {};

export async function getPool(dbName: string) {
  if (pools[dbName]) return pools[dbName];
  const config = { ...baseConfig, database: dbName };
  const pool = await sql.connect(config);
  pools[dbName] = pool;
  return pool;
}
