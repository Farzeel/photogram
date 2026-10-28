import express from "express";
import { pool } from "./db/pool.js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { requestLogger } from "./middlewares/request-logger.js";

export const app = express();

app.use(requestLogger);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.get("/api/ready", async (_req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ready"
    });
  } catch (error) {
    console.error(
      "Database readiness check failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    res.status(503).json({
      status: "not_ready"
    });
  }
});

// Unknown API routes should return JSON.
app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "API route not found"
  });
});

if (process.env.NODE_ENV === "production") {
  const webDirectory = fileURLToPath(
    new URL("../../web/dist/", import.meta.url)
  );

  const indexFile = fileURLToPath(
    new URL("../../web/dist/index.html", import.meta.url)
  );

  if (!existsSync(indexFile)) {
    throw new Error(
      "Frontend build is missing. Build apps/web before starting production."
    );
  }

  app.use(express.static(webDirectory));
}