const { runSqlQuery } = require('./dbpool.ts');

(async () => {
  const conn =
    'Driver={ODBC Driver 17 for SQL Server};Server=azg2dbasql001;Database=master;Trusted_Connection=yes;';

  try {
    console.log('before queries');

    const [r1, r2] = await Promise.all([
      runSqlQuery(conn, 'SELECT 1 as result'),
      runSqlQuery(conn, 'SELECT 1 as result'),
    ]);

    console.log('after queries');
console.log('r1 json:', JSON.stringify(r1));
console.log('r2 json:', JSON.stringify(r2));
} catch (err) {
    console.error('query failed:', err);
  }
})();