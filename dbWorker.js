const sql = eval("require")("msnodesqlv8");

function connect_timeout() {
    var co = {
        conn_str:
            "server=192.168.100.151;Database=AdminDB;Uid=sa;PWD=Yukon900;Driver={ODBC Driver 18 for SQL Server};Encrypt=yes;TrustServerCertificate=yes;LoginTimeout=2;",
        conn_timeout: 2,
    };

    var start = new Date().getTime();
    console.log("connect " + start);

    sql.open(co, function (err, connection) {
        var end = new Date().getTime();
        var elapsed = end - start;
        console.log("callback ..... " + elapsed);

        if (err) {
            console.error(err);
            process.exit(1);
            return;
        }

        var ts = new Date().getTime();

        connection.query(
            "declare @v time = ?; select @v as v",
            [sql.Time(ts)],
            function (err, res) {
                if (connection) {
                    try {
                        connection.close();
                    } catch { }
                }

                if (err) {
                    console.error(err);
                    process.exit(1);
                    return;
                }

                console.log(JSON.stringify(res));
                process.exit(0);
            }
        );
    });
}

connect_timeout();