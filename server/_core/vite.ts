/**
 * vite.ts — Serveur statique production + serveur de dev Vite
 *
 * IMPORTANT: Les imports de 'vite' et 'vite.config' sont DYNAMIQUES (lazy)
 * pour éviter que esbuild les bundle dans dist/index.js.
 * En production, seule serveStatic() est appelée — jamais setupVite().
 * Vite est une devDependency absente en production.
 */

import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import { logger } from "../infrastructure/logger";

// ─── Mode développement — Vite HMR ───────────────────────────────────────────

export async function setupVite(app: Express, server: Server) {
  // Import dynamique — Vite absent en prod, présent en dev uniquement
  const { createServer: createViteServer } = await import("vite");
  const { default: viteConfig } = await import("../../vite.config");

  const { nanoid } = await import("nanoid");

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true as const,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(process.cwd(), "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // Ajouter un cache-buster pour forcer le rechargement en dev
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// ─── Mode production — Fichiers statiques ────────────────────────────────────

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  logger.info(`[Static] Serving from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    logger.error(`[Static] ❌ dist/public/ introuvable — lancez 'pnpm build' d'abord`);
  }

  // Assets avec hash → cache 1 an (immutable)
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        // Supprimer l'isolation d'agent sur tous les assets
        res.setHeader("Origin-Agent-Cluster", "?0");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    })
  );

  // SPA fallback — retourner index.html pour toutes les routes non-API
  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api/") ||
      req.path.startsWith("/metrics") ||
      req.path.startsWith("/health") ||
      req.path.startsWith("/healthz")
    ) {
      return next();
    }

    const indexPath = path.resolve(distPath, "index.html");

    if (!fs.existsSync(indexPath)) {
      return res.status(503).send(`
        <html><head><title>Build manquant</title></head>
        <body style="font-family:Arial;padding:50px;text-align:center">
          <h1>⚠️ Application non compilée</h1>
          <p>Exécutez <code>pnpm build</code> puis redémarrez le serveur.</p>
        </body></html>
      `);
    }

    // Pas de cache sur index.html — doit toujours être frais
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Origin-Agent-Cluster", "?0");

    // Injection du nonce CSP dans les balises <script> (prod uniquement)
    const nonce = (res.locals as Record<string, unknown>)["cspNonce"] as string | undefined;
    if (nonce) {
      try {
        let html = fs.readFileSync(indexPath, "utf-8");
        // Injection du nonce dans toutes les balises script
        html = html.replace(/<script/g, `<script nonce="${nonce}"`);
        // Injection du nonce dans les balises link rel="modulepreload"
        html = html.replace(/<link rel="modulepreload"/g, `<link rel="modulepreload" nonce="${nonce}"`);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(html);
      } catch (err) {
        logger.error("[Static] Error injecting nonce", err);
      }
    }

    res.sendFile(indexPath);
  });
}
