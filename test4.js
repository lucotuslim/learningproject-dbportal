import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function runQueryWithTimeout(connStr, sqlText, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const child = fork(path.join(__dirname, "dbWorker.js"));
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Query timeout (child killed) after ${timeoutMs} ms`));
    }, timeoutMs);

    child.on("message", (msg) => {
      clearTimeout(timer);

      if (msg.success) {
        resolve(msg.data);
      } else {
        reject(new Error(msg.error));
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("exit", (code, signal) => {
      if (signal === "SIGKILL") {
        reject(new Error("Child process killed"));
      }
    });

    // send query to child
    child.send({
      connStr,
      sqlText,
    });
  });
}

(async () => {
  try {
    const result = await runQueryWithTimeout(
      "server=wrongserver;Database=AdminDB;Uid=sa;PWD=Yukon900;Driver={ODBC Driver 18 for SQL Server};Encrypt=yes;TrustServerCertificate=yes;",
      "SELECT 1 as Columnn1",
      3000
    );

    console.log("Result:", result);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();