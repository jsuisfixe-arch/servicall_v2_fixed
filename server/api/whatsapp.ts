/**
 * WHATSAPP WEBHOOK ROUTER
 * ─────────────────────────────────────────────────────────────
 * Reçoit les messages WhatsApp entrants (Meta Business API ou Twilio)
 * et déclenche le dialogue IA.
 *
 * FIX CRIT-3: Suppression de l'injection SQL par interpolation de chaîne
 *   Avant: WHERE phone_number = '${toNumber.replace(/'/g, "''")}'
 *          Interpolation directe dans SQL brut → injection possible.
 *   Après: Requête Drizzle ORM paramétrée sur le champ settings JSON.
 *          Aucune interpolation de données utilisateur dans le SQL.
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
import { eq, sql } from "drizzle-orm";

const router = Router();

// ─────────────────────────────────────────────
// Type de config tenant WhatsApp
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// FIX CRIT-3: Résolution du tenant — paramétré, sans interpolation SQL
// ─────────────────────────────────────────────

async function resolveTenantFromWhatsApp(toNumber: string): Promise<TenantWhatsAppConfig> {
  // Validation du format de numéro avant toute requête (sécurité défense en profondeur)
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  if (!phoneRegex.test(toNumber.replace(/[\s\-().]/g, ''))) {
    logger.warn("[WhatsApp] Invalid phone number format rejected");
    return null;
  }

  try {
    const dbModule = await import("../db");
    const db = dbModule.db;
    if (!db) return null;

    const { tenants } = await import("../../drizzle/schema");
    const normalizedNumber = toNumber.startsWith('+') ? toNumber : `+${toNumber}`;
    const rawNumber = normalizedNumber.replace(/^\+/, '');

    // FIX CRIT-3: Drizzle ORM avec SQL paramétré sur le settings JSON
    // Aucune interpolation — toutes les valeurs sont passées comme paramètres liés
    const rows = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        settings: tenants.settings,
      })
      .from(tenants)
      .where(
        sql`(
          ${tenants.settings}->>'twilioPhone' = ${toNumber}
          OR ${tenants.settings}->>'twilioPhone' = ${normalizedNumber}
          OR ${tenants.settings}->>'twilioPhone' = ${rawNumber}
          OR ${tenants.settings}->>'wabaPhoneNumber' = ${toNumber}
          OR ${tenants.settings}->>'wabaPhoneNumber' = ${normalizedNumber}
        )`
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      // Fallback VPS single-tenant: premier tenant actif
      const fallbackRows = await db
        .select({ id: tenants.id, name: tenants.name, settings: tenants.settings })
        .from(tenants)
        .where(eq(tenants.isActive, true))
        .limit(1);

      const fb = fallbackRows[0];
      if (!fb) return null;

      const fbSettings = (fb.settings ?? {}) as Record<string, string>;
      return {
        tenantId: fb.id,
        tenantName: fb.name,
        config: {
          twilioSid: fbSettings['twilioAccountSid'] ?? process.env["TWILIO_ACCOUNT_SID"],
          twilioToken: fbSettings['twilioAuthToken'] ?? process.env["TWILIO_AUTH_TOKEN"],
          twilioPhone: fbSettings['twilioPhone'] ?? process.env["TWILIO_PHONE_NUMBER"],
          wabaPhoneNumberId: fbSettings['wabaPhoneNumberId'] ?? process.env["WABA_PHONE_NUMBER_ID"],
          wabaAccessToken: fbSettings['wabaAccessToken'] ?? process.env["WABA_ACCESS_TOKEN"],
        },
      };
    }

    const rowSettings = (row.settings ?? {}) as Record<string, string>;
    return {
      tenantId: row.id,
      tenantName: row.name,
      config: {
        wabaPhoneNumberId: rowSettings['wabaPhoneNumberId'] ?? process.env["WABA_PHONE_NUMBER_ID"],
        wabaAccessToken: rowSettings['wabaAccessToken'] ?? process.env["WABA_ACCESS_TOKEN"],
        twilioSid: rowSettings['twilioAccountSid'] ?? process.env["TWILIO_ACCOUNT_SID"],
        twilioToken: rowSettings['twilioAuthToken'] ?? process.env["TWILIO_AUTH_TOKEN"],
        twilioPhone: rowSettings['twilioPhone'] ?? process.env["TWILIO_PHONE_NUMBER"],
      },
    };
  } catch (err) {
    logger.error("[WhatsApp] Failed to resolve tenant", { err });
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

  const verifyToken =
    process.env["META_WEBHOOK_VERIFY_TOKEN"] ??
    process.env["WABA_WEBHOOK_VERIFY_TOKEN"] ??
    "servicall_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    logger.info("[WhatsApp] Meta webhook verification OK");
    return res.status(200).send(challenge);
  } else {
    logger.warn("[WhatsApp] Meta webhook verification failed", { mode });
    return res.sendStatus(403);
  }
});

// ─────────────────────────────────────────────
// POST /api/whatsapp/webhook — Messages Meta entrants
// ─────────────────────────────────────────────

router.post("/webhook", async (req: Request, res: Response) => {
  // ACK immédiat requis par Meta (< 5s)
  res.sendStatus(200);

  try {
    const body = req.body as Record<string, unknown>;
    const message = parseMetaWebhookMessage(body);

    if (!message || !message.text) return;

    const isNew = await IdempotencyService.checkAndSet(message.messageId, "whatsapp-meta");
    if (!isNew) return;

    const tenantConfig = await resolveTenantFromWhatsApp(message.to ?? "");
    if (!tenantConfig) {
      logger.warn("[WhatsApp] Could not resolve tenant for Meta message");
      return;
    }

    logger.info("[WhatsApp] Processing Meta message", { from: message.from, tenantId: tenantConfig.tenantId });
    await handleIncomingWhatsAppMessage(message, tenantConfig.tenantId, tenantConfig.tenantName, tenantConfig.config);
  } catch (err) {
    logger.error("[WhatsApp] Error processing Meta webhook", { err });
  }
});

// ─────────────────────────────────────────────
// POST /api/whatsapp/twilio — Messages Twilio entrants
// ─────────────────────────────────────────────

router.post("/twilio", async (req: Request, res: Response) => {
  res.sendStatus(200);

  try {
    const body = req.body as Record<string, unknown>;
    const message = parseTwilioWebhookMessage(body);

    if (!message || !message.text) return;

    const isNew = await IdempotencyService.checkAndSet(message.messageId, "whatsapp-twilio");
    if (!isNew) return;

    const tenantConfig = await resolveTenantFromWhatsApp(message.to ?? "");
    if (!tenantConfig) {
      logger.warn("[WhatsApp] Could not resolve tenant for Twilio message");
      return;
    }

    logger.info("[WhatsApp] Processing Twilio message", { from: message.from, tenantId: tenantConfig.tenantId });
    await handleIncomingWhatsAppMessage(message, tenantConfig.tenantId, tenantConfig.tenantName, tenantConfig.config);
  } catch (err) {
    logger.error("[WhatsApp] Error processing Twilio webhook", { err });
  }
});

// ─────────────────────────────────────────────
// GET /api/whatsapp/status — Statut config
// ─────────────────────────────────────────────

router.get("/status", (_req: Request, res: Response) => {
  const hasWaba = !!(process.env["WABA_PHONE_NUMBER_ID"] && process.env["WABA_ACCESS_TOKEN"]);
  const hasTwilio = !!(process.env["TWILIO_ACCOUNT_SID"] && process.env["TWILIO_AUTH_TOKEN"] && process.env["TWILIO_PHONE_NUMBER"]);

  return res.json({
    status: "ok",
    providers: {
      meta: hasWaba ? "configured" : "not_configured",
      twilio: hasTwilio ? "configured" : "not_configured",
    },
  });
});

export default router;
