//import { NextResponse } from "next/server";
//import os from "os";
import sql from "mssql";
import { safeMsNodeSqlQuery } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.server || !body?.db || !body?.q) {
      return NextResponse.json(
        { error: "Missing required fields: server, db, q" },
        { status: 400 }
      );
    }
    const rows = await getClientData(body.server, body.db, body.q);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("POST /api/clientdb error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function getClientData(serverName: string, dbName: string, sqlText: string) {
  console.log(sqlText);
  // If environment variables specify credentials, use mssql with them.
  if (process.env.DB_USER) {
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      throw new Error(`mssql failed on ${serverName}/${dbName}: ${msg}`);
    }
  }

  // Otherwise, fallback to msnodesqlv8 for trusted (Windows) connection.
  console.log("Falling back to msnodesqlv8 trusted connection...");
  const conn = `
    server=${serverName};
    Database=${dbName};
    Trusted_Connection=Yes;
    Driver={ODBC Driver 17 for SQL Server};
    Encrypt=yes;
    TrustServerCertificate=yes;
  `;

  const QUERY_TIMEOUT_MS = Number(process.env.DB_QUERY_TIMEOUT_MS || 10000); // query timeout

  try {
    const rows = await safeMsNodeSqlQuery(
      conn,
      `
      SET NOCOUNT ON;
      ${sqlText}
      `,
      QUERY_TIMEOUT_MS
    );
    return rows;
  } catch (err) {
    console.error("msnodesqlv8 safe query error:", err);
    throw err;
  }
}

// Minimal GET handler that proxies to getClientData using query params:
// ?server=SERVERNAME&db=DBNAME&q=<sql-encoded>
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const server = url.searchParams.get("server");
  const db = url.searchParams.get("db");
  const q = url.searchParams.get("q");

  if (!server || !db || !q) {
    return NextResponse.json(
      { error: "Missing required query params: server, db, q" },
      { status: 400 }
    );
  }

  try {
    const rows = await getClientData(server, db, q);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/clientdb error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
