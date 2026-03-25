/**
 * BYOK Router - Bring Your Own Key
 * Endpoints tRPC pour gérer les clés API centralisées
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  saveAPIKey,
  getAPIKey,
  listAPIKeys,
  deleteAPIKey,
  testAPIKey,
  getAuditLogs,
} from "../services/byokService";

export const byokRouter = router({
  /**
   * Sauvegarder ou mettre à jour une clé API
   */
  saveKey: protectedProcedure
    .input(
      z.object({
        provider: z.string().min(1),
        key: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.user?.id || 1;
      return await saveAPIKey(tenantId, input.provider, input.key);
    }),

  /**
   * Récupérer une clé API (déchiffrée)
   */
  getKey: protectedProcedure
    .input(z.object({ provider: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.user?.id || 1;
      const key = await getAPIKey(tenantId, input.provider);
      return { key: key || null };
    }),

  /**
   * Lister toutes les clés API (sans les valeurs)
   */
  listKeys: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.user?.tenantId || ctx.user?.id || 1;
    return await listAPIKeys(tenantId);
  }),

  /**
   * Supprimer une clé API
   */
  deleteKey: protectedProcedure
    .input(z.object({ provider: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.user?.id || 1;
      const success = await deleteAPIKey(tenantId, input.provider);
      return { success, message: success ? "Key deleted" : "Failed to delete key" };
    }),

  /**
   * Tester une clé API
   */
  testKey: protectedProcedure
    .input(
      z.object({
        provider: z.string().min(1),
        key: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await testAPIKey(input.provider, input.key);
    }),

  /**
   * Récupérer les logs d'audit
   */
  getAuditLogs: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.user?.tenantId || ctx.user?.id || 1;
    return await getAuditLogs(tenantId, 100);
  }),
});
