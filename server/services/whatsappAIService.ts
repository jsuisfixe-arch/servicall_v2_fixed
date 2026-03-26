/**
 * WHATSAPP AI DIALOGUE SERVICE
 * ─────────────────────────────────────────────────────────────
 * Gère les conversations WhatsApp entrantes avec l'IA.
 * Le client envoie un message → l'IA répond intelligemment
 * en tenant compte du métier du tenant, de la mémoire du contact,
 * et de la langue détectée automatiquement.
 *
 * FLUX :
 *  1. Meta envoie webhook POST /api/whatsapp/webhook
 *  2. Ce service reçoit le message
 *  3. Récupère le contexte IA du tenant (métier, prompt)
 *  4. Injecte la mémoire du contact (interactions passées)
 *  5. Génère une réponse IA adaptée à la langue détectée
 *  6. Envoie via Meta WhatsApp Business API (ou Twilio en fallback)
 *  7. Sauvegarde l'interaction en mémoire
 *
 * PROVIDERS supportés :
 *  - Meta WhatsApp Business API (recommandé - moins cher)
 *  - Twilio WhatsApp (fallback)
 */

import { invokeLLM } from "../_core/llm";
import { AI_MODEL } from "../_core/aiModels";
import { logger } from "../infrastructure/logger";
import { getContactMemory, saveInteractionMemory } from "./aiMemoryService";
import { generateTenantSystemPrompt } from "./tenantIndustryService";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface WhatsAppMessage {
  from: string;         // numéro WhatsApp expéditeur (format: +21298...)
  to: string;           // numéro WhatsApp destinataire (votre numéro)
  body: string;         // contenu du message
  messageId: string;    // ID unique Meta
  timestamp: number;    // Unix timestamp
  type: "text" | "audio" | "image" | "document" | "location";
  profileName?: string; // Nom du contact WhatsApp
}

export interface WhatsAppDialogueResult {
  replied: boolean;
  response?: string;
  language?: string;
  memoryUsed?: boolean;
  error?: string;
}

// ─────────────────────────────────────────────
// Détection de langue MENA
// ─────────────────────────────────────────────

const ARABIC_REGEX = /[\u0600-\u06FF]/;
const DARIJA_KEYWORDS = /wach|bghit|labas|mashi|wakha|daba|mzyan|zwina|smiyti|dial/i;
const TUNISIAN_KEYWORDS = /chkoun|chbik|barcha|mrigel|barka|yaaser|ki|nakol|nheb/i;
const ALGERIAN_KEYWORDS = /wach|rabi|nta|ntiya|khoya|sahbi|chhal|bezzaf|lazem/i;
const FRENCH_REGEX = /\b(je|tu|il|nous|vous|ils|le|la|les|un|une|est|sont|avec|pour|dans)\b/i;

export function detectLanguage(text: string): string {
  if (ARABIC_REGEX.test(text)) return "ar";
  if (DARIJA_KEYWORDS.test(text)) return "dar"; // Darija marocain
  if (TUNISIAN_KEYWORDS.test(text)) return "tun"; // Tunisien
  if (ALGERIAN_KEYWORDS.test(text)) return "alg"; // Algérien
  if (FRENCH_REGEX.test(text)) return "fr";
  return "fr"; // défaut
}

function getLanguageInstruction(lang: string): string {
  const map: Record<string, string> = {
    ar:  "Réponds en arabe standard (fusha) avec un ton professionnel.",
    dar: "Réponds en darija marocain de manière naturelle et chaleureuse. Tu peux mélanger français et darija si c'est plus naturel.",
    tun: "Réponds en dialecte tunisien de manière naturelle. Tu peux utiliser le français quand c'est plus clair.",
    alg: "Réponds en dialecte algérien de manière naturelle. Mélange arabe et français comme c'est naturel en Algérie.",
    fr:  "Réponds en français de manière professionnelle et chaleureuse.",
    en:  "Reply in English, professional and friendly tone.",
  };
  return map[lang] ?? map.fr;
}

// ─────────────────────────────────────────────
// Envoi WhatsApp
// ─────────────────────────────────────────────

async function sendWhatsAppReply(
  to: string,
  message: string,
  tenantConfig: { wabaPhoneNumberId?: string; wabaAccessToken?: string; twilioSid?: string; twilioToken?: string; twilioPhone?: string }
): Promise<boolean> {
  // Option 1 : Meta WhatsApp Business API (recommandé - moins cher que Twilio)
  if (tenantConfig.wabaPhoneNumberId && tenantConfig.wabaAccessToken) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${tenantConfig.wabaPhoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantConfig.wabaAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to.replace(/^\+/, "").replace(/\s/g, ""),
            type: "text",
            text: { body: message },
          }),
        }
      );
      if (res.ok) {
        logger.info("[WhatsApp] Reply sent via Meta Business API", { to });
        return true;
      }
      const err = await res.text();
      logger.warn("[WhatsApp] Meta API error", { err, status: res.status });
    } catch (err) {
      logger.error("[WhatsApp] Meta API exception", { err });
    }
  }

  // Option 2 : Twilio WhatsApp (fallback)
  if (tenantConfig.twilioSid && tenantConfig.twilioToken && tenantConfig.twilioPhone) {
    try {
      const twilio = await import("twilio");
      const client = (twilio as any).default(tenantConfig.twilioSid, tenantConfig.twilioToken);
      await (client as any).messages.create({
        from: `whatsapp:${tenantConfig.twilioPhone}`,
        to: `whatsapp:${to}`,
        body: message,
      });
      logger.info("[WhatsApp] Reply sent via Twilio", { to });
      return true;
    } catch (err) {
      logger.error("[WhatsApp] Twilio exception", { err });
    }
  }

  // Mode simulation si rien de configuré
  logger.warn("[WhatsApp] No provider configured — simulating reply", { to, preview: message.slice(0, 80) });
  return false;
}

// ─────────────────────────────────────────────
// Dialogue principal IA
// ─────────────────────────────────────────────

/**
 * Traite un message WhatsApp entrant et génère une réponse IA
 */
export async function handleIncomingWhatsAppMessage(
  message: WhatsAppMessage,
  tenantId: number,
  tenantName: string,
  tenantConfig: {
    wabaPhoneNumberId?: string;
    wabaAccessToken?: string;
    twilioSid?: string;
    twilioToken?: string;
    twilioPhone?: string;
  }
): Promise<WhatsAppDialogueResult> {
  try {
    // 1. Détecter la langue
    const detectedLang = detectLanguage(message.body);
    logger.info("[WhatsApp] Incoming message", {
      from: message.from,
      lang: detectedLang,
      preview: message.body.slice(0, 60),
    });

    // 2. Récupérer la mémoire du contact
    const memory = await getContactMemory(tenantId, message.from);

    // 3. Récupérer le prompt système du métier
    const industryPrompt = await generateTenantSystemPrompt(tenantId, tenantName);

    // 4. Construire le système prompt complet
    const systemPrompt = `${industryPrompt}

Tu es l'assistant WhatsApp de ${tenantName}.
${getLanguageInstruction(detectedLang)}

RÈGLES IMPORTANTES :
- Sois concis sur WhatsApp (2-4 phrases max par réponse)
- Réponds toujours dans la langue du client (${detectedLang})
- Si tu ne peux pas résoudre, propose un rappel téléphonique
- Ne partage jamais de données d'autres clients
- Pour les urgences médicales ou légales, oriente vers les services compétents
${memory.memoryPrompt}`;

    // 5. Générer la réponse IA
    const response = await invokeLLM(tenantId, {
      model: AI_MODEL.DEFAULT,
      messages: [
        { role: "system", content: systemPrompt as any },
        { role: "user", content: message.body as any },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiReply = ((response as any).choices[0]?.message?.content as string)?.trim();
    if (!aiReply) {
      throw new Error("Empty AI response");
    }

    // 6. Envoyer la réponse
    await sendWhatsAppReply(message.from, aiReply, tenantConfig);

    // 7. Sauvegarder en mémoire (async, non bloquant)
    saveInteractionMemory({
      tenantId,
      contactIdentifier: message.from,
      contactName: message.profileName,
      channel: "whatsapp",
      manualSummary: `Msg: "${message.body.slice(0, 100)}" → Réponse IA: "${aiReply.slice(0, 100)}"`,
      keyFacts: {
        language: detectedLang,
        sentiment: "neutral",
      },
    }).catch((err) => logger.warn("[WhatsApp] Memory save failed", { err }));

    return {
      replied: true,
      response: aiReply,
      language: detectedLang,
      memoryUsed: memory.hasMemory,
    };
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[WhatsApp] AI dialogue failed", { err: msg, from: message.from });
    return { replied: false, error: msg };
  }
}

/**
 * Parse un webhook Meta WhatsApp Business API
 */
export function parseMetaWebhookMessage(body: any): WhatsAppMessage | null {
  try {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];

    if (!msg || msg.type !== "text") return null;

    const contact = value?.contacts?.[0];

    return {
      from: msg.from,
      to: value.metadata?.display_phone_number ?? "",
      body: msg.text?.body ?? "",
      messageId: msg.id,
      timestamp: parseInt(msg.timestamp ?? "0"),
      type: "text",
      profileName: contact?.profile?.name,
    };
  } catch {
    return null;
  }
}

/**
 * Parse un webhook Twilio WhatsApp (form-encoded)
 */
export function parseTwilioWebhookMessage(body: Record<string, string>): WhatsAppMessage | null {
  if (!body.From || !body.Body) return null;
  return {
    from: body.From.replace("whatsapp:", ""),
    to: (body.To ?? "").replace("whatsapp:", ""),
    body: body.Body,
    messageId: body.MessageSid ?? `twilio_${Date.now()}`,
    timestamp: Math.floor(Date.now() / 1000),
    type: "text",
    profileName: body.ProfileName,
  };
}
