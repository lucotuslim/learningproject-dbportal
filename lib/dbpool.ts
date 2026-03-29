export const runtime = "nodejs";
import * as sql from "msnodesqlv8";
type SqlPool = InstanceType<typeof sql.Pool>;

//const poolByConnectionString = new Map();
const poolByConnectionString = new Map<string, SqlPool>();
export async function runSqlQuery(
  connectionString: string,
  queryText: string,
  timeoutMs: number,
  minpool: number,
  maxpool: number,
  heartbeatSecs: number
) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  if (!queryText) {
    throw new Error("queryText is required");
  }
  console.log(`[DB] Running query on ${maskConnectionString(connectionString)}: ${queryText}`);
  const pool = await getOrCreatePool(connectionString, timeoutMs, minpool, maxpool, heartbeatSecs);
  const rows = await executeQuery(pool, queryText);
  return rows;
}

async function getOrCreatePool(
  connectionString: string,
  timeoutMs: number,
  minpool: number,
  maxpool: number,
  heartbeatSecs: number
): Promise<SqlPool> {
  const existing = poolByConnectionString.get(connectionString);

  if (existing) {
    return existing;
  }

  const pool = new sql.Pool({
    connectionString,
    floor: minpool,
    ceiling: maxpool,
    heartbeatSecs: heartbeatSecs,
  });
  attachPoolEvents(pool, connectionString);

  try {
    await openPool(pool, timeoutMs);
    // ✅ ONLY cache if successful
    poolByConnectionString.set(connectionString, pool);
    return pool;
  } catch (err) {
    console.error(`[DB] Failed to open pool for ${maskConnectionString(connectionString)}`, err);
    // ❗ IMPORTANT: destroy bad pool

    poolByConnectionString.delete(connectionString);
    throw err;
  }
}

function attachPoolEvents(pool: SqlPool, connectionString: string) {
  pool.on("open", () => {
    console.log(
      `[DB] Pool opened for connection string: ${maskConnectionString(connectionString)}`
    );
  });

  pool.on("status", (status: string) => {
    console.log(`[DB] Status for ${maskConnectionString(connectionString)}`, status);
  });

  pool.on("error", (err: string) => {
    console.error(`[DB] Pool error for ${maskConnectionString(connectionString)}`, err);
  });
}

function openPool(pool: SqlPool, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Pool open timeout"));
      }
    }, timeoutMs);
    pool.open((err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) return reject(err);
      resolve();
    });
  });
}

function executeQuery<T>(pool: SqlPool, queryText: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    pool.query(queryText, (err: unknown, rows?: unknown[]) => {
      if (err) return reject(err);
      resolve((rows ?? []) as T[]);
    });
  });
}

function maskConnectionString(connectionString: string) {
  return connectionString
    .replace(/Password=[^;]*/i, "Password=***")
    .replace(/PWD=[^;]*/i, "PWD=***");
}
