/**
 * RATE LIMITING — REDIS AVEC FALLBACK MÉMOIRE (Phase 4.2)
 * Si Redis indisponible → fallback automatique sur store mémoire.
 * Ne throw jamais à l'initialisation.
 */
import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../infrastructure/logger";

const createRedisStore = (prefix: string) => {
  try {
    // Import synchrone intentionnel — le client est déjà initialisé au boot
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getRedisClient } = require("../infrastructure/redis/redis.client");
    const client = getRedisClient();
    // Si c'est un RedisMock, pas de sendCommand → fallback mémoire
    if (!client || typeof client.call !== "function") return undefined;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RedisStore = require("rate-limit-redis");
    return new RedisStore({
      // @ts-ignore
      sendCommand: (...args: string[]) => client.call(...args),
      prefix: `rl:${prefix}:`,
    });
  } catch (e) {
    logger.warn(`[RateLimit] Store Redis indisponible pour "${prefix}" → mémoire`, {
      error: e instanceof Error ? e.message : String(e),
    });
    return undefined;
  }
};

const isTest = () => process.env["NODE_ENV"] === "test";

/** /auth/login → 5 req/min/IP */
export const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("login"),
  skip: isTest,
  message: { error: "Too Many Requests", message: "Trop de tentatives. Réessayez dans une minute." },
});

/** /auth/register → 3 req/min/IP */
export const registerLimiter = rateLimit({
  windowMs: 60_000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("register"),
  skip: isTest,
  message: { error: "Too Many Requests", message: "Trop de tentatives. Réessayez dans une minute." },
});

/** /api → 100 req/min/IP */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("api"),
  skip: isTest,
  message: { error: "Too Many Requests", message: "Trop de requêtes. Veuillez ralentir." },
});

/** Sécurité webhook — vérification de signature faite dans chaque handler */
export const webhookSecurity = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

/** Webhook rate limiter — 200 req/min pour les webhooks entrants */
export const webhookLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("webhook"),
  skip: isTest,
  message: { error: "Too Many Requests", message: "Trop de requêtes webhook." },
});
