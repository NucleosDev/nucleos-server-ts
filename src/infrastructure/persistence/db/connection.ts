// import { Pool, PoolClient } from "pg";
// import { env } from "../../../config/env";

// export const pool = new Pool({
//   host: env.SUPABASE_HOST,
//   port: env.SUPABASE_PORT,
//   user: env.SUPABASE_USERNAME,
//   password: env.SUPABASE_PASSWORD,
//   database: env.SUPABASE_DATABASE,
//   ssl: { rejectUnauthorized: false },
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 5000,
// });

// export type { PoolClient };

// // Logs
// pool.on("connect", () => {
//   console.log("Connected to Supabase");
// });

// pool.on("error", (err) => {
//   console.error("❌ Database error:", err);
// });

// // Query helper
// export async function query(text: string, params?: any[]) {
//   const start = Date.now();

//   const result = await pool.query(text, params);

//   const duration = Date.now() - start;

//   if (env.NODE_ENV === "development") {
//     console.log("Query:", {
//       text: text.substring(0, 100),
//       duration,
//       rows: result.rowCount,
//     });
//   }

//   return result;
// }

// //  ESSENCIAL (faltava)
// export async function testDatabaseConnection(): Promise<boolean> {
//   try {
//     await pool.query("SELECT 1");
//     return true;
//   } catch (err) {
//     console.error("DB connection failed:", err);
//     return false;
//   }
// }

import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from "pg";
import dns from "dns";
import { env } from "../../../config/env";

export type { PoolClient };

// Função para resolver DNS e pegar IPv4
async function resolveHost(host: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(host, { all: true, family: 4 }, (err, addresses) => {
      if (err || !addresses?.length) {
        return reject(err ?? new Error("No DNS addresses found"));
      }

      // Pega apenas IPv4 (family 4)
      const ipv4Addresses = addresses.filter((addr) => addr.family === 4);

      if (ipv4Addresses.length === 0) {
        return reject(new Error("No IPv4 addresses found"));
      }

      const selected = ipv4Addresses[0];
      console.log(`🌐 DNS resolved → ${selected?.address} (IPv4)`);

      resolve(selected!.address);
    });
  });
}

// Configuração base
const baseConfig: PoolConfig = {
  host: env.SUPABASE_HOST,
  port: Number(env.SUPABASE_PORT),
  user: env.SUPABASE_USERNAME,
  password: env.SUPABASE_PASSWORD,
  database: env.SUPABASE_DATABASE,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Aumentado de 5000 para 10000
};

// Cria pool com configuração base
export const pool: Pool = new Pool(baseConfig);

let initialized = false;

// Garante que o pool está pronto com resolução DNS
async function ensurePoolReady(): Promise<void> {
  if (initialized) return;

  try {
    const resolvedIp = await resolveHost(env.SUPABASE_HOST);

    // Substitui host pelo IP resolvido (resolve problema de IPv4)
    (pool.options as PoolConfig).host = resolvedIp;

    console.log("🔌 Pool configurado com resolução DNS para IPv4");
  } catch (err) {
    console.warn("⚠️ Falha no DNS fallback, usando host original:", err);
  }

  initialized = true;
}

// Logs
pool.on("connect", () => {
  console.log("✅ Connected to Supabase");
});

pool.on("error", (err: Error) => {
  console.error("❌ Database error:", err);
});

// Query helper com resolução DNS automática
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

// Teste de conexão
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await ensurePoolReady();
    await pool.query("SELECT 1");
    console.log("✅ Database connection test passed");
    return true;
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    return false;
  }
}
