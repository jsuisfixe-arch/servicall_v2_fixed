import twilio from "twilio";
import { logger } from "../infrastructure/logger";
import { ENV } from "../_core/env";
import { ResilienceService } from "./resilienceService";

// ⚠️ SÉCURITÉ: Les valeurs de fallback sont uniquement pour le développement
const accountSid = ENV.twilioAccountSid ?? "AC_PLACEHOLDER_DEV_ONLY";
const authToken = ENV.twilioAuthToken ?? "PLACEHOLDER_DEV_ONLY";
const phoneNumber = ENV.twilioPhoneNumber || "+00000000000";

import type { Twilio } from "twilio";
import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

// ─── Return-type interfaces (remplace Promise<any>) ──────────────────────────

export interface QueuedCallResult {
  jobId: string | number;
  status: string;
  sid?: string; // Added for phoneRouter.ts correction
}

export interface CallSidResult {
  sid: string;
  status: string;
}

export interface CallDetailsResult {
  sid: string;
  from: string;
  to: string;
  status: string;
  duration: string | null;
  startTime: Date | null;
    endTime: Date | null;
  price: string | null;
  direction: string;
}

interface TwilioLike {
  calls: {
    create: (params: Record<string, unknown>) => Promise<Pick<CallInstance, "sid" | "status">>;
    (callSid: string): { update: (params: Record<string, unknown>) => Promise<Pick<CallInstance, "sid" | "status">>; fetch: () => Promise<CallInstance> };
  };
  messages: {
    create: (params: Record<string, unknown>) => Promise<Pick<MessageInstance, "sid" | "status">>;
  };
}

let _client: Twilio | TwilioLike | null = null;

/**
 * Lazy initialization of Twilio client
 */
export function getTwilioClient() {
  if (!_client) {
    if (accountSid && accountSid.startsWith("AC") && authToken && authToken !== "PLACEHOLDER_DEV_ONLY") {
      try {
        _client = twilio(accountSid, authToken);
        logger.info("[Twilio] Client initialized");
      } catch (error: any) {
        logger.error("[Twilio] Failed to initialize Twilio client", error);
      }
    } else if (process.env["NODE_ENV"] !== "production") {
      logger.warn("[Twilio] Missing credentials, using mock client (dev mode)");
      _client = {
        calls: Object.assign(
          (callSid: string) => ({
            update: async (params: Record<string, unknown>) => {
              logger.info(`[Twilio MOCK] Updating call ${callSid}`, params);
              return { sid: callSid, status: "in-progress" as const };
            },
            fetch: async () => {
              logger.info(`[Twilio MOCK] Fetching call ${callSid}`);
              return { sid: callSid, status: "completed" as const, from: "mock", to: "mock", duration: "0", startTime: new Date(), endTime: new Date(), price: "0", direction: "outbound" } as CallInstance;
            },
          }),
          {
            create: async (params: Record<string, unknown>) => {
              logger.info("[Twilio MOCK] Creating call", params);
              return { sid: `mock_call_${Date.now()}`, status: "queued" as const };
            },
          }
        ),
        messages: {
          create: async (params: Record<string, unknown>) => {
            logger.info("[Twilio MOCK] Sending SMS", params);
            return { sid: `mock_msg_${Date.now()}`, status: "sent" as const };
          }
        }
      } satisfies TwilioLike;
    } else {
      logger.warn("[Twilio] Missing or invalid credentials, client not initialized");
    }
  }
  return _client;
}

export function reinitTwilioClient() {
  _client = null;
  return getTwilioClient();
}

export interface CallRouting {
  tenantId: number;
  prospectPhone: string;
  prospectName?: string;
  useAI: boolean;
  agentId?: number;
}

/**
 * Initiate an inbound call with Twilio
 */
export async function handleIncomingCall(params: {
  callSid: string;
  from: string;
  to: string;
  status: string;
}): Promise<string> {
  try {
    const { callSid, from, to } = params;
    logger.info("[Twilio] Handling incoming call", { callSid, from, to });

    const { getDb, createCall } = await import("../db");
    const db = await getDb();

    // 1. Workflow Engine Trigger (will be called after tenant resolution)

    const twiml = new twilio.twiml.VoiceResponse();

    if (!db) {
      logger.warn("[Twilio] Database not available, using default AI routing");
      twiml.say({ voice: "alice", language: "fr-FR" }, "Bienvenue chez Servicall. Nous traitons votre demande.");
      twiml.play("http://com.twilio.music.classic.s3.amazonaws.com/wait.mp3");
      return twiml.toString();
    }

    const { prospects, users } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const prospectResults = await db
      .select()
      .from(prospects)
      .where(eq(prospects.phone, from))
      .limit(1);

    let agentType: "AI" | "HUMAN" = "AI";
    let userId: number | undefined;
    let tenantId: number | null = null;

    if (prospectResults.length > 0) {
      const prospect = prospectResults[0];
      tenantId = prospect.tenantId;
      
      if (prospect.assignedTo) {
        const userResults = await db
          .select()
          .from(users)
          .where(eq(users.id, prospect.assignedTo))
          .limit(1);

        if (userResults.length > 0) {
          const user = userResults[0];
          // @ts-ignore
          agentType = ((user as any).assignedAgentType as "AI" | "HUMAN") || "AI";
          userId = user.id;
        }
      }
    }

    if (!tenantId) {
      logger.warn("[Twilio] Appel entrant sans tenant associé (prospect inconnu)", { from, callSid });
      const errorTwiml = new twilio.twiml.VoiceResponse();
      errorTwiml.say({ voice: "alice", language: "fr-FR" }, "Désolé, nous ne pouvons pas identifier votre compte. Veuillez contacter le support.");
      errorTwiml.hangup();
      return errorTwiml.toString();
    }

    const callRecord = await createCall({
      tenantId,
      prospectId: prospectResults.length > 0 ? prospectResults[0].id : undefined,
      agentId: userId,
      callType: "inbound",
      status: "in_progress",
      callSid: callSid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ✅ BLOC 2 : Déclenchement centralisé du workflow live_call_started
    const { LiveCallTriggerService } = await import("./liveCallTriggerService");
    LiveCallTriggerService.triggerAsync({
      callSid,
      callId: callRecord?.id,
      tenantId: tenantId!,
      from,
      to,
      direction: "inbound",
      prospect: prospectResults[0] || null,
      metadata: {
        agentType,
        userId,
      },
    });

    if (agentType === "AI") {
      twiml.say({ voice: "alice", language: "fr-FR" }, "Bienvenue. Je suis votre assistant intelligent. Comment puis-je vous aider ?");
      const webhookBase = process.env["WEBHOOK_URL"] || "https://api.servicall.local";
      const connect = twiml.connect();
      connect.stream({
        url: `wss://${new URL(webhookBase).host}/voice-ai`,
        name: "VoiceAIStream",
      });
    } else {
      twiml.say({ voice: "alice", language: "fr-FR" }, "Bienvenue. Je vous mets en relation avec un agent. Veuillez patienter.");
      twiml.dial(phoneNumber);
    }

    return twiml.toString();
  } catch (error: any) {
    logger.error("[Twilio] Error handling inbound call", { error });
    const errorTwiml = new twilio.twiml.VoiceResponse();
    errorTwiml.say({ voice: "alice", language: "fr-FR" }, "Désolé, nous rencontrons une difficulté technique. Veuillez nous rappeler ultérieurement.");
    errorTwiml.hangup();
    return errorTwiml.toString();
  }
}

const callLocks = new Set<string>();

/**
 * Create an outbound call
 */
export async function createOutboundCall(
  toNumber: string,
  tenantId: number,
  prospectId?: number,
  isAI: boolean = false
): Promise<QueuedCallResult> {
  return ResilienceService.execute(
    async () => {
      if (callLocks.has(toNumber)) {
        throw new Error("Call already in progress for this number");
      }
      callLocks.add(toNumber);

      const { jobQueue } = await import("./jobQueueService");

      const jobId = await jobQueue.enqueue("WORKFLOW_EXECUTE", tenantId, {
        toNumber,
        tenantId,
        prospectId,
        isAI,
        type: "outbound-call"
      });

      logger.info(`[Twilio] Outbound call added to queue`, { 
        jobId, 
        toNumber,
        tenantId 
      });

      setTimeout(() => callLocks.delete(toNumber), 30000);
      return { jobId, status: "queued" };
    },
    {
      name: "TWILIO_OUTBOUND_QUEUE",
      module: "TWILIO",
      idempotencyKey: `call_${tenantId}_${toNumber}_${Date.now().toString().substring(0, 8)}`
    }
  );
}

/**
 * Internal function to trigger the Twilio call via API
 */
/**
 * Alias for createOutboundCallInternal to match DialerEngine requirements
 */
export async function makeCall(toNumber: string, _message?: string, tenantId: number = 1): Promise<string> {
  const call = await createOutboundCallInternal(toNumber, tenantId, undefined, false);
  return call.sid;
}

export async function createOutboundCallInternal(
  toNumber: string,
  tenantId: number,
  prospectId?: number,
  isAI: boolean = false
): Promise<CallSidResult> {
  return ResilienceService.execute(
    async () => {
      const client = getTwilioClient();
      if (!client) throw new Error("Twilio client not initialized");

      const webhookBase = process.env["WEBHOOK_URL"] || "https://api.servicall.local";
      const url = isAI 
        ? `${webhookBase}/webhooks/ai-outbound?tenantId=${tenantId}&prospectId=${prospectId}`
        : `${webhookBase}/webhooks/call-status?tenantId=${tenantId}&prospectId=${prospectId}`;

      const call = await (client as any).calls.create({
        from: phoneNumber,
        to: toNumber,
        url: url,
        statusCallback: `${webhookBase}/webhooks/call-status?tenantId=${tenantId}&prospectId=${prospectId}`,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        record: true,
        recordingChannels: "mono",
      });

      // Observabilité : Coût estimé (0.015$ par minute)
      logger.info(`[Twilio] Call initiated`, { 
        module: "TWILIO",
        callSid: call.sid, 
        toNumber,
        tenantId,
        estimated_min_cost: 0.015
      });

      return call;
    },
    {
      name: "TWILIO_API_CALL",
      module: "TWILIO",
      timeoutMs: 10000,
      validateResponse: (data) => !!data.sid
    }
  );
}

/**
 * Handle call status updates
 */
export async function handleCallStatusUpdate(params: {
  callSid: string;
  status: string;
  from: string;
  to: string;
  duration?: string;
  recordingUrl?: string;
  recordingSid?: string;
}) {
  try {
    const { callSid, status, from, to, duration, recordingUrl, recordingSid } = params;
    logger.info(`[Twilio] Call status update`, { callSid, status, from, to });

    const { getDb, updateCall } = await import("../db");
    const db = await getDb();
    if (!db) return;

    const { calls } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const callResults = await db
      .select()
      .from(calls)
      .where(eq(calls.callSid, callSid))
      .limit(1);

    if (callResults.length === 0) {
      logger.warn("[Twilio] Call status update for unknown call", { callSid });
      return;
    }

    const call = callResults[0];

    await updateCall(call.id, {
      status,
      duration: duration ? parseInt(duration, 10) : undefined,
      recordingUrl,
      recordingKey: recordingSid,
      updatedAt: new Date(),
    });

    // ✅ BLOC 2 : Déclenchement du workflow live_call_ended
    if (status === "completed" || status === "failed") {
      const { LiveCallTriggerService } = await import("./liveCallTriggerService");
      LiveCallTriggerService.triggerAsync({
        callSid,
        callId: call.id,
        tenantId: call.tenantId!,
        from,
        to,
        direction: call.direction || "outbound",
        prospect: null, // Prospect non requis pour l'événement de fin
        metadata: {
          status,
          duration,
          recordingUrl,
        },
      });
    }

  } catch (error: any) {
    logger.error("[Twilio] Error handling call status update", { error });
  }
}

/**
 * Send an SMS message
 */
export async function sendSms(to: string, body: string, tenantId: number): Promise<any> {
  return ResilienceService.execute(
    async () => {
      const client = getTwilioClient();
      if (!client) throw new Error("Twilio client not initialized");

      const message = await client.messages.create({
        to,
        from: phoneNumber,
        body,
      });

      logger.info(`[Twilio] SMS sent`, { 
        messageSid: message.sid, 
        to, 
        tenantId 
      });

      return message;
    },
    {
      name: "TWILIO_SEND_SMS",
      module: "TWILIO",
      timeoutMs: 10000,
      validateResponse: (data) => !!data.sid
    }
  );
}

export const sendSMS = sendSms; // Alias as requested

export async function endCall(callSid: string): Promise<void> {
  return ResilienceService.execute(
    async () => {
      const client = getTwilioClient();
      if (!client) throw new Error("Twilio client not initialized");
      await (client as any).calls(callSid).update({ status: 'completed' });
    },
    { name: "TWILIO_END_CALL", module: "TWILIO" }
  );
}

export async function transferCall(callSid: string, to: string): Promise<void> {
  return ResilienceService.execute(
    async () => {
      const client = getTwilioClient();
      if (!client) throw new Error("Twilio client not initialized");
      await (client as any).calls(callSid).update({ twiml: `<Response><Dial>${to}</Dial></Response>` });
    },
    { name: "TWILIO_TRANSFER_CALL", module: "TWILIO" }
  );
}

export async function sendWhatsAppMessage(params: { to: string; body: string }): Promise<any> {
  return ResilienceService.execute(
    async () => {
      const client = getTwilioClient();
      if (!client) throw new Error("Twilio client not initialized");
      return await client.messages.create({
        from: `whatsapp:${process.env['TWILIO_WHATSAPP_NUMBER'] || phoneNumber}`,
        to: `whatsapp:${params.to}`,
        body: params.body,
      });
    },
    { name: "TWILIO_SEND_WHATSAPP", module: "TWILIO" }
  );
}

/**
 * Get call details
 */
export async function getCallDetails(callSid: string): Promise<CallDetailsResult> {
  return ResilienceService.execute(
    async () => {
      const client = getTwilioClient();
      if (!client) throw new Error("Twilio client not initialized");

      const call = await client.calls(callSid).fetch();

      return {
        sid: call.sid,
        from: call.from,
        to: call.to,
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
        price: call.price,
        direction: call.direction,
      };
    },
    {
      name: "TWILIO_GET_CALL_DETAILS",
      module: "TWILIO",
      timeoutMs: 5000
    }
  );
}

/**
 * sendWhatsApp — Alias de compatibilité vers sendWhatsAppMessage.
 * Remplace l'import depuis _core/twilio.ts (logique métier déplacée ici).
 * @param to   Numéro WhatsApp de destination
 * @param body Message à envoyer
 */
export async function sendWhatsApp(
  to: string,
  body: string
): Promise<{ success: boolean; messageSid?: string; message?: string; error?: string }> {
  return sendWhatsAppMessage({ to, body });
}
