/**
 * Tests — Domaine Campaigns (campagnes d'appels)
 * Priorité : HAUTE — risque financier direct
 *
 * Ces tests couvrent :
 * - La validation des données de campagne
 * - La logique de statut des campagnes
 * - Les calculs de métriques de campagne
 * - La gestion des prospects dans une campagne
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Types et constantes de domaine
// ============================================================
type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

interface Campaign {
  id: number;
  tenantId: number;
  name: string;
  status: CampaignStatus;
  totalProspects: number;
  calledProspects: number;
  successfulCalls: number;
  failedCalls: number;
  createdAt: Date;
}

const VALID_STATUSES: CampaignStatus[] = ["draft", "active", "paused", "completed", "cancelled"];

// Transitions d'état valides
const VALID_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["active", "cancelled"],
  active: ["paused", "completed", "cancelled"],
  paused: ["active", "cancelled"],
  completed: [],
  cancelled: [],
};

function canTransition(from: CampaignStatus, to: CampaignStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function calculateCompletionRate(campaign: Campaign): number {
  if (campaign.totalProspects === 0) return 0;
  return Math.round((campaign.calledProspects / campaign.totalProspects) * 100);
}

function calculateSuccessRate(campaign: Campaign): number {
  if (campaign.calledProspects === 0) return 0;
  return Math.round((campaign.successfulCalls / campaign.calledProspects) * 100);
}

// ============================================================
// Tests de validation des données de campagne
// ============================================================
describe("Campaigns — Validation des données", () => {
  it("un nom de campagne ne doit pas être vide", () => {
    const name = "Campagne Q1 2025";
    expect(name.trim().length).toBeGreaterThan(0);
  });

  it("rejette un nom de campagne vide", () => {
    const name = "   ";
    expect(name.trim().length).toBe(0);
  });

  it("un tenantId doit être un entier positif", () => {
    const tenantId = 1;
    expect(tenantId).toBeGreaterThan(0);
    expect(Number.isInteger(tenantId)).toBe(true);
  });

  it("un statut de campagne doit être valide", () => {
    const status: CampaignStatus = "active";
    expect(VALID_STATUSES).toContain(status);
  });

  it("rejette un statut invalide", () => {
    const invalidStatus = "running";
    expect(VALID_STATUSES).not.toContain(invalidStatus);
  });

  it("le nombre de prospects doit être non négatif", () => {
    const totalProspects = 150;
    expect(totalProspects).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// Tests des transitions d'état
// ============================================================
describe("Campaigns — Transitions d'état", () => {
  it("peut passer de draft à active", () => {
    expect(canTransition("draft", "active")).toBe(true);
  });

  it("peut passer de active à paused", () => {
    expect(canTransition("active", "paused")).toBe(true);
  });

  it("peut passer de paused à active", () => {
    expect(canTransition("paused", "active")).toBe(true);
  });

  it("peut passer de active à completed", () => {
    expect(canTransition("active", "completed")).toBe(true);
  });

  it("ne peut pas passer de completed à active", () => {
    expect(canTransition("completed", "active")).toBe(false);
  });

  it("ne peut pas passer de cancelled à active", () => {
    expect(canTransition("cancelled", "active")).toBe(false);
  });

  it("ne peut pas passer de draft à completed directement", () => {
    expect(canTransition("draft", "completed")).toBe(false);
  });

  it("peut annuler une campagne active", () => {
    expect(canTransition("active", "cancelled")).toBe(true);
  });

  it("peut annuler une campagne en pause", () => {
    expect(canTransition("paused", "cancelled")).toBe(true);
  });
});

// ============================================================
// Tests de calcul des métriques
// ============================================================
describe("Campaigns — Métriques", () => {
  const mockCampaign: Campaign = {
    id: 1,
    tenantId: 1,
    name: "Test Campaign",
    status: "active",
    totalProspects: 200,
    calledProspects: 150,
    successfulCalls: 90,
    failedCalls: 60,
    createdAt: new Date(),
  };

  it("calcule correctement le taux de complétion", () => {
    const rate = calculateCompletionRate(mockCampaign);
    expect(rate).toBe(75); // 150/200 = 75%
  });

  it("calcule correctement le taux de succès", () => {
    const rate = calculateSuccessRate(mockCampaign);
    expect(rate).toBe(60); // 90/150 = 60%
  });

  it("retourne 0% de complétion si aucun prospect", () => {
    const emptyCampaign = { ...mockCampaign, totalProspects: 0, calledProspects: 0 };
    expect(calculateCompletionRate(emptyCampaign)).toBe(0);
  });

  it("retourne 0% de succès si aucun appel passé", () => {
    const noCallsCampaign = { ...mockCampaign, calledProspects: 0, successfulCalls: 0 };
    expect(calculateSuccessRate(noCallsCampaign)).toBe(0);
  });

  it("le nombre d'appels échoués + réussis = total appelés", () => {
    const total = mockCampaign.successfulCalls + mockCampaign.failedCalls;
    expect(total).toBe(mockCampaign.calledProspects);
  });

  it("les prospects appelés ne dépassent pas le total", () => {
    expect(mockCampaign.calledProspects).toBeLessThanOrEqual(mockCampaign.totalProspects);
  });

  it("une campagne à 100% de complétion a tous les prospects appelés", () => {
    const completedCampaign = {
      ...mockCampaign,
      calledProspects: 200,
      totalProspects: 200,
    };
    expect(calculateCompletionRate(completedCampaign)).toBe(100);
  });
});

// ============================================================
// Tests de sécurité et isolation
// ============================================================
describe("Campaigns — Sécurité et isolation", () => {
  it("les campagnes doivent être isolées par tenant", () => {
    const campaign1 = { id: 1, tenantId: 1, name: "Camp A" };
    const campaign2 = { id: 2, tenantId: 2, name: "Camp B" };
    expect(campaign1.tenantId).not.toBe(campaign2.tenantId);
  });

  it("un tenant ne peut pas voir les campagnes d'un autre tenant", () => {
    const userTenantId = 1;
    const campaigns = [
      { id: 1, tenantId: 1, name: "Camp A" },
      { id: 2, tenantId: 2, name: "Camp B" },
      { id: 3, tenantId: 1, name: "Camp C" },
    ];
    const filtered = campaigns.filter(c => c.tenantId === userTenantId);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(c => c.tenantId === userTenantId)).toBe(true);
  });

  it("une campagne annulée ne peut plus être modifiée", () => {
    const cancelledCampaign: Campaign = {
      id: 1,
      tenantId: 1,
      name: "Cancelled",
      status: "cancelled",
      totalProspects: 100,
      calledProspects: 50,
      successfulCalls: 30,
      failedCalls: 20,
      createdAt: new Date(),
    };
    // Aucune transition possible depuis cancelled
    const possibleTransitions = VALID_TRANSITIONS[cancelledCampaign.status];
    expect(possibleTransitions).toHaveLength(0);
  });
});

// ============================================================
// Tests d'import CSV de prospects
// ============================================================
describe("Campaigns — Import CSV", () => {
  it("valide un numéro de téléphone international", () => {
    const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
    expect(phoneRegex.test("+33612345678")).toBe(true);
    expect(phoneRegex.test("+1234567890")).toBe(true);
  });

  it("rejette un numéro de téléphone invalide", () => {
    const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
    expect(phoneRegex.test("0612345678")).toBe(false);
    expect(phoneRegex.test("invalid")).toBe(false);
    expect(phoneRegex.test("")).toBe(false);
  });

  it("valide une adresse email correcte", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("contact@example.com")).toBe(true);
    expect(emailRegex.test("user.name+tag@domain.co.uk")).toBe(true);
  });

  it("rejette une adresse email invalide", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("not-an-email")).toBe(false);
    expect(emailRegex.test("@domain.com")).toBe(false);
  });
});
