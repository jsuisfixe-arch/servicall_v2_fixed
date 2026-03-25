/**
 * BYOK Service - Bring Your Own Key
 * Gestion centralisée et sécurisée des clés API avec chiffrement
 */

import crypto from "crypto";
import { db } from "../db";
import { apiKeys, byokAuditLogs } from "../../drizzle/schema-byok-services";
import { eq, and } from "drizzle-orm";
import { logger } from "../infrastructure/logger";


const ENCRYPTION_KEY = process.env['ENCRYPTION_KEY'] || "default-key-change-in-production";
const ALGORITHM = "aes-256-cbc";

/**
 * Chiffrer une clé API
 */
export function encryptKey(key: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32)), iv);
    let encrypted = cipher.update(key, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    logger.error("[BYOK] Encryption failed:", error);
    throw new Error("Failed to encrypt key");
  }
}

/**
 * Déchiffrer une clé API
 */
export function decryptKey(encryptedKey: string): string {
  try {
    const parts = encryptedKey.split(":");
    const iv = Buffer.from(parts[0]!, "hex");
    const encrypted = parts[1]!;
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32)), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    logger.error("[BYOK] Decryption failed:", error);
    throw new Error("Failed to decrypt key");
  }
}

/**
 * Sauvegarder une clé API
 */
export async function saveAPIKey(
  tenantId: number,
  provider: string,
  key: string
): Promise<{ success: boolean; message: string }> {
  try {
    const encryptedKey = encryptKey(key);

    // Vérifier si la clé existe déjà
    const existing = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.provider, provider)))
      .limit(1);

    if (existing.length > 0) {
      // Mettre à jour
      await db
        .update(apiKeys)
        .set({ encryptedKey, updatedAt: new Date() })
        .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.provider, provider)));
    } else {
      // Créer
      await db.insert(apiKeys).values({
        tenantId,
        provider,
        encryptedKey,
        isActive: true,
      });
    }

    // Audit log
    await logAuditAction(tenantId, "create", provider, "success", "API key saved");

    return { success: true, message: "API key saved successfully" };
  } catch (error) {
    logger.error("[BYOK] Save failed:", error);
    await logAuditAction(tenantId, "create", provider, "failed", String(error));
    return { success: false, message: "Failed to save API key" };
  }
}

/**
 * Récupérer une clé API déchiffrée
 */
export async function getAPIKey(tenantId: number, provider: string): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.provider, provider), eq(apiKeys.isActive, true)))
      .limit(1);

    if (result.length === 0) return null;

    return decryptKey(result[0]!.encryptedKey);
  } catch (error) {
    logger.error("[BYOK] Retrieval failed:", error);
    return null;
  }
}

/**
 * Lister toutes les clés API (sans les valeurs)
 */
export async function listAPIKeys(tenantId: number) {
  try {
    const results = await db
      .select({
        id: apiKeys.id,
        provider: apiKeys.provider,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId));

    return results;
  } catch (error) {
    logger.error("[BYOK] List failed:", error);
    return [];
  }
}

/**
 * Supprimer une clé API
 */
export async function deleteAPIKey(tenantId: number, provider: string): Promise<boolean> {
  try {
    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.provider, provider)));

    await logAuditAction(tenantId, "delete", provider, "success", "API key deleted");
    return true;
  } catch (error) {
    logger.error("[BYOK] Delete failed:", error);
    await logAuditAction(tenantId, "delete", provider, "failed", String(error));
    return false;
  }
}

/**
 * Tester une clé API
 */
export async function testAPIKey(provider: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    switch (provider) {
      case "google_maps":
        return await testGoogleMapsKey(key);
      case "pages_jaunes":
        return await testPagesJaunesKey(key);
      case "openai":
        return await testOpenAIKey(key);
      case "stripe":
        return await testStripeKey(key);
      case "sendgrid":
        return await testSendGridKey(key);
      default:
        return { success: false, message: "Unknown provider" };
    }
  } catch (error) {
    logger.error("[BYOK] Test failed:", error);
    return { success: false, message: String(error) };
  }
}

async function testGoogleMapsKey(key: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("https://maps.googleapis.com/maps/api/place/textsearch/json?query=test&key=" + key);
    if (response.ok || response.status === 400) {
      return { success: true, message: "Google Maps key is valid" };
    }
    return { success: false, message: "Invalid Google Maps key" };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

async function testPagesJaunesKey(key: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("https://api.pagesjaunes.fr/search?apiKey=" + key + "&keyword=test");
    if (response.ok || response.status === 400) {
      return { success: true, message: "Pages Jaunes key is valid" };
    }
    return { success: false, message: "Invalid Pages Jaunes key" };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

async function testOpenAIKey(key: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (response.ok) {
      return { success: true, message: "OpenAI key is valid" };
    }
    return { success: false, message: "Invalid OpenAI key" };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

async function testStripeKey(key: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (response.ok) {
      return { success: true, message: "Stripe key is valid" };
    }
    return { success: false, message: "Invalid Stripe key" };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

async function testSendGridKey(key: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "test@example.com" }] }],
        from: { email: "test@example.com" },
        subject: "Test",
        content: [{ type: "text/plain", value: "Test" }],
      }),
    });
    if (response.status === 202 || response.status === 400) {
      return { success: true, message: "SendGrid key is valid" };
    }
    return { success: false, message: "Invalid SendGrid key" };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

/**
 * Enregistrer une action d'audit
 */
async function logAuditAction(
  tenantId: number,
  action: string,
  provider: string,
  status: string,
  message: string
): Promise<void> {
  try {
    await db.insert(byokAuditLogs).values({
      tenantId,
      action,
      provider,
      status,
      message,
    });
  } catch (error) {
    logger.error("[BYOK] Audit log failed:", error);
  }
}

/**
 * Récupérer les logs d'audit
 */
export async function getAuditLogs(tenantId: number, limit = 50) {
  try {
    const results = await db
      .select()
      .from(byokAuditLogs)
      .where(eq(byokAuditLogs.tenantId, tenantId))
      .orderBy((t) => t.createdAt)
      .limit(limit);

    return results;
  } catch (error) {
    logger.error("[BYOK] Audit retrieval failed:", error);
    return [];
  }
}
