import { NextResponse } from "next/server";
import os from "os";
import sql from "mssql";
import { safeMsNodeSqlQuery } from "@/lib/utils";

export async function getDbaserverData(
  dbName: string,
  sqlText: string
) {
  const serverName = process.env.DB_SERVER!;
  const hasSqlLogin = Boolean(process.env.DB_USER);

  // --- Case 1: Use SQL Auth via mssql ---
  if (hasSqlLogin) {
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
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

    try {
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log(`Connected via mssql: ${serverName}/${dbName}`);
      const result = await pool.request().query(sqlText);
      await pool.close();
      return result.recordset;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      throw new Error(`mssql failed on ${serverName}/${dbName}: ${msg}`);
    }
  }

  // --- Case 2: No DB_USER — use msnodesqlv8 (Trusted Connection) ---
// inside runQuery fallback branch
const conn = [
  `server=${serverName}`,
  `Database=${dbName}`,
  `Trusted_Connection=Yes`,
  `Driver={ODBC Driver 17 for SQL Server}`,
  `Encrypt=yes`,
  `TrustServerCertificate=yes`,
].join(";") + ";";
const QUERY_TIMEOUT_MS = Number(process.env.DB_QUERY_TIMEOUT_MS || 10000); // query timeout

try {
  const rows = await safeMsNodeSqlQuery(conn, sqlText, QUERY_TIMEOUT_MS);
  return rows;
} catch (err) {
  // log and rethrow so route returns a 504/500
  console.error("msnodesqlv8 safe query error:", err);
  throw err;
}



  // console.log("Falling back to msnodesqlv8 trusted connection...");
  // const util = await import("util");
  // const msnodesqlv8 = eval("require")("msnodesqlv8");

  // const conn = `
  //   server=${serverName};
  //   Database=${dbName};
  //   Trusted_Connection=Yes;
  //   Driver={ODBC Driver 17 for SQL Server};
  //   Encrypt=yes;
  //   TrustServerCertificate=yes;
  // `;

  // const query = util.promisify(msnodesqlv8.query);

  // try {
  //   const rows = await query(conn, sqlText);
  //   console.log(`Connected via msnodesqlv8: ${serverName}/${dbName}`);
  //   return rows;
  // } catch (err: any) {
  //   console.error("msnodesqlv8 query ERROR:", util.inspect(err, { depth: 10, colors: false }));
  //   try {
  //     console.error("JSON-safe:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  //   } catch {
  //     console.error("Error JSONifying err");
  //   }
  //   throw new Error(`msnodesqlv8 failed on ${serverName}/${dbName}: ${err?.message || err}`);
  // }
}
