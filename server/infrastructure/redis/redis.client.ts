/**
 * ARCHITECTURE REDIS CENTRALISÉE — VERSION ROBUSTE
 * ─────────────────────────────────────────────────
 * Ne throw jamais — retourne toujours un client (réel ou mock).
 * C'est index.ts qui décide si un échec Redis est fatal.
 */
import Redis from "ioredis";
import RedisMockLib from "ioredis-mock";
const RedisMock = RedisMockLib as unknown as typeof Redis;
import { logger } from "../../infrastructure/logger";

export let redisClient: Redis | null = null;

const isProduction = process.env["NODE_ENV"] === "production";

/**
 * Initialise la connexion Redis.
 * Ne throw JAMAIS — retourne toujours un client fonctionnel.
 */
export async function connectRedis(): Promise<Redis> {
  if (redisClient) return redisClient;

  const redisUrl = process.env["REDIS_URL"];
  const redisDisabled = process.env["DISABLE_REDIS"] === "true";

  if (redisDisabled) {
    logger.warn("[Redis] DISABLE_REDIS=true → RedisMock en mémoire");
    redisClient = new RedisMock() as unknown as Redis;
    return redisClient;
  }

  if (!redisUrl) {
    logger.warn(
      "[Redis] REDIS_URL absente → RedisMock en mémoire" +
        (isProduction ? " ⚠️ rate-limit Redis désactivé en production" : "")
    );
    redisClient = new RedisMock() as unknown as Redis;
    return redisClient;
  }

  logger.info("[Redis] Tentative de connexion...");
  try {
    const client = new Redis(redisUrl, {
      connectTimeout: isProduction ? 5000 : 2000,
      retryStrategy: (times) => (times > (isProduction ? 3 : 1) ? null : times * 500),
      enableReadyCheck: true,
      lazyConnect: true,
    });

    await client.connect();
    await client.ping();
    redisClient = client;
    logger.info("[Redis] ✅ Connexion réussie");
    return redisClient;
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.warn(`[Redis] Connexion échouée (${errMsg}) → RedisMock (fonctionnement dégradé)`);
    redisClient = new RedisMock() as unknown as Redis;
    return redisClient;
  }
}

/**
 * Retourne l'instance Redis courante.
 * Si non initialisé, retourne un mock plutôt que de throw.
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    logger.warn("[Redis] getRedisClient() appelé avant connectRedis() → RedisMock temporaire");
    redisClient = new RedisMock() as unknown as Redis;
  }
  return redisClient;
}

export function resetRedisClient(): void {
  redisClient = null;
}

/**
 * Export proxy pour compatibilité avec les services qui importent `redis` directement.
 */
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = redisClient ?? (new RedisMock() as unknown as Redis);
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
