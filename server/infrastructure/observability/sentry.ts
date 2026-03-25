/**
 * Sentry Observability — OPTIONNEL
 * Si SENTRY_DSN absent ou @sentry/node manquant → no-ops silencieux.
 * Ne throw jamais, ne bloque pas le démarrage.
 */

import { ENV } from "../../_core/env";
import { logger } from "../../core/logger/index";

let sentryAvailable = false;
let _captureException: ((e: any) => void) | null = null;
let _setContext: ((k: string, v: Record<string, unknown>) => void) | null = null;
let _setUser: ((u: { id: string } | null) => void) | null = null;
let _setTag: ((k: string, v: string) => void) | null = null;
let _setExtras: ((e: Record<string, unknown>) => void) | null = null;

export function initSentry(): void {
  if (!ENV.sentryDsn) {
    logger.info("[Sentry] DSN absent → Sentry désactivé");
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sentry = require("@sentry/node");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { nodeProfilingIntegration } = require("@sentry/profiling-node");

    sentry.init({
      dsn: ENV.sentryDsn,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      environment: ENV.nodeEnv ?? "development",
    });

    _captureException = sentry.captureException;
    _setContext = sentry.setContext;
    _setUser = sentry.setUser;
    _setTag = sentry.setTag;
    _setExtras = sentry.setExtras;
    sentryAvailable = true;
    logger.info("[Sentry] ✅ Initialisé avec succès");
  } catch (e) {
    logger.warn("[Sentry] Impossible d'initialiser (@sentry/node absent ?)", { error: e });
  }
}

export function sentryContextMiddleware(
  req: Record<string, unknown>,
  _res: any,
  next: () => void
): void {
  if (sentryAvailable) {
    try {
      const tenantId = (req.tenantId as string) || (req.headers as Record<string, string>)?.["x-tenant-id"];
      const userId = (req.user as { id?: any } | undefined)?.id;
      const requestId = (req.correlationId as string) || (req.headers as Record<string, string>)?.["x-request-id"];
      _setContext?.("tenant", { id: tenantId });
      if (userId) _setUser?.({ id: String(userId) });
      if (requestId) _setTag?.("requestId", String(requestId));
      if (tenantId) _setTag?.("tenantId", String(tenantId));
    } catch (_e) { /* jamais bloquer une requête */ }
  }
  next();
}

export function captureException(error: any, context?: Record<string, unknown>): void {
  if (!sentryAvailable) return;
  try {
    if (context) _setExtras?.(context);
    _captureException?.(error);
  } catch (_e) { /* ignorer */ }
}
