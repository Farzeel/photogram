import "dotenv/config";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  max: 5,
  connectionTimeoutMillis: 2000,
  statement_timeout: 2000,
  query_timeout: 3000
});

pool.on("error", (error) => {
  console.error("Idle database connection failed:", error.message);
});