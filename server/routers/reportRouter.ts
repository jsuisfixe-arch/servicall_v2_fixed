import { router, tenantProcedure, managerProcedure } from "../procedures";
import { z } from "zod";
import { db, calls, users, appointments } from "../db";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reportRouter = router({
  /**
   * Statistiques globales d'appels pour le tenant
   */
  getCallStats: tenantProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const start = input.startDate ? new Date(input.startDate) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
      const end = input.endDate ? new Date(input.endDate) : new Date();

      const stats = await db.select({
        totalCalls: sql<number>`count(${calls.id})::int`,
        avgDuration: sql<number>`coalesce(avg(${calls.duration}), 0)::int`,
        avgQualityScore: sql<number>`coalesce(avg(${calls.qualityScore}), 0)::float`,
        status: calls.status,
      })
      .from(calls)
      .where(and(
        eq(calls.tenantId, ctx.tenantId),
        sql`${calls.createdAt} >= ${start}`,
        sql`${calls.createdAt} <= ${end}`
      ))
      .groupBy(calls.status);

      return stats;
    }),

  /**
   * Performance détaillée par agent (nécessite manager)
   */
  getAgentPerformance: managerProcedure
    .input(z.object({
      agentId: z.number().optional(),
      timeRange: z.enum(["7d", "30d", "90d"]).default("30d"),
    }))
    .query(async ({ ctx, input }) => {
      const days = input.timeRange === "7d" ? 7 : input.timeRange === "30d" ? 30 : 90;
      const since = new Date(Date.now() - days * 24 * 3600 * 1000);

      const query = db.select({
        agentId: calls.agentId,
        agentName: users.name,
        totalCalls: sql<number>`count(${calls.id})::int`,
        avgScore: sql<number>`coalesce(avg(${calls.qualityScore}), 0)::float`,
        totalAppointments: sql<number>`count(${appointments.id})::int`,
      })
      .from(calls)
      .leftJoin(users, eq(calls.agentId, users.id))
      .leftJoin(appointments, and(
        eq(appointments.agentId, calls.agentId),
        eq(appointments.tenantId, ctx.tenantId)
      ))
      .where(and(
        eq(calls.tenantId, ctx.tenantId),
        sql`${calls.createdAt} >= ${since}`,
        input.agentId ? eq(calls.agentId, input.agentId) : sql`true`
      ))
      .groupBy(calls.agentId, users.name);

      return await query;
    }),

  /**
   * Export des données d'appels en CSV (nécessite manager)
   */
  exportCallData: managerProcedure
    .input(z.object({
      format: z.enum(["csv", "json"]).default("csv"),
    }))
    .mutation(async ({ ctx }) => {
      const data = await db.select()
        .from(calls)
        .where(eq(calls.tenantId, ctx.tenantId))
        .limit(1000)
        .orderBy(desc(calls.createdAt));

      if (data.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aucune donnée à exporter",
        });
      }

      // Simulation d'export (en prod, on générerait un fichier S3 et retournerait l'URL)
      return {
        message: "Export généré avec succès",
        count: data.length,
        data: data,
      };
    }),
});
