import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { serveStatic, setupVite } from "./_core/vite";
import { logger } from "./infrastructure/logger";
import { ensureDatabaseInitialized, isDatabaseReady } from "./services/dbInitializer";
import { validateEnv as validateEnvSchema } from "./config/envSchema";
import { setupGlobalErrorHandlers, expressErrorHandler, notFoundHandler } from "./middleware/errorHandler";
import { ENV } from "./_core/env";

async function startServer() {
  try {
    // 1. Configuration initiale
    setupGlobalErrorHandlers();
    validateEnvSchema();

    logger.info("[Server] 🚀 Démarrage de Servicall v4...");

    // 2. Initialisation CRITIQUE de la base de données
    logger.info("[Server] 📦 Initialisation de la base de données...");
    try {
      await ensureDatabaseInitialized();
      logger.info("[Server] ✅ Base de données prête");
    } catch (error: unknown) {
      logger.error(
        "[Server] ❌ ERREUR CRITIQUE : Impossible d'initialiser la base de données : " +
        (error instanceof Error ? error.message : String(error))
      );
      if (ENV.isProduction) {
        process.exit(1);
      }
      logger.warn("[Server] ⚠️ Fonctionnement en mode dégradé (développement)");
    }

    // 3. Configuration Express
    const app = express();
    const server = createServer(app);

    app.set("trust proxy", 1);

    // Middleware de sécurité
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS
    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );

    // Parsers
    app.use(cookieParser());
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: false, limit: "1mb" }));

    // 4. Routes de santé
    app.get("/api/health", (_req: Request, res: Response) => {
      res.json({
        status: isDatabaseReady() ? "ok" : "degraded",
        database: isDatabaseReady() ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
        version: "4.0.0",
      });
    });

    app.get("/healthz", (_req: Request, res: Response) => {
      res.json({ status: "ok" });
    });

    // 5. API tRPC
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );

    // 6. Fichiers statiques et frontend
    const { existsSync } = await import("fs");
    const { resolve: resolvePath } = await import("path");
    const distExists = existsSync(
      resolvePath(process.cwd(), "dist", "public", "index.html")
    );

    if (ENV.nodeEnv === "development" && !distExists) {
      logger.info("[Server] 🔧 Mode développement - Vite activé");
      await setupVite(app, server);
    } else {
      logger.info("[Server] 📁 Serveur statique activé");
      serveStatic(app);
    }

    // 7. Handlers d'erreur
    app.use(notFoundHandler);
    app.use(expressErrorHandler);

    // 8. Démarrage du serveur
    const PORT = ENV.port || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      logger.info(`[Server] ✅ Sécurisé et démarré sur le port ${PORT}`);
      logger.info(`[Server] 🌐 URL: http://localhost:${PORT}`);
      logger.info("[Server] 📊 Dashboard: http://localhost:5000/dashboard");
      logger.info("[Server] 🔐 Login: http://localhost:5000/login");
    });

    // Gestion des signaux d'arrêt gracieux
    process.on("SIGTERM", () => {
      logger.info("[Server] SIGTERM reçu, arrêt gracieux...");
      server.close(() => {
        logger.info("[Server] ✅ Serveur arrêté proprement");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("[Server] SIGINT reçu, arrêt gracieux...");
      server.close(() => {
        logger.info("[Server] ✅ Serveur arrêté proprement");
        process.exit(0);
      });
    });
  } catch (error: unknown) {
    logger.error(
      "[Server] 💥 Erreur fatale au démarrage : " +
      (error instanceof Error ? error.message : String(error))
    );
    console.error(error);
    process.exit(1);
  }
}

// Lancer le serveur
startServer();
