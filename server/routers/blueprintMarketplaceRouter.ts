import { router, tenantProcedure, publicProcedure } from "../procedures";
import { z } from "zod";
import { db, workflows, tenants } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const blueprintMarketplaceRouter = router({
  /**
   * Liste tous les blueprints publics disponibles
   */
  listBlueprints: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      // ✅ FIX BUG #3: Utiliser blueprints.json au lieu de la DB
      const blueprints = await import("../../shared/blueprints.json").then(m => m.default);
      let filtered = blueprints;
      
      if (input.category) {
        filtered = blueprints.filter((b: any) => b.industry === input.category);
      }

      return filtered.slice(input.offset, input.offset + input.limit);
    }),

  /**
   * Importe un blueprint dans le tenant de l'utilisateur
   */
  importBlueprint: tenantProcedure
    .input(z.object({
      blueprintId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // ✅ FIX BUG #3: Utiliser blueprints.json au lieu de la DB
      const blueprints = await import("../../shared/blueprints.json").then(m => m.default);
      const blueprint = blueprints.find((b: any) => b.id === input.blueprintId);

      if (!blueprint) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blueprint non trouvé dans la bibliothèque",
        });
      }

      const { createWorkflow } = await import("../db");
      const newWorkflow = await createWorkflow({
        tenantId: ctx.tenantId,
        name: `${blueprint.name} (Importé)`,
        description: blueprint.description,
        triggerType: "event",
        actions: blueprint.actions,
      });

      return newWorkflow;
    }),

  /**
   * Publie un workflow du tenant vers la marketplace (nécessite admin)
   */
  publishToMarketplace: tenantProcedure
    .input(z.object({
      workflowId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.update(workflows)
        .set({ isPublic: true })
        .where(and(
          eq(workflows.id, input.workflowId),
          eq(workflows.tenantId, ctx.tenantId)
        ))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow non trouvé ou accès refusé",
        });
      }

      return { success: true };
    }),
});
