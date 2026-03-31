// import { NextResponse } from "next/server";
// import os from "os";
//import sql from "mssql";
// import { safeMsNodeSqlQuery, safeQueryAsync } from "@/lib/utils";
// import { runSqlQuery } from "@/lib/dbpool";
import { runQueryWithTimeout } from "@/lib/serverutils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.db || !body?.q) {
      return new Response(JSON.stringify({ error: "Missing required fields: db, q" }), {
        status: 400,
      });
    }
    const rows = await getDbaserverData(body.db, body.q);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("POST /api/dbaserver error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

async function getDbaserverData<T>(dbName: string, sqlText: string): Promise<T> {
  const serverName = process.env.DB_SERVER!;
  //const hasSqlLogin = Boolean(process.env.DB_USER);
  console.log(sqlText);
  // // --- Case 1: Use SQL Auth via mssql ---
  // if (hasSqlLogin) {
  //   const config: sql.config = {
  //     server: serverName,
  //     database: dbName,
  //     options: {
  //       encrypt: true,
  //       trustServerCertificate: true,
  //     },
  //     pool: {
  //       max: 5,
  //       min: 0,
  //       idleTimeoutMillis: 30000,
  //     },
  //     user: process.env.DB_USER,
  //     password: process.env.DB_PASSWORD,
  //   };

  //   try {
  //     const pool = new sql.ConnectionPool(config);
  //     await pool.connect();
  //     console.log(`Connected via mssql: ${serverName}/${dbName}`);
  //     const result = await pool.request().query(sqlText);
  //     await pool.close();
  //     return result.recordset as T;
  //   } catch (err: unknown) {
  //     const msg = err instanceof Error ? err.message : JSON.stringify(err);
  //     throw new Error(`mssql failed on ${serverName}/${dbName}: ${msg}`);
  //   }
  // }

  // --- Case 2: No DB_USER — use msnodesqlv8 (Trusted Connection) ---
  // inside runQuery fallback branch
  // const QUERY_TIMEOUT_SEC = Number(process.env.DB_QUERY_TIMEOUT_SEC || 10);

  const parts = [
    `server=${serverName}`,
    `Database=${dbName}`,
    `Driver={${process.env.ConnectionDriver || "ODBC Driver 17 for SQL Server"}}`,
    `Encrypt=yes`,
    `TrustServerCertificate=yes`,
  ];
  // `QueryTimeout=${QUERY_TIMEOUT_SEC}`,
  if (process.env.DB_USER) {
    parts.push(`UID=${process.env.DB_USER}`);
    parts.push(`PWD=${process.env.DB_PASSWORD}`);
  } else {
    parts.push(`Trusted_Connection=Yes`);
  }

  const conn = parts.join(";") + ";";
  // const minpool = Number(process.env.DBMinPool || 10); // query timeout
  // const maxpool = Number(process.env.DBMaxPool || 20); // query timeout
  // const heartbeatSecs = Number(process.env.heartbeatSecs || 30); // query timeout
  const CONNECTION_TIMEOUT_MS = Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000); // query timeout

  try {
    const rows = await runQueryWithTimeout(conn, sqlText, CONNECTION_TIMEOUT_MS);
    //    console.log(rows);
    //console.log(`rows: ${JSON.stringify(rows)}`);
    return rows as T;
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
