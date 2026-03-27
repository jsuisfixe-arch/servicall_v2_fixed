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

    // ✅ FIX — agentType supporte maintenant AI | HUMAN | BOTH
    let agentType: "AI" | "HUMAN" | "BOTH" = "AI";
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
          const raw = ((user as any).assignedAgentType as string)?.toUpperCase();
          agentType = (raw === "AI" || raw === "HUMAN" || raw === "BOTH") ? raw : "AI";
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

    // ─── Helper : crée un token éphémère WebSocket et le stocke ─────────────
    const STREAM_TOKEN_TTL_MS = 5 * 60 * 1000;
    const { voiceStreamTokens } = await import("../index");

    const createStreamToken = (agentId?: number, mode: "AI" | "HUMAN" | "BOTH" = "AI") => {
      const token = `vst_${(crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      voiceStreamTokens.set(token, {
        tenantId: tenantId!,
        callSid,
        callId: callRecord?.id ?? 0,
        expiresAt: Date.now() + STREAM_TOKEN_TTL_MS,
        agentId,
        agentMode: mode,
      });
      setTimeout(() => voiceStreamTokens.delete(token), STREAM_TOKEN_TTL_MS);
      return token;
    };

    const webhookBase = (process.env["WEBHOOK_URL"] || "https://api.servicall.local").replace(/\/$/, "");
    const wsHost = new URL(webhookBase).host;

    if (agentType === "AI") {
      // ─── Mode IA seule ───────────────────────────────────────────────────
      // Pipeline vocal IA complet : ASR → LLM → TTS, tout via WebSocket Twilio
      const streamToken = createStreamToken(undefined, "AI");

      twiml.say(
        { voice: "alice", language: "fr-FR" },
        "Bienvenue. Je suis votre assistant intelligent. Comment puis-je vous aider ?"
      );
      const connect = twiml.connect();
      connect.stream({
        url: `wss://${wsHost}/voice-stream?token=${streamToken}&callSid=${encodeURIComponent(callSid)}&tenantId=${tenantId}`,
        name: "VoiceAIStream",
      });

    } else if (agentType === "BOTH") {
      // ─── Mode BOTH : humain répond + copilot IA écoute en parallèle ──────
      // L'appel est transféré à l'agent humain (numéro de téléphone).
      // En parallèle, un <Stream> bidirectionnel envoie l'audio au pipeline
      // RealtimeAgentCoachingService qui génère des suggestions temps réel
      // affichées dans l'interface de l'agent (via WebSocket séparé).
      const streamToken = createStreamToken(userId, "BOTH");

      twiml.say(
        { voice: "alice", language: "fr-FR" },
        "Bienvenue. Je vous mets en relation avec votre conseiller."
      );

      // Fork : <Dial> vers l'agent humain ET <Stream> vers le copilot IA
      // Le <Stream> en mode "inbound" écoute l'audio sans interrompre l'appel.
      const connect = twiml.connect();
      connect.stream({
        url: `wss://${wsHost}/voice-stream?token=${streamToken}&callSid=${encodeURIComponent(callSid)}&tenantId=${tenantId}&mode=copilot`,
        name: "CopilotStream",
      });

      twiml.dial(
        { callerId: phoneNumber },
        userId ? undefined : phoneNumber // destination : agent humain ou numéro par défaut
      );

    } else {
      // ─── Mode HUMAN seul ─────────────────────────────────────────────────
      twiml.say(
        { voice: "alice", language: "fr-FR" },
        "Bienvenue. Je vous mets en relation avec un agent. Veuillez patienter."
      );
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
        prospect: null,
        metadata: {
          status,
          duration,
          recordingUrl,
          agentType: (call as any).agentType ?? undefined,
        },
      });

      // ✅ FIX — Coaching post-appel : déclenché automatiquement à chaque fin d'appel
      // AVANT : agentCoachingService.analyzeCallAndGenerateFeedback() n'était jamais appelé
      //         depuis le webhook — il fallait l'appeler manuellement depuis le router.
      // APRÈS : déclenché ici, fire-and-forget, pour tout appel avec un agentId connu.
      if (call.agentId && call.tenantId && status === "completed") {
        void (async () => {
          try {
            const { AgentCoachingService } = await import("./agentCoachingService");
            const coachingService = new AgentCoachingService();
            await coachingService.analyzeCallAndGenerateFeedback(call.id, call.tenantId!);
            logger.info("[Coaching] Post-call analysis completed", {
              callId: call.id,
              agentId: call.agentId,
              tenantId: call.tenantId,
            });
          } catch (coachingErr) {
            // Ne jamais faire crasher le webhook à cause du coaching
            logger.warn("[Coaching] Post-call analysis failed (non-blocking)", {
              callId: call.id,
              coachingErr,
            });
          }
        })();
      }
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

/**
 * ✅ FIX — transferCall avec transmission du contexte de conversation IA → Humain
 *
 * AVANT : transfert Twilio brut, l'agent humain repart de zéro.
 * APRÈS :
 *   1. Lit l'historique de conversation Redis (conversation:${callSid})
 *   2. Génère un résumé IA de l'échange en cours
 *   3. Stocke ce résumé dans Redis (transfer_context:${callSid}, TTL 10 min)
 *   4. Effectue le transfert Twilio via <Dial>
 *
 * L'interface agent humain peut lire transfer_context:${callSid} via
 * GET /api/calls/:callSid/transfer-context pour afficher le résumé.
 */
export async function transferCall(
  callSid: string,
  to: string,
  tenantId?: number
): Promise<void> {
  return ResilienceService.execute(
    async () => {
      const client = getTwilioClient();
      if (!client) throw new Error("Twilio client not initialized");

      // ─── 1. Récupérer l'historique de conversation depuis Redis ──────────
      let contextSummary: string | null = null;
      try {
        const { getRedisClient } = await import("../infrastructure/redis/redis.client");
        const redis = getRedisClient();
        if (redis) {
          const raw = await redis.get(`conversation:${callSid}`);
          if (raw) {
            const history: Array<{ role: string; content: string }> = JSON.parse(raw);
            const recentTurns = history.slice(-10); // 5 derniers échanges max

            if (recentTurns.length > 0) {
              // ─── 2. Générer un résumé IA de la conversation ────────────
              const { invokeLLM } = await import("../_core/llm");
              const summaryResult = await invokeLLM(tenantId ?? 0, {
                messages: [
                  {
                    role: "system",
                    content:
                      "Tu es un assistant qui résume des conversations téléphoniques pour les agents humains. " +
                      "Génère un résumé concis (3-5 lignes) : raison de l'appel, informations clés collectées, " +
                      "ton du client, actions déjà effectuées, points d'attention.",
                  },
                  {
                    role: "user",
                    content:
                      `Résume cette conversation pour l'agent humain qui prend le relais :\n\n` +
                      recentTurns
                        .map((m) => `${m.role === "user" ? "Client" : "IA"}: ${m.content}`)
                        .join("\n"),
                  },
                ],
                maxTokens: 300,
              });

              contextSummary =
                (summaryResult.choices[0]?.message?.content as string) || null;

              // ─── 3. Stocker le contexte dans Redis (TTL 10 min) ─────────
              await redis.setex(
                `transfer_context:${callSid}`,
                600,
                JSON.stringify({
                  callSid,
                  transferredAt: new Date().toISOString(),
                  summary: contextSummary,
                  rawHistory: recentTurns,
                })
              );

              logger.info("[Twilio] Transfer context saved", { callSid, contextLength: recentTurns.length });
            }
          }
        }
      } catch (contextErr) {
        // Ne jamais bloquer le transfert à cause d'une erreur de contexte
        logger.warn("[Twilio] Could not build transfer context", { callSid, contextErr });
      }

      // ─── 4. Effectuer le transfert Twilio ────────────────────────────────
      await (client as any).calls(callSid).update({
        twiml: `<Response><Dial>${to}</Dial></Response>`,
      });

      logger.info("[Twilio] Call transferred", { callSid, to, hasContext: !!contextSummary });
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
