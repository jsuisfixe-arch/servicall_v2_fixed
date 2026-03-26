import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { randomBytes } from "crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { serveStatic, setupVite } from "./_core/vite";
import { logger } from "./infrastructure/logger";
import { dbManager } from "./services/dbManager";
import { initializeDatabaseOrExit } from "./services/dbInitializationService";
import { validateEnv as validateEnvSchema } from "./config/envSchema";
import { setupGlobalErrorHandlers, expressErrorHandler, notFoundHandler } from "./middleware/errorHandler";
import { ENV } from "./_core/env";
import WebSocket, { WebSocketServer } from "ws";
import { jwtVerify } from "jose";
import { RealtimeVoicePipeline } from "./services/realtimeVoicePipeline";
import { StripeWorker } from "./services/stripeWorker";
import { storageService } from "./services/storage";
import { loginLimiter, registerLimiter, apiLimiter } from "./middleware/rateLimit";

async function startServer() {
  // 1. Initialisation de l'infrastructure
  setupGlobalErrorHandlers();
  validateEnvSchema();

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
    logger.error("[Server] ❌ Erreur DB : " + (error instanceof Error ? error.message : String(error)));
    if (ENV.isProduction) process.exit(1);
  }

  logger.info("[Server] Connexion à Redis...");
  try {
    const { connectRedis } = await import("./infrastructure/redis/redis.client");
    await connectRedis();
    logger.info("[Server] ✅ Redis connecté");
  } catch (e) {
    logger.warn("[Server] ⚠️ Redis non disponible — fonctionnement dégradé", { error: e });
  }

  logger.info("[Server] Initialisation du stockage...");
  try {
    await storageService.init();
    logger.info("[Server] ✅ Stockage initialisé");
  } catch (e) {
    logger.warn("[Server] ⚠️ Stockage non initialisé", { error: e });
  }

  try {
    StripeWorker.start();
    logger.info("[Server] ✅ Stripe Worker démarré");
  } catch (e) {
    logger.warn("[Server] ⚠️ Stripe Worker non démarré", { error: e });
  }

  try {
    const { startAllWorkers } = await import("./workers");
    await Promise.resolve(startAllWorkers());
    logger.info("[Server] ✅ Workers BullMQ démarrés");
  } catch (e) {
    logger.warn("[Server] ⚠️ Workers non démarrés", { error: e });
  }

  // 2. Configuration Express
  const app = express();
  const server = createServer(app);

  app.set("trust proxy", 1);
  
  // Sécurité & Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour compatibilité proxy
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // Rate Limiting
  app.use("/api/trpc/auth.login", loginLimiter);
  app.use("/api/trpc/auth.register", registerLimiter);
  app.use("/api/trpc", apiLimiter);

  // ── Routes API utilitaires ───────────────────────────────────────────────────
  // CSRF Token : retourne csrfEnabled:false car la protection est gérée via SameSite cookies
  app.get('/api/csrf-token', (_req: Request, res: Response) => {
    res.json({ csrfEnabled: false, csrfToken: null });
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '3.0.0' });
  });

  app.get('/healthz', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // tRPC
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Frontend & Static
  const { existsSync } = await import("fs");
  const { resolve: resolvePath } = await import("path");
  const distExists = existsSync(resolvePath(process.cwd(), "dist", "public", "index.html"));
  if (ENV.nodeEnv === "development" && !distExists) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Error Handlers
  app.use(notFoundHandler);
  app.use(expressErrorHandler);

  // 3. WebSocket Voice Pipeline
  const wss = new WebSocketServer({ server, path: "/voice-stream" });
  const activeSessions = new Map<string, RealtimeVoicePipeline>();

  wss.on("connection", async (ws: WebSocket, req) => {
    let callId: string | null = null;
    let pipeline: RealtimeVoicePipeline | null = null;
    let authenticatedTenantId: number | null = null;

    try {
      const cookieHeader = req.headers.cookie || "";
      const match = cookieHeader.match(/servicall_session=([^;]+)/);
      const token = match?.[1];
      if (!token) throw new Error("No session token");
      const secret = new TextEncoder().encode(process.env["JWT_SECRET"] || "");
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      authenticatedTenantId = typeof payload.tenantId === "number" ? payload.tenantId : null;
      if (!authenticatedTenantId) throw new Error("No tenantId in token");
    } catch (err) {
      logger.warn("[WebSocket] Rejected unauthenticated connection");
      ws.close(4401, "Unauthorized");
      return;
    }

    ws.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message);
        if (data.event === "start") {
          callId = data.start.callSid;
          pipeline = new RealtimeVoicePipeline(ws, {
            callId: parseInt(callId!, 10),
            streamSid: data.start.streamSid,
            callSid: callId!,
            tenantId: authenticatedTenantId!,
            systemPrompt: "Tu es un assistant vocal intelligent.",
          });
          activeSessions.set(callId!, pipeline);
          await pipeline.start();
        } else if (data.event === "stop") {
          cleanupSession(callId);
        }
      } catch (error: unknown) {
        logger.error("[WebSocket] Error processing message", { error });
      }
    });

    ws.on("close", () => cleanupSession(callId));
    ws.on("error", () => cleanupSession(callId));

    function cleanupSession(id: string | null) {
      if (id && activeSessions.has(id)) {
        const p = activeSessions.get(id);
        (p as any)?.stop().catch((e: any) => logger.error("Error stopping pipeline", e));
        activeSessions.delete(id);
      }
      if ((globalThis as any).gc) (globalThis as any).gc();
    }
  });

  // 4. Démarrage
  const port = parseInt(String(process.env["PORT"] ?? 5000), 10);
  server.listen(port, () => {
    logger.info(`[Server] ✅ Sécurisé et démarré sur le port ${port}`);
  });

  process.on("SIGTERM", () => {
    logger.info("[Server] SIGTERM reçu, arrêt gracieux...");
    server.close(() => process.exit(0));
  });
}

startServer().catch((error) => {
  logger.error("❌ ERREUR FATALE", error);
  process.exit(1);
});
