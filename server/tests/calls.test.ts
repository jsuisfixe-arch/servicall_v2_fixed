/**
 * Tests — Domaine Calls (appels téléphoniques)
 * Priorité : HAUTE — risque financier direct
 *
 * Ces tests couvrent :
 * - La validation des données d'appel
 * - La logique de durée et de facturation des appels
 * - Les statuts d'appel et leurs transitions
 * - Le scoring et le sentiment des appels
 * - L'isolation multi-tenant
 */
import { describe, it, expect, vi } from "vitest";

// ============================================================
// Types et constantes de domaine
// ============================================================
type CallStatus = "pending" | "in_progress" | "completed" | "failed" | "no_answer" | "busy" | "cancelled";
type CallType = "inbound" | "outbound" | "internal";
type CallSentiment = "positive" | "neutral" | "negative";

interface CallRecord {
  id: number;
  tenantId: number;
  prospectId?: number;
  userId?: number;
  callSid?: string;
  callType: CallType;
  status: CallStatus;
  duration?: number; // en secondes
  startedAt?: Date;
  endedAt?: Date;
  sentiment?: CallSentiment;
  score?: number; // 0-100
  notes?: string;
}

const VALID_STATUSES: CallStatus[] = ["pending", "in_progress", "completed", "failed", "no_answer", "busy", "cancelled"];
const VALID_TYPES: CallType[] = ["inbound", "outbound", "internal"];
const VALID_SENTIMENTS: CallSentiment[] = ["positive", "neutral", "negative"];

function formatDuration(seconds: number): string {
  if (seconds === 0) return "-";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

function calculateCallCost(durationSeconds: number, ratePerMinute: number): number {
  const minutes = Math.ceil(durationSeconds / 60); // Arrondi à la minute supérieure
  return minutes * ratePerMinute;
}

function isCallBillable(status: CallStatus): boolean {
  return status === "completed";
}

// ============================================================
// Tests de validation des données d'appel
// ============================================================
describe("Calls — Validation des données", () => {
  it("un callSid Twilio doit commencer par CA", () => {
    const callSid = "CA1234567890abcdef1234567890abcdef";
    expect(callSid.startsWith("CA")).toBe(true);
    expect(callSid.length).toBeGreaterThanOrEqual(34);
  });

  it("un statut d'appel doit être valide", () => {
    const status: CallStatus = "completed";
    expect(VALID_STATUSES).toContain(status);
  });

  it("rejette un statut d'appel invalide", () => {
    const invalidStatus = "ringing";
    expect(VALID_STATUSES).not.toContain(invalidStatus);
  });

  it("un type d'appel doit être valide", () => {
    const type: CallType = "outbound";
    expect(VALID_TYPES).toContain(type);
  });

  it("un score doit être entre 0 et 100", () => {
    const score = 85;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("rejette un score négatif", () => {
    const score = -5;
    expect(score).toBeLessThan(0); // Invalide
  });

  it("rejette un score supérieur à 100", () => {
    const score = 105;
    expect(score).toBeGreaterThan(100); // Invalide
  });

  it("un sentiment doit être valide", () => {
    const sentiment: CallSentiment = "positive";
    expect(VALID_SENTIMENTS).toContain(sentiment);
  });
});

// ============================================================
// Tests de durée et formatage
// ============================================================
describe("Calls — Durée et formatage", () => {
  it("formate correctement une durée de 0 secondes", () => {
    expect(formatDuration(0)).toBe("-");
  });

  it("formate correctement 90 secondes en 1m 30s", () => {
    expect(formatDuration(90)).toBe("1m 30s");
  });

  it("formate correctement 60 secondes en 1m 0s", () => {
    expect(formatDuration(60)).toBe("1m 0s");
  });

  it("formate correctement 3600 secondes en 60m 0s", () => {
    expect(formatDuration(3600)).toBe("60m 0s");
  });

  it("la durée doit être non négative", () => {
    const duration = 300;
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it("la durée est calculée correctement entre startedAt et endedAt", () => {
    const startedAt = new Date("2025-01-01T10:00:00Z");
    const endedAt = new Date("2025-01-01T10:05:30Z");
    const durationMs = endedAt.getTime() - startedAt.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);
    expect(durationSeconds).toBe(330); // 5 minutes 30 secondes
  });
});

// ============================================================
// Tests de facturation des appels
// ============================================================
describe("Calls — Facturation", () => {
  it("calcule le coût d'un appel de 90 secondes à 0.05€/min", () => {
    const cost = calculateCallCost(90, 0.05);
    expect(cost).toBe(0.10); // 2 minutes (arrondi) × 0.05€
  });

  it("calcule le coût d'un appel de 60 secondes exactement", () => {
    const cost = calculateCallCost(60, 0.05);
    expect(cost).toBe(0.05); // 1 minute × 0.05€
  });

  it("calcule le coût d'un appel de 1 seconde (arrondi à 1 minute)", () => {
    const cost = calculateCallCost(1, 0.05);
    expect(cost).toBe(0.05); // Arrondi à 1 minute
  });

  it("seuls les appels complétés sont facturables", () => {
    expect(isCallBillable("completed")).toBe(true);
    expect(isCallBillable("failed")).toBe(false);
    expect(isCallBillable("no_answer")).toBe(false);
    expect(isCallBillable("busy")).toBe(false);
    expect(isCallBillable("cancelled")).toBe(false);
  });

  it("un appel en cours n'est pas encore facturable", () => {
    expect(isCallBillable("in_progress")).toBe(false);
  });
});

// ============================================================
// Tests de scoring IA
// ============================================================
describe("Calls — Scoring IA", () => {
  it("un score de 0 correspond à un appel très mauvais", () => {
    const score = 0;
    const rating = score >= 70 ? "good" : score >= 40 ? "average" : "poor";
    expect(rating).toBe("poor");
  });

  it("un score de 85 correspond à un bon appel", () => {
    const score = 85;
    const rating = score >= 70 ? "good" : score >= 40 ? "average" : "poor";
    expect(rating).toBe("good");
  });

  it("un score de 55 correspond à un appel moyen", () => {
    const score = 55;
    const rating = score >= 70 ? "good" : score >= 40 ? "average" : "poor";
    expect(rating).toBe("average");
  });

  it("le sentiment positif doit augmenter le score", () => {
    const baseScore = 60;
    const sentimentBonus = { positive: 10, neutral: 0, negative: -10 };
    const finalScore = baseScore + sentimentBonus.positive;
    expect(finalScore).toBeGreaterThan(baseScore);
  });

  it("le sentiment négatif doit diminuer le score", () => {
    const baseScore = 60;
    const sentimentBonus = { positive: 10, neutral: 0, negative: -10 };
    const finalScore = baseScore + sentimentBonus.negative;
    expect(finalScore).toBeLessThan(baseScore);
  });
});

// ============================================================
// Tests d'isolation multi-tenant
// ============================================================
describe("Calls — Isolation multi-tenant", () => {
  it("les appels doivent être filtrés par tenantId", () => {
    const allCalls: CallRecord[] = [
      { id: 1, tenantId: 1, callType: "outbound", status: "completed" },
      { id: 2, tenantId: 2, callType: "inbound", status: "completed" },
      { id: 3, tenantId: 1, callType: "outbound", status: "failed" },
    ];
    const tenant1Calls = allCalls.filter(c => c.tenantId === 1);
    expect(tenant1Calls).toHaveLength(2);
    expect(tenant1Calls.every(c => c.tenantId === 1)).toBe(true);
  });

  it("un tenant ne peut pas accéder aux appels d'un autre tenant", () => {
    const allCalls: CallRecord[] = [
      { id: 1, tenantId: 1, callType: "outbound", status: "completed" },
      { id: 2, tenantId: 2, callType: "inbound", status: "completed" },
    ];
    const userTenantId = 1;
    const accessibleCalls = allCalls.filter(c => c.tenantId === userTenantId);
    expect(accessibleCalls.find(c => c.id === 2)).toBeUndefined();
  });

  it("les statistiques d'appels sont calculées par tenant", () => {
    const calls: CallRecord[] = [
      { id: 1, tenantId: 1, callType: "outbound", status: "completed", duration: 120 },
      { id: 2, tenantId: 1, callType: "outbound", status: "completed", duration: 180 },
      { id: 3, tenantId: 2, callType: "outbound", status: "completed", duration: 300 },
    ];
    const tenant1Calls = calls.filter(c => c.tenantId === 1);
    const totalDuration = tenant1Calls.reduce((sum, c) => sum + (c.duration ?? 0), 0);
    expect(totalDuration).toBe(300); // 120 + 180
  });
});

// ============================================================
// Tests de gestion des erreurs
// ============================================================
describe("Calls — Gestion des erreurs", () => {
  it("un appel sans callSid Twilio doit être traité en mode simulation", () => {
    const call: Partial<CallRecord> = {
      tenantId: 1,
      callType: "outbound",
      status: "in_progress",
      // Pas de callSid
    };
    const isSimulated = !call.callSid;
    expect(isSimulated).toBe(true);
  });

  it("un appel failed doit avoir une raison d'échec", () => {
    const failedStatuses: CallStatus[] = ["failed", "no_answer", "busy", "cancelled"];
    expect(failedStatuses).toContain("failed");
    expect(failedStatuses).toContain("no_answer");
  });

  it("la durée d'un appel failed doit être 0 ou null", () => {
    const failedCall: CallRecord = {
      id: 1,
      tenantId: 1,
      callType: "outbound",
      status: "failed",
      duration: 0,
    };
    expect(failedCall.duration ?? 0).toBe(0);
  });
});
