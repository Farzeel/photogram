import { app } from "./app.js";
import { pool } from "./db/pool.js";

const port = Number(process.env.PORT ?? "3000");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const server = app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});

let shuttingDown = false;

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  const deadline = setTimeout(() => {
    console.error("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000);

  deadline.unref();

  server.close(async (error) => {
    try {
      if (error) throw error;

      await pool.end();

      clearTimeout(deadline);
      console.log("HTTP server and database pool closed.");
      process.exitCode = 0;
    } catch (error) {
      console.error("Shutdown failed:", error);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));