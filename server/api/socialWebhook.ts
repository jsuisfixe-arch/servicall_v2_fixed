/**
 * SOCIAL WEBHOOK ROUTER
 * ─────────────────────────────────────────────────────────────
 * Reçoit les webhooks de :
 *   - Facebook Messenger (messages privés)
 *   - Instagram (DM + commentaires)
 *   - TikTok (commentaires)
 *
 * Endpoints :
 *  GET  /api/social-webhook/meta        → Vérification Meta (challenge)
 *  POST /api/social-webhook/meta        → Messenger + Instagram
 *  POST /api/social-webhook/tiktok      → TikTok commentaires
 */

import { Router, Request, Response } from "express";
import { logger } from "../infrastructure/logger";
import { IdempotencyService } from "../workflow-engine/utils/IdempotencyService";
import {
  handleAutoReply,
  parseMetaMessengerWebhook,
  parseInstagramWebhook,
  parseTikTokCommentWebhook,
} from "../services/social/autoReplyService";

const router = Router();

// ─────────────────────────────────────────────
// Helper: Résoudre le tenant depuis la page/account ID
// ─────────────────────────────────────────────

async function resolveTenantFromPageId(pageId: string): Promise<{ tenantId: number; tenantName: string } | null> {
  try {
    const { db: getDb } = await import("../db");
    const db = await (getDb as any)();
    if (!db) return null;

    // Chercher via les socialAccounts — la page ID est dans platformAccountId
    const { socialAccounts } = await import("../../drizzle/schema-social");
    const { tenants } = await import("../../drizzle/schema");
    const { eq, inArray } = await import("drizzle-orm");

    const accounts = await db
      .select({ tenantId: socialAccounts.tenantId })
      .from(socialAccounts)
      .where(eq(socialAccounts.platformAccountId, pageId))
      .limit(1);

    if (!accounts[0]) {
      // Fallback : premier tenant actif (mode VPS single-tenant)
      const fallback = await db.select({ id: tenants.id, name: tenants.name }).from(tenants).where(eq(tenants.isActive, true)).limit(1);
      if (!fallback[0]) return null;
      return { tenantId: fallback[0].id, tenantName: fallback[0].name };
    }

    const tenantRow = await db.select({ id: tenants.id, name: tenants.name }).from(tenants).where(eq(tenants.id, accounts[0].tenantId)).limit(1);
    if (!tenantRow[0]) return null;
    return { tenantId: tenantRow[0].id, tenantName: tenantRow[0].name };
  } catch (err) {
    logger.error("[SocialWebhook] resolveTenant failed", { err });
    return {
      tenantId: parseInt(process.env["DEFAULT_TENANT_ID"] ?? "1"),
      tenantName: process.env["APP_NAME"] ?? "Servicall",
    };
  }
}

// ─────────────────────────────────────────────
// Helper: Vérifier si l'auto-reply est activé pour ce tenant + plateforme
// ─────────────────────────────────────────────

async function isAutoReplyEnabled(tenantId: number, platform: string): Promise<boolean> {
  try {
    const { db: getDb } = await import("../db");
    const db = await (getDb as any)();
    if (!db) return false;

    const { tenants } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const [tenant] = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    const settings = (tenant?.settings ?? {}) as Record<string, unknown>;
    const channelSettings = (settings["channelSettings"] ?? {}) as Record<string, unknown>;
    const autoReply = (channelSettings["autoReply"] ?? {}) as Record<string, boolean>;
    return autoReply[platform] === true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// GET /api/social-webhook/meta — Vérification Meta
// ─────────────────────────────────────────────

router.get("/meta", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = process.env["META_WEBHOOK_VERIFY_TOKEN"] ?? process.env["WABA_WEBHOOK_VERIFY_TOKEN"] ?? "servicall_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    logger.info("[SocialWebhook] Meta verification OK");
    res.status(200).send(challenge);
  } else {
    logger.warn("[SocialWebhook] Meta verification failed", { mode, token });
    res.sendStatus(403);
  }
});

// ─────────────────────────────────────────────
// POST /api/social-webhook/meta — Messenger + Instagram
// ─────────────────────────────────────────────

router.post("/meta", async (req: Request, res: Response) => {
  // ACK immédiat requis par Meta (< 5s)
  res.sendStatus(200);

  try {
    const body = req.body as Record<string, unknown>;
    const objectType = body["object"] as string;

    // ── Messenger ──────────────────────────────────────
    if (objectType === "page") {
      const message = parseMetaMessengerWebhook(body);
      if (!message || !message.text) return;

      const isNew = await IdempotencyService.checkAndSet(message.messageId, "messenger");
      if (!isNew) return;

      const tenant = await resolveTenantFromPageId(message.recipientId);
      if (!tenant) return;

      const enabled = await isAutoReplyEnabled(tenant.tenantId, "messenger");
      if (!enabled) {
        logger.info("[SocialWebhook] Messenger auto-reply disabled for tenant", { tenantId: tenant.tenantId });
        return;
      }

      logger.info("[SocialWebhook] Processing Messenger message", { from: message.senderId, tenantId: tenant.tenantId });
      await handleAutoReply(message, tenant.tenantId, tenant.tenantName);
      return;
    }

    // ── Instagram ──────────────────────────────────────
    if (objectType === "instagram") {
      const message = parseInstagramWebhook(body);
      if (!message || !message.text) return;

      const isNew = await IdempotencyService.checkAndSet(message.messageId, "instagram");
      if (!isNew) return;

      const tenant = await resolveTenantFromPageId(message.recipientId);
      if (!tenant) return;

      const platformKey = message.platform === "instagram_comment" ? "instagram_comment" : "instagram_dm";
      const enabled = await isAutoReplyEnabled(tenant.tenantId, platformKey);
      if (!enabled) {
        logger.info("[SocialWebhook] Instagram auto-reply disabled for tenant", { tenantId: tenant.tenantId, platform: platformKey });
        return;
      }

      logger.info("[SocialWebhook] Processing Instagram message", { platform: message.platform, tenantId: tenant.tenantId });
      await handleAutoReply(message, tenant.tenantId, tenant.tenantName);
      return;
    }

    logger.debug("[SocialWebhook] Unknown Meta object type", { objectType });
  } catch (err) {
    logger.error("[SocialWebhook] Meta webhook error", { err });
  }
});

// ─────────────────────────────────────────────
// POST /api/social-webhook/tiktok — Commentaires TikTok
// ─────────────────────────────────────────────

router.post("/tiktok", async (req: Request, res: Response) => {
  res.sendStatus(200);

  try {
    const body = req.body as Record<string, unknown>;
    const message = parseTikTokCommentWebhook(body);
    if (!message || !message.text) return;

    const isNew = await IdempotencyService.checkAndSet(message.messageId, "tiktok-comment");
    if (!isNew) return;

    const tenant = await resolveTenantFromPageId(message.recipientId);
    if (!tenant) return;

    const enabled = await isAutoReplyEnabled(tenant.tenantId, "tiktok_comment");
    if (!enabled) {
      logger.info("[SocialWebhook] TikTok auto-reply disabled for tenant", { tenantId: tenant.tenantId });
      return;
    }

    logger.info("[SocialWebhook] Processing TikTok comment", { commentId: message.commentId, tenantId: tenant.tenantId });
    await handleAutoReply(message, tenant.tenantId, tenant.tenantName);
  } catch (err) {
    logger.error("[SocialWebhook] TikTok webhook error", { err });
  }
});

export default router;
