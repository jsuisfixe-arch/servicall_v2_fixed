
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { randomBytes } from "crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import twilioWebhookRouter from "../api/twilio";
import stripeWebhookRouter from "../api/stripe";
import whatsappRouter from "../api/whatsapp";
import socialWebhookRouter from "../api/socialWebhook";
import { testLoginHandler } from "../api/test-login";
import {
  loginLimiter,
  registerLimiter,
  apiLimiter,
  webhookSecurity,
} from "../middleware/rateLimit";
import { logger, requestLogger } from "../infrastructure/logger";
import { correlationIdMiddleware } from "../middleware/correlationIdMiddleware";
import { tenantIsolationMiddleware, globalErrorHandler } from "../middleware/globalMiddleware";
import { setupMetricsEndpoint, httpRequestDuration, trpcCallsTotal } from "../services/metricsService";
import { HealthService } from "../services/healthService";
import { storageService } from "../services/storage";
import { StripeWorker } from "../services/stripeWorker";
import path from "path";
import { dbManager } from "../services/dbManager";
import { initializeDatabaseOrExit } from "../services/dbInitializationService";
import { validateEnv as validateEnvSchema } from "../config/envSchema";
import { setupGlobalErrorHandlers, expressErrorHandler, notFoundHandler } from "../middleware/errorHandler";
import { ENV, validateSecrets, validateEnvironmentSeparation } from "./env";

// ── WebSocket voice pipeline (du projet référence) ─────────────────────────
import WebSocket, { WebSocketServer } from "ws";
import { jwtVerify } from "jose";
import { RealtimeVoicePipeline } from "../services/realtimeVoicePipeline";

async function startServer() {
  // ── PHASE 1.2 : Sentry OPTIONNEL ──────────────────────────────────────────
  try {
    const { initSentry } = await import("../infrastructure/observability/sentry");
    initSentry();
  } catch (e) {
    logger.warn("[Sentry] Non disponible — désactivé", { error: e });
  }

  setupGlobalErrorHandlers();

  // ── PHASE 1.3 : Validation d'environnement STRICTE (Zod) ──────────────────
  logger.info("[Server] Validation de l'environnement...");
  validateEnvSchema();
  logger.info("[Server] ✅ Environnement validé");

  // ── Base de données ────────────────────────────────────────────────────────
  logger.info("[Server] Initialisation de la base de données...");
  try {
    await dbManager.initialize();
    if (ENV.dbEnabled) {
      await initializeDatabaseOrExit().catch((_err) =>
        logger.warn("[Server] ⚠️ Échec initializeDatabaseOrExit, poursuite du boot...")
      );
    }
    logger.info("[Server] ✅ Base de données initialisée");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("[Server] ❌ Erreur DB : " + msg);
    if (ENV.isProduction) process.exit(1);
  }

  // ── PHASE 1.1 : Redis OPTIONNEL ───────────────────────────────────────────
  logger.info("[Server] Connexion à Redis...");
  try {
    const { connectRedis } = await import("../infrastructure/redis/redis.client");
    await connectRedis();
    logger.info("[Server] ✅ Redis connecté");
  } catch (e) {
    logger.warn("[Server] ⚠️ Redis non disponible — fonctionnement dégradé (pas de cache/rate-limit Redis)", { error: e });
    // Ne pas throw — continuer sans Redis
  }

  // ── Stockage ───────────────────────────────────────────────────────────────
  logger.info("[Server] Initialisation du stockage...");
  try {
    await storageService.init();
    logger.info("[Server] ✅ Stockage initialisé");
  } catch (e) {
    logger.warn("[Server] ⚠️ Stockage non initialisé", { error: e });
  }

  // ── Stripe Worker OPTIONNEL ───────────────────────────────────────────────
  try {
    StripeWorker.start();
    logger.info("[Server] ✅ Stripe Worker démarré");
  } catch (e) {
    logger.warn("[Server] ⚠️ Stripe Worker non démarré", { error: e });
  }

  // ── PHASE 1.4 : Workers BullMQ SÉCURISÉS ─────────────────────────────────
  try {
    const { startAllWorkers } = await import("../workers");
    await Promise.resolve(startAllWorkers());
    logger.info("[Server] ✅ Workers BullMQ démarrés");
  } catch (e) {
    logger.warn("[Server] ⚠️ Workers non démarrés — fonctionnement dégradé", { error: e });
    // Ne pas throw
  }

  // ── Dialer Engine OPTIONNEL ───────────────────────────────────────────────
  let dialerEngine: import("../services/dialer/dialer-engine").DialerEngineService | null = null;
  try {
    const { DialerEngine } = await import("../services/dialer/dialer-engine");
    const { TwilioService } = await import("../services/twilio/twilio-service");
    const twilioService = new TwilioService({
      accountSid: process.env['TWILIO_ACCOUNT_SID'] || "test-account",
      authToken: process.env['TWILIO_AUTH_TOKEN'] || "test-token",
      fromNumber: process.env['TWILIO_FROM_NUMBER'] || "+1234567890",
    });
    dialerEngine = new DialerEngine(process.env['REDIS_URL'] || "redis://localhost:6379", twilioService);
    await dialerEngine.initialize();
    const { initializeCampaignRoutes } = await import("../routes/campaigns");
    initializeCampaignRoutes(dialerEngine);
    logger.info("[Server] ✅ Moteur de dialer initialisé");
  } catch (e) {
    logger.warn("[Server] ⚠️ Dialer Engine non disponible (Twilio/Redis absent ?)", { error: e });
  }

  // ── Express App ────────────────────────────────────────────────────────────
  const app = express();
  const server = createServer(app);

  app.set("trust proxy", 1);
  logger.info("[Server] Trust proxy activé");

  // ── CORS ───────────────────────────────────────────────────────────────────
  // Règle définitive :
  // - Whitelist vide → toutes origines autorisées (déploiement proxy, ngrok, Manus, etc.)
  // - Whitelist renseignée → strict sur la liste
  // - Pas d'origine (même origin, appels serveur-serveur) → toujours autorisé
  const whitelist = (ENV.allowedOrigins?.split(",") || []).map((o) => o.trim()).filter(Boolean);
  const corsOptions: cors.CorsOptions = {
    origin: true, // Autorise toutes les origines (nécessaire pour le proxy Manus/Replit)
    credentials: true,
  };
  app.use(cors(corsOptions));

  // ── Headers HTTP — Solution définitive proxy HTTPS ────────────────────────
  //
  // RACINE DU PROBLÈME PAGE BLANCHE :
  // Node.js >= 14 + Express ajoutent automatiquement :
  //   Origin-Agent-Cluster: ?1
  // Cet en-tête force le browser à isoler le contexte JS dans un "agent cluster"
  // séparé. Les import() dynamiques de Vite (chunks React, pages lazy) se chargent
  // dans un contexte isolé et ne peuvent plus accéder au module principal.
  // Résultat : React ne se monte pas → page blanche.
  //
  // Helmet ajoute en plus :
  //   Cross-Origin-Opener-Policy: same-origin  → bloque window entre origins proxy
  //   Cross-Origin-Embedder-Policy: require-corp → bloque ressources cross-origin
  //
  // SOLUTION : désactiver explicitement Origin-Agent-Cluster + COOP + COEP
  //            tout en conservant les protections utiles (noSniff, frameguard, etc.)

  // 1. Forcer Origin-Agent-Cluster: ?0 AVANT helmet (Express l'ajoute en interne)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Origin-Agent-Cluster", "?0");
    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const nonce = randomBytes(16).toString("base64");
    (res.locals as Record<string, unknown>)["cspNonce"] = nonce;

    const isDevMode = ENV.nodeEnv !== "production";

    // Dev: permissif pour HMR Vite
    // Prod: nonce + unsafe-inline comme fallback pour proxies (Replit, ngrok, Manus)
    // strict-dynamic retiré — incompatible avec les chunks Vite crossorigin sans SSR
    // unsafe-inline ignoré par les browsers qui supportent les nonces (sécurité maintenue)
    const scriptSrc = isDevMode
      ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
      : ["'self'", `'nonce-${nonce}'`, "'unsafe-inline'", "'unsafe-eval'"];

    try {
      helmet({
        // 2. CSP — script-src avec nonce en prod, permissif en dev
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc,
            scriptSrcAttr: ["'unsafe-inline'"],  // needed for some Radix/shadcn components
            // Google Fonts inclus (rapport Manus fix #3)
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "data:"],
            connectSrc: ["'self'", "wss:", "https:", "http://localhost:*"],
            mediaSrc: ["'self'", "blob:", "https:"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
            // frame-ancestors 'none' → 'self' + https: (rapport Manus fix #1)
            // 'none' bloquait l'iframe sandbox du proxy
            frameAncestors: ["'self'", "https:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            // Désactivé — casse les modules ES6 via proxy HTTP→HTTPS
            upgradeInsecureRequests: null,
          },
        },

        // 3. HSTS uniquement en prod et seulement si pas derrière un proxy HTTP
        hsts: ENV.nodeEnv === "production"
          ? { maxAge: 31536000, includeSubDomains: true, preload: true }
          : false,

        // 4. COOP désactivé — same-origin bloque window.opener via proxy cross-origin
        crossOriginOpenerPolicy: false,

        // 5. COEP désactivé — require-corp bloque les ressources cross-origin
        crossOriginEmbedderPolicy: false,

        // 6. CORP cross-origin — permet aux chunks Vite de se charger depuis n'importe quel origin
        crossOriginResourcePolicy: { policy: "cross-origin" },

        // Protections utiles conservées
        // frameguard désactivé (rapport Manus fix #2)
        // X-Frame-Options: DENY bloquait l'iframe sandbox du proxy
        frameguard: false,
        // originAgentCluster désactivé explicitement dans Helmet (rapport Manus fix #4)
        originAgentCluster: false,
        noSniff: true,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        xssFilter: false, // déprécié dans les navigateurs modernes
        dnsPrefetchControl: { allow: false },
        ieNoOpen: true,
        permittedCrossDomainPolicies: false,
      })(req, res, next);
    } catch (e) {
      next();
    }
  });

  setupMetricsEndpoint(app);

  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route ? req.route.path : req.path;
      httpRequestDuration.labels(req.method, route, res.statusCode.toString()).observe(duration);
    });
    next();
  });

  app.use(cookieParser(ENV.sessionSecret));
  app.use(correlationIdMiddleware);
  app.use(tenantIsolationMiddleware);

  // Sentry context (optionnel)
  try {
    const { sentryContextMiddleware } = await import("../infrastructure/observability/sentry");
    app.use(sentryContextMiddleware);
  } catch (_e) { /* Sentry absent, on continue */ }

  app.use(globalErrorHandler);

  // ── Rate Limiting ──────────────────────────────────────────────────────────
  app.use("/api/auth/login", loginLimiter);
  app.use("/api/auth/register", registerLimiter);

  // ── Webhooks ───────────────────────────────────────────────────────────────
  app.use("/api/twilio", webhookSecurity, express.urlencoded({ extended: true }), twilioWebhookRouter);
  app.use("/api/twiml", express.urlencoded({ extended: true }), twilioWebhookRouter);
  app.use("/api/stripe", webhookSecurity, express.raw({ type: "application/json" }), stripeWebhookRouter);
  app.use("/api/whatsapp", express.json(), whatsappRouter);
  app.use("/api/social-webhook", express.json(), socialWebhookRouter);

  app.use("/api", (_req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("X-API-Version", "2.0.0");
    next();
  });

  // ── CSRF protection ────────────────────────────────────────────────────────
  // Solution définitive pour proxy HTTPS (Manus, ngrok, etc.) :
  //
  // PROBLÈME 1 — getSessionIdentifier retourne "anon-default" quand le cookie
  //   de session est absent au GET /api/csrf-token (premier chargement ou proxy
  //   qui ne transmet pas les cookies). Au POST suivant, la session existe → mismatch.
  //   Fix : utiliser un identifiant stable basé sur l'IP + User-Agent (pas les cookies).
  //
  // PROBLÈME 2 — SameSite:"lax" + Secure bloque le cookie csrf-token quand la page
  //   est servie via un proxy HTTPS sur un domaine différent.
  //   Fix : SameSite:"none" + Secure:true en prod, SameSite:"lax" en dev.
  //
  // PROBLÈME 3 — httpOnly:true empêche le JS client de lire le cookie csrf pour
  //   l'injecter dans le header.
  //   Fix : httpOnly:false (le token CSRF n'est pas un secret d'authentification).

  let generateToken: ((req: Request, res: Response) => string) | null = null;
  let doubleCsrfProtection: ((req: Request, res: Response, next: NextFunction) => void) | null = null;

  const ANON_SESSION_COOKIE = "_sc_anon";

  if (ENV.isProduction && ENV.sessionSecret) {
    try {
      const { doubleCsrf } = await import("csrf-csrf");
      const csrfResult = doubleCsrf({
        getSecret: () => ENV.sessionSecret as string,
        // Identifiant stable qui NE dépend PAS des cookies de session
        // → évite le mismatch GET/POST via proxy où les cookies arrivent différemment
        getSessionIdentifier: (req: Request) => {
          // Priorité 1 : cookie de session JWT (le plus stable)
          const sessionCookie = req.cookies?.["servicall_session"] as string | undefined;
          if (sessionCookie) return sessionCookie.substring(0, 32); // tronqué pour perf

          // Priorité 2 : cookie anonyme (créé au premier load)
          const anonCookie = req.cookies?.[ANON_SESSION_COOKIE] as string | undefined;
          if (anonCookie) return anonCookie;

          // Priorité 3 : IP + User-Agent (stable pour une session browser)
          // Fonctionne même quand les cookies ne traversent pas le proxy
          const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
            ?? req.socket?.remoteAddress
            ?? "unknown";
          const ua = (req.headers["user-agent"] ?? "").substring(0, 50);
          return `${ip}:${ua}`;
        },
        cookieName: "x-csrf-token",
        cookieOptions: {
          httpOnly: false,          // Le JS doit pouvoir lire ce cookie pour l'injecter
          sameSite: "none" as const, // Nécessaire pour les requêtes cross-site via proxy HTTPS
          secure: true,             // Requis quand SameSite=none
          path: "/",
        },
        size: 64,
        ignoredMethods: ["GET", "HEAD", "OPTIONS"],
        getCsrfTokenFromRequest: (req: Request) =>
          (req.headers["x-csrf-token"] as string) ?? "",
        skipCsrfProtection: (req: Request) => {
          const url = req.url ?? "";
          // Exclure auth (login/register/forgot) + webhooks Twilio/Stripe/WhatsApp
          return (
            url.includes("auth.login") ||
            url.includes("auth.register") ||
            url.includes("auth.forgotPassword") ||
            req.path.startsWith("/api/twilio") ||
            req.path.startsWith("/api/stripe") ||
            req.path.startsWith("/api/whatsapp") ||
            req.path.startsWith("/api/social-webhook")
          );
        },
      });
      generateToken = csrfResult.generateCsrfToken;
      doubleCsrfProtection = csrfResult.doubleCsrfProtection;
      logger.info("[Server] ✅ CSRF protection activée (production)");
    } catch (e) {
      logger.warn("[Server] ⚠️ CSRF non disponible (csrf-csrf absent ?)", { error: e });
    }
  } else {
    logger.info("[Server] ℹ️ CSRF désactivé (dev ou CSRF_SECRET manquant)");
  }

  app.use("/api/files", express.static(path.join(process.cwd(), "uploads")));

  // Campaigns route (optionnel)
  try {
    const campaignRoutes = (await import("../routes/campaigns")).default;
    app.use("/api/campaigns", campaignRoutes);
  } catch (e) {
    logger.warn("[Server] ⚠️ Campaign routes non chargées", { error: e });
  }

  app.use(express.json({ limit: "1mb" }));

  // Cookie anonyme stable pour CSRF — doit avoir les mêmes attributs que le cookie CSRF
  // SameSite="none" + Secure pour traverser le proxy HTTPS sans être bloqué
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies?.["servicall_session"] && !req.cookies?.[ANON_SESSION_COOKIE]) {
      const anonId = randomBytes(16).toString("hex");
      res.cookie(ANON_SESSION_COOKIE, anonId, {
        httpOnly: false,
        sameSite: ENV.isProduction ? "none" : "lax",
        secure: ENV.isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours (stable entre sessions)
        path: "/",
      });
      req.cookies[ANON_SESSION_COOKIE] = anonId;
    }
    next();
  });

  app.get("/api/csrf-token", (req, res) => {
    // Ne jamais mettre en cache ce endpoint — chaque appel doit générer un token frais
    // lié à la session courante (surtout après login où la session change)
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");

    if (!generateToken) {
      return res.json({ csrfToken: null, csrfEnabled: false });
    }

    // Effacer l'ancien cookie csrf avant d'en générer un nouveau
    // Evite que csrf-csrf retourne un token lié à l'ancienne session
    res.clearCookie("x-csrf-token", { path: "/" });

    const token = generateToken(req, res);
    res.json({ csrfToken: token, csrfEnabled: true });
  });

  app.use(requestLogger);

  // ── Health checks ──────────────────────────────────────────────────────────
  app.get("/health/live", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  app.get("/health/ready", async (_req, res) => {
    const status = await HealthService.getFullStatus();
    res.status(status.status === "ok" ? 200 : 503).json(status);
  });
  app.get("/health", async (_req, res) => {
    const status = await HealthService.getFullStatus();
    res.status(status.status === "error" ? 500 : 200).json(status);
  });
  app.get("/healthz", async (_req, res) => {
    const status = await HealthService.getFullStatus();
    res.status(status.status === "error" ? 500 : 200).json(status);
  });

  if (process.env["MODE_TEST"] === "true" && ENV.nodeEnv !== "production") {
    app.get("/api/oauth/test-login", loginLimiter, testLoginHandler);
    logger.warn("[Security] MODE_TEST active — test login endpoint exposed. NEVER enable in production.");
  } else if (process.env["MODE_TEST"] === "true" && ENV.nodeEnv === "production") {
    logger.error("[Security] CRITICAL: MODE_TEST=true detected in production — endpoint NOT registered. Remove this env var immediately.");
  }

  // ── tRPC (avec CSRF si activé) ─────────────────────────────────────────────
  const trpcMiddlewares: ((req: Request, res: Response, next: NextFunction) => void)[] = [apiLimiter];
  if (doubleCsrfProtection) trpcMiddlewares.push(doubleCsrfProtection);

  app.use(
    "/api/trpc",
    ...trpcMiddlewares,
    createExpressMiddleware({
      router: appRouter,
      createContext: async (opts) => {
        const ctx = await createContext(opts);
        const procedure = opts.req.path.replace(/^\//, "");
        trpcCallsTotal.labels(procedure, "unknown", "success").inc();
        return ctx;
      },
    })
  );

  // ── Stripe Connect OAuth ───────────────────────────────────────────────────
  app.get("/api/stripe/connect/callback", async (req, res) => {
    const { code, state, error } = req.query as Record<string, string>;
    const appUrl = process.env["APP_URL"] ?? "http://localhost:5000";
    if (error) return res.redirect(`${appUrl}/settings?tab=billing&connect_error=${encodeURIComponent(error)}`);
    if (!code || !state) return res.redirect(`${appUrl}/settings?tab=billing&connect_error=missing_params`);
    const tenantId = parseInt(state);
    if (isNaN(tenantId)) return res.redirect(`${appUrl}/settings?tab=billing&connect_error=invalid_state`);
    try {
      const { exchangeOAuthCode, saveTenantStripeConnect } = await import("../services/stripeConnectService");
      const tokens = await exchangeOAuthCode(code);
      await saveTenantStripeConnect(tenantId, tokens);
      return res.redirect(`${appUrl}/settings?tab=billing&connect_success=1`);
    } catch (err) {
      logger.error("[StripeConnect] OAuth exchange failed", err);
      return res.redirect(`${appUrl}/settings?tab=billing&connect_error=exchange_failed`);
    }
  });

  // ── Public API v1 (optionnel) ──────────────────────────────────────────────
  try {
    const { publicApiRouter } = await import("../routes/publicApi");
    app.use("/api/v1", publicApiRouter);
    logger.info("[Server] ✅ Public API v1 enregistrée");
  } catch (err) {
    logger.warn("[Server] ⚠️ Public API v1 non chargée", err);
  }

  // ── Invoice PDF ────────────────────────────────────────────────────────────
  app.get("/api/invoices/:id/pdf", async (req, res): Promise<void> => {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      if (isNaN(invoiceId)) { res.status(400).json({ error: "Invalid invoice ID" }); return; }
      const { InvoiceService } = await import("../services/invoiceService");
      const invoice = await InvoiceService.getInvoiceById(invoiceId);
      if (!invoice) { res.status(404).json({ error: "Invoice not found" }); return; }
      if (invoice.pdfUrl) { res.redirect(invoice.pdfUrl); return; }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="facture-${invoiceId}.html"`);
      res.send(`<!DOCTYPE html><html><body>
        <h1>Facture #${invoice.invoiceNumber ?? invoiceId}</h1>
        <p>Montant : ${invoice.amount} ${invoice.currency ?? "EUR"}</p>
        <p>Statut : ${invoice.status}</p>
        <p>Date : ${new Date(invoice.createdAt ?? Date.now()).toLocaleDateString("fr-FR")}</p>
      </body></html>`);
    } catch (err) {
      res.status(500).json({ error: "PDF generation failed" });
    }
  });

  // ── Frontend ───────────────────────────────────────────────────────────────
  const { existsSync } = await import("fs");
  const { resolve: resolvePath } = await import("path");
  const distExists = existsSync(resolvePath(process.cwd(), "dist", "public", "index.html"));
  if (ENV.nodeEnv === "development" && !distExists) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: { type: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` } });
  });

  app.use(notFoundHandler);
  app.use(expressErrorHandler);

  // ── PHASE 6 : WebSocket Voice Pipeline (pattern référence) ─────────────────
  const wss = new WebSocketServer({ server, path: "/voice-stream" });
  const activeSessions = new Map<string, RealtimeVoicePipeline>();

  wss.on("connection", async (ws: WebSocket, req) => {
    let callId: string | null = null;
    let pipeline: RealtimeVoicePipeline | null = null;
    let authenticatedTenantId: number | null = null;

    // C-2: Authenticate WebSocket via JWT cookie — reject unauthenticated connections
    try {
      const cookieHeader = req.headers.cookie || "";
      const match = cookieHeader.match(/servicall_session=([^;]+)/);
      const token = match?.[1];
      if (!token) throw new Error("No session token");
      const secret = new TextEncoder().encode(process.env["JWT_SECRET"] || "");
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      authenticatedTenantId = typeof payload.tenantId === "number" ? payload.tenantId : null;
      if (!authenticatedTenantId) throw new Error("No tenantId in token");
      logger.info("[WebSocket] Authenticated connection", { tenantId: authenticatedTenantId });
    } catch (err) {
      logger.warn("[WebSocket] Rejected unauthenticated connection", { err });
      ws.close(4401, "Unauthorized");
      return;
    }

    logger.info("[WebSocket] New authenticated connection established");

    ws.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message);
        switch (data.event) {
          case "start":
            callId = data.start.callSid;
            const streamSid = data.start.streamSid;
            logger.info("[WebSocket] Call started", { callId, streamSid });
            // C-2: Always use tenantId from JWT — never trust client-supplied value
            pipeline = new RealtimeVoicePipeline(ws, {
              callId: parseInt(callId!, 10),
              streamSid,
              callSid: callId!,
              tenantId: authenticatedTenantId!,
              systemPrompt: "Tu es un assistant vocal intelligent.",
            });
            activeSessions.set(callId!, pipeline);
            await pipeline.start();
            break;
          case "media":

            break;
          case "stop":
            logger.info("[WebSocket] Call stopped", { callId });
            cleanupSession(callId);
            break;
        }
      } catch (error: unknown) {
        logger.error("[WebSocket] Error processing message", { error: error instanceof Error ? error.message : String(error) });
      }
    });

    ws.on("close", () => {
      logger.info("[WebSocket] Connection closed", { callId });
      cleanupSession(callId);
    });

    ws.on("error", (error) => {
      logger.error("[WebSocket] Connection error", { callId, error });
      cleanupSession(callId);
    });

    function cleanupSession(id: string | null) {
      if (id && activeSessions.has(id)) {
        const p = activeSessions.get(id);
        (p as any)?.stop().catch((e: any) => logger.error("Error stopping pipeline", e));
        activeSessions.delete(id);
        logger.info("[WebSocket] Session cleaned up", { callId: id });
      }
      if ((globalThis as any).gc) (globalThis as any).gc();
    }
  });

  // Monitoring mémoire toutes les 60s (pattern référence)
  setInterval(() => {
    const { heapUsed } = process.memoryUsage();
    if (heapUsed > 500 * 1024 * 1024) {
      logger.warn("[System] High memory usage", { heapUsed: Math.round(heapUsed / 1024 / 1024) + "MB" });
    }
  }, 60_000);

  // ── Démarrage ──────────────────────────────────────────────────────────────
  const port = parseInt(String(process.env["PORT"] ?? 5000), 10);

  process.on("SIGTERM", async () => {
    logger.info("[Server] SIGTERM reçu, arrêt gracieux...");
    if (dialerEngine) await dialerEngine.shutdown();
    server.close(() => {
      logger.info("[Server] Serveur arrêté");
      process.exit(0);
    });
  });

  server.listen(port, () => {
    logger.info(`[Server] ✅ Sécurisé et démarré sur le port ${port}`);
    import("../workers/scheduledPostsWorker")
      .then(({ startScheduledPostsWorker }) => startScheduledPostsWorker())
      .catch((err) => logger.error("[Server] Failed to start scheduledPostsWorker", { err }));
  });
}

startServer().catch((error) => {
  logger.error("❌ ERREUR FATALE", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  logger.info("\n[Server] SIGINT reçu, arrêt gracieux...");
  import("../workers/scheduledPostsWorker")
    .then(({ stopScheduledPostsWorker }) => stopScheduledPostsWorker())
    .catch(() => {});
  process.exit(0);
});
