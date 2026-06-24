import Redis from "ioredis";
import { logger } from "../../shared/utils/logger";

let redisClient: Redis | null = null;
let redisAvailable = false;

export const initRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn("Redis: could not connect after 3 attempts, disabling");
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
    });

    redisClient.on("error", () => {
      // Evita "Unhandled error event" durante tentativas de conexão
    });

    await redisClient.ping();
    redisAvailable = true;
    logger.info("Redis connected");
  } catch (error) {
    redisAvailable = false;
    redisClient = null;
    logger.warn("Redis unavailable — using in-memory cache fallback");
  }
};

export const getRedisClient = (): Redis | null =>
  redisAvailable ? redisClient : null;

export const isRedisAvailable = (): boolean => redisAvailable;

// ─── In-memory fallback ───────────────────────────────────────────────────

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

// Prune expired entries periodically to prevent unbounded growth
setInterval(
  () => {
    const now = Date.now();
    for (const [k, v] of memoryCache) {
      if (v.expiresAt < now) memoryCache.delete(k);
    }
  },
  60 * 1000,
);

// ─── Public API ───────────────────────────────────────────────────────────

export const getCache = async <T = unknown>(key: string): Promise<T | null> => {
  if (redisAvailable && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }

  const item = memoryCache.get(key);
  if (item && item.expiresAt > Date.now()) return item.value as T;
  memoryCache.delete(key);
  return null;
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds = 300,
): Promise<void> => {
  if (redisAvailable && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      // fall through to memory
    }
    return;
  }
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

export const deleteCache = async (key: string): Promise<void> => {
  if (redisAvailable && redisClient) {
    try {
      await redisClient.del(key);
    } catch {}
  }
  memoryCache.delete(key);
};

export const deleteCacheByPrefix = async (prefix: string): Promise<void> => {
  if (redisAvailable && redisClient) {
    try {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length > 0) await redisClient.del(...keys);
    } catch {}
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(prefix)) memoryCache.delete(k);
  }
};

export const clearCache = async (): Promise<void> => {
  if (redisAvailable && redisClient) {
    try {
      await redisClient.flushdb();
    } catch {}
  }
  memoryCache.clear();
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info("Redis connection closed");
  }
};

// ─── Cache key helpers ────────────────────────────────────────────────────

export const CacheKeys = {
  habitosByBloco: (blocoId: string) => `habitos:bloco:${blocoId}`,
  blocosByNucleo: (nucleoId: string) => `blocos:nucleo:${nucleoId}`,
  blocoById: (blocoId: string) => `bloco:${blocoId}`,
  nucleosByUser: (userId: string) => `nucleos:user:${userId}`,
  nucleoById: (nucleoId: string) => `nucleo:${nucleoId}`,
  tarefasByBloco: (blocoId: string) => `tarefas:bloco:${blocoId}`,
  listasByBloco: (blocoId: string) => `listas:bloco:${blocoId}`,
  listaById: (listaId: string) => `lista:${listaId}`,
  itensByLista: (listaId: string) => `itens:lista:${listaId}`,
  colecoesByBloco: (blocoId: string) => `colecoes:bloco:${blocoId}`,
  colecaoById: (colecaoId: string) => `colecao:${colecaoId}`,
  calendarioByNucleo: (nucleoId: string) => `calendario:nucleo:${nucleoId}`,
  timersByNucleo: (nucleoId: string) => `timers:nucleo:${nucleoId}`,
  gamificacaoByUser: (userId: string) => `gamificacao:user:${userId}`,
} as const;

export const TTL = {
  SHORT: 60,
  DEFAULT: 300,
  LONG: 1800,
} as const;
