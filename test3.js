import sql from "msnodesqlv8";
import { v4 as uuidv4 } from "uuid";

const connstr = "server=c.custadds.com;Database=TestDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server};Encrypt=yes;TrustServerCertificate=yes;";

export function createR() {
  return new Promise((resolve, reject) => {
    sql.open(connstr, (err, conn) => {
      if (err) {
        return reject(new Error("Failed to connect to database: " + err.message));
      }

      const pm = conn.procedureMgr();

      pm.callproc(`
        Set NoCount on;
        Exec dbo.GetUsers;
        Set nocount off;
        `,
        (err, rows, output) => {
          if (err) {
            return reject(new Error("Procedure failed: " + err.message));
          }

          resolve({
            success: true,
            message: "succeeded",
            rows,   // 👈 SELECT data here
            output  // 👈 OUTPUT params here
          });
        }
      );
    });
  });
}

// usage
const res = await createR();
console.log(JSON.stringify(res, null, 2));
