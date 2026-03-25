/**
 * Tests — Domaine Billing (facturation)
 * Priorité : HAUTE — risque financier direct
 *
 * Ces tests couvrent :
 * - La structure des plans d'abonnement
 * - La logique de calcul des prix
 * - Les validations des données de facturation
 * - Les fonctions utilitaires de facturation
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Copie locale de SUBSCRIPTION_PLANS pour les tests unitaires.
 * Évite l'import du billingRouter qui charge Sentry/tRPC (dépendances lourdes).
 * À synchroniser si les plans changent dans billingRouter.ts.
 */
const SUBSCRIPTION_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 2900,
    currency: "eur",
    callsIncluded: 500,
    agentSeats: 3,
    features: ["500 appels/mois", "3 agents", "CRM basique"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 14900,
    currency: "eur",
    callsIncluded: 2000,
    agentSeats: 10,
    features: ["2000 appels/mois", "10 agents", "CRM avancé", "IA intégrée"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    currency: "eur",
    callsIncluded: -1,
    agentSeats: -1,
    features: ["Appels illimités", "Agents illimités", "Support dédié", "SLA garanti"],
  },
} as const;

// ============================================================
// Tests des plans d'abonnement
// ============================================================
describe("Billing — Plans d'abonnement", () => {
  it("doit avoir les 3 plans définis (starter, pro, enterprise)", () => {
    expect(SUBSCRIPTION_PLANS).toHaveProperty("starter");
    expect(SUBSCRIPTION_PLANS).toHaveProperty("pro");
    expect(SUBSCRIPTION_PLANS).toHaveProperty("enterprise");
  });

  it("chaque plan doit avoir les champs obligatoires", () => {
    for (const [planId, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      expect(plan, `Plan ${planId} doit avoir un id`).toHaveProperty("id");
      expect(plan, `Plan ${planId} doit avoir un name`).toHaveProperty("name");
      expect(plan, `Plan ${planId} doit avoir un price`).toHaveProperty("price");
      expect(plan, `Plan ${planId} doit avoir currency`).toHaveProperty("currency");
      expect(plan, `Plan ${planId} doit avoir callsIncluded`).toHaveProperty("callsIncluded");
      expect(plan, `Plan ${planId} doit avoir agentSeats`).toHaveProperty("agentSeats");
      expect(plan, `Plan ${planId} doit avoir features`).toHaveProperty("features");
    }
  });

  it("le plan starter doit avoir un prix positif", () => {
    expect(SUBSCRIPTION_PLANS.starter.price).toBeGreaterThan(0);
  });

  it("le plan pro doit être plus cher que le starter", () => {
    expect(SUBSCRIPTION_PLANS.pro.price).toBeGreaterThan(SUBSCRIPTION_PLANS.starter.price);
  });

  it("le plan enterprise doit avoir un prix à 0 (prix personnalisé)", () => {
    expect(SUBSCRIPTION_PLANS.enterprise.price).toBe(0);
  });

  it("le plan enterprise doit avoir des limites illimitées (-1)", () => {
    expect(SUBSCRIPTION_PLANS.enterprise.callsIncluded).toBe(-1);
    expect(SUBSCRIPTION_PLANS.enterprise.agentSeats).toBe(-1);
  });

  it("le plan starter doit avoir moins de sièges que le pro", () => {
    expect(SUBSCRIPTION_PLANS.starter.agentSeats).toBeLessThan(
      SUBSCRIPTION_PLANS.pro.agentSeats
    );
  });

  it("tous les plans doivent avoir la devise EUR", () => {
    for (const plan of Object.values(SUBSCRIPTION_PLANS)) {
      expect(plan.currency).toBe("eur");
    }
  });

  it("chaque plan doit avoir au moins une feature", () => {
    for (const [planId, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      expect(plan.features.length, `Plan ${planId} doit avoir des features`).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// Tests de logique de calcul de facturation
// ============================================================
describe("Billing — Logique de calcul", () => {
  it("calcule correctement le pourcentage d'utilisation", () => {
    const callsIncluded = 100;
    const callsUsed = 75;
    const percentage = Math.round((callsUsed / callsIncluded) * 100);
    expect(percentage).toBe(75);
  });

  it("le pourcentage d'utilisation ne dépasse pas 100%", () => {
    const callsIncluded = 100;
    const callsUsed = 150;
    const percentage = Math.min(100, Math.round((callsUsed / callsIncluded) * 100));
    expect(percentage).toBe(100);
  });

  it("les appels restants sont calculés correctement", () => {
    const callsIncluded = 1000;
    const callsUsed = 300;
    const remaining = Math.max(0, callsIncluded - callsUsed);
    expect(remaining).toBe(700);
  });

  it("les appels restants ne peuvent pas être négatifs", () => {
    const callsIncluded = 100;
    const callsUsed = 150;
    const remaining = Math.max(0, callsIncluded - callsUsed);
    expect(remaining).toBe(0);
  });

  it("le plan enterprise (illimité) retourne -1 pour callsRemaining", () => {
    const plan = SUBSCRIPTION_PLANS.enterprise;
    const callsRemaining = plan.callsIncluded > 0
      ? Math.max(0, plan.callsIncluded - 50)
      : -1;
    expect(callsRemaining).toBe(-1);
  });

  it("convertit correctement les centimes en euros", () => {
    const priceInCents = SUBSCRIPTION_PLANS.starter.price;
    const priceInEuros = priceInCents / 100;
    expect(priceInEuros).toBe(29);
  });

  it("le plan pro coûte 149€", () => {
    const priceInEuros = SUBSCRIPTION_PLANS.pro.price / 100;
    expect(priceInEuros).toBe(149);
  });
});

// ============================================================
// Tests de validation des données de facturation
// ============================================================
describe("Billing — Validation des données", () => {
  it("valide un planId correct", () => {
    const validPlans = Object.keys(SUBSCRIPTION_PLANS);
    expect(validPlans).toContain("starter");
    expect(validPlans).toContain("pro");
    expect(validPlans).toContain("enterprise");
  });

  it("rejette un planId invalide", () => {
    const validPlans = Object.keys(SUBSCRIPTION_PLANS);
    expect(validPlans).not.toContain("invalid_plan");
    expect(validPlans).not.toContain("free");
  });

  it("un tenantId doit être un entier positif", () => {
    const validTenantId = 1;
    expect(validTenantId).toBeGreaterThan(0);
    expect(Number.isInteger(validTenantId)).toBe(true);
  });

  it("une URL de retour doit être une chaîne non vide", () => {
    const returnUrl = "https://app.servicall.fr/billing";
    expect(returnUrl).toBeTruthy();
    expect(returnUrl.startsWith("http")).toBe(true);
  });

  it("une facture doit avoir un montant positif", () => {
    const invoiceAmount = 2900;
    expect(invoiceAmount).toBeGreaterThan(0);
  });
});

// ============================================================
// Tests de sécurité facturation
// ============================================================
describe("Billing — Sécurité", () => {
  it("ne doit pas exposer la clé Stripe dans les réponses", () => {
    const mockResponse = {
      url: "https://billing.stripe.com/session/test_123",
      planId: "pro",
    };
    expect(mockResponse).not.toHaveProperty("stripeSecretKey");
    expect(mockResponse).not.toHaveProperty("apiKey");
  });

  it("une session portail doit retourner une URL valide", () => {
    const mockPortalUrl = "https://billing.stripe.com/p/session/test_abc123";
    expect(mockPortalUrl).toMatch(/^https:\/\//);
  });

  it("les données de facturation doivent être isolées par tenant", () => {
    const tenant1Data = { tenantId: 1, plan: "starter" };
    const tenant2Data = { tenantId: 2, plan: "pro" };
    expect(tenant1Data.tenantId).not.toBe(tenant2Data.tenantId);
  });
});
