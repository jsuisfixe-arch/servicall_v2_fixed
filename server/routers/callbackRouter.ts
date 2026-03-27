/**
 * CALLBACK ROUTER — API de gestion des rappels planifiés
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoints :
 *  GET  /api/callbacks                  — Liste des rappels du tenant
 *  GET  /api/callbacks/:id              — Détail d'un rappel
 *  POST /api/callbacks                  — Planifier manuellement un rappel
 *  PUT  /api/callbacks/:id/complete     — Marquer un rappel comme effectué
 *  PUT  /api/callbacks/:id/cancel       — Annuler un rappel
 *  POST /api/callbacks/:id/execute      — Déclencher le rappel immédiatement
 *  GET  /api/callbacks/config           — Config rappel de l'utilisateur connecté
 *  PUT  /api/callbacks/config           — Mettre à jour la config (numéro + mode)
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { scheduledCallbacks } from "../../drizzle/schema-calls";
import { users } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../infrastructure/logger";
import { sdk } from "../_core/sdk";
import { apiLimiter } from "../middleware/rateLimit";
import { cancelCallback, resolveTransfer } from "../services/smartTransferService";
import twilio from "twilio";
import { ENV } from "../_core/env";

const router = Router();
router.use(apiLimiter);

// ── Auth middleware ────────────────────────────────────────────────────────────
const requireAuth = async (req: Request, res: Response, next: (err?: any) => void): Promise<void> => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

router.use(requireAuth);

// ── GET /api/callbacks — Liste des rappels ─────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    const statusFilter = req.query.status as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string ?? "50"), 200);

    let query = db
      .select()
      .from(scheduledCallbacks)
      .where(eq(scheduledCallbacks.tenantId, tenantId))
      .orderBy(desc(scheduledCallbacks.scheduledAt))
      .limit(limit);

    const callbacks = await query;

    // Filtrer par statut si demandé
    const filtered = statusFilter
      ? callbacks.filter((c) => c.status === statusFilter)
      : callbacks;

    return res.json({ success: true, data: filtered, total: filtered.length });
  } catch (err) {
    logger.error("[CallbackRouter] GET / failed", { err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/callbacks/config — Config rappel utilisateur ─────────────────────
router.get("/config", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    const [user] = await db
      .select({
        callbackPhone: (users as any).callbackPhone,
        callbackNotifyMode: (users as any).callbackNotifyMode,
        isAvailableForTransfer: (users as any).isAvailableForTransfer,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return res.json({
      success: true,
      data: {
        callbackPhone: user?.callbackPhone ?? null,
        callbackNotifyMode: user?.callbackNotifyMode ?? "crm",
        isAvailableForTransfer: user?.isAvailableForTransfer ?? true,
      },
    });
  } catch (err) {
    logger.error("[CallbackRouter] GET /config failed", { err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/callbacks/config — Mettre à jour la config rappel ────────────────
router.put("/config", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    const { callbackPhone, callbackNotifyMode, isAvailableForTransfer } = req.body;

    // Validation du numéro de téléphone
    if (callbackPhone && !/^\+?[\d\s\-().]{7,20}$/.test(callbackPhone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    const validModes = ["crm", "phone", "both"];
    if (callbackNotifyMode && !validModes.includes(callbackNotifyMode)) {
      return res.status(400).json({ error: "Invalid notify mode. Must be: crm, phone, or both" });
    }

    await db
      .update(users)
      .set({
        ...(callbackPhone !== undefined && { callbackPhone }),
        ...(callbackNotifyMode !== undefined && { callbackNotifyMode }),
        ...(isAvailableForTransfer !== undefined && { isAvailableForTransfer }),
        updatedAt: new Date(),
      } as any)
      .where(eq(users.id, userId));

    logger.info("[CallbackRouter] Config updated", {
      userId,
      callbackPhone: callbackPhone ? "***" + callbackPhone.slice(-4) : null,
      callbackNotifyMode,
      isAvailableForTransfer,
    });

    return res.json({ success: true, message: "Configuration mise à jour" });
  } catch (err) {
    logger.error("[CallbackRouter] PUT /config failed", { err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/callbacks/:id — Détail d'un rappel ───────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const callbackId = parseInt(req.params.id);
    if (isNaN(callbackId)) return res.status(400).json({ error: "Invalid ID" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    const [callback] = await db
      .select()
      .from(scheduledCallbacks)
      .where(and(
        eq(scheduledCallbacks.id, callbackId),
        eq(scheduledCallbacks.tenantId, tenantId)
      ))
      .limit(1);

    if (!callback) return res.status(404).json({ error: "Callback not found" });

    return res.json({ success: true, data: callback });
  } catch (err) {
    logger.error("[CallbackRouter] GET /:id failed", { err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/callbacks — Planifier manuellement un rappel ────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    const {
      prospectPhone, prospectName, prospectId,
      scheduledAt, note,
      delayMinutes,
    } = req.body;

    if (!prospectPhone) {
      return res.status(400).json({ error: "prospectPhone is required" });
    }

    // Si scheduledAt non fourni, utiliser delayMinutes (défaut 60 min)
    const scheduledDate = scheduledAt
      ? new Date(scheduledAt)
      : new Date(Date.now() + (delayMinutes ?? 60) * 60 * 1000);

    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: "Invalid scheduledAt date" });
    }

    // Récupérer la config de l'agent qui planifie
    const [agentConfig] = await db
      .select({
        callbackNotifyMode: (users as any).callbackNotifyMode,
        callbackPhone: (users as any).callbackPhone,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const notifyMode = agentConfig?.callbackNotifyMode ?? "crm";

    const [inserted] = await db
      .insert(scheduledCallbacks)
      .values({
        tenantId,
        prospectPhone,
        prospectName: prospectName ?? null,
        prospectId: prospectId ?? null,
        triggerReason: "manual",
        scheduledAt: scheduledDate,
        notifyMode,
        assignedUserId: userId,
        status: "pending",
        conversationSummary: note ?? "Rappel planifié manuellement",
        metadata: { createdBy: userId, source: "manual" },
      } as any)
      .returning({ id: scheduledCallbacks.id });

    logger.info("[CallbackRouter] Manual callback created", {
      callbackId: inserted.id,
      tenantId,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: { id: inserted.id, scheduledAt: scheduledDate, notifyMode },
      message: "Rappel planifié avec succès",
    });
  } catch (err) {
    logger.error("[CallbackRouter] POST / failed", { err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/callbacks/:id/complete — Marquer comme effectué ──────────────────
router.put("/:id/complete", async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const callbackId = parseInt(req.params.id);
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    await db
      .update(scheduledCallbacks)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
        metadata: { completedBy: req.user!.id, completedAt: new Date().toISOString() },
      } as any)
      .where(and(
        eq(scheduledCallbacks.id, callbackId),
        eq(scheduledCallbacks.tenantId, tenantId)
      ));

    return res.json({ success: true, message: "Rappel marqué comme effectué" });
  } catch (err) {
    logger.error("[CallbackRouter] PUT /:id/complete failed", { err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/callbacks/:id/cancel — Annuler un rappel ─────────────────────────
router.put("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const callbackId = parseInt(req.params.id);
    const { reason } = req.body;

    // Vérifier appartenance tenant
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    const [existing] = await db
      .select({ tenantId: scheduledCallbacks.tenantId })
      .from(scheduledCallbacks)
      .where(eq(scheduledCallbacks.id, callbackId))
      .limit(1);

    if (!existing || existing.tenantId !== tenantId) {
      return res.status(404).json({ error: "Callback not found" });
    }

    await cancelCallback(callbackId, reason ?? `Cancelled by user ${req.user!.id}`);
    return res.json({ success: true, message: "Rappel annulé" });
  } catch (err) {
    logger.error("[CallbackRouter] PUT /:id/cancel failed", { err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/callbacks/:id/execute — Déclencher le rappel immédiatement ──────
router.post("/:id/execute", async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const callbackId = parseInt(req.params.id);
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    const [callback] = await db
      .select()
      .from(scheduledCallbacks)
      .where(and(
        eq(scheduledCallbacks.id, callbackId),
        eq(scheduledCallbacks.tenantId, tenantId)
      ))
      .limit(1);

    if (!callback) return res.status(404).json({ error: "Callback not found" });
    if (callback.status === "completed" || callback.status === "cancelled") {
      return res.status(400).json({ error: `Cannot execute a ${callback.status} callback` });
    }

    const accountSid = ENV.twilioAccountSid;
    const authToken = ENV.twilioAuthToken;
    const fromNumber = ENV.twilioPhoneNumber;

    if (!accountSid?.startsWith("AC") || !authToken || !fromNumber) {
      return res.status(503).json({ error: "Twilio not configured" });
    }

    const client = twilio(accountSid, authToken);
    const webhookBase = (process.env["WEBHOOK_URL"] || "https://api.servicall.local").replace(/\/$/, "");

    // Lancer l'appel vers le prospect
    const call = await client.calls.create({
      from: fromNumber,
      to: callback.prospectPhone,
      url: `${webhookBase}/api/twilio/incoming-call`,
      statusCallback: `${webhookBase}/api/twilio/call-status`,
    });

    // Mettre à jour le statut
    await db
      .update(scheduledCallbacks)
      .set({
        status: "called",
        callbackCallSid: call.sid,
        updatedAt: new Date(),
      } as any)
      .where(eq(scheduledCallbacks.id, callbackId));

    logger.info("[CallbackRouter] Callback executed", {
      callbackId,
      callSid: call.sid,
      to: callback.prospectPhone,
    });

    return res.json({
      success: true,
      data: { callSid: call.sid },
      message: "Appel de rappel déclenché",
    });
  } catch (err: any) {
    logger.error("[CallbackRouter] POST /:id/execute failed", { err });
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

export const callbackRouter = router;
export default router;
