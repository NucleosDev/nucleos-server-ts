import dns from "dns/promises";
import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from "pg";
import { env } from "../../../config/env";

export type { PoolClient };

const isIpAddress = (host: string): boolean =>
  /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":");

async function resolveDbHost(host: string): Promise<string> {
  if (isIpAddress(host)) return host;

  try {
    const { address } = await dns.lookup(host, { family: 4 });
    console.log(`DNS resolved → ${address} (IPv4)`);
    return address;
  } catch {
    try {
      const { address, family } = await dns.lookup(host);
      console.warn(
        `⚠️ ${host} não possui IPv4 — usando ${address} (IPv${family}). ` +
          `Se falhar com ECONNREFUSED, use o Connection Pooler do Supabase (Settings → Database) ` +
          `ou habilite o add-on IPv4 no projeto.`,
      );
      return address;
    } catch {
      console.warn(`⚠️ Falha ao resolver DNS de ${host}, usando hostname original`);
      return host;
    }
  }
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
    const resolvedIp = await resolveDbHost(env.SUPABASE_HOST);
    (pool.options as PoolConfig).host = resolvedIp;
  } catch {
    console.warn("⚠️ Falha no DNS fallback, usando host original");
  }

  initialized = true;
}

pool.on("connect", () => {
  console.log("Connected to Supabase");
});

pool.on("error", (err) => {
  console.error("❌ Database error:", err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
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
