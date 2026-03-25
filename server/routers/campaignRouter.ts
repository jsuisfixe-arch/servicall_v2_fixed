import { router } from "../_core/trpc";
import { z } from "zod";
import { CampaignService } from "../services/campaignService";
import { TRPCError } from "@trpc/server";
import { tenantProcedure, managerProcedure } from "../procedures";
import { normalizeResponse, normalizeDbRecords } from "../_core/responseNormalizer";
import { dialerEngine } from "../services/dialer/dialer-engine";
import { paginationInput, paginate } from "../_core/pagination";
import * as db from "../db";
import { count, eq } from "drizzle-orm";

export const campaignRouter = router({
  /**
   * List all campaigns for a tenant with pagination
   * ✅ Bloc 3: Performance optimisée
   */
  list: tenantProcedure
    .input(paginationInput)
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      const [campaigns, totalResult] = await Promise.all([
        CampaignService.getCampaigns(ctx.tenantId, {
          limit,
          offset,
        }),
        db.db.select({ value: count() })
          .from(db.campaigns)
          .where(eq(db.campaigns.tenantId, ctx.tenantId))
      ]);

      const normalizedData = normalizeDbRecords(campaigns);
      return paginate(normalizedData, totalResult[0]?.value ?? 0, input);
    }),

  /**
   * Create a new campaign
   */
  create: managerProcedure
    .input(z.object({
      tenantId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      activityType: z.string().optional(),
      type: z.enum(["ai_qualification", "human_appointment", "hybrid_reception"]).optional().default("ai_qualification"),
      config: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const campaignData = {
          name: input.name,
          description: input.description,
          type: input.type,
          activityType: input.activityType ?? "prospection",
          tenantId: ctx.tenantId,
          status: "active",
          details: input.config || {},
        };

        const campaign = await CampaignService.createCampaign(campaignData);
        return normalizeResponse(campaign, 'campaign.create');
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create campaign",
        });
      }
    }),
  /**
   * Ajouter des prospects à une campagne (depuis la liste CRM)
   */
  addProspects: managerProcedure
    .input(z.object({
      campaignId: z.number(),
      prospectIds: z.array(z.number()).min(1),
    }))
    .mutation(async ({ input }) => {
      const added = await CampaignService.addProspects(input.campaignId, input.prospectIds);
      return { success: true, added: added.length, message: `${added.length} prospect(s) ajouté(s)` };
    }),

  /**
   * Changer le statut d'une campagne (pause, reprise, arrêt)
   */
  updateStatus: managerProcedure
    .input(z.object({
      campaignId: z.number(),
      status: z.enum(["draft", "ready", "active", "paused", "completed"]),
    }))
    .mutation(async ({ input }) => {
      await CampaignService.updateStatus(input.campaignId, input.status);
      return { success: true };
    }),

  /**
   * Récupérer les prospects d'une campagne
   */
  getProspects: tenantProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const prospects = await CampaignService.getCampaignProspects(input.campaignId);
      return { success: true, data: prospects };
    }),

  // ─── Predictive Dialer ────────────────────────────────────────────────────

  /**
   * Démarrer une campagne d'appels prédictifs
   */
  startDialer: managerProcedure
    .input(z.object({
      campaignId: z.number(),
      pacingRatio: z.number().min(0.5).max(5).default(1),
      maxAttempts: z.number().min(1).max(5).default(3),
      retryDelayMs: z.number().min(60_000).max(3_600_000).default(300_000),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await dialerEngine.startCampaign(
        input.campaignId,
        ctx.tenantId,
        { pacingRatio: input.pacingRatio, maxAttempts: input.maxAttempts, retryDelayMs: input.retryDelayMs }
      );
      return { success: true, ...result };
    }),

  /**
   * Arrêter une campagne d'appels
   */
  stopDialer: managerProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await dialerEngine.stopCampaign(input.campaignId, ctx.tenantId);
      return { success: true };
    }),

  /**
   * Statut temps réel d'une campagne
   */
  dialerStatus: tenantProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input, ctx }) => {
      const status = await dialerEngine.getCampaignStatus(input.campaignId, ctx.tenantId);
      return { success: true, data: status };
    }),

});
