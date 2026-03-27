/**
 * TwilioService — service unifié Twilio
 *
 * Absorbe l'ancien _core/twilio.ts (supprimé).
 * Toute la logique Twilio passe par cette classe ou les fonctions exportées ci-dessous.
 */

import twilio from "twilio";
import type { Twilio } from "twilio";
import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { logger } from "../../infrastructure/logger";
import { ENV } from "../../_core/env";

// ─── Types publics ────────────────────────────────────────────────────────────

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface CallOptions {
  to: string;
  from?: string;
  isAI?: boolean;
  shouldRecord?: boolean;
  consentGiven?: boolean;
  prospectName?: string;
  agentName?: string;
  workflowId?: number;
  prospectId?: number;
}

export interface CallResult {
  success: boolean;
  callSid?: string;
  error?: string;
  message?: string;
}

export interface RecordingResult {
  success: boolean;
  recordingSid?: string;
  recordingUrl?: string;
  error?: string;
}

// ─── Singleton client partagé ─────────────────────────────────────────────────

const _accountSid = ENV.twilioAccountSid;
const _authToken = ENV.twilioAuthToken;
const _phoneNumber = ENV.twilioPhoneNumber;

let _sharedClient: Twilio | null = null;

if (_accountSid?.startsWith("AC") && _authToken) {
  try {
    _sharedClient = twilio(_accountSid, _authToken);
  } catch {
    logger.warn("[Twilio] Impossible d'initialiser le client partagé");
  }
}

export const twilioConfig = {
  accountSid: _accountSid,
  authToken: _authToken,
  phoneNumber: _phoneNumber,
  twimlUrl: process.env["TWILIO_TWIML_URL"] ?? "https://your-domain.com/api/twiml",
  recordingUrl: process.env["TWILIO_RECORDING_URL"] ?? "https://your-domain.com/api/recording",
};

// Export du client partagé (lecture seule)
export const twilioClient: Twilio | null = _sharedClient;

// ─── Classe principale ────────────────────────────────────────────────────────

export class TwilioService {
  private client: Twilio | null = null;
  private fromNumber: string;
  private configured = false;

  constructor(config: TwilioConfig) {
    this.fromNumber = config.fromNumber;

    const isValidSid = config.accountSid?.startsWith("AC");
    const isValidToken =
      config.authToken?.length > 10 && !config.authToken.includes("your_");

    if (isValidSid && isValidToken) {
      try {
        this.client = twilio(config.accountSid, config.authToken);
        this.configured = true;
        logger.info("✅ [TwilioService] Initialisé avec succès");
      } catch (error) {
        logger.warn("⚠️ [TwilioService] Impossible d'initialiser Twilio:", error);
      }
    } else {
      logger.warn(
        "⚠️ [TwilioService] Credentials Twilio non configurés — mode simulation activé"
      );
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async makeCall(toNumber: string, message: string): Promise<string> {
    if (!this.configured || !this.client) {
      logger.info(`📞 [SIMULATION] Appel vers ${toNumber}: ${message}`);
      return `sim_call_${Date.now()}`;
    }
    const call: CallInstance = await this.client.calls.create({
      url: `${process.env["APP_URL"] ?? "https://your-domain.com"}/api/twilio/twiml?message=${encodeURIComponent(message)}`,
      to: toNumber,
      from: this.fromNumber,
    });
    logger.info(`📞 Call initiated: ${call.sid}`);
    return call.sid;
  }

  async getCallStatus(callSid: string): Promise<string> {
    if (!this.configured || !this.client) return "simulated";
    const call: CallInstance = await this.client.calls(callSid).fetch();
    return call.status;
  }

  async sendSMS(toNumber: string, message: string): Promise<string> {
    if (!this.configured || !this.client) {
      logger.info(`📱 [SIMULATION] SMS vers ${toNumber}: ${message}`);
      return `sim_sms_${Date.now()}`;
    }
    const sms: MessageInstance = await this.client.messages.create({
      body: message,
      from: this.fromNumber,
      to: toNumber,
    });
    logger.info(`📱 SMS sent: ${sms.sid}`);
    return sms.sid;
  }

  async sendWhatsApp(toNumber: string, message: string): Promise<string> {
    if (!this.configured || !this.client) {
      logger.info(`💬 [SIMULATION] WhatsApp vers ${toNumber}: ${message}`);
      return `sim_wa_${Date.now()}`;
    }
    const msg: MessageInstance = await this.client.messages.create({
      body: message,
      from: `whatsapp:${this.fromNumber}`,
      to: `whatsapp:${toNumber}`,
    });
    logger.info(`💬 WhatsApp sent: ${msg.sid}`);
    return msg.sid;
  }

  async terminateCall(callSid: string): Promise<CallResult> {
    if (!this.configured || !this.client)
      return { success: false, error: "Client Twilio non configuré" };
    try {
      const call: CallInstance = await this.client.calls(callSid).update({
        status: "completed",
      });
      return { success: true, callSid: call.sid, message: "Appel terminé" };
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("[TwilioService] terminateCall:", msg);
      return { success: false, error: msg };
    }
  }
}

// ─── Fonctions standalone (compatibilité héritée de _core/twilio.ts) ──────────

export function generateTwiML(options: CallOptions): string {
  const { isAI, prospectName, agentName } = options;
  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

  if (isAI) {
    twiml += `  <Say voice="alice">
    Bonjour ${prospectName ?? ""}. Vous êtes en communication avec une IA de Servicall.
    Acceptez-vous d'être appelé et enregistré ? Appuyez sur 1 pour accepter, ou 2 pour refuser.
  </Say>\n`;
  } else {
    twiml += `  <Say voice="alice">
    Bonjour ${prospectName ?? ""}, ${agentName ?? "un agent"} de Servicall à l'appareil.
    Nous aimerions enregistrer cet appel. Acceptez-vous ?
  </Say>\n`;
  }

  twiml += `  <Gather numDigits="1" action="${twilioConfig.recordingUrl}?consent=true" method="POST">
    <Say voice="alice">Appuyez sur 1 pour accepter ou 2 pour refuser.</Say>
  </Gather>\n`;
  twiml += `  <Say voice="alice">Nous n'avons pas reçu votre réponse. L'appel va se terminer.</Say>\n`;
  twiml += `  <Hangup />\n`;
  twiml += `</Response>`;

  return twiml;
}

export async function initiateCall(options: CallOptions): Promise<CallResult> {
  if (!options.to) return { success: false, error: "Numéro de destination requis" };
  if (!_sharedClient) return { success: false, error: "Configuration Twilio manquante" };

  try {
    const call: CallInstance = await _sharedClient.calls.create({
      to: options.to,
      from: options.from ?? twilioConfig.phoneNumber ?? "",
      twiml: generateTwiML(options),
      record: options.shouldRecord ?? false,
      recordingChannels: "mono",
      recordingStatusCallback: `${twilioConfig.recordingUrl}?callSid={CallSid}&prospectId=${options.prospectId ?? ""}`,
      recordingStatusCallbackMethod: "POST",
    });
    return { success: true, callSid: call.sid, message: `Appel lancé (SID: ${call.sid})` };
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("[Twilio] initiateCall:", msg);
    return { success: false, error: msg };
  }
}

export async function listCalls(
  limit = 50
): Promise<{ success: boolean; calls?: CallInstance[]; error?: string }> {
  if (!_sharedClient) return { success: false, error: "Client non configuré" };
  try {
    const calls = await _sharedClient.calls.list({ limit });
    return { success: true, calls };
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("[Twilio] listCalls:", msg);
    return { success: false, error: msg };
  }
}

export async function getCallRecordings(callSid: string): Promise<RecordingResult> {
  if (!_sharedClient) return { success: false, error: "Client non configuré" };
  try {
    const recordings = await _sharedClient.calls(callSid).recordings.list({ limit: 20 });
    if (recordings.length === 0)
      return { success: false, error: "Aucun enregistrement trouvé" };
    const rec = recordings[0]!;
    return {
      success: true,
      recordingSid: rec.sid,
      recordingUrl: `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Recordings/${rec.sid}.mp3`,
    };
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("[Twilio] getCallRecordings:", msg);
    return { success: false, error: msg };
  }
}
