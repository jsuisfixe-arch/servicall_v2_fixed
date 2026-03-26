/**
 * Services Router - 10 Services Métier Avancés
 * Extracteur de Leads, Mémoire IA, Workflows, Rapports, Webhooks, Blueprints, Stripe, Email, Monitoring, Training
 */
import { router, tenantProcedure } from "../procedures";
import { z } from "zod";
import { db } from "../db";
import {
  leads,
  contactMemories,
  workflows,
  reports,
  webhookSubscriptions,
  blueprints,
  stripeConnections,
  emailConfigs,
  aiMetrics,
  trainingModules,
} from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";

export const servicesRouter = router({
  // ============================================
  // SERVICE 1: Lead Extraction
  // ============================================
  leads: router({
    search: tenantProcedure
      .input(z.object({ query: z.string(), source: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        // Recherche locale (sans API externe requise)
        const results = await db
          .select()
          .from(leads)
          .where(eq(leads.tenantId, tenantId))
          .limit(10);
        return { success: true, data: results };
      }),

    import: tenantProcedure
      .input(z.object({ name: z.string(), email: z.string(), company: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const result = await db
          .insert(leads)
          .values({
            tenantId,
            name: input.name,
            email: input.email,
            company: input.company,
            source: "manual",
          })
          .returning();
        return { success: true, data: result[0]! };
      }),

    getHistory: tenantProcedure.query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      return await db.select().from(leads).where(eq(leads.tenantId, tenantId)).limit(50);
    }),
  }),

  // ============================================
  // SERVICE 2: Contact Memory (AI)
  // ============================================
  contactMemory: router({
    getMemory: tenantProcedure
      .input(z.object({ contactId: z.number() }))
      .query(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const memories = await db
          .select()
          .from(contactMemories)
          .where(and(eq(contactMemories.contactId, input.contactId), eq(contactMemories.tenantId, tenantId)))
          .limit(10);
        return { success: true, data: memories };
      }),

    saveInteraction: tenantProcedure
      .input(
        z.object({
          contactId: z.number(),
          interactionType: z.string(),
          summary: z.string(),
          sentiment: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const result = await db
          .insert(contactMemories)
          .values({
            tenantId,
            contactId: input.contactId,
            interactionType: input.interactionType,
            summary: input.summary,
            sentiment: input.sentiment,
          })
          .returning();
        return { success: true, data: result[0]! };
      }),

    delete: tenantProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.delete(contactMemories).where(and(eq(contactMemories.id, input.memoryId), eq(contactMemories.tenantId, ctx.tenantId)));
        return { success: true };
      }),
  }),

  // ============================================
  // SERVICE 3: Workflow Builder
  // ============================================
  workflows: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      return await db.select().from(workflows).where(eq(workflows.tenantId, tenantId));
    }),

    create: tenantProcedure
      .input(z.object({ name: z.string(), definition: z.record(z.unknown()) }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const result = await db
          .insert(workflows)
          .values({
            tenantId,
            name: input.name,
            definition: input.definition,
          })
          .returning();
        return { success: true, data: result[0]! };
      }),

    update: tenantProcedure
      .input(z.object({ id: z.number(), definition: z.record(z.unknown()) }))
      .mutation(async ({ input, ctx }) => {
        const result = await db
          .update(workflows)
          .set({ definition: input.definition, updatedAt: new Date() })
          .where(and(eq(workflows.id, input.id), eq(workflows.tenantId, ctx.tenantId)))
          .returning();
        return { success: true, data: result[0]! };
      }),

    delete: tenantProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.delete(workflows).where(and(eq(workflows.id, input.id), eq(workflows.tenantId, ctx.tenantId)));
        return { success: true };
      }),
  }),

  // ============================================
  // SERVICE 4: Weekly Reports
  // ============================================
  reports: router({
    sendTestReport: tenantProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const htmlContent = `<h1>Test Report</h1><p>This is a test weekly report for ${input.email}</p>`;
        const result = await db
          .insert(reports)
          .values({
            tenantId,
            reportType: "weekly",
            htmlContent,
            sentTo: input.email,
          })
          .returning();
        return { success: true, message: "Test report generated", data: result[0]! };
      }),

    getReports: tenantProcedure.query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      return await db.select().from(reports).where(eq(reports.tenantId, tenantId)).limit(10);
    }),
  }),

  // ============================================
  // SERVICE 5: Webhooks
  // ============================================
  webhooks: router({
    createSubscription: tenantProcedure
      .input(z.object({ url: z.string().url(), events: z.array(z.string()) }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const result = await db
          .insert(webhookSubscriptions)
          .values({
            tenantId,
            url: input.url,
            events: input.events,
          })
          .returning();
        return { success: true, data: result[0]! };
      }),

    listSubscriptions: tenantProcedure.query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      return await db.select().from(webhookSubscriptions).where(eq(webhookSubscriptions.tenantId, tenantId));
    }),

    delete: tenantProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.delete(webhookSubscriptions).where(and(eq(webhookSubscriptions.id, input.id), eq(webhookSubscriptions.tenantId, ctx.tenantId)));
        return { success: true };
      }),
  }),

  // ============================================
  // SERVICE 6: Blueprint Marketplace
  // ============================================
  blueprints: router({
    list: tenantProcedure.query(async () => {
      return await db.select().from(blueprints).limit(20);
    }),

    install: tenantProcedure
      .input(z.object({ blueprintId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const blueprint = await db.select().from(blueprints).where(eq(blueprints.id, input.blueprintId)).limit(1);
        if (blueprint.length === 0) return { success: false, message: "Blueprint not found" };
        // Créer un workflow à partir du blueprint
        const result = await db
          .insert(workflows)
          .values({
            tenantId,
            name: `${blueprint[0]!.name} (Installed)`,
            definition: blueprint[0]!.definition,
          })
          .returning();
        return { success: true, data: result[0]! };
      }),
  }),

  // ============================================
  // SERVICE 7: Stripe Connect
  // ============================================
  stripe: router({
    getStatus: tenantProcedure.query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      const connection = await db
        .select()
        .from(stripeConnections)
        .where(eq(stripeConnections.tenantId, tenantId))
        .limit(1);
      return {
        connected: connection.length > 0 && connection[0]!.isConnected,
        data: connection[0] || null,
      };
    }),

    getConnectUrl: tenantProcedure.query(async () => {
      return {
        url: "https://connect.stripe.com/oauth/authorize?client_id=YOUR_CLIENT_ID&state=YOUR_STATE",
      };
    }),
  }),

  // ============================================
  // SERVICE 8: Email Configuration
  // ============================================
  emailConfig: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      const configs = await db.select().from(emailConfigs).where(eq(emailConfigs.tenantId, tenantId));
      // Ne pas retourner les credentials chiffrées
      return configs.map((c) => ({
        id: c.id,
        provider: c.provider,
        fromEmail: c.fromEmail,
        isActive: c.isActive,
        createdAt: c.createdAt,
      }));
    }),

    create: tenantProcedure
      .input(z.object({ provider: z.string(), fromEmail: z.string().email(), credentials: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const tenantId = ctx.tenantId;
        const result = await db
          .insert(emailConfigs)
          .values({
            tenantId,
            provider: input.provider,
            fromEmail: input.fromEmail,
            encryptedCredentials: input.credentials, // À chiffrer en production
          })
          .returning();
        return { success: true, data: result[0]! };
      }),
  }),

  // ============================================
  // SERVICE 9: AI Monitoring
  // ============================================
  aiMonitoring: router({
    getMetrics: tenantProcedure.query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;
      const metrics = await db
        .select()
        .from(aiMetrics)
        .where(eq(aiMetrics.tenantId, tenantId))
        .limit(100);
      return {
        latency: metrics.filter((m) => m.metricType === "latency").map((m) => m.value),
        successRate: metrics.filter((m) => m.metricType === "success_rate").map((m) => m.value),
        errors: metrics.filter((m) => m.metricType === "error").map((m) => m.value),
      };
    }),
  }),

  // ============================================
  // SERVICE 10: Training Modules
  // ============================================
  training: router({
    getProgress: tenantProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      return await db
        .select()
        .from(trainingModules)
        .where(eq(trainingModules.userId, userId))
        .limit(10);
    }),

    startModule: tenantProcedure
      .input(z.object({ moduleType: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        const tenantId = ctx.tenantId;
        const result = await db
          .insert(trainingModules)
          .values({
            tenantId,
            userId,
            moduleType: input.moduleType,
            progress: 0,
          })
          .returning();
        return { success: true, data: result[0]! };
      }),
  }),
});
