// dbTestMsNodeSqlV8.js
const util = require("util");

// hide require from bundlers (not needed here but safe)
const sql = eval("require")("msnodesqlv8");

const conn = "server=azg1gussql12dnn.custadds.com;Database=tekion;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server};Encrypt=yes;TrustServerCertificate=yes;";
const q = "exec dbo.GetDocumentListAll @IsJson  = 0";

console.log("Running msnodesqlv8 test...");

sql.query(conn, q, (err, rows,output) => {
  if (err) {
    // print deep object structure
    console.error("msnodesqlv8 query ERROR (util.inspect):");
    console.error(util.inspect(err, { depth: 10, colors: false }));
    // also print JSON-safe form if possible
    try {
      console.error("msnodesqlv8 query ERROR (JSON):", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch (e) {
      console.error("error JSONifying err:", e && e.message);
    }
    process.exit(1);
  }
  console.log("msnodesqlv8 OK rows:", rows);
  console.log("msnodesqlv8 output", output);
  process.exit(0);
});
