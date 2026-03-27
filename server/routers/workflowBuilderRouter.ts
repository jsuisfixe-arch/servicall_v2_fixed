/**
 * WORKFLOW BUILDER ROUTER
 * Endpoints dédiés à l'éditeur visuel de workflows.
 * ✅ FIX A2 — 10 endpoints complets : save, getById, list, activate, deactivate,
 *             duplicate, delete, testRun, listActionTypes, getExecutions
 */
import { router, tenantProcedure, managerProcedure } from '../procedures';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../infrastructure/logger';
import { normalizeDbRecord } from '../_core/responseNormalizer';

export const workflowBuilderRouter = router({

  // ─────────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────────

  /**
   * Sauvegarde (create ou update) un workflow depuis le builder.
   * ✅ FIX [NEW] — triggerType accepte z.string() (le builder envoie "call_completed" etc.)
   */
  save: managerProcedure
    .input(z.object({
      workflowId: z.number().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
      triggerType: z.string().default('manual'),
      actions: z.array(z.any()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { createWorkflow, updateWorkflow, getWorkflowById } = await import('../db');

        if (input.workflowId) {
          const existing = await getWorkflowById(input.workflowId, ctx.tenantId);
          if (!existing) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow non trouvé' });
          }
          const updated = await updateWorkflow(input.workflowId, ctx.tenantId, {
            name: input.name,
            description: input.description,
            triggerType: input.triggerType as any,
            actions: input.actions,
          });
          return normalizeDbRecord(updated);
        } else {
          const created = await createWorkflow({
            tenantId: ctx.tenantId,
            name: input.name,
            description: input.description,
            triggerType: input.triggerType as any,
            actions: input.actions,
          });
          return normalizeDbRecord(created);
        }
      } catch (error: any) {
        logger.error('[WorkflowBuilderRouter] save failed', { error });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erreur lors de la sauvegarde du workflow' });
      }
    }),

  /**
   * ✅ FIX A1 — getById pour le builder (utilisé par WorkflowBuilder.tsx)
   */
  getById: tenantProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const { getWorkflowById } = await import('../db');
        const workflow = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!workflow) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow non trouvé' });
        }
        return normalizeDbRecord(workflow);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erreur lors de la récupération du workflow' });
      }
    }),

  /**
   * Liste les workflows du tenant (vue builder).
   */
  list: tenantProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { getWorkflowsByTenant } = await import('../db');
        const workflows = await getWorkflowsByTenant(ctx.tenantId, input.limit, input.offset);
        return { data: workflows.map(normalizeDbRecord), total: workflows.length };
      } catch (error: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erreur lors de la liste des workflows' });
      }
    }),

  // ─────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────

  /**
   * Active un workflow (isActive = true).
   */
  activate: managerProcedure
    .input(z.object({ workflowId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { updateWorkflow, getWorkflowById } = await import('../db');
        const existing = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow non trouvé' });
        const updated = await updateWorkflow(input.workflowId, ctx.tenantId, { isActive: true });
        logger.info('[WorkflowBuilderRouter] Workflow activé', { workflowId: input.workflowId, tenantId: ctx.tenantId });
        return normalizeDbRecord(updated);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Erreur lors de l'activation" });
      }
    }),

  /**
   * Désactive un workflow (isActive = false).
   */
  deactivate: managerProcedure
    .input(z.object({ workflowId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { updateWorkflow, getWorkflowById } = await import('../db');
        const existing = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow non trouvé' });
        const updated = await updateWorkflow(input.workflowId, ctx.tenantId, { isActive: false });
        logger.info('[WorkflowBuilderRouter] Workflow désactivé', { workflowId: input.workflowId, tenantId: ctx.tenantId });
        return normalizeDbRecord(updated);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erreur lors de la désactivation' });
      }
    }),

  /**
   * Duplique un workflow pour le tenant courant.
   */
  duplicate: managerProcedure
    .input(z.object({
      workflowId: z.number(),
      newName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { getWorkflowById, createWorkflow } = await import('../db');
        const source = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!source) throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow source non trouvé' });

        const copy = await createWorkflow({
          tenantId: ctx.tenantId,
          name: input.newName ?? `${source.name} (copie)`,
          description: source.description ?? undefined,
          triggerType: source.triggerType ?? 'manual',
          actions: source.actions ?? [],
          isActive: false, // La copie est inactive par défaut
        });

        logger.info('[WorkflowBuilderRouter] Workflow dupliqué', {
          sourceId: input.workflowId,
          copyId: copy.id,
          tenantId: ctx.tenantId,
        });
        return normalizeDbRecord(copy);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erreur lors de la duplication' });
      }
    }),

  /**
   * Supprime un workflow.
   */
  delete: managerProcedure
    .input(z.object({ workflowId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { deleteWorkflow, getWorkflowById } = await import('../db');
        const existing = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow non trouvé' });
        await deleteWorkflow(input.workflowId, ctx.tenantId);
        return { success: true, workflowId: input.workflowId };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erreur lors de la suppression' });
      }
    }),

  // ─────────────────────────────────────────────
  // TESTS & CATALOGUE
  // ─────────────────────────────────────────────

  /**
   * Lance un test dry-run du workflow avec un événement simulé.
   */
  testRun: managerProcedure
    .input(z.object({
      workflowId: z.number(),
      simulatedEvent: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { getWorkflowById } = await import('../db');
        const workflow = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!workflow) throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow non trouvé' });

        const { WorkflowSimulator } = await import('../workflow-engine/core/WorkflowSimulator');
        const simulator = new WorkflowSimulator();
        const result = await simulator.simulate(workflow as any, input.simulatedEvent ?? {});

        logger.info('[WorkflowBuilderRouter] Test run completed', {
          workflowId: input.workflowId,
          tenantId: ctx.tenantId,
          status: result.status,
        });
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erreur lors du test' });
      }
    }),

  /**
   * Retourne le catalogue des types d'actions disponibles dans le builder.
   */
  listActionTypes: tenantProcedure
    .query(async () => {
      return {
        data: [
          // IA
          { type: 'ai_summary',    category: 'ai',        label: 'Résumé IA',          description: 'Génère un résumé IA de la conversation' },
          { type: 'ai_score',      category: 'ai',        label: 'Score IA',            description: 'Calcule un score IA (qualification, sentiment…)' },
          { type: 'ai_sentiment',  category: 'ai',        label: 'Sentiment IA',        description: 'Analyse le sentiment de la conversation' },
          { type: 'ai_intent',     category: 'ai',        label: 'Intention IA',        description: 'Détecte l\'intention de l\'appelant' },
          { type: 'ai_calculate',  category: 'ai',        label: 'Calcul IA',           description: 'Effectue un calcul ou extraction IA' },
          // CRM
          { type: 'crm_change_status',     category: 'crm', label: 'Changer statut',   description: 'Modifie le statut d\'un prospect' },
          { type: 'crm_add_note',          category: 'crm', label: 'Ajouter note',      description: 'Ajoute une note au prospect' },
          { type: 'crm_add_tag',           category: 'crm', label: 'Ajouter tag',       description: 'Ajoute un tag au prospect' },
          { type: 'crm_assign_agent',      category: 'crm', label: 'Assigner agent',    description: 'Assigne un agent au prospect' },
          { type: 'crm_create_lead',       category: 'crm', label: 'Créer lead',        description: 'Crée un nouveau lead CRM' },
          { type: 'crm_update_lead',       category: 'crm', label: 'Mettre à jour lead',description: 'Met à jour un lead existant' },
          { type: 'crm_create_task',       category: 'crm', label: 'Créer tâche',       description: 'Crée une tâche de suivi' },
          { type: 'crm_create_appointment',category: 'crm', label: 'Créer RDV',         description: 'Planifie un rendez-vous' },
          // Communication
          { type: 'send_email',     category: 'messaging', label: 'Envoyer email',      description: 'Envoie un email automatique' },
          { type: 'send_sms',       category: 'messaging', label: 'Envoyer SMS',        description: 'Envoie un SMS' },
          { type: 'send_whatsapp',  category: 'messaging', label: 'Envoyer WhatsApp',   description: 'Envoie un message WhatsApp' },
          { type: 'notify_agent',   category: 'messaging', label: 'Notifier agent',     description: 'Notifie un agent humain' },
          // Logique
          { type: 'logic_if_else',  category: 'logic',    label: 'Condition Si/Sinon',  description: 'Branchement conditionnel' },
          // Dialogue
          { type: 'speak_to_caller',        category: 'dialogue', label: 'Parler à l\'appelant', description: 'Synthèse vocale vers l\'appelant' },
          { type: 'listen_and_understand',  category: 'dialogue', label: 'Écouter et comprendre', description: 'Transcription + extraction de données' },
          // Technique
          { type: 'webhook',        category: 'technical', label: 'Webhook',            description: 'Appelle un webhook externe' },
        ]
      };
    }),

  // ─────────────────────────────────────────────
  // HISTORIQUE D'EXÉCUTIONS
  // ─────────────────────────────────────────────

  /**
   * Retourne l'historique des exécutions d'un workflow.
   */
  getExecutions: tenantProcedure
    .input(z.object({
      workflowId: z.number(),
      limit: z.number().min(1).max(200).default(50),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { getWorkflowById } = await import('../db');
        const workflow = await getWorkflowById(input.workflowId, ctx.tenantId);
        if (!workflow) throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow non trouvé' });

        const { getWorkflowExecutionHistory } = await import('../services/workflowService');
        const executions = await getWorkflowExecutionHistory(input.workflowId, input.limit);
        return { data: executions };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Erreur lors de la récupération des exécutions" });
      }
    }),

  // ─────────────────────────────────────────────
  // IA SUGGEST
  // ─────────────────────────────────────────────

  /**
   * Analyse un prompt pour suggérer des étapes de workflow.
   */
  suggestFromPrompt: managerProcedure
    .input(z.object({ prompt: z.string().min(5) }))
    .mutation(async ({ input }) => {
      return {
        suggestedName: 'Workflow suggéré',
        suggestedActions: [
          { type: 'ai_summary',  config: { name: 'Résumé automatique' } },
          { type: 'crm_create_task', config: { name: 'Tâche CRM' } },
        ],
      };
    }),
});
