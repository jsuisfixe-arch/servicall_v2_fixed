import { z } from "zod";
import { router } from "../_core/trpc";
import { adminProcedure, managerProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { logger } from "../infrastructure/logger";
import { paginationInput, paginate } from "../_core/pagination";
import { 
  paginatedTeamMemberSchema, 
  teamKPIsSchema 
} from "../../shared/validators/user";

/**
 * Router pour la gestion des utilisateurs et membres de l'équipe
 * ✅ Bloc 4: Validation Runtime (Zod) - Sécurisation backend + frontend
 */
export const userRouter = router({
  /**
   * Liste tous les membres de l'équipe pour le tenant actuel
   */
  getTeamMembers: managerProcedure
    .input(paginationInput)
    .output(paginatedTeamMemberSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      try {
        if (!ctx.tenantId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });
        }
        const members = await db.getTenantMembers(ctx.tenantId);
        const total = members.length;
        const paginatedMembers = members.slice(offset, offset + limit);

        const data = paginatedMembers.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          isActive: m.isActive,
        }));

        const result = paginate(data, total, input);
        return paginatedTeamMemberSchema.parse(result);
      } catch (error: any) {
        logger.error("[UserRouter] Failed to get team members", { error, tenantId: ctx.tenantId });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get team members" });
      }
    }),

  /**
   * Invite un nouvel utilisateur ou l'ajoute au tenant
   */
  inviteMember: adminProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(["admin", "manager", "agent", "viewer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.tenantId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });
        }
        let user = await db.getUserByEmail(input.email);
        
        if (!user) {
          const [result] = await db.createUser({
            email: input.email,
            name: input.name,
            openId: `invited-${Date.now()}`,
            role: "user",
          });
          user = result ?? undefined;
        }

        if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create or find user' });

        await db.addUserToTenant(user.id, ctx.tenantId, input.role);

        logger.info("[UserRouter] Member invited", { 
          tenantId: ctx.tenantId, 
          invitedEmail: input.email,
          role: input.role 
        });

        return { success: true };
      } catch (error: any) {
        logger.error("[UserRouter] Failed to invite member", { error, tenantId: ctx.tenantId });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to invite member" });
      }
    }),

  /**
   * Met à jour le rôle ou le statut d'un membre
   */
  updateMember: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.tenantId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });
        }
        await db.updateTenantUser(input.userId, ctx.tenantId, {
          role: input.role,
          isActive: input.isActive,
        });
        return { success: true };
      } catch (error: any) {
        logger.error("[UserRouter] Failed to update member", { error, userId: input.userId });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update member" });
      }
    }),

  /**
   * Récupère les KPIs de l'équipe pour les managers
   */
  getTeamKPIs: managerProcedure
    .output(teamKPIsSchema)
    .query(async ({ ctx }) => {
      try {
        if (!ctx.tenantId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });
        }
        const members = await db.getTenantMembers(ctx.tenantId);
        const activeAgents = members.filter((m) => m.role === "agent" && m.isActive).length;
        
        const result = {
          totalMembers: members.length,
          activeAgents,
          teamPerformance: 85,
          alerts: [
            { id: 1, type: "warning", message: "Agent Smith est inactif depuis 2h" },
            { id: 2, type: "info", message: "Objectif hebdomadaire atteint à 70%" }
          ]
        };
        return teamKPIsSchema.parse(result);
      } catch (error: any) {
        logger.error("[UserRouter] Failed to get team KPIs", { error, tenantId: ctx.tenantId });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get team KPIs" });
      }
    }),
});
