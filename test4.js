import { spawn } from "child_process";

function runWithTimeout() {
  const child = spawn("node", ["dbWorker.js"], {
    stdio: "inherit", // show logs
  });

  const timeoutMs = 5000;

  const timer = setTimeout(() => {
    console.log("❌ Timeout reached - killing child");
    child.kill("SIGKILL"); // 💥 guaranteed kill
  }, timeoutMs);

  child.on("exit", (code, signal) => {
    clearTimeout(timer);

    if (signal === "SIGKILL") {
      console.log("Child was force killed");
    } else {
      console.log("Child exited with code:", code);
    }
  });

  child.on("error", (err) => {
    clearTimeout(timer);
    console.error("Failed to start child:", err);
  });
}

runWithTimeout();