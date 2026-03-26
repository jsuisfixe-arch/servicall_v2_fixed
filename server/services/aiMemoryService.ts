
/**
 * AI MEMORY SERVICE — Mémoire conversationnelle longue durée
 * ─────────────────────────────────────────────────────────────
 * L'agent IA se souvient de chaque client : dernier appel, préférences,
 * problèmes non résolus, promesses faites, humeur détectée.
 *
 * Architecture :
 *  - Stockage en DB (table ai_memories) — persistant sans dépendance externe
 *  - Résumés compressés générés par LLM après chaque interaction
 *  - Récupération par tenantId + identifiant contact (phone/email/prospectId)
 *  - Injection automatique dans le context prompt de chaque appel/message
 */

import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { AI_MODEL } from "../_core/aiModels";
import { logger } from "../infrastructure/logger";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Type alias — drizzle exposes execute() at runtime but not in the Proxy type
type DrizzleDb = PostgresJsDatabase & { execute: (sql: string) => Promise<{ rows: Record<string, unknown>[] }> };

interface RawMemoryRow {
  id: any;
  contact_name: string | null;
  channel: string;
  summary: string;
  key_facts: Record<string, unknown> | string | null;
  interaction_date: string | Date;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface MemoryEntry {
  id?: number;
  tenantId: number;
  contactIdentifier: string;  // phone, email, ou prospectId.toString()
  contactName?: string;
  channel: "call" | "whatsapp" | "sms" | "email" | "chat";
  summary: string;            // Résumé compressé de l'interaction
  keyFacts: {                 // Faits importants extraits
    preferences?: string[];
    issues?: string[];
    promises?: string[];
    sentiment?: "positive" | "neutral" | "negative";
    language?: string;
    lastOutcome?: string;
  };
  interactionDate: Date;
  createdAt?: Date;
}

export interface ConversationContext {
  hasMemory: boolean;
  contactName?: string;
  memoryPrompt: string;       // Prêt à injecter dans le system prompt
  recentSummaries: string[];
  keyFacts: MemoryEntry["keyFacts"];
  totalInteractions: number;
}

// ─────────────────────────────────────────────
// Helpers DB (utilise JSONB en Postgres)
// ─────────────────────────────────────────────

async function getMemoryTable() {
  const { sql } = await import("drizzle-orm");
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return { db, sql };
}

async function ensureMemoryTableExists(): Promise<void> {
  try {
    const { db } = await getMemoryTable();
    await (db as DrizzleDb).execute(`
      CREATE TABLE IF NOT EXISTS ai_memories (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        contact_identifier TEXT NOT NULL,
        contact_name TEXT,
        channel TEXT NOT NULL DEFAULT 'call',
        summary TEXT NOT NULL,
        key_facts JSONB DEFAULT '{}',
        interaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT ai_memories_tenant_contact_idx UNIQUE (tenant_id, contact_identifier, interaction_date)
      );
      CREATE INDEX IF NOT EXISTS idx_ai_memories_lookup
        ON ai_memories (tenant_id, contact_identifier, interaction_date DESC);
    `);
  } catch (err) {
    logger.warn("[AIMemory] Could not ensure table exists (may already exist)", { err });
  }
}

// ─────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────

/**
 * Récupère le contexte mémorisé d'un contact pour injection dans le prompt IA
 */
export async function getContactMemory(
  tenantId: number,
  contactIdentifier: string,
  limit: number = 5
): Promise<ConversationContext> {
  try {
    await ensureMemoryTableExists();
    const { db } = await getMemoryTable();

    const rows = await (db as DrizzleDb).execute(`
      SELECT id, contact_name, channel, summary, key_facts, interaction_date
      FROM ai_memories
      WHERE tenant_id = ${tenantId}
        AND contact_identifier = '${contactIdentifier.replace(/'/g, "''")}'
      ORDER BY interaction_date DESC
      LIMIT ${limit}
    `);

    const memories: RawMemoryRow[] = (rows.rows ?? rows ?? []) as RawMemoryRow[];

    if (memories.length === 0) {
      return {
        hasMemory: false,
        memoryPrompt: "",
        recentSummaries: [],
        keyFacts: {},
        totalInteractions: 0,
      };
    }

    // Agréger les key_facts de toutes les interactions
    const aggregatedFacts: MemoryEntry["keyFacts"] = {
      preferences: [],
      issues: [],
      promises: [],
    };

    let lastSentiment: string | undefined;
    let lastLanguage: string | undefined;
    let lastOutcome: string | undefined;
    let contactName: string | undefined;

    for (const m of memories) {
      const facts = typeof m.key_facts === "string"
        ? JSON.parse(m.key_facts)
        : (m.key_facts ?? {});

      if (facts.preferences) aggregatedFacts.preferences!.push(...facts.preferences);
      if (facts.issues) aggregatedFacts.issues!.push(...facts.issues);
      if (facts.promises) aggregatedFacts.promises!.push(...facts.promises);
      if (!lastSentiment && facts.sentiment) lastSentiment = facts.sentiment;
      if (!lastLanguage && facts.language) lastLanguage = facts.language;
      if (!lastOutcome && facts.lastOutcome) lastOutcome = facts.lastOutcome;
      if (!contactName && m.contact_name) contactName = m.contact_name;
    }

    aggregatedFacts.sentiment = lastSentiment as MemoryEntry["keyFacts"]["sentiment"];
    aggregatedFacts.language = lastLanguage;
    aggregatedFacts.lastOutcome = lastOutcome;

    // Dédupliquer
    if (aggregatedFacts.preferences) {
      aggregatedFacts.preferences = [...new Set(aggregatedFacts.preferences)].slice(0, 5);
    }
    if (aggregatedFacts.issues) {
      aggregatedFacts.issues = [...new Set(aggregatedFacts.issues)].slice(0, 5);
    }
    if (aggregatedFacts.promises) {
      aggregatedFacts.promises = [...new Set(aggregatedFacts.promises)].slice(0, 3);
    }

    const recentSummaries = memories.slice(0, 3).map((m: RawMemoryRow) => {
      const date = new Date(m.interaction_date).toLocaleDateString("fr-FR");
      return `[${date} via ${m.channel}] ${m.summary}`;
    });

    // Construire le prompt mémoire
    const memoryPrompt = buildMemoryPrompt(contactName, recentSummaries, aggregatedFacts);

    return {
      hasMemory: true,
      contactName,
      memoryPrompt,
      recentSummaries,
      keyFacts: aggregatedFacts,
      totalInteractions: memories.length,
    };
  } catch (err) {
    logger.error("[AIMemory] Failed to retrieve memory", { err, tenantId, contactIdentifier });
    return {
      hasMemory: false,
      memoryPrompt: "",
      recentSummaries: [],
      keyFacts: {},
      totalInteractions: 0,
    };
  }
}

/**
 * Sauvegarde une nouvelle interaction en mémoire
 * Génère automatiquement un résumé via LLM si transcript fourni
 */
export async function saveInteractionMemory(params: {
  tenantId: number;
  contactIdentifier: string;
  contactName?: string;
  channel: MemoryEntry["channel"];
  transcript?: string;
  manualSummary?: string;
  keyFacts?: MemoryEntry["keyFacts"];
}): Promise<void> {
  try {
    await ensureMemoryTableExists();

    let summary = params.manualSummary ?? "";
    let keyFacts = params.keyFacts ?? {};

    // Générer un résumé intelligent via LLM si transcript disponible
    if (params.transcript && params.transcript.length > 50) {
      const result = await generateMemorySummary(
        params.transcript,
        params.tenantId,
        params.channel
      );
      summary = result.summary;
      keyFacts = { ...keyFacts, ...result.keyFacts };
    }

    if (!summary) {
      summary = `Interaction ${params.channel} enregistrée`;
    }

    const { db } = await getMemoryTable();

    await (db as DrizzleDb).execute(`
      INSERT INTO ai_memories
        (tenant_id, contact_identifier, contact_name, channel, summary, key_facts, interaction_date)
      VALUES (
        ${params.tenantId},
        '${params.contactIdentifier.replace(/'/g, "''")}',
        ${params.contactName ? `'${params.contactName.replace(/'/g, "''")}'` : "NULL"},
        '${params.channel}',
        '${summary.replace(/'/g, "''")}',
        '${JSON.stringify(keyFacts).replace(/'/g, "''")}',
        NOW()
      )
      ON CONFLICT DO NOTHING
    `);

    logger.info("[AIMemory] Interaction saved", {
      tenantId: params.tenantId,
      contact: params.contactIdentifier,
      channel: params.channel,
    });
  } catch (err) {
    logger.error("[AIMemory] Failed to save memory", { err });
  }
}

/**
 * Supprime toutes les mémoires d'un contact (RGPD - droit à l'oubli)
 */
export async function deleteContactMemory(
  tenantId: number,
  contactIdentifier: string
): Promise<number> {
  try {
    await ensureMemoryTableExists();
    const { db } = await getMemoryTable();

    const result = await (db as DrizzleDb).execute(`
      DELETE FROM ai_memories
      WHERE tenant_id = ${tenantId}
        AND contact_identifier = '${contactIdentifier.replace(/'/g, "''")}'
      RETURNING id
    `);

    const count = (result.rows ?? result ?? []).length;
    logger.info("[AIMemory] RGPD deletion completed", { tenantId, contactIdentifier, count });
    return count;
  } catch (err) {
    logger.error("[AIMemory] Failed to delete memory", { err });
    return 0;
  }
}

/**
 * Purge les mémoires plus vieilles que N jours (RGPD rétention)
 */
export async function purgeOldMemories(
  tenantId: number,
  retentionDays: number = 365
): Promise<number> {
  try {
    await ensureMemoryTableExists();
    const { db } = await getMemoryTable();

    const result = await (db as DrizzleDb).execute(`
      DELETE FROM ai_memories
      WHERE tenant_id = ${tenantId}
        AND interaction_date < NOW() - INTERVAL '${retentionDays} days'
      RETURNING id
    `);

    const count = (result.rows ?? result ?? []).length;
    logger.info("[AIMemory] Old memories purged", { tenantId, retentionDays, count });
    return count;
  } catch (err) {
    logger.error("[AIMemory] Failed to purge old memories", { err });
    return 0;
  }
}

// ─────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────

async function generateMemorySummary(
  transcript: string,
  tenantId: number,
  channel: string
): Promise<{ summary: string; keyFacts: MemoryEntry["keyFacts"] }> {
  try {
    const response = await invokeLLM(tenantId, {
      model: AI_MODEL.DEFAULT,
      messages: [
        {
          role: "system",
          content: `Tu es un assistant qui crée des résumés concis d'interactions client pour la mémoire IA.
Réponds UNIQUEMENT en JSON valide.` as any,
        },
        {
          role: "user",
          content: `Résume cette interaction ${channel} en 2-3 phrases max et extrais les faits clés.

TRANSCRIPT :
${transcript.slice(0, 2000)}

Réponds en JSON :
{
  "summary": "Résumé court de ce qui s'est passé",
  "keyFacts": {
    "preferences": ["préférence détectée si applicable"],
    "issues": ["problème mentionné si applicable"],
    "promises": ["promesse faite si applicable"],
    "sentiment": "positive|neutral|negative",
    "language": "fr|ar|en|dar|tun|alg",
    "lastOutcome": "résultat court (ex: RDV pris, problème résolu, rappel demandé)"
  }
}` as any,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 400,
    });

    const raw = (response as any).choices[0]?.message?.content as string ?? "{}";
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary ?? "Interaction enregistrée",
      keyFacts: parsed.keyFacts ?? {},
    };
  } catch (err) {
    logger.warn("[AIMemory] LLM summary failed, using fallback", { err });
    return {
      summary: `Interaction ${channel} — résumé non disponible`,
      keyFacts: {},
    };
  }
}

function buildMemoryPrompt(
  contactName: string | undefined,
  recentSummaries: string[],
  keyFacts: MemoryEntry["keyFacts"]
): string {
  if (recentSummaries.length === 0) return "";

  const lines: string[] = [
    `\n---MÉMOIRE CLIENT---`,
    contactName ? `Contact : ${contactName}` : "",
    `Historique récent :`,
    ...recentSummaries.map((s) => `  • ${s}`),
  ];

  if (keyFacts.preferences?.length) {
    lines.push(`Préférences : ${keyFacts.preferences.join(", ")}`);
  }
  if (keyFacts.issues?.length) {
    lines.push(`Problèmes connus : ${keyFacts.issues.join(", ")}`);
  }
  if (keyFacts.promises?.length) {
    lines.push(`Engagements pris : ${keyFacts.promises.join(", ")}`);
  }
  if (keyFacts.sentiment) {
    lines.push(`Humeur dernière interaction : ${keyFacts.sentiment}`);
  }
  if (keyFacts.language && keyFacts.language !== "fr") {
    lines.push(`Langue préférée : ${keyFacts.language}`);
  }

  lines.push(
    `INSTRUCTION : Utilise ce contexte pour personnaliser ta réponse. ` +
    `Fais référence naturellement aux interactions passées si pertinent.`,
    `---FIN MÉMOIRE---\n`
  );

  return lines.filter(Boolean).join("\n");
}
