const sql = eval("require")("msnodesqlv8");

process.on("message", (msg) => {
    const { connStr, sqlText } = msg;

    const co = {
        conn_str: connStr,
        conn_timeout: 2,
    };

    sql.open(co, function (err, connection) {
        if (err) {
            process.send({ success: false, error: err.message });
            process.exit(1);
            return;
        }

        connection.query(sqlText, [], function (err, rows) {
            if (connection) {
                try {
                    connection.close();
                } catch { }
            }

            if (err) {
                process.send({ success: false, error: err.message });
                process.exit(1);
                return;
            }

            // make JSON safe
            const safeRows = JSON.parse(JSON.stringify(rows));

            process.send({ success: true, data: safeRows });
            process.exit(0);
        });
    });
});