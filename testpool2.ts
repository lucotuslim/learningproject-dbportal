// const sql = require('msnodesqlv8')

// const pool = new sql.Pool({
//   connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=azg2dbasql001;Database=master;Trusted_Connection=yes;'
// })

// pool.on('open', (options: any) => {
//   console.log(`ready options = ${JSON.stringify(options, null, 4)}`)
// })

// pool.on('debug', (msg: any) => {
//   console.log(`\t\t\t\t\t\t${new Date().toLocaleTimeString()} <pool.debug> ${msg}`)
// })

// pool.on('status', (s: any) => {
//   console.log(`status = ${JSON.stringify(s, null, 4)}`)
// })

// pool.on('error', (e: any) => {
//   console.log(e)
// })

// const testSql = 'waitfor delay \'00:00:02\';'

// function submit (sql:string) {
//   const q = pool.query(sql)
//   console.log(`send ${new Date().toLocaleTimeString()}, sql = ${sql}`)
//   q.on('submitted', (d: { query_str: any }) => {
//     console.log(`query submitted ${new Date().toLocaleTimeString()}, sql = ${d.query_str}`)
//     q.on('done', () => console.log(`query done ${new Date().toLocaleTimeString()}`))
//   })
//   return q
// }

// // for (let i = 0; i < 7; ++i) {
// //   const q = submit(testSql)
// //   switch (i) {
// //     case 5:
// //       console.log('cancel a query')
// //       q.cancelQuery()
// //       break
// //     case 6:
// //       q.pauseQuery()
// //       setTimeout(() => {
// //         console.log('resume a paused query')
// //         q.resumeQuery()
// //       }, 5000)
// //       break
// //     default:
// //       break
// //   }
// // }

// // setInterval(() => {
// //   submit(testSql)
// // }, 60000)

// pool.open()