/**
 * WORKFLOW ENGINE ROUTER
 * Expose les fonctionnalités du nouveau moteur de workflow via tRPC
 */

import { z } from "zod";
import { router, managerProcedure } from "../procedures";
import { WorkflowEngine } from "../workflow-engine/core/WorkflowEngine";
import { Channel, EventType } from "../workflow-engine/types";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";
import { db, workflowDeadLetters, workflows } from "../db";
import { eq, and, desc } from "drizzle-orm";

const engine = new WorkflowEngine();

export const workflowEngineRouter = router({
  /**
   * Déclencher manuellement un workflow pour un prospect
   */
  triggerManual: managerProcedure
    .input(z.object({
      prospectId: z.number(),
      workflowName: z.string().optional(),
      variables: z.record(z.string(), z.any()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { getProspectById } = await import("../db");
        const prospect = await getProspectById(input.prospectId, ctx.tenantId);
        
        if (!prospect) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Prospect non trouvé" });
        }

        const event = {
          id: uuidv4(),
          tenant_id: ctx.tenantId,
          channel: Channel.WEBHOOK,
          type: EventType.MANUAL,
          source: 'UI_MANUAL',
          destination: '',
          data: {
            prospect,
            ...input.variables
          },
          metadata: {
            triggered_by: ctx.user.id
          },
          status: 'received',
          created_at: new Date()
        };

        const result = await engine.handle(event);

        return {
          success: true,
          execution: result
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Erreur lors du déclenchement du workflow"
        });
      }
    }),

  /**
   * Simuler un événement entrant (pour test/démo)
   */
  simulateEvent: managerProcedure
    .input(z.object({
      channel: z.nativeEnum(Channel),
      source: z.string(),
      data: z.record(z.string(), z.any())
    }))
    .mutation(async ({ input, ctx }) => {
      const event = {
        id: uuidv4(),
        tenant_id: ctx.tenantId,
        channel: input.channel,
        type: EventType.INBOUND,
        source: input.source,
        destination: '',
        data: input.data,
        metadata: { simulated: true },
        status: 'received',
        created_at: new Date()
      };

      return await engine.handle(event);
    }),

  /**
   * Lister les dead letters pour le tenant actuel
   */
  listDeadLetters: managerProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input, ctx }) => {
      return await db.select()
        .from(workflowDeadLetters)
        .where(eq(workflowDeadLetters.tenantId, ctx.tenantId))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(workflowDeadLetters.createdAt));
    }),

  /**
   * Retenter une dead letter
   */
  retryDeadLetter: managerProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      const deadLetter = await db.query.workflowDeadLetters.findFirst({
        where: and(
          eq(workflowDeadLetters.id, input.id),
          eq(workflowDeadLetters.tenantId, ctx.tenantId)
        ),
      });

      if (!deadLetter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dead letter non trouvée" });
      }

      // Marquer comme en cours de rejeu
      await db.update(workflowDeadLetters)
        .set({ status: 'retrying' })
        .where(eq(workflowDeadLetters.id, input.id));

      try {
        // Rejouer l'événement via le moteur
        const event = deadLetter.payload as any;
        await engine.handle(event);

        // Marquer comme résolu
        await db.update(workflowDeadLetters)
          .set({ status: 'resolved', resolvedAt: new Date() })
          .where(eq(workflowDeadLetters.id, input.id));

        return { success: true };
      } catch (error: any) {
        // Remettre en échec
        await db.update(workflowDeadLetters)
          .set({ status: 'failed', error: error.message })
          .where(eq(workflowDeadLetters.id, input.id));
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Échec du rejeu : " + error.message
        });
      }
    }),

  /**
   * Supprimer une dead letter
   */
  deleteDeadLetter: managerProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.delete(workflowDeadLetters)
        .where(and(
          eq(workflowDeadLetters.id, input.id),
          eq(workflowDeadLetters.tenantId, ctx.tenantId)
        ))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dead letter non trouvée" });
      }

      return { success: true };
    })
});
