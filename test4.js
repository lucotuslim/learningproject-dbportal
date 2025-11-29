import sql from "msnodesqlv8";

const connstr = "server=azg1gussql12dnn.custadds.com;Database=tekion;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server};Encrypt=yes;TrustServerCertificate=yes;";

export function createR() {
  return new Promise((resolve, reject) => {
    let settled = false; // guard to prevent double resolve/reject
    const safeResolve = (v) => {
      if (settled) {
        console.warn('createR: duplicate resolve ignored');
        return;
      }
      settled = true;
      resolve(v);
    };
    const safeReject = (err) => {
      if (settled) {
        console.warn('createR: duplicate reject ignored', err);
        return;
      }
      settled = true;
      reject(err);
    };

    sql.open(connstr, (err, conn) => {
      if (err) return safeReject(new Error("Failed to connect to database: " + err.message));

      const pm = conn.procedureMgr();

      pm.callproc(
        "[dbo].[GetDocumentListAll]",
        [null, "DOCUMENTMANAGEMENT", false, null],
        (err, rows, output) => {
          try {
            if (err) return safeReject(new Error("Procedure failed: " + err.message));

            const fullRows = Array.isArray(rows) ? rows.map(r => ({ ...r })) : [];

            console.log('rows.length =', rows && rows.length);
            console.log('fullRows.length =', fullRows.length);

            // resolve with the result
            safeResolve({
              success: true,
              message: "succeeded",
              data: fullRows,
              output
            });
          } catch (ex) {
            safeReject(ex);
          } finally {
            // always try to close the connection (defensive)
            try {
              if (conn && typeof conn.close === 'function') conn.close();
            } catch (closeErr) {
              console.warn('Error closing connection', closeErr);
            }
          }
        }
      );
    });
  });
}


try {
  const res =await createR();
  console.log(JSON.stringify(res, null, 2));
} catch (err) {
  console.error(err);
}
