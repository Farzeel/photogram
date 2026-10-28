import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, res, next) => {
  const requestId = randomUUID();
  const startedAt = performance.now();

  res.setHeader("X-Request-ID", requestId);

  res.once("finish", () => {
    console.log(
      JSON.stringify({
        event: "http_request",
        timestamp: new Date().toISOString(),
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(
          (performance.now() - startedAt).toFixed(2)
        )
      })
    );
  });

  next();
};