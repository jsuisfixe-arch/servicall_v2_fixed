/**
 * CALLBACK WORKER — Exécuteur de rappels planifiés
 * ─────────────────────────────────────────────────────────────────────────────
 * Tourne toutes les 2 minutes. Cherche les rappels en attente dont
 * scheduledAt <= now, et déclenche les actions configurées.
 *
 * Mode de fonctionnement :
 *  - notifyMode = "crm"   → broadcast WebSocket vers dashboard agent
 *  - notifyMode = "phone" → appel Twilio vers numéro de l'agent
 *  - notifyMode = "both"  → les deux simultanément
 */

import { logger } from "../infrastructure/logger";
import { getDb } from "../db";
import { scheduledCallbacks } from "../../drizzle/schema-calls";
import { users } from "../../drizzle/schema";
import { eq, and, lte, inArray } from "drizzle-orm";
import { ENV } from "../_core/env";
import twilio from "twilio";
import { broadcastToTenant, broadcastToAgent } from "../infrastructure/websocketBroadcast";

const WORKER_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
let workerTimer: NodeJS.Timeout | null = null;

export function startCallbackWorker(): void {
  if (workerTimer) return; // déjà démarré

  logger.info("[CallbackWorker] Starting — interval 2 min");
  workerTimer = setInterval(runCallbackCheck, WORKER_INTERVAL_MS);

  // Première exécution immédiate au démarrage
  runCallbackCheck().catch((err) =>
    logger.error("[CallbackWorker] Initial run failed", { err })
  );
}

export function stopCallbackWorker(): void {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
    logger.info("[CallbackWorker] Stopped");
  }
}

async function runCallbackCheck(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const now = new Date();

    // Récupérer tous les rappels en attente ou notifiés dont l'heure est arrivée
    const pendingCallbacks = await db
      .select()
      .from(scheduledCallbacks)
      .where(
        and(
          inArray(scheduledCallbacks.status, ["pending", "notified"]),
          lte(scheduledCallbacks.scheduledAt, now)
        )
      )
      .limit(20); // traiter par batch de 20

    if (pendingCallbacks.length === 0) return;

    logger.info(`[CallbackWorker] Processing ${pendingCallbacks.length} pending callbacks`);

    for (const callback of pendingCallbacks) {
      try {
        await processCallback(callback, db);
      } catch (err) {
        logger.error("[CallbackWorker] Failed to process callback", {
          err,
          callbackId: callback.id,
        });
        // Marquer en échec sans bloquer les suivants
        await db
          .update(scheduledCallbacks)
          .set({ status: "failed", updatedAt: new Date() } as any)
          .where(eq(scheduledCallbacks.id, callback.id))
          .catch(() => {});
      }
    }
  } catch (err) {
    logger.error("[CallbackWorker] Check cycle failed", { err });
  }
}

async function processCallback(
  callback: typeof scheduledCallbacks.$inferSelect,
  db: Awaited<ReturnType<typeof getDb>>
): Promise<void> {
  if (!db) return;

  logger.info("[CallbackWorker] Processing callback", {
    id: callback.id,
    notifyMode: callback.notifyMode,
    prospectPhone: callback.prospectPhone.slice(-4),
  });

  // Récupérer la config de l'agent assigné
  let agentPhone: string | null = null;
  let agentName: string | null = null;

  if (callback.assignedUserId) {
    const [agent] = await db
      .select({
        callbackPhone: (users as any).callbackPhone,
        name: users.name,
        callbackNotifyMode: (users as any).callbackNotifyMode,
      })
      .from(users)
      .where(eq(users.id, callback.assignedUserId))
      .limit(1);

    if (agent) {
      agentPhone = agent.callbackPhone ?? null;
      agentName = agent.name ?? null;
      // Utiliser le mode de l'agent si non spécifié sur le callback
    }
  }

  const notifyMode = callback.notifyMode ?? "crm";

  // ── Mode CRM ou BOTH : notification WebSocket ──────────────────────────────
  if (notifyMode === "crm" || notifyMode === "both") {
    const payload = {
      type: "CALLBACK_SCHEDULED" as const,
      data: {
        callbackId: callback.id,
        tenantId: callback.tenantId,
        prospectPhone: callback.prospectPhone,
        prospectName: callback.prospectName ?? "Prospect",
        scheduledAt: callback.scheduledAt?.toISOString(),
        triggerReason: callback.triggerReason,
        conversationSummary: callback.conversationSummary ?? "",
        agentId: callback.assignedUserId,
        agentName,
        dueNow: true,
      },
    };

    if (callback.assignedUserId) {
      await broadcastToAgent(callback.tenantId, callback.assignedUserId, payload);
    } else {
      await broadcastToTenant(callback.tenantId, payload);
    }
    logger.info("[CallbackWorker] CRM notification sent", { callbackId: callback.id });
  }

  // ── Mode PHONE ou BOTH : appel Twilio vers l'agent ─────────────────────────
  let callbackCallSid: string | null = null;
  if ((notifyMode === "phone" || notifyMode === "both") && agentPhone) {
    callbackCallSid = await callAgentNow(callback, agentPhone);
  } else if ((notifyMode === "phone" || notifyMode === "both") && !agentPhone) {
    logger.warn("[CallbackWorker] Phone mode but no agent phone configured", {
      callbackId: callback.id,
      assignedUserId: callback.assignedUserId,
    });
  }

  // ── Mettre à jour le statut ────────────────────────────────────────────────
  await db
    .update(scheduledCallbacks)
    .set({
      status: "called",
      callbackCallSid: callbackCallSid ?? callback.callbackCallSid,
      updatedAt: new Date(),
    } as any)
    .where(eq(scheduledCallbacks.id, callback.id));
}

async function callAgentNow(
  callback: typeof scheduledCallbacks.$inferSelect,
  agentPhone: string
): Promise<string | null> {
  const accountSid = ENV.twilioAccountSid;
  const authToken = ENV.twilioAuthToken;
  const fromNumber = ENV.twilioPhoneNumber;

  if (!accountSid?.startsWith("AC") || !authToken || !fromNumber) {
    logger.warn("[CallbackWorker] Twilio not configured — skipping phone call");
    return null;
  }

  try {
    const client = twilio(accountSid, authToken);

    const twiml = new twilio.twiml.VoiceResponse();
    const prospectName = callback.prospectName ?? "un prospect";
    const summary = (callback.conversationSummary ?? "").slice(0, 200);

    twiml.say(
      { voice: "alice", language: "fr-FR" },
      `Bonjour. Rappel Servicall. ` +
      `Vous avez un rappel à effectuer pour ${prospectName}. ` +
      `Contexte : ${summary}. ` +
      `Numéro du prospect : ${callback.prospectPhone.split("").join(" ")}. ` +
      `Bonne journée.`
    );

    const call = await client.calls.create({
      from: fromNumber,
      to: agentPhone,
      twiml: twiml.toString(),
    });

    logger.info("[CallbackWorker] Agent called", {
      callbackId: callback.id,
      callSid: call.sid,
      agentPhone: agentPhone.slice(-4),
    });

    return call.sid;
  } catch (err) {
    logger.error("[CallbackWorker] Failed to call agent", { err, callbackId: callback.id });
    return null;
  }
}
