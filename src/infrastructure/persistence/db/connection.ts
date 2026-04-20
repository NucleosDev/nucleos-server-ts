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

//  ESSENCIAL (faltava)
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (err) {
    console.error("DB connection failed:", err);
    return false;
  }
}

/*

import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from "pg";
import dns from "dns";
import { env } from "../../../config/env";

export type { PoolClient };


async function resolveHost(host: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(host, { all: true }, (err, addresses) => {
      if (err || !addresses?.length) {
        return reject(err ?? new Error("No DNS addresses found"));
      }

      // ordena: IPv4 primeiro (family 4 vem antes de 6)
      const sorted = addresses.sort((a, b) => a.family - b.family);

      const selected = sorted[0];

      if (!selected) {
        return reject(new Error("No valid DNS address selected"));
      }

      console.log(
        `🌐 DNS resolved → ${selected.address} (IPv${selected.family})`,
      );

      resolve(selected.address);
    });
  });
}


const baseConfig: PoolConfig = {
  host: env.SUPABASE_HOST,
  port: Number(env.SUPABASE_PORT),
  user: env.SUPABASE_USERNAME,
  password: env.SUPABASE_PASSWORD,
  database: env.SUPABASE_DATABASE,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};


export const pool: Pool = new Pool(baseConfig);


let initialized = false;


async function ensurePoolReady(): Promise<void> {
  if (initialized) return;

  try {
    const resolvedIp = await resolveHost(env.SUPABASE_HOST);

    // 👇 substitui host pelo IP (resolve seu problema real)
    (pool.options as PoolConfig).host = resolvedIp;

    console.log("🔌 Pool configurado com fallback de DNS");
  } catch (err) {
    console.warn("⚠️ Falha no DNS fallback, usando host original");
  }

  initialized = true;
}


pool.on("connect", () => {
  console.log("✅ Connected to Supabase");
});

pool.on("error", (err: Error) => {
  console.error("❌ Database error:", err);
});


export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  await ensurePoolReady();

  const start = Date.now();

  const result = await pool.query<T>(text, params);

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


export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await ensurePoolReady();

    await pool.query("SELECT 1");
    return true;
  } catch (err) {
    console.error("DB connection failed:", err);
    return false;
  }
}

//
*/
