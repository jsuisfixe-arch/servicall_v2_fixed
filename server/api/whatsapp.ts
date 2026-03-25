/**
 * WHATSAPP WEBHOOK ROUTER
 * ─────────────────────────────────────────────────────────────
 * Reçoit les messages WhatsApp entrants (Meta Business API ou Twilio)
 * et déclenche le dialogue IA.
 *
 * Endpoints :
 *  GET  /api/whatsapp/webhook      → Vérification Meta (challenge)
 *  POST /api/whatsapp/webhook      → Messages entrants Meta
 *  POST /api/whatsapp/twilio       → Messages entrants Twilio
 *  GET  /api/whatsapp/status       → Statut de la configuration
 */

import { Router, Request, Response } from "express";
import { logger } from "../infrastructure/logger";
import {
  handleIncomingWhatsAppMessage,
  parseMetaWebhookMessage,
  parseTwilioWebhookMessage,
} from "../services/whatsappAIService";
import { IdempotencyService } from "../workflow-engine/utils/IdempotencyService";

const router = Router();

// ─────────────────────────────────────────────
// Helper: Résoudre la config tenant depuis un numéro WhatsApp
// ─────────────────────────────────────────────

// ✅ FIX: Type extrait pour éviter la confusion du parser avec les génériques multilignes
type TenantWhatsAppConfig = {
  tenantId: number;
  tenantName: string;
  config: {
    wabaPhoneNumberId?: string;
    wabaAccessToken?: string;
    twilioSid?: string;
    twilioToken?: string;
    twilioPhone?: string;
  };
} | null;

async function resolveTenantFromWhatsApp(toNumber: string): Promise<TenantWhatsAppConfig> {
  try {
    const dbModule = await import("../db");
    const db = await dbModule.db;
    if (!db) return null;

    // Chercher le tenant par numéro WhatsApp
    // On cherche dans tenants.phoneNumber ou tenants.whatsapp_number
    const result = await db.execute(`
      SELECT id, name,
        waba_phone_number_id,
        waba_access_token,
        twilio_account_sid,
        twilio_auth_token,
        twilio_phone_number
      FROM tenants
      WHERE phone_number = '${toNumber.replace(/'/g, "''")}' 
         OR phone_number = '+${toNumber.replace(/^\+/, "").replace(/'/g, "''")}'
         OR twilio_phone_number = '${toNumber.replace(/'/g, "''")}'
      LIMIT 1
    `);

    const row = ((result as any).rows ?? result ?? [])[0];
    if (!row) {
      // Si VPS single-tenant : prendre le premier tenant actif
      const fallback = await db.execute(
        `SELECT id, name FROM tenants WHERE status = 'active' LIMIT 1`
      );
      const fb = ((fallback as any).rows ?? fallback ?? [])[0];
      if (!fb) return null;

      return {
        tenantId: fb.id,
        tenantName: fb.name,
        config: {
          twilioSid: process.env["TWILIO_ACCOUNT_SID"],
          twilioToken: process.env["TWILIO_AUTH_TOKEN"],
          twilioPhone: process.env["TWILIO_PHONE_NUMBER"],
          wabaPhoneNumberId: process.env["WABA_PHONE_NUMBER_ID"],
          wabaAccessToken: process.env["WABA_ACCESS_TOKEN"],
        },
      };
    }

    return {
      tenantId: row.id,
      tenantName: row.name,
      config: {
        wabaPhoneNumberId: row.waba_phone_number_id ?? process.env["WABA_PHONE_NUMBER_ID"],
        wabaAccessToken: row.waba_access_token ?? process.env["WABA_ACCESS_TOKEN"],
        twilioSid: row.twilio_account_sid ?? process.env["TWILIO_ACCOUNT_SID"],
        twilioToken: row.twilio_auth_token ?? process.env["TWILIO_AUTH_TOKEN"],
        twilioPhone: row.twilio_phone_number ?? process.env["TWILIO_PHONE_NUMBER"],
      },
    };
  } catch (err) {
    logger.error("[WhatsApp] Failed to resolve tenant", { err });
    // Fallback VPS single-tenant
    return {
      tenantId: parseInt(process.env["DEFAULT_TENANT_ID"] ?? "1"),
      tenantName: process.env["APP_NAME"] ?? "Servicall",
      config: {
        twilioSid: process.env["TWILIO_ACCOUNT_SID"],
        twilioToken: process.env["TWILIO_AUTH_TOKEN"],
        twilioPhone: process.env["TWILIO_PHONE_NUMBER"],
        wabaPhoneNumberId: process.env["WABA_PHONE_NUMBER_ID"],
        wabaAccessToken: process.env["WABA_ACCESS_TOKEN"],
      },
    };
  }
}

// ─────────────────────────────────────────────
// GET /api/whatsapp/webhook — Vérification Meta
// ─────────────────────────────────────────────

router.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env["WABA_WEBHOOK_VERIFY_TOKEN"] ?? "servicall_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    logger.info("[WhatsApp] Meta webhook verification successful");
    res.status(200).send(challenge);
  } else {
    logger.warn("[WhatsApp] Meta webhook verification failed", { mode, token });
    res.sendStatus(403);
  }
});

// ─────────────────────────────────────────────
// POST /api/whatsapp/webhook — Messages Meta
// ─────────────────────────────────────────────

router.post("/webhook", async (req: Request, res: Response) => {
  // ACK immédiat à Meta (ils attendent < 5s)
  res.sendStatus(200);

  try {
    const body = req.body;

    // Vérifier que c'est bien un message WhatsApp
    if (body.object !== "whatsapp_business_account") return;

    const message = parseMetaWebhookMessage(body);
    if (!message) return; // Pas un message texte (statut, réaction, etc.)

    // Idempotence — éviter les doublons Meta
    const isNew = await IdempotencyService.checkAndSet(message.messageId, "whatsapp-meta");
    if (!isNew) {
      logger.info("[WhatsApp] Duplicate message ignored", { messageId: message.messageId });
      return;
    }

    // Résoudre le tenant
    const tenant = await resolveTenantFromWhatsApp(message.to);
    if (!tenant) {
      logger.warn("[WhatsApp] Could not resolve tenant for number", { to: message.to });
      return;
    }

    logger.info("[WhatsApp] Processing Meta message", {
      from: message.from,
      tenantId: tenant.tenantId,
      preview: message.body.slice(0, 50),
    });

    // Déclencher le dialogue IA
    const result = await handleIncomingWhatsAppMessage(
      message,
      tenant.tenantId,
      tenant.tenantName,
      tenant.config
    );

    logger.info("[WhatsApp] Meta dialogue completed", {
      replied: result.replied,
      language: result.language,
      memoryUsed: result.memoryUsed,
    });
  } catch (err) {
    logger.error("[WhatsApp] Meta webhook processing error", { err });
  }
});

// ─────────────────────────────────────────────
// POST /api/whatsapp/twilio — Messages Twilio
// ─────────────────────────────────────────────

router.post("/twilio", async (req: Request, res: Response) => {
  try {
    const message = parseTwilioWebhookMessage(req.body);
    if (!message) {
      res.status(200).send("<Response/>");
      return;
    }

    // ACK Twilio
    res.status(200).type("text/xml").send("<Response/>");

    // Idempotence
    const isNew = await IdempotencyService.checkAndSet(message.messageId, "whatsapp-twilio");
    if (!isNew) return;

    // Résoudre le tenant
    const tenant = await resolveTenantFromWhatsApp(message.to);
    if (!tenant) {
      logger.warn("[WhatsApp] Could not resolve tenant", { to: message.to });
      return;
    }

    logger.info("[WhatsApp] Processing Twilio message", {
      from: message.from,
      tenantId: tenant.tenantId,
    });

    await handleIncomingWhatsAppMessage(
      message,
      tenant.tenantId,
      tenant.tenantName,
      tenant.config
    );
  } catch (err) {
    logger.error("[WhatsApp] Twilio webhook error", { err });
    if (!res.headersSent) res.status(200).send("<Response/>");
  }
});

// ─────────────────────────────────────────────
// GET /api/whatsapp/status — Statut configuration
// ─────────────────────────────────────────────

router.get("/status", (req: Request, res: Response) => {
  const metaConfigured = !!(
    process.env["WABA_PHONE_NUMBER_ID"] &&
    process.env["WABA_ACCESS_TOKEN"]
  );
  const twilioConfigured = !!(
    process.env["TWILIO_ACCOUNT_SID"] &&
    process.env["TWILIO_AUTH_TOKEN"] &&
    process.env["TWILIO_PHONE_NUMBER"]
  );

  res.json({
    meta: {
      configured: metaConfigured,
      phoneNumberId: process.env["WABA_PHONE_NUMBER_ID"]
        ? `...${process.env["WABA_PHONE_NUMBER_ID"].slice(-4)}`
        : null,
      webhookUrl: `${process.env["APP_URL"] ?? "https://your-domain.com"}/api/whatsapp/webhook`,
      verifyToken: process.env["WABA_WEBHOOK_VERIFY_TOKEN"] ? "configured" : "not set",
    },
    twilio: {
      configured: twilioConfigured,
      webhookUrl: `${process.env["APP_URL"] ?? "https://your-domain.com"}/api/whatsapp/twilio`,
    },
    activeProvider: metaConfigured ? "meta" : twilioConfigured ? "twilio" : "none",
    recommendation: metaConfigured
      ? "Meta WhatsApp Business API active (recommended)"
      : "Configure WABA_PHONE_NUMBER_ID + WABA_ACCESS_TOKEN for cheaper Meta API",
  });
});

export default router;
