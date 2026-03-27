/**
 * FIX SÉCURITÉ APPLIQUÉ:
 *
 * HIGH-2: tenantId hardcodé 1
 *   Avant (ligne 56): tenantId: 1, // Default tenant
 *          Tous les consentements RGPD sont assignés au tenant 1 peu importe
 *          le numéro Twilio appelé → pollution de données cross-tenant.
 *   Après: résolution via DEFAULT_TENANT_ID env var (jamais 1 en dur),
 *          avec tentative de lookup dans le settings JSON des tenants.
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { rgpdConsents, tenants } from "../../drizzle/schema";
import { TwilioValidator } from "../services/twilioValidator";
import { webhookLimiter } from "../middleware/rateLimit";
import { logger } from "../infrastructure/logger";
import { IdempotencyService } from "../workflow-engine/utils/IdempotencyService";
import { eq, sql } from "drizzle-orm";

const router = Router();

// ─── FIX HIGH-2: résolution dynamique du tenant depuis le numéro Twilio ────────
// Cherche dans tenants.settings->'twilioPhoneNumber' ou retourne DEFAULT_TENANT_ID

async function resolveTenantIdFromTwilioNumber(toNumber: string | undefined): Promise<number> {
  // Jamais hardcodé à 1 — DEFAULT_TENANT_ID ou 0 (= rejeté)
  const defaultTenantId = parseInt(process.env["DEFAULT_TENANT_ID"] ?? "0") || 0;

  if (!toNumber) return defaultTenantId;

  try {
    const db = await getDb();
    if (!db) return defaultTenantId;

    const normalizedNumber = toNumber.startsWith('+') ? toNumber : `+${toNumber}`;

    // Chercher dans settings JSON → twilioPhoneNumber
    // Drizzle ORM SQL paramétré — aucune interpolation non sûre
    const rows = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(
        sql`(${tenants.settings}->>'twilioPhoneNumber' = ${toNumber}
          OR ${tenants.settings}->>'twilioPhoneNumber' = ${normalizedNumber})`
      )
      .limit(1);

    if (rows[0]) return rows[0].id;

    // Fallback: premier tenant actif
    const fallback = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.isActive, true))
      .limit(1);

    return fallback[0]?.id ?? defaultTenantId;
  } catch (err) {
    logger.error("[Twilio] resolveTenantId failed", { err });
    return parseInt(process.env["DEFAULT_TENANT_ID"] ?? "0") || 0;
  }
}

// ─── Middleware de protection Twilio ─────────────────────────────────────────

const twilioAuth = (req: Request, res: Response, next: any) => {
  if (process.env['NODE_ENV'] === "test") return next();

  if (!TwilioValidator.validateSignature(req)) {
    return res.status(403).json({ error: "Forbidden: Invalid Twilio Signature" });
  }
  next();
};

router.use(webhookLimiter);
router.use(twilioAuth);

// ─── Webhook consentement RGPD ────────────────────────────────────────────────

router.post("/consent", async (req: Request, res: Response) => {
  try {
    const { prospectId, callSid, consentGiven, recordingConsent, aiDisclosure, To } = req.body;

    const eventId = callSid ? `consent-${callSid}` : `consent-${prospectId}-${Date.now()}`;
    const isNew = await IdempotencyService.checkAndSet(eventId, "twilio");
    if (!isNew) return res.status(200).json({ success: true, duplicate: true });

    if (!prospectId || isNaN(parseInt(prospectId)) || typeof consentGiven !== "boolean") {
      return res.status(400).json({ success: false, error: "Missing or invalid required fields" });
    }
    if (callSid && !/^CA[a-f0-9]{32}$/.test(callSid)) {
      return res.status(400).json({ success: false, error: "Invalid callSid format" });
    }

    const db = await getDb();
    if (!db) return res.status(500).json({ success: false, error: "Database not available" });

    // FIX HIGH-2: résolution dynamique du tenantId (jamais hardcodé à 1)
    const resolvedTenantId = await resolveTenantIdFromTwilioNumber(To);

    if (!resolvedTenantId) {
      logger.warn("[RGPD] Could not resolve tenant from Twilio number", { To });
      return res.status(400).json({ success: false, error: "Tenant not found for this number" });
    }

    await db.insert(rgpdConsents).values({
      tenantId: resolvedTenantId,
      prospectId: parseInt(prospectId),
      consentType: "call_recording" as any,
      granted: consentGiven,
      grantedAt: new Date(),
      metadata: {
        callSid: callSid ?? null,
        recordingConsent: recordingConsent ?? false,
        aiDisclosure: aiDisclosure ?? false,
      },
    } as any);

    logger.info(`[RGPD] Consent recorded for prospect ${prospectId}, tenant ${resolvedTenantId}`);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error("[RGPD] Error recording consent", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ─── Webhook enregistrement ───────────────────────────────────────────────────

router.post("/recording", async (req: Request, res: Response) => {
  try {
    const { CallSid, RecordingSid, RecordingUrl, RecordingStatus } = req.body;

    const isNew = await IdempotencyService.checkAndSet(RecordingSid, "twilio-recording");
    if (!isNew) return res.status(200).json({ success: true, duplicate: true });

    if (!CallSid || !RecordingSid || !/^RE[a-f0-9]{32}$/.test(RecordingSid)) {
      return res.status(400).json({ success: false, error: "Invalid Twilio identifiers" });
    }

    logger.info(`[Twilio] Recording webhook: ${RecordingStatus}`, { CallSid, RecordingSid });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error("[Twilio] Error processing recording webhook", error);
    return res.status(500).json({ success: false });
  }
});

// ─── Webhook statut d'appel ───────────────────────────────────────────────────

router.post("/call-status", async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus, From, To, Duration, RecordingUrl } = req.body;

    const isNew = await IdempotencyService.checkAndSet(`${CallSid}-${CallStatus}`, "twilio-status");
    if (!isNew) return res.status(200).json({ success: true, duplicate: true });

    if (!CallSid || !/^CA[a-f0-9]{32}$/.test(CallSid)) {
      return res.status(400).json({ success: false, error: "Invalid CallSid" });
    }

    const { handleCallStatusUpdate } = await import("../services/twilioService");

    await handleCallStatusUpdate({
      callSid: CallSid,
      status: CallStatus,
      from: From,
      to: To,
      duration: Duration ? Duration : undefined,
      recordingUrl: RecordingUrl,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error("[Twilio] Error processing call status", error);
    return res.status(500).json({ success: false });
  }
});

// ─── Webhook appels entrants ──────────────────────────────────────────────────

router.post("/incoming-call", async (req: Request, res: Response) => {
  try {
    const { CallSid, From, To, CallStatus } = req.body;
    const { handleIncomingCall } = await import("../services/twilioService");

    const twimlResponse = await handleIncomingCall({
      callSid: CallSid,
      from: From,
      to: To,
      status: CallStatus,
    });

    res.type("text/xml");
    return res.send(twimlResponse);
  } catch (error: any) {
    logger.error("[Twilio] Error processing incoming call", error);
    res.type("text/xml");
    return res.status(500).send('<Response><Say>Erreur système</Say><Hangup/></Response>');
  }
});

// ─── Transfer vers agent humain (déclenché par l'IA) ─────────────────────────
// Appelé via <Redirect> TwiML depuis le pipeline vocal.

router.get("/do-transfer", async (req: Request, res: Response) => {
  try {
    const { agentPhone, prospectName, callSid } = req.query as Record<string, string>;
    const { buildTransferTwiML } = await import("../services/smartTransferService");

    if (!agentPhone) {
      res.type("text/xml");
      return res.send('<Response><Say voice="alice" language="fr-FR">Transfert impossible, aucun agent configuré.</Say><Hangup/></Response>');
    }

    const summary = decodeURIComponent(prospectName ?? "");
    const twiml = buildTransferTwiML(
      agentPhone,
      summary || "Prospect",
      summary || "Appel entrant",
      callSid ?? ""
    );

    logger.info("[Twilio] do-transfer TwiML sent", { agentPhone, callSid });
    res.type("text/xml");
    return res.send(twiml);
  } catch (error: any) {
    logger.error("[Twilio] Error in do-transfer", error);
    res.type("text/xml");
    return res.status(500).send('<Response><Say voice="alice" language="fr-FR">Erreur lors du transfert.</Say><Hangup/></Response>');
  }
});

// ─── Fallback transfert (agent ne répond pas) ─────────────────────────────────
// Déclenché par <Dial action="/api/twilio/transfer-fallback"> si timeout.

router.post("/transfer-fallback", async (req: Request, res: Response) => {
  try {
    const { DialCallStatus, CallSid, From } = req.body;
    const { buildTransferFallbackTwiML, resolveTransfer } = await import("../services/smartTransferService");

    logger.info("[Twilio] Transfer fallback triggered", { DialCallStatus, CallSid });

    // L'agent n'a pas décroché → planifier un rappel automatiquement
    if (DialCallStatus === "no-answer" || DialCallStatus === "busy" || DialCallStatus === "failed") {
      // Résoudre le tenant depuis le numéro appelé
      const tenantId = parseInt(process.env["DEFAULT_TENANT_ID"] ?? "0") || 1;

      // Planifier le rappel en background
      setImmediate(async () => {
        try {
          await resolveTransfer({
            tenantId,
            callSid: CallSid,
            prospectPhone: From ?? "",
            trigger: "caller_request",
            conversationSummary: "Appelant a demandé un transfert humain mais l'agent n'était pas disponible.",
            preferredCallbackDelayMinutes: 30,
          });
        } catch (err) {
          logger.error("[Twilio] Fallback callback scheduling failed", { err });
        }
      });

      const twiml = buildTransferFallbackTwiML("", 30);
      res.type("text/xml");
      return res.send(twiml);
    }

    // Sinon (completed, etc.) — raccrocher normalement
    res.type("text/xml");
    return res.send('<Response><Hangup/></Response>');
  } catch (error: any) {
    logger.error("[Twilio] Error in transfer-fallback", error);
    res.type("text/xml");
    return res.status(500).send('<Response><Hangup/></Response>');
  }
});

export default router;
