/**
 * BLOC 3 - AI Suggestions Router
 * Expose les fonctionnalités du Shadow Agent au frontend
 */

import { router } from "../_core/trpc";
import { z } from "zod";
import { ShadowAgentService } from "../services/shadowAgentService";
import { tenantProcedure } from "../procedures";
import { TRPCError } from "@trpc/server";

export const aiSuggestionsRouter = router({
  /**
   * Récupérer les suggestions en attente
   */
  getPending: tenantProcedure
    .input(z.object({
    }))
    .query(async ({ input }) => {
      try {
        return await ShadowAgentService.getPendingSuggestions(ctx.tenantId);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error instanceof Error ? error.message : String(error)) || "Erreur lors de la récupération des suggestions",
        });
      }
    }),

  /**
   * Déclencher la détection d'appels manqués
   */
  detectMissedCalls: tenantProcedure
    .input(z.object({
    }))
    .mutation(async ({ input }) => {
      try {
        return await ShadowAgentService.detectMissedCallsAndSuggest(ctx.tenantId);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error instanceof Error ? error.message : String(error)) || "Erreur lors de la détection",
        });
      }
    }),

  /**
   * Approuver une suggestion
   */
  approve: tenantProcedure
    .input(z.object({
      suggestionId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ShadowAgentService.approveSuggestion(
          input.suggestionId,
          ctx.tenantId,
          ctx.user.id
        );
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error instanceof Error ? error.message : String(error)) || "Erreur lors de l'approbation",
        });
      }
    }),

  /**
   * Rejeter une suggestion
   */
  reject: tenantProcedure
    .input(z.object({
      suggestionId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ShadowAgentService.rejectSuggestion(
          input.suggestionId,
          ctx.tenantId,
          ctx.user.id
        );
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error instanceof Error ? error.message : String(error)) || "Erreur lors du rejet",
        });
      }
    }),

  /**
   * Modifier une suggestion
   */
  modify: tenantProcedure
    .input(z.object({
      suggestionId: z.number(),
      newContent: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      try {
        return await ShadowAgentService.modifySuggestion(
          input.suggestionId,
          ctx.tenantId,
          input.newContent
        );
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error instanceof Error ? error.message : String(error)) || "Erreur lors de la modification",
        });
      }
    }),
});
