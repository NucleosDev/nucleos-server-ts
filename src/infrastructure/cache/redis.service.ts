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
          logger.warn("Redis: Não foi possível conectar após 3 tentativas");
          return null; // Para de tentar
        }
        return Math.min(times * 100, 3000);
      },
    });

    // Testar conexão
    await redisClient.ping();
    redisAvailable = true;
    logger.info("Redis conectado com sucesso");
  } catch (error) {
    redisAvailable = false;
    logger.warn("Redis não disponível, usando cache em memória");
  }
};

export const getRedisClient = (): Redis | null => {
  return redisAvailable ? redisClient : null;
};

export const isRedisAvailable = (): boolean => {
  return redisAvailable;
};

// Cache em memória (fallback)
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

export const getCache = async (key: string): Promise<any | null> => {
  if (redisAvailable && redisClient) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Fallback para memória
  const item = memoryCache.get(key);
  if (item && item.expiresAt > Date.now()) {
    return item.value;
  }
  memoryCache.delete(key);
  return null;
};

export const setCache = async (
  key: string,
  value: any,
  ttlSeconds: number = 3600,
): Promise<void> => {
  if (redisAvailable && redisClient) {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return;
  }

  // Fallback para memória
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const deleteCache = async (key: string): Promise<void> => {
  if (redisAvailable && redisClient) {
    await redisClient.del(key);
  }
  memoryCache.delete(key);
};

export const clearCache = async (): Promise<void> => {
  if (redisAvailable && redisClient) {
    await redisClient.flushall();
  }
  memoryCache.clear();
};

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info("Redis connection closed");
  }
};
