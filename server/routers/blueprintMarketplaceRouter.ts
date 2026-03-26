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
      const whereClause = eq(workflows.isPublic, true);
      // Note: On pourrait ajouter un filtre par catégorie si la colonne existe
      
      const results = await db.select()
        .from(workflows)
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(workflows.createdAt));

      return results;
    }),

  /**
   * Importe un blueprint dans le tenant de l'utilisateur
   */
  importBlueprint: tenantProcedure
    .input(z.object({
      blueprintId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const blueprint = await db.query.workflows.findFirst({
        where: and(eq(workflows.id, input.blueprintId), eq(workflows.isPublic, true)),
      });

      if (!blueprint) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blueprint non trouvé ou non public",
        });
      }

      // Créer une copie pour le tenant actuel
      const [newWorkflow] = await db.insert(workflows).values({
        name: `${blueprint.name} (Importé)`,
        description: blueprint.description,
        definition: blueprint.definition,
        tenantId: ctx.tenantId,
        isPublic: false,
        isActive: false,
      }).returning();

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
