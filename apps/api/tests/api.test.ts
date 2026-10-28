import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import { app } from "../src/app.js";
import { pool } from "../src/db/pool.js";

const server = createServer(app);
let baseUrl: string;

before(async () => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Unable to determine test server address");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } finally {
    await pool.end();
  }
});

function request(path: string) {
  return fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(5000)
  });
}

test("health returns 200", async () => {
  const response = await request("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok"
  });
});

test("readiness returns 200 with a working database", async () => {
  const response = await request("/api/ready");

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ready"
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("database failure affects readiness but not health", async (t) => {
  t.mock.method(pool, "query", async () => {
    throw new Error("Simulated database failure");
  });

  const readyResponse = await request("/api/ready");

  assert.equal(readyResponse.status, 503);
  assert.deepEqual(await readyResponse.json(), {
    status: "not_ready"
  });

  const healthResponse = await request("/api/health");

  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), {
    status: "ok"
  });
});



