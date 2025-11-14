import { NextResponse } from "next/server";
import os from "os";
import sql from "mssql";
//import { msnodesqlv8 } from "mssql/msnodesqlv8";

// --- Generic pool getter (no global pools, always create per-request) ---
export async function getClientData(
  serverName: string,
  dbName: string,
  sqlText: string
) {
  const config: sql.config = {
    server: serverName,
    database: dbName,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
    pool: {
      max: 5,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    ...(process.env.DB_PASSWORD
      ? {
          user: process.env.DB_USER,
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

  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(`Connected: ${serverName}/${dbName}`);
    const request = pool.request();
    
    const result = await request.query(`
  ${sqlText}
`);
    await pool.close();
    return result.recordset;
    
  } catch (err: any) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`Failed to connect to ${serverName}/${dbName}: ${errMsg}`);
  }
}
