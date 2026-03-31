import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApiInterface } from "@/interfaces/generic";
import { IApiTokenParams } from "@/interfaces/generic";
//import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
// safeMsNodeSqlQuery.ts (paste into your helper or route)
//import util from "util";
// use eval(require) if your bundler rewrites require at build time:
// import * as mssql from "mssql";

// type PoolEntry = {
//   pool:  mssql.ConnectionPool; // mssql.ConnectionPool
//   connecting: Promise<void> | null;
// };
// const poolMap = new Map<string, PoolEntry>();

// async function getOrCreatePool(
//   connStr: string,
//   poolOptions:  {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30_000,
//   }
// ): Promise<mssql.ConnectionPool> {

//   const existing = poolMap.get(connStr);
//   if (existing) {
//     if (existing.pool.connected) return existing.pool;
//     if (existing.connecting) return existing.connecting; // ✅ now matches return type
//   }

//   const config: mssql.config = {

//     driver: "msnodesqlv8" as const,
//     pool: poolOptions,
//     options: {
//       enableArithAbort: true,
//     },
//   };

//   const pool = new mssql.ConnectionPool(config);

//   const connecting: Promise<mssql.ConnectionPool> =
//     pool.connect().then(() => pool);

//   pool.on("error", (err: Error) => {
//     console.error("[mssql pool error]", err);
//     pool.close().catch(() => {});
//     poolMap.delete(connStr);
//   });

//   poolMap.set(connStr, { pool, connecting });
//   return connecting;
// }

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "";
  const date = new Date(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }); // "Nov"
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// export async function safeMsNodeSqlQuery(
//   connStr: string,
//   sqlText: string,
//   timeoutMs: number
// ): Promise<unknown> {
//   const msnodesqlv8 = eval("require")("msnodesqlv8");
//   const queryAsync = util.promisify(msnodesqlv8.query);

//   let timeoutHandle: NodeJS.Timeout | null = null;

//   try {
//     const result = await Promise.race([
//       // Main query
//       queryAsync(connStr, sqlText),

//       // Timeout guard
//       new Promise((_, reject) => {
//         timeoutHandle = setTimeout(() => {
//           reject(new Error("msnodesqlv8 query timed out"));
//         }, timeoutMs);
//       }),
//     ]);

//     return result;
//   } catch (err) {
//     // Normalize error
//     throw err instanceof Error ? err : new Error(String(err));
//   } finally {
//     // Cleanup timeout
//     if (timeoutHandle) {
//       clearTimeout(timeoutHandle);
//     }
//   }
// }

interface SqlConnection {
  query: (sql: string, params: unknown[], cb: (err: Error | null, rows: unknown) => void) => void;
  close: () => void;
}

interface OpenOptions {
  conn_str: string;
  conn_timeout: number;
}

type QueryCallback = (err: Error | null, rows?: unknown) => void;

export function safeMsNodeSqlQuery(
  connStr: string,
  sqlText: string,
  conn_timeout: number,
  callback: QueryCallback
): void {
  const sql = eval("require")("msnodesqlv8");
  const co: OpenOptions = {
    conn_str: connStr,
    conn_timeout: conn_timeout, // seconds
  };

  let finished = false;
  let conn: SqlConnection | null = null;

  const timer = setTimeout(
    () => {
      if (finished) return;
      finished = true;
      if (conn) {
        try {
          conn.close();
        } catch {}
      }

      callback(new Error("Query timed out"));
    },
    1000 * (conn_timeout + 30)
  );
  sql.open(co, (err: Error | null, connection: SqlConnection) => {
    if (finished) return;
    if (err) {
      finished = true;
      clearTimeout(timer);
      return callback(err);
    }
    conn = connection;
    conn.query(sqlText, [], (err: Error | null, rows: unknown) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (conn) {
        try {
          conn.close();
        } catch {}
      }
      if (err) {
        return callback(err);
      }
      // ✅ FIX: must call callback (not return JSON directly)
      const safeRows = JSON.parse(JSON.stringify(rows));
      return callback(null, safeRows);
    });
  });
}

export function safeQueryAsync(
  connStr: string,
  sqlText: string,
  timeout: number
): Promise<unknown> {
  console.log("connStr:", connStr);

  return new Promise((resolve, reject) => {
    safeMsNodeSqlQuery(connStr, sqlText, timeout, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
interface PushResponse {
  url_token: string;
  payload: string;
  expire_after_days: number;
  expire_after_views: number;
  expired: boolean;
  created_at: string;
  updated_at: string;
}

export async function createPush(pwpusher_api_url: string, payload: string): Promise<PushResponse> {
  const response = await fetch(`${pwpusher_api_url}/p.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "password[payload]": payload,
    }),
  });

  const data: PushResponse = await response.json();
  console.log(
    `Share this secret URL: ${process.env.NEXT_PUBLIC_PWPUSHER_API_URL}/p/${data.url_token}`
  );
  return data;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function ApiRequest<T>(
  fetchUrl: string,
  options?: RequestInit
): Promise<ApiInterface<T>> {
  const response = await fetch(fetchUrl, options);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.json();
}

// export function encryptString(plainText: string, key: Buffer): string {
//   if (![16, 32].includes(key.length)) {
//     throw new Error("Key must be 16 or 32 bytes (AES-128 or AES-256).");
//   }

//   const iv = randomBytes(16); // PowerShell uses 16-byte IV for AES-CBC
//   const cipher = createCipheriv(`aes-${key.length * 8}-cbc`, key, iv);
//   let encrypted = cipher.update(plainText, "utf8", "base64");
//   encrypted += cipher.final("base64");

//   // PowerShell prepends the IV (base64 encoded)
//   const fullCipher = Buffer.concat([iv, Buffer.from(encrypted, "base64")]);
//   return fullCipher.toString("base64");
// }

/**
 * Decrypt a Base64 ciphertext encrypted with PowerShell's ConvertFrom-SecureString -Key
 */
// export function decryptString(encryptedBase64: string, key: Buffer): string {
//   if (![16, 32].includes(key.length)) {
//     throw new Error("Key must be 16 or 32 bytes (AES-128 or AES-256).");
//   }

//   const fullCipher = Buffer.from(encryptedBase64, "base64");
//   const iv = fullCipher.subarray(0, 16);
//   const encrypted = fullCipher.subarray(16);

//   const decipher = createDecipheriv(`aes-${key.length * 8}-cbc`, key, iv);
//   let decrypted = decipher.update(encrypted, undefined, "utf8");
//   decrypted += decipher.final("utf8");

//   return decrypted;
// }

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export async function getApiToken({
  Url,
  Method,
  ContentType,
  GrantType,
  ClientId,
  Scope,
  ClientSecret = process.env.DocApiClientSecret,
}: IApiTokenParams): Promise<TokenResponse> {
  try {
    if (!Url || !Method || !ContentType || !GrantType || !ClientId || !Scope || !ClientSecret) {
      throw new Error("Missing required parameters");
    }

    // 🧩 Prepare headers and body
    const headers = {
      "Content-Type": ContentType,
    };

    const body = new URLSearchParams({
      grant_type: GrantType,
      client_id: ClientId,
      scope: Scope,
      client_secret: ClientSecret,
    });

    // 🚀 Send request
    const response = await fetch(Url, {
      method: Method.toUpperCase(),
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.statusText} — ${errorText}`);
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`getApiToken: ${message}`);
  }
}
