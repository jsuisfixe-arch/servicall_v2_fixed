import { z } from "zod";
import { router, tenantProcedure } from "../_core/trpc";
import { managerProcedure } from "../procedures";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { candidateInterviews, recruitmentSettings, interviewQuestions } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { logger } from "../infrastructure/logger";
import { paginationInput, paginate } from "../_core/pagination";
import { 
  paginatedInterviewSchema, 
  recruitmentStatsSchema,
  interviewSchema
} from "../../shared/validators/recruitment";

export const recruitmentRouter = router({
  /**
   * Liste les entretiens avec pagination et filtres
   */
  listInterviews: tenantProcedure
    .input(paginationInput.extend({
      status: z.string().optional(),
      businessType: z.string().optional(),
    }))
    .output(paginatedInterviewSchema)
    .query(async ({ input, ctx }) => {
      const { page, limit, status, businessType } = input;
      const offset = (page - 1) * limit;

      try {
        const conditions = [eq(candidateInterviews.tenantId, ctx.tenantId)];
        if (status) conditions.push(eq(candidateInterviews.status, status));
        if (businessType) conditions.push(eq(candidateInterviews.businessType, businessType));

        const [data, totalResult] = await Promise.all([
          db.db.select().from(candidateInterviews)
            .where(and(...conditions))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(candidateInterviews.createdAt)),
          db.db.select({ value: sql`count(*)` })
            .from(candidateInterviews)
            .where(and(...conditions))
        ]);

        const result = paginate(data, totalResult[0]?.value ?? 0, input);
        return paginatedInterviewSchema.parse(result);
      } catch (error: any) {
        logger.error("[RecruitmentRouter] Failed to list interviews", { error });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to list interviews" });
      }
    }),

  /**
   * Récupère les statistiques
   */
  getStats: tenantProcedure
    .input(z.object({ businessType: z.string().optional() }))
    .output(recruitmentStatsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const conditions = [eq(candidateInterviews.tenantId, ctx.tenantId)];
        if (input.businessType) conditions.push(eq(candidateInterviews.businessType, input.businessType));

        const interviews = await db.db.select().from(candidateInterviews).where(and(...conditions));
        
        const stats = {
          total: interviews.length,
          pending: interviews.filter(i => i.status === "pending").length,
          completed: interviews.filter(i => i.status === "completed").length,
          shortlisted: interviews.filter(i => i.status === "shortlisted").length,
          rejected: interviews.filter(i => i.status === "rejected").length,
          averageScore: 75, // Valeur simulée ou calculée
        };

        return recruitmentStatsSchema.parse(stats);
      } catch (error: any) {
        logger.error("[RecruitmentRouter] Failed to get stats", { error });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get stats" });
      }
    }),

  /**
   * Crée un nouvel entretien
   */
  createInterview: managerProcedure
    .input(z.object({
      candidateName: z.string(),
      candidateEmail: z.string().email().optional(),
      candidatePhone: z.string(),
      jobPosition: z.string(),
      scheduledAt: z.string().optional(),
      businessType: z.string().optional(),
    }))
    .output(interviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [newInterview] = await db.db.insert(candidateInterviews).values({
          tenantId: ctx.tenantId,
          ...input,
          status: "pending",
        }).returning();

        return interviewSchema.parse(newInterview);
      } catch (error: any) {
        logger.error("[RecruitmentRouter] Failed to create interview", { error });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create interview" });
      }
    }),
});
