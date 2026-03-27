import { z } from "zod";
import { router } from "../_core/trpc";
import { adminProcedure, tenantProcedure } from "../procedures";
import {
  forceHumanAgent,
  forceAIAgent,
  forceBothMode,
  getAgentType,
  getAgentSwitchHistory,
  getTenantAgentSwitchHistory,
} from "../services/agentSwitchService";
import { logger } from "../infrastructure/logger";
import { TRPCError } from "@trpc/server";

/**
 * Router pour la gestion de la bascule Agent IA ↔ Agent Humain
 * ✅ BLOC 1: Toutes les procédures tenant-spécifiques utilisent tenantProcedure
 * ✅ BLOC 1: tenantId retiré des schémas d'entrée — ctx.tenantId utilisé exclusivement
 */
export const agentSwitchRouter = router({
  /**
   * Force la bascule vers un agent humain
   */
  forceHuman: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
        callId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await forceHumanAgent(
          input.userId,
          ctx.tenantId,
          ctx.user.id,
          input.reason,
          input.callId
        );

        logger.info("[AgentSwitchRouter] Forced human agent", {
          userId: input.userId,
          triggeredBy: ctx.user.id,
          tenantId: ctx.tenantId,
        });

        return {
          success: true,
          message: "Agent switched to HUMAN successfully",
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        logger.error("[AgentSwitchRouter] Failed to force human agent", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to switch to human agent",
        });
      }
    }),

  /**
   * Force la bascule vers un agent IA
   */
  forceAI: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
        callId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await forceAIAgent(
          input.userId,
          ctx.tenantId,
          ctx.user.id,
          input.reason,
          input.callId
        );

        logger.info("[AgentSwitchRouter] Forced AI agent", {
          userId: input.userId,
          triggeredBy: ctx.user.id,
          tenantId: ctx.tenantId,
        });

        return {
          success: true,
          message: "Agent switched to AI successfully",
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        logger.error("[AgentSwitchRouter] Failed to force AI agent", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to switch to AI agent",
        });
      }
    }),

  /**
   * ✅ FIX — Active le mode BOTH : agent humain + copilot IA simultané
   */
  forceBoth: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
        callId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await forceBothMode(
          input.userId,
          ctx.tenantId,
          ctx.user.id,
          input.reason,
          input.callId
        );

        logger.info("[AgentSwitchRouter] Forced BOTH mode (human + AI copilot)", {
          userId: input.userId,
          triggeredBy: ctx.user.id,
          tenantId: ctx.tenantId,
        });

        return {
          success: true,
          message: "Agent switched to BOTH (human + AI copilot) successfully",
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        logger.error("[AgentSwitchRouter] Failed to force BOTH mode", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to switch to BOTH mode",
        });
      }
    }),

  /**
   * Récupère le type d'agent actuel d'un utilisateur
   */
  getAgentType: tenantProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const agentType = await getAgentType(input.userId);

        return {
          userId: input.userId,
          agentType: agentType ?? "AI",
        };
      } catch (error: any) {
        logger.error("[AgentSwitchRouter] Failed to get agent type", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get agent type",
        });
      }
    }),

  /**
   * Récupère l'historique des bascules pour un utilisateur
   */
  getUserHistory: tenantProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getAgentSwitchHistory(input.userId, input.limit);

        return {
          userId: input.userId,
          history,
        };
      } catch (error: any) {
        logger.error("[AgentSwitchRouter] Failed to get user history", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get switch history",
        });
      }
    }),

  /**
   * Récupère la configuration actuelle de l'agent switch pour un tenant
   * ✅ BLOC 1: tenantId retiré du schéma — ctx.tenantId utilisé
   */
  getConfig: tenantProcedure
    .query(async ({ ctx }) => {
      try {
        const tenantId = ctx.tenantId;
        const agentType = await getAgentType(tenantId);
        const history = await getTenantAgentSwitchHistory(tenantId, 10);
        // Récupérer la config avancée si disponible
        let aiAutomationRate = 80;
        let escalationThreshold = 50;
        try {
          const { getDbInstance } = await import("../db");
          const { tenantSettings } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db = getDbInstance();
          const [config] = await db
            .select()
            .from(tenantSettings)
            .where(eq(tenantSettings.tenantId, tenantId))
            .limit(1);
          if (config) {
            const settings = config.agentSwitchSettings as Record<string, unknown> | null;
            if (settings) {
              if (typeof settings["aiAutomationRate"] === "number") aiAutomationRate = settings["aiAutomationRate"];
              if (typeof settings["escalationThreshold"] === "number") escalationThreshold = settings["escalationThreshold"];
            }
          }
        } catch {
          // Utiliser les valeurs par défaut si la config n'est pas disponible
        }

        return {
          tenantId,
          currentMode: agentType,
          isAIEnabled: agentType?.toLowerCase() === 'ai',
          recentHistory: history,
          aiAutomationRate,
          escalationThreshold,
        };
      } catch (error: any) {
        logger.error('[AgentSwitchRouter] Failed to get config', { error });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get agent switch config',
        });
      }
    }),

  /**
   * Récupère l'historique des bascules pour un tenant (admin only)
   * ✅ BLOC 1: tenantId retiré du schéma — ctx.tenantId utilisé
   */
  getTenantHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const history = await getTenantAgentSwitchHistory(ctx.tenantId, input.limit);

        return {
          tenantId: ctx.tenantId,
          history,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        logger.error("[AgentSwitchRouter] Failed to get tenant history", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get tenant switch history",
        });
      }
    }),
});
