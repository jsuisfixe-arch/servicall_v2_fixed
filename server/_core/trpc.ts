/**
 * FIXES SÉCURITÉ APPLIQUÉS:
 *
 * CRIT-7: Double auth DB × 2 par requête
 *   Avant: requireUser rappelait AuthService.authenticateRequest(req) même si
 *          createContext() l'avait déjà fait → 2 aller-retours DB par requête.
 *   Après: requireUser utilise ctx.user déjà résolu par createContext() → 0 appel DB.
 *
 * CRIT-1: requireTenantContext — ctx.user.tenantId === ctx.tenantId brise multi-tenant
 *   Avant: si la condition est false et role !== superadmin → INTERNAL_SERVER_ERROR.
 *          Aucun contrôle d'accès cross-tenant réel.
 *   Après: user standard → FORBIDDEN si tenantId ne correspond pas.
 *          superadmin → accès cross-tenant autorisé avec log d'audit.
 */

import { UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext, ProtectedTrpcContext, TenantTrpcContext } from "./context";
import { logger } from "../infrastructure/logger";
import { setTag, setContext, captureException } from "@sentry/node";

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const rateLimitMiddleware = async (opts: any) => {
  const { ctx, next, path } = opts;

  if (process.env["NODE_ENV"] === "test") return next();

  try {
    const { getRedisClient } = await import("../infrastructure/redis/redis.client");
    const redis = getRedisClient();

    if (!redis || typeof redis.call !== "function") return next();

    const ip = ctx.req.ip || "unknown";
    const key = `rl:trpc:${path}:${ip}`;

    const current = await (redis as any).incr(key);
    if (current === 1) await (redis as any).expire(key, 60);

    const limit = 200;
    if (current > limit) {
      logger.warn(`[TRPC RateLimit] Limit exceeded for ${path} from ${ip}`);
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Trop de requêtes. Veuillez ralentir.",
      });
    }
  } catch (error: any) {
    if (error instanceof TRPCError) throw error;
    logger.error("[TRPC RateLimit] Error checking rate limit", error);
  }

  return next();
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

// ─── Sentry Middleware ────────────────────────────────────────────────────────

const sentryMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
  try {
    const result = await next();
    if (!result.ok) {
      setTag("trpc.path", path);
      setTag("trpc.type", type);
      setContext("trpc.context", { userId: ctx.user?.id, tenantId: ctx.tenantId });
      captureException(result.error);
    }
    return result;
  } catch (error: any) {
    setTag("trpc.path", path);
    setTag("trpc.type", type);
    captureException(error);
    throw error;
  }
});

export const router = t.router;
export const middleware = t.middleware;

export const publicProcedure = t.procedure
  .use(sentryMiddleware)
  .use(t.middleware(rateLimitMiddleware));

// ─── FIX CRIT-7: requireUser sans 2ème appel DB ──────────────────────────────
// Avant: const authResult = await AuthService.authenticateRequest(req); (DOUBLE DB)
// Après: utilise ctx.user déjà résolu par createContext()

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  // Pas d'appel à AuthService ici — ctx.user est déjà authentifié par createContext()
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      tenantId: ctx.tenantId,
    } as ProtectedTrpcContext,
  });
});

// ─── FIX CRIT-1: requireTenantContext avec contrôle multi-tenant correct ─────
// Avant: ctx.user.tenantId === ctx.tenantId ? { role } : undefined
//        Si false + pas superadmin → INTERNAL_SERVER_ERROR (pas FORBIDDEN!)
//        Aucun log d'audit cross-tenant pour les superadmins
// Après: user normal → FORBIDDEN si IDs ne correspondent pas
//        superadmin → accès autorisé avec log d'audit obligatoire

const requireTenantContext = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user || !ctx.tenantId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (typeof ctx.tenantId !== "number" || ctx.tenantId <= 0) {
    logger.warn("[TRPC] Invalid tenantId in context", {
      userId: ctx.user.id,
      path: opts.path,
      tenantId: ctx.tenantId,
    });
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Contexte d'entreprise (tenantId) obligatoire.",
    });
  }

  const isSuperAdmin = ctx.user.role === 'superadmin';

  // FIX CRIT-1: vérification d'appartenance tenant correcte
  if (!isSuperAdmin && ctx.user.tenantId !== ctx.tenantId) {
    logger.warn("[TRPC] Cross-tenant access attempt BLOCKED", {
      userId: ctx.user.id,
      userTenantId: ctx.user.tenantId,
      requestedTenantId: ctx.tenantId,
      path: opts.path,
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès refusé: ce compte n'appartient pas à cette organisation.",
    });
  }

  if (isSuperAdmin && ctx.user.tenantId !== ctx.tenantId) {
    // Log d'audit obligatoire pour accès cross-tenant superadmin
    logger.info("[TRPC] Superadmin cross-tenant access (audit log)", {
      adminId: ctx.user.id,
      adminTenantId: ctx.user.tenantId,
      targetTenantId: ctx.tenantId,
      path: opts.path,
    });
  }

  const normalizeRole = (role: string): 'admin' | 'manager' | 'agent' => {
    if (role === 'admin' || role === 'owner' || role === 'superadmin') return 'admin';
    if (role === 'manager') return 'manager';
    return 'agent';
  };

  const tenantContext = {
    tenantId: ctx.tenantId,
    role: normalizeRole(ctx.user.role),
    userId: ctx.user.id,
    issuedAt: Date.now(),
  };

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      tenantId: ctx.tenantId,
      tenantContext,
    } as TenantTrpcContext,
  });
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const protectedProcedure = t.procedure
  .use(sentryMiddleware)
  .use(t.middleware(rateLimitMiddleware))
  .use(requireUser);

export const tenantProcedure = protectedProcedure.use(requireTenantContext);
