import { Pool, PoolClient } from "pg";
import { env } from "../../../config/env";

export const pool = new Pool({
  host: env.SUPABASE_HOST,
  port: env.SUPABASE_PORT,
  user: env.SUPABASE_USERNAME,
  password: env.SUPABASE_PASSWORD,
  database: env.SUPABASE_DATABASE,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export type { PoolClient };

// Logs
pool.on("connect", () => {
  console.log("Connected to Supabase");
});

pool.on("error", (err) => {
  console.error("❌ Database error:", err);
});

// Query helper
export async function query(text: string, params?: any[]) {
  const start = Date.now();

  const result = await pool.query(text, params);

  const duration = Date.now() - start;

  if (env.NODE_ENV === "development") {
    console.log("Query:", {
      text: text.substring(0, 100),
      duration,
      rows: result.rowCount,
    });
  }

  return result;
}

// ✅ ESSENCIAL (faltava)
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (err) {
    console.error("DB connection failed:", err);
    return false;
  }
}
