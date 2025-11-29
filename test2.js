const sql = require('msnodesqlv8');

const connectionString = "server=azg1gussql12dnn.custadds.com;Database=tekion;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server};Encrypt=yes;TrustServerCertificate=yes;";
const storedProcedureName = "dbo.GetDocumentListAll";

sql.open(connectionString, (err, conn) => {
    if (err) {
        console.error("Connection error:", err);
        return;
    }

    // Example with parameters (if your SP takes them)
    const params = [
        { name: 'InputParam1', value: 'SomeValue', type: sql.TYPES.NVarChar },
        { name: 'OutputParam1', type: sql.TYPES.Int, output: true } // For OUTPUT parameters
    ];

    conn.query(`EXEC ${storedProcedureName} @InputParam1=?, @OutputParam1=?`, params, (err, rows, output) => {
        if (err) {
            console.error("Stored procedure execution error:", err);
            return;
        }
        console.log("Result rows:", rows);
        console.log("Output parameters:", output); // Will contain values of OUTPUT parameters
    });
});