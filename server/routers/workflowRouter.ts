import { z } from "zod";
import { router } from "../_core/trpc";
import { adminProcedure, managerProcedure, tenantProcedure } from "../_core/trpc";
import {
  getWorkflowExecutionHistory,
  getTenantWorkflowExecutionHistory,
} from "../services/workflowService";
import { logger } from "../infrastructure/logger";
import { TRPCError } from "@trpc/server";
import { normalizeResponse, normalizeDbRecords, normalizeDbRecord } from "../_core/responseNormalizer";
import { paginationInput, paginate } from "../_core/pagination";
import { count, eq, desc } from "drizzle-orm";
import { workflows } from "../../drizzle/schema";
import { 
  workflowSchema, 
  workflowExecutionSchema, 
  paginatedWorkflowSchema 
} from "../../shared/validators/workflow";
import type { Workflow, WorkflowExecution, PaginatedResponse } from "../../shared/types/workflow";

/**
 * Router pour la gestion et consultation des workflows IA
 * ✅ Bloc 4: Validation Runtime (Zod) - Sécurisation backend + frontend
 */
export const workflowRouter = router({
  /**
   * Liste tous les workflows d'un tenant
   */
  list: tenantProcedure
    .input(paginationInput)
    .output(paginatedWorkflowSchema)
    .query(async ({ ctx, input }): Promise<PaginatedResponse<Workflow>> => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;
      const { db } = await import("../db");
      
      if (!ctx.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const [data, totalResult] = await Promise.all([
        db.select().from(workflows)
          .where(eq(workflows.tenantId, ctx.tenantId))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(workflows.createdAt)),
        db.select({ value: count() })
          .from(workflows)
          .where(eq(workflows.tenantId, ctx.tenantId))
      ]);

      const normalizedData = normalizeDbRecords(data);
      const result = paginate(normalizedData, totalResult[0]?.value ?? 0, input);
      return paginatedWorkflowSchema.parse(result) as PaginatedResponse<Workflow>;
    }),

  /**
   * Récupère un workflow par son ID
   */
  getById: tenantProcedure
    .input(z.object({ workflowId: z.number() }))
    .output(workflowSchema)
    .query(async ({ input, ctx }): Promise<Workflow> => {
      const { getWorkflowById } = await import("../db");
      if (!ctx.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }
      const workflow = await getWorkflowById(input.workflowId, ctx.tenantId);
      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }
      const normalized = normalizeDbRecord(workflow);
      return workflowSchema.parse(normalized) as Workflow;
    }),

  /**
   * Crée un nouveau workflow
   */
  create: managerProcedure
    .input(
      z.object({
        // BUG-R5 FIX: tenantId supprimé de l'input — toujours issu de ctx.tenantId (garanti par tenantProcedure)
        name: z.string().min(1, "Le nom est requis"),
        description: z.string().optional(),
        industry: z.string().min(1, "Le métier est requis").default("generic"),
        // BUG-R4 FIX: triggerType validé contre l'enum réel du schéma Drizzle
        triggerType: z.enum(["manual", "scheduled", "event"]).optional().default("manual"),
        actions: z.array(z.any()).optional().default([]),
      })
    )
    .output(workflowSchema)
    .mutation(async ({ ctx, input }): Promise<Workflow> => {
      try {
        const { createWorkflow } = await import("../db");
        
        if (!ctx.tenantId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tenant ID is required",
          });
        }

        const workflow = await createWorkflow({
          tenantId: ctx.tenantId,
          name: input.name,
          description: input.description,
          triggerType: input.triggerType, // BUG-R4 FIX: type-safe, plus de as any
          actions: input.actions,
        });
        const normalized = normalizeDbRecord(workflow);
        return workflowSchema.parse(normalized) as Workflow;
      } catch (error: any) {
        logger.error("[WorkflowRouter] Create failed", { error });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la création du workflow",
        });
      }
    }),

  /**
   * Met à jour un workflow existant
   */
  update: managerProcedure
    .input(
      z.object({
        workflowId: z.number(),
        // BUG-R5 FIX: tenantId supprimé de l'input — toujours issu de ctx.tenantId
        name: z.string().optional(),
        description: z.string().optional(),
        triggerType: z.enum(["manual", "scheduled", "event"]).optional(),
        actions: z.array(z.any()).optional(),
        isActive: z.boolean().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .output(workflowSchema)
    .mutation(async ({ input, ctx }): Promise<Workflow> => {
      try {
        const { getWorkflowById, updateWorkflow } = await import("../db");
        const { workflowId, ...data } = input;
        
        if (!ctx.tenantId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tenant ID is required",
          });
        }

        const workflow = await getWorkflowById(workflowId, ctx.tenantId);
        if (!workflow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workflow non trouvé",
          });
        }

        const updated = await updateWorkflow(workflowId, ctx.tenantId, data);
        const normalized = normalizeDbRecord(updated);
        return workflowSchema.parse(normalized) as Workflow;
      } catch (error: any) {
        logger.error("[WorkflowRouter] Update failed", { error });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la mise à jour du workflow",
        });
      }
    }),

  /**
   * Supprime un workflow
   */
  delete: managerProcedure 
    .input(z.object({ 
      // BUG-R5 FIX: tenantId supprimé de l'input — toujours issu de ctx.tenantId
      workflowId: z.number() 
    }))
    .mutation(async ({ input, ctx }) => {
      const { getWorkflowById, deleteWorkflow } = await import("../db");
      if (!ctx.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }
      // Atomic: deleteWorkflow checks tenantId directly — no TOCTOU
      const result = await deleteWorkflow(input.workflowId, ctx.tenantId).catch(() => {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      });
      return normalizeResponse(result, 'workflow.delete');
    }),

  /**
   * Récupère l'historique des exécutions d'un workflow spécifique
   */
  getExecutionHistory: managerProcedure 
    .input(
      z.object({
        workflowId: z.number(),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { getWorkflowById } = await import("../db");
        if (!ctx.tenantId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tenant ID is required",
          });
        }
        const workflow = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!workflow) throw new TRPCError({ code: "NOT_FOUND" });

        const history = await getWorkflowExecutionHistory(input.workflowId, input.limit);

        return normalizeResponse({
          workflowId: input.workflowId,
          executions: normalizeDbRecords(history),
          total: history.length,
        }, 'workflow.executionHistory');
      } catch (error: any) {
        logger.error("[WorkflowRouter] Failed to get execution history", { error });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workflow execution history",
        });
      }
    }),
});
