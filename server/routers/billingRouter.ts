import { z } from "zod";
import { router, tenantProcedure } from "../_core/trpc";
import { adminProcedure } from "../procedures";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { logger } from "../infrastructure/logger";
import { 
  subscriptionSchema, 
  invoiceSchema,
  // billingInfoSchema retiré : non utilisé dans ce router (TS6133)
  usageStatsSchema
} from "../../shared/validators/billing";

export const billingRouter = router({
  /**
   * Récupère l'abonnement actuel du tenant
   */
  // ✅ BLOC 1: tenantId supprimé du schéma — ctx.tenantId utilisé
  getSubscription: tenantProcedure
    .output(z.object({ subscription: subscriptionSchema.nullable() }))
    .query(async ({ ctx }) => {
      try {
        // BUG-R3 FIX: ctx.tenantId est garanti non-null par tenantProcedure.
        // Le fallback ?? ctx.tenantId était dangereux : un client pourrait injecter un tenantId arbitraire.
        const tenantIdToUse = ctx.tenantId;
        const subscription = await db.getSubscriptionByTenant(tenantIdToUse);
        return { subscription: subscription ? subscriptionSchema.parse(subscription) : null };
      } catch (error: any) {
        logger.error("[BillingRouter] Failed to get subscription", { error });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get subscription" });
      }
    }),

  /**
   * Récupère les factures du tenant
   */
  // ✅ BLOC 1: tenantId supprimé du schéma — ctx.tenantId utilisé
  getInvoices: tenantProcedure
    .output(z.object({ invoices: z.array(invoiceSchema) }))
    .query(async ({ ctx }) => {
      try {
        // BUG-R3 FIX: ctx.tenantId est garanti non-null par tenantProcedure.
        const tenantIdToUse = ctx.tenantId;
        const invoices = await db.getInvoicesByTenant(tenantIdToUse);
        return { invoices: z.array(invoiceSchema).parse(invoices) };
      } catch (error: any) {
        logger.error("[BillingRouter] Failed to get invoices", { error });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get invoices" });
      }
    }),

  /**
   * Récupère les statistiques d'utilisation
   */
  getUsageStats: tenantProcedure
    .input(z.object({ days: z.number().default(30) }))
    .output(usageStatsSchema)
    .query(async ({ ctx: _ctx }) => {
      try {
        // Simulation de statistiques pour l'exemple
        const stats = {
          totalCalls: 150,
          callsInPeriod: 45,
          totalDuration: 450,
          averageDuration: 10,
          plan: "Pro",
          callsIncluded: 1000,
          callsRemaining: 955,
          usagePercentage: 4.5,
        };
        return usageStatsSchema.parse(stats);
      } catch (error: any) {
        logger.error("[BillingRouter] Failed to get usage stats", { error });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get usage stats" });
      }
    }),

  /**
   * Crée une session portail Stripe
   */
  createPortalSession: adminProcedure
    .input(z.object({
      tenantId: z.number(),
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      return { url: input.returnUrl + "?portal=success" };
    }),

  /**
   * Crée un lien de paiement
   */
  createPaymentLink: adminProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(async ({ input: _input }) => {
      return { url: "https://checkout.stripe.com/pay/test" };
    }),
});
