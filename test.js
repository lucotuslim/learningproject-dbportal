// dbTestMsNodeSqlV8.js
import { inspect } from "util";

const sql = await import("msnodesqlv8");

const conn =
  "server=192.168.100.151;" +
  "Database=AdminDB;" +
  "Driver={ODBC Driver 18 for SQL Server};" +
  "Encrypt=yes;" +
  "TrustServerCertificate=yes;" +
  "Uid=sa;" +
  "PWD=Yukon900";

const q = "SELECT TOP 1 * FROM sys.tables";

console.log("Running msnodesqlv8 test...again");

console.log("Connection string:", conn);


sql.query(conn, q, (err, rows, output) => {
  if (err) {
    console.error("msnodesqlv8 query ERROR (inspect):");
    console.error(inspect(err, { depth: 10 }));

    try {
      console.error(
        "msnodesqlv8 query ERROR (JSON):",
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
      );
    } catch (e) {
      console.error("error JSONifying err:", e?.message);
    }

    process.exit(1);
  }

  console.log("✅ Rows:", rows);
  console.log("Output:", output);
  process.exit(0);
});