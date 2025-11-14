// lib/dbserver.js  (ESM)
import { createRequire } from "module";
import util from "util";

const require = createRequire(import.meta.url);
const sql = require("msnodesqlv8"); // msnodesqlv8 is a native module; require it

const connStr =
  "server=azg1dbasql011.custadds.com;Database=DocumentManagement;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server};Encrypt=yes;TrustServerCertificate=yes;";

/**
 * Open a connection and return the connection object.
 * Caller is responsible for calling conn.close().
 */
export async function getConnection() {
  return new Promise((resolve, reject) => {
    sql.open(connStr, (err, conn) => {
      if (err) {
        console.error("DB open error:", util.inspect(err, { depth: 5 }));
        return reject(err);
      }
      resolve(conn);
    });
  });
}
