/**
 * STRIPE CONNECT SERVICE
 * Gestion des connexions OAuth Stripe Connect pour les tenants
 */

import { logger } from "../infrastructure/logger";
import { getDbInstance } from "../db";
import { tenants } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface StripeConnectTokens {
  access_token: string;
  refresh_token?: string;
  stripe_user_id: string;
  scope?: string;
  livemode?: boolean;
}

/**
 * Échange un code OAuth Stripe contre des tokens d'accès
 */
export async function exchangeOAuthCode(code: string): Promise<StripeConnectTokens> {
  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeSecretKey) {
    throw new Error("[StripeConnect] STRIPE_SECRET_KEY manquante");
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
  });

  const response = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error("[StripeConnect] OAuth exchange failed", { status: response.status, errorBody });
    throw new Error(`[StripeConnect] OAuth exchange failed: ${errorBody}`);
  }

  const tokens = await response.json() as StripeConnectTokens;
  logger.info("[StripeConnect] OAuth exchange successful", { stripeUserId: tokens.stripe_user_id });
  return tokens;
}

/**
 * Sauvegarde les informations de connexion Stripe Connect d'un tenant
 */
export async function saveTenantStripeConnect(
  tenantId: number,
  tokens: StripeConnectTokens
): Promise<void> {
  const db = getDbInstance();
  try {
    await db
      .update(tenants)
      .set({
        stripeAccountId: tokens.stripe_user_id,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    logger.info("[StripeConnect] Tenant Stripe Connect saved", {
      tenantId,
      stripeUserId: tokens.stripe_user_id,
    });
  } catch (error: any) {
    logger.error("[StripeConnect] Failed to save tenant Stripe Connect", { error, tenantId });
    throw error;
  }
}
