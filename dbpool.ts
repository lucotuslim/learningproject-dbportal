'use strict';

import * as sql from 'msnodesqlv8';
type SqlPool = InstanceType<typeof sql.Pool>;

// One pool per connection string
const poolByConnectionString = new Map();

/**
 * Run a SQL query against the pool for the given connection string.
 * Reuses the pool if that connection string is already open.
 *
 * @param {string} connectionString
 * @param {string} queryText
 * @returns {Promise<{ connectionString: string }>}
 */

export async function runSqlQuery(connectionString: string, queryText: string) {
  if (!connectionString) {
    throw new Error('connectionString is required');
  }

  if (!queryText) {
    throw new Error('queryText is required');
  }

  const pool = await getOrCreatePool(connectionString);
  const rows = await executeQuery(pool, queryText);

  return rows;
}

async function getOrCreatePool(connectionString: string) {
  const existing = poolByConnectionString.get(connectionString);
  if (existing) {
    return existing;
  }

  const pool = new sql.Pool({ connectionString });
  attachPoolEvents(pool, connectionString);

  try {
    await openPool(pool);
    poolByConnectionString.set(connectionString, pool);
    return pool;
  } catch (err) {
    console.error(`[DB] Failed to open pool for ${connectionString}`, err);

    // optional but recommended: close/cleanup if supported
    try {
      await pool.close?.();
    } catch (_) {
      // ignore cleanup errors
    }

    throw err;
  }
}


function attachPoolEvents(pool:SqlPool, connectionString:string) {
  pool.on('open', () => {
    console.log(`[DB] Pool opened for connection string: ${maskConnectionString(connectionString)}`);
  });

  pool.on('status', (status:any) => {
    //console.log(`[DB] Status for ${maskConnectionString(connectionString)}`, status);
  });

  pool.on('error', (err:any) => {
    console.error(`[DB] Pool error for ${maskConnectionString(connectionString)}`, err);
  });
}


function openPool(pool: SqlPool): Promise<void> {
  return new Promise((resolve, reject) => {
    pool.open((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function executeQuery<T = any>(pool: SqlPool, queryText: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    pool.query(queryText, (err: any, rows?: any[], more?: boolean) => {
      if (err) return reject(err);
      resolve((rows ?? []) as T[]);
    });
  });
}

// function executeQuery<T = any>(pool: SqlPool, queryText: string): Promise<T[]> {
//   return new Promise((resolve, reject) => {
//     const rows: T[] = [];
//     const q = pool.query(queryText);
//     let settled = false;

//     // const cleanup = () => {
//     //   q.removeAllListeners();
//     // };

//     q.on('submitted', (d: any) => {
//       console.log(`[DB] Query submitted: ${d.query_str}`);
//     });

  
//     q.on('row' as any, (row: any) => {
//   console.log('row raw:', row);
//   //console.log('row keys:', row && typeof row === 'object' ? Object.keys(row) : null);
//   //console.log('query object:', q);
// });

//     q.on('done', () => {
//       if (!settled) {
//         settled = true;
//         //cleanup();
//         resolve(rows);
//       }
//     });

//     q.on('error', (err: any) => {
//       if (!settled) {
//         settled = true;
//         //cleanup();
//         reject(err);
//       }
//     });
//   });
// }

function maskConnectionString(connectionString:string) {
  return connectionString
    .replace(/Password=[^;]*/i, 'Password=***')
    .replace(/PWD=[^;]*/i, 'PWD=***');
}

// module.exports = {
//   runSqlQuery,
// };