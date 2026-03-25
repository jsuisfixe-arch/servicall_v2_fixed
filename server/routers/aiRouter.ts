import { AI_MODEL } from '../_core/aiModels';
/**
 * AI Router - Endpoints pour l'interaction avec l'IA conversationnelle
 * et la gestion des rôles IA (listModels, getModel, createModel, updateModel, deleteModel)
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../procedures';
import { generateAIResponse, generateCompletion } from '../services/aiService';
import { logger } from "../infrastructure/logger";
import { TRPCError } from '@trpc/server';

// Schéma commun pour un rôle IA
const aiRoleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['agent', 'supervisor']),
  systemPrompt: z.string().default(''),
  contextPrompt: z.string().default(''),
  responseGuidelines: z.string().default(''),
});

// Store en mémoire pour les rôles IA (à remplacer par DB en production)
const aiRolesStore = new Map<number, Record<string, unknown>>();
let nextRoleId = 1;

export const aiRouter = router({
  /**
   * Liste tous les rôles IA d'un tenant
   */
  listModels: tenantProcedure
    .query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      const roles = Array.from(aiRolesStore.values()).filter(
        (r) => r["tenantId"] === tenantId
      );
      return { roles, total: roles.length };
    }),

  /**
   * Récupère un rôle IA par ID
   */
  getModel: tenantProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      const role = aiRolesStore.get(input.modelId);
      if (!role || role["tenantId"] !== tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Rôle IA introuvable' });
      }
      return role;
    }),

  /**
   * Crée un nouveau rôle IA
   */
  createModel: tenantProcedure
    .input(aiRoleSchema)
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      const id = nextRoleId++;
      const role: Record<string, unknown> = {
        id,
        ...input,
        tenantId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      aiRolesStore.set(id, role);
      logger.info('[AI Router] Rôle IA créé', { id, tenantId });
      return { success: true, role };
    }),

  /**
   * Met à jour un rôle IA existant
   */
  updateModel: tenantProcedure
    .input(aiRoleSchema.partial().extend({ modelId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      const existing = aiRolesStore.get(input.modelId);
      if (!existing || existing["tenantId"] !== tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Rôle IA introuvable' });
      }
      const updated: Record<string, unknown> = { ...existing, ...input, updatedAt: new Date() };
      aiRolesStore.set(input.modelId, updated);
      logger.info('[AI Router] Rôle IA mis à jour', { id: input.modelId });
      return { success: true, role: updated };
    }),

  /**
   * Supprime un rôle IA
   */
  deleteModel: tenantProcedure
    .input(z.object({ modelId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      const existing = aiRolesStore.get(input.modelId);
      if (!existing || existing["tenantId"] !== tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Rôle IA introuvable' });
      }
      aiRolesStore.delete(input.modelId);
      logger.info('[AI Router] Rôle IA supprimé', { id: input.modelId });
      return { success: true };
    }),

  /**
   * Chat avec l'IA - Génère une réponse contextuelle
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, 'Le message ne peut pas être vide'),
        context: z
          .object({
            prospectName: z.string().optional(),
            callReason: z.string().optional(),
            conversationHistory: z.array(z.object({
              role: z.enum(['user', 'assistant']),
              content: z.string(),
            })).optional(),
          })
          .optional(),
        model: z.enum(['gpt-4o-mini', 'gpt-4o', 'gpt-4o-mini', 'gpt-4o-mini', 'gemini-1.5-flash']).optional().default(AI_MODEL.DEFAULT as unknown),
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // ✅ GUARD: Vérifier que l'utilisateur est présent
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Utilisateur non authentifié" });
      }

      const tenantId = ctx.tenantId ?? 0;

      try {
        logger.info('[AI Router] Chat request received', {
          userId: ctx.user.id,
          tenantId: tenantId,
          messageLength: input.message.length,
          model: input.model,
        });

        let response: string;

        // Si un contexte spécifique est fourni, utiliser generateAIResponse
        if (input.context?.prospectName || input.context?.callReason) {
          response = await generateAIResponse(input.message, {
            tenantId: tenantId,
            prospectName: input.context.prospectName ?? 'Client',
            callReason: input.context.callReason || 'Demande générale',
            tenantName: ctx.user.name ?? 'Servicall',
          });
        } else {
          // Sinon, utiliser generateCompletion pour une conversation générique
          const conversationHistory = input.context?.conversationHistory || [];
          const systemPrompt = `Tu es un assistant IA professionnel pour un centre d'appels. Réponds de manière courtoise, concise et professionnelle en français.`;
          
          // Construire le prompt avec l'historique
          let prompt = input.message;
          if (conversationHistory.length > 0) {
            const historyText = conversationHistory
              .map((msg) => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
              .join('\n');
            prompt = `${historyText}\nUtilisateur: ${input.message}`;
          }

          response = await generateCompletion({
            prompt,
            systemPrompt,
            temperature: input.temperature,
            maxTokens: input.maxTokens,
            model: input.model,
          });
        }

        logger.info('[AI Router] Chat response generated', {
          userId: ctx.user.id,
          tenantId: tenantId,
          responseLength: response.length,
        });

        return {
          success: true,
          response,
          model: input.model,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        logger.error('[AI Router] Error generating chat response', error, {
          userId: ctx.user.id,
          tenantId: tenantId,
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Impossible de générer une réponse IA',
          cause: error,
        });
      }
    }),
});
