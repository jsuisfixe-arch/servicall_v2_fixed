/**
 * Tenant Router - Gestion des tenants et changement de contexte
 */

import { router, protectedProcedure } from "../procedures";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { switchTenant, initializeDefaultTenant } from "../services/tenantService";
import { logger } from "../infrastructure/logger";
import { tenantProcedure, adminProcedure } from "../procedures";

export const tenantRouter = router({
  /**
   * Récupère un tenant par son ID
   */
  getById: tenantProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input, ctx }) => {
      // C-5: Prevent tenant enumeration — only allow access to own tenant
      if (input.tenantId !== ctx.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
      return await db.getTenantById(ctx.tenantId);
    }),

  /**
   * Liste tous les tenants (alias pour compatibilité)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (process.env['DB_ENABLED'] === "false") {
      return [{
        id: 1,
        name: "Demo Tenant",
        slug: "demo",
        role: "admin",
        isActive: true,
      }];
    }
    return await db.getUserTenants(ctx.user.id);
  }),

  /**
   * Crée un nouveau tenant
   */
  create: adminProcedure // Restricted to admin
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      phoneNumber: z.string().optional(),
      timezone: z.string().default("UTC"),
      language: z.string().default("fr"),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Create the tenant
      const tenants = await db.createTenant({
        name: input.name,
        slug: input.slug,
        settings: { timezone: input.timezone, language: input.language },
      });
      const newTenant = tenants[0]!;
      if (!newTenant) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create tenant" });
      const tenantId = newTenant.id;

      // 2. Add the current user as the default admin for this tenant
      await db.addUserToTenant(ctx.user.id, tenantId, "admin");

      return await db.getTenantById(tenantId);
    }),

  /**
   * Met à jour un tenant existant
   */
  update: adminProcedure // Restricted to admin
    .input(z.object({
      name: z.string().optional(),
      settings: z.object({
        phoneNumber: z.string().optional(),
        timezone: z.string().optional(),
        language: z.string().optional(),
        logo: z.string().optional(),
        branding: z.any().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: Partial<schema.Tenant> = { name: input.name };
      if (input.settings) {
        const tenant = await db.getTenantById(ctx.tenantId);
        const existingSettings = (tenant?.settings as Record<string, unknown> | null) ?? {};
        updateData.settings = { ...existingSettings, ...input.settings };
      }
      await db.updateTenant(ctx.tenantId, updateData);
      return await db.getTenantById(ctx.tenantId);
    }),

  /**
   * Obtenir la liste des tenants de l'utilisateur
   */
  getUserTenants: protectedProcedure.query(async ({ ctx }) => {
    let tenants;
    if (process.env['DB_ENABLED'] === "false") {
      tenants = [{
        id: 1,
        name: "Demo Tenant",
        slug: "demo",
        role: "admin",
        isActive: true,
      }];
    } else {
      tenants = await db.getUserTenants(ctx.user.id);
    }

    logger.info("User tenants retrieved", {
      userId: ctx.user.id,
      tenantCount: tenants.length,
    });

    return {
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        role: t.role,
        isActive: t.isActive,
      })),
      currentTenantId: ctx.tenantId ?? 1,
    };
  }),

  /**
   * Obtenir le tenant actuel
   */
  getCurrentTenant: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await db.getTenantById(ctx.tenantId);

    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant introuvable",
      });
    }

    logger.debug("Current tenant retrieved", {
      tenantId: ctx.tenantId,
      userId: ctx.user.id,
    });

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
      },
    };
  }),

  /**
   * Changer de tenant
   */
  switchTenant: protectedProcedure
    .input(
      z.object({
        tenantId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await switchTenant(ctx.user.id, input.tenantId, ctx.res);

      if (!result.success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: result.error || "Impossible de changer de tenant",
        });
      }

      logger.info("Tenant switched", {
        userId: ctx.user.id,
        tenantId: input.tenantId,
      });

      return {
        success: true,
        tenantId: input.tenantId,
      };
    }),

  /**
   * Initialiser le tenant par défaut (appelé après login)
   */
  initializeDefaultTenant: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await initializeDefaultTenant(ctx.user.id, ctx.res);

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Aucun tenant disponible pour cet utilisateur",
      });
    }

    logger.info("Default tenant initialized", {
      userId: ctx.user.id,
      tenantId: result.tenantId,
      role: result.role,
    });

    return {
      success: true,
      tenantId: result.tenantId,
      role: result.role,
    };
  }),

  /**
   * Mettre à jour les paramètres du tenant
   */
  updateSettings: adminProcedure // Restricted to admin
    .input(z.object({
      name: z.string().optional(),
      settings: z.object({
        timezone: z.string().optional(),
        language: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: Partial<schema.Tenant> = { name: input.name };
      if (input.settings) {
        const tenant = await db.getTenantById(ctx.tenantId);
        const existingSettings = (tenant?.settings as Record<string, unknown> | null) ?? {};
        updateData.settings = { ...existingSettings, ...input.settings };
      }
      await db.updateTenant(ctx.tenantId, updateData);
      return { success: true };
    }),

  /**
   * Mettre à jour la configuration métier du tenant
   */
  updateBusinessConfig: adminProcedure
    .input(z.object({
      businessType: z.enum([
        "restaurant",
        "hotel",
        "real_estate",
        "clinic",
        "ecommerce",
        "artisan",
        "call_center",
        "generic"
      ]).optional(),
      aiCustomScript: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateTenant(ctx.tenantId, {
        businessType: input.businessType,
        aiCustomScript: input.aiCustomScript,
      });
      
      logger.info("[TenantRouter] Business config updated", {
        tenantId: ctx.tenantId,
        businessType: input.businessType,
        hasCustomScript: !!input.aiCustomScript,
      });
      
      return { success: true };
    }),

  /**
   * Récupérer la configuration métier du tenant
   */
  getBusinessConfig: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await db.getTenantById(ctx.tenantId);
    
    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found",
      });
    }
    
    return {
      businessType: tenant.businessType ?? null,
      aiCustomScript: tenant.aiCustomScript ?? null,
    };
  }),

  /**
   * Récupérer la configuration Brand AI du tenant
   * Stockée dans tenant.settings.brandAI (JSON field)
   */
  getBrandAIConfig: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await db.getTenantById(ctx.tenantId);
    if (!tenant) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tenant introuvable" });
    }
    const settings = (tenant.settings as Record<string, unknown> | null) ?? {};
    const brandAI = (settings.brandAI as Record<string, unknown> | null) ?? {};
    const channelSettings = (settings.channelSettings as Record<string, unknown> | null) ?? {};
    return {
      aiRole: (brandAI.aiRole as string) ?? "",
      aiMission: (brandAI.aiMission as string) ?? "",
      tagline: (brandAI.tagline as string) ?? "",
      tone: (brandAI.tone as string) ?? "professional",
      language: (brandAI.language as string) ?? "fr",
      phoneNumber: (brandAI.phoneNumber as string) ?? "",
      email: (brandAI.email as string) ?? "",
      address: (brandAI.address as string) ?? "",
      businessHours: (brandAI.businessHours as string) ?? "",
      escalationMessage: (brandAI.escalationMessage as string) ?? "",
      websiteUrl: (brandAI.websiteUrl as string) ?? "",
      scrapedContent: (brandAI.scrapedContent as string) ?? "",
      customPricingText: (brandAI.customPricingText as string) ?? "",
      customInstructions: (brandAI.customInstructions as string) ?? "",
      includePricing: (brandAI.includePricing as boolean) ?? false,
      includeProducts: (brandAI.includeProducts as boolean) ?? false,
      allowedTopics: (brandAI.allowedTopics as string[]) ?? [],
      forbiddenTopics: (brandAI.forbiddenTopics as string[]) ?? [],
      faqItems: (brandAI.faqItems as unknown[]) ?? [],
      channelSettings,
    };
  }),

  /**
   * Mettre à jour la configuration Brand AI du tenant
   */
  updateBrandAIConfig: adminProcedure
    .input(z.object({
      brandAI: z.object({
        aiRole: z.string().optional(),
        aiMission: z.string().optional(),
        tagline: z.string().optional(),
        tone: z.string().optional(),
        language: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        businessHours: z.string().optional(),
        escalationMessage: z.string().optional(),
        websiteUrl: z.string().optional(),
        scrapedContent: z.string().optional(),
        customPricingText: z.string().optional(),
        customInstructions: z.string().optional(),
        includePricing: z.boolean().optional(),
        includeProducts: z.boolean().optional(),
        allowedTopics: z.array(z.string()).optional(),
        forbiddenTopics: z.array(z.string()).optional(),
        faqItems: z.array(z.any()).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenant = await db.getTenantById(ctx.tenantId);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant introuvable" });
      }
      const existingSettings = (tenant.settings as Record<string, unknown> | null) ?? {};
      const existingBrandAI = (existingSettings.brandAI as Record<string, unknown> | null) ?? {};
      const updatedSettings = {
        ...existingSettings,
        brandAI: { ...existingBrandAI, ...input.brandAI },
      };
      await db.updateTenant(ctx.tenantId, { settings: updatedSettings });
      logger.info("[TenantRouter] Brand AI config updated", { tenantId: ctx.tenantId });
      return { success: true };
    }),

  /**
   * Scraper le contenu d'un site web pour alimenter la Brand AI
   */
  scrapeWebsite: adminProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      try {
        // Fetch basique du contenu public de la page
        const response = await fetch(input.url, {
          headers: { "User-Agent": "Servicall-BrandAI-Scraper/1.0" },
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const html = await response.text();
        // Extraction texte brut : retirer les balises HTML
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim()
          .slice(0, 4000); // Limiter à 4000 chars
        return { content: text };
      } catch (err) {
        logger.warn("[TenantRouter] scrapeWebsite failed", { url: input.url, err });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de récupérer le contenu du site. Vérifiez l'URL et réessayez.",
        });
      }
    }),

  /**
   * Prévisualiser la réponse Brand AI pour un canal et message donné
   */
  previewBrandAI: adminProcedure
    .input(z.object({
      channel: z.enum(["whatsapp", "messenger", "instagram", "sms", "email"]),
      testMessage: z.string().default("Bonjour, quels sont vos services ?"),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenant = await db.getTenantById(ctx.tenantId);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant introuvable" });
      }
      const settings = (tenant.settings as Record<string, unknown> | null) ?? {};
      const brandAI = (settings.brandAI as Record<string, unknown> | null) ?? {};

      const systemPrompt = [
        brandAI.aiRole ? `Tu es ${brandAI.aiRole}.` : "Tu es un assistant commercial.",
        brandAI.tagline ? `Slogan : ${brandAI.tagline}` : "",
        brandAI.aiMission ? `Mission : ${brandAI.aiMission}` : "",
        brandAI.tone ? `Ton : ${brandAI.tone}` : "",
        `Canal : ${input.channel}`,
        brandAI.scrapedContent ? `Contexte entreprise : ${String(brandAI.scrapedContent).slice(0, 1000)}` : "",
        brandAI.customInstructions ? `Instructions : ${brandAI.customInstructions}` : "",
      ].filter(Boolean).join("\n");

      // Réponse simulée si pas d'OpenAI configuré
      const sampleReply = `[Aperçu ${input.channel}] Bonjour ! ${brandAI.tagline || "Comment puis-je vous aider ?"} — réponse simulée pour prévisualisation.`;

      return {
        prompt: systemPrompt,
        sampleReply,
        channel: input.channel,
      };
    }),

  /**
   * Mettre à jour les paramètres de canaux (autoReply, whatsapp, messenger, etc.)
   */
  updateChannelSettings: adminProcedure
    .input(z.object({
      whatsapp: z.boolean().optional(),
      messenger: z.boolean().optional(),
      instagram: z.boolean().optional(),
      sms: z.boolean().optional(),
      email: z.boolean().optional(),
      autoReply: z.record(z.boolean()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenant = await db.getTenantById(ctx.tenantId);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant introuvable" });
      }
      const existingSettings = (tenant.settings as Record<string, unknown> | null) ?? {};
      const existingChannels = (existingSettings.channelSettings as Record<string, unknown> | null) ?? {};
      const updatedSettings = {
        ...existingSettings,
        channelSettings: { ...existingChannels, ...input },
      };
      await db.updateTenant(ctx.tenantId, { settings: updatedSettings });
      logger.info("[TenantRouter] Channel settings updated", { tenantId: ctx.tenantId });
      return { success: true };
    }),
});
