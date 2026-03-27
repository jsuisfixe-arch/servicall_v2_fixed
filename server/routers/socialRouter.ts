
/**
 * Social Media Manager Router - tRPC
 * ✅ Intégration AI Social Media Manager pour Servicall v3
 * ✅ TikTok, Facebook, Instagram, LinkedIn, Twitter
 */
import { router } from "../_core/trpc";
import { z } from "zod";
import { tenantProcedure } from "../procedures";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import * as schema from "../../drizzle/schema";
import type { BusinessEntity } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getOpenAIClient } from "../_core/openaiClient";
import { AI_MODEL } from "../_core/aiModels";
import { logger } from "../infrastructure/logger";
import { paginationInput, paginate } from "../_core/pagination";
import { createTikTokService } from "../services/social/tiktok-service";
import { ChatbotService } from "../services/chatbotService";
import { createFacebookService } from "../services/social/facebook-service";
import { createLinkedInService, createTwitterService } from "../services/social/linkedin-twitter-service";

// Plateformes supportées incluant TikTok
const PLATFORMS = ["facebook", "instagram", "linkedin", "twitter", "tiktok"] as const;
type SocialPlatform = typeof PLATFORMS[number];
type Platform = typeof PLATFORMS[number];

export const socialRouter = router({
  /**
   * Statut des connexions réseaux sociaux (incluant TikTok)
   */
  getConnections: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });
    
    const accounts = await db.db.select().from(schema.socialAccounts)
      .where(eq(schema.socialAccounts.tenantId, ctx.tenantId));
    
    const status: Record<string, string> = {
      facebook: "disconnected",
      instagram: "disconnected",
      linkedin: "disconnected",
      twitter: "disconnected",
      tiktok: "disconnected"
    };
    
    accounts.forEach((acc: typeof schema.socialAccounts.$inferSelect) => {
      status[acc.platform] = acc.isActive ? "connected" : "error";
    });
    
    // Vérifier aussi via les variables d'environnement
    const fbService = createFacebookService();
    const tiktokService = createTikTokService();
    const liService = createLinkedInService();
    const twService = createTwitterService();
    
    if (fbService.isConfigured()) {
      if (status.facebook === "disconnected") status.facebook = "configured";
      if (status.instagram === "disconnected") status.instagram = "configured";
    }
    if (tiktokService.isConfigured() && status.tiktok === "disconnected") status.tiktok = "configured";
    if (liService.isConfigured() && status.linkedin === "disconnected") status.linkedin = "configured";
    if (twService.isConfigured() && status.twitter === "disconnected") status.twitter = "configured";
    
    return status;
  }),

  /**
   * Connecter un compte réseau social (sauvegarder les credentials)
   */
  connectAccount: tenantProcedure
    .input(z.object({
      platform: z.enum(PLATFORMS),
      accessToken: z.string(),
      accountName: z.string().optional(),
      platformAccountId: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });
      
      // Upsert le compte social
      const existing = await db.db.select().from(schema.socialAccounts)
        .where(and(
          eq(schema.socialAccounts.tenantId, ctx.tenantId),
          eq(schema.socialAccounts.platform, input.platform as SocialPlatform)
        ))
        .limit(1);
      
      if (existing[0]) {
        await db.db.update(schema.socialAccounts)
          .set({
            accessToken: input.accessToken,
            accountName: input.accountName,
            isActive: true,
            updatedAt: new Date(),
            metadata: input.metadata || {}
          })
          .where(eq(schema.socialAccounts.id, existing[0].id));
      } else {
        await db.db.insert(schema.socialAccounts).values({
          tenantId: ctx.tenantId,
          platform: input.platform as SocialPlatform,
          platformAccountId: input.platformAccountId || `manual_${Date.now()}`,
          accountName: input.accountName || input.platform,
          accessToken: input.accessToken,
          isActive: true,
          metadata: input.metadata || {}
        });
      }
      
      return { success: true, platform: input.platform };
    }),

  /**
   * Déconnecter un compte réseau social
   */
  disconnectAccount: tenantProcedure
    .input(z.object({ platform: z.enum(PLATFORMS) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });
      
      await db.db.update(schema.socialAccounts)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(
          eq(schema.socialAccounts.tenantId, ctx.tenantId),
          eq(schema.socialAccounts.platform, input.platform as SocialPlatform)
        ));
      
      return { success: true };
    }),

  /**
   * Lister les posts planifiés ou publiés
   */
  listPosts: tenantProcedure
    .input(paginationInput.extend({
      status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
      platform: z.enum(PLATFORMS).optional(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });
      
      const { page, limit, status, platform } = input;
      const offset = (page - 1) * limit;
      
      const conditions = [eq(schema.socialPosts.tenantId, ctx.tenantId)];
      if (status) conditions.push(eq(schema.socialPosts.status, status));
      if (platform) conditions.push(eq(schema.socialPosts.platform, platform as SocialPlatform));
      
      const [data, totalResult] = await Promise.all([
        db.db.select().from(schema.socialPosts)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(schema.socialPosts.scheduledAt), desc(schema.socialPosts.createdAt)),
        db.db.select({ value: count() })
          .from(schema.socialPosts)
          .where(and(...conditions))
      ]);
      
      return paginate(data, totalResult[0]?.value ?? 0, input);
    }),

  /**
   * Générer des posts via IA (Prompt Engine) - incluant TikTok
   */
  generatePosts: tenantProcedure
    .input(z.object({
      prompt: z.string(),
      count: z.number().min(1).max(6).default(3),
      platforms: z.array(z.enum(PLATFORMS)),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });
      
      try {
        const [tenant, businessInfo] = await Promise.all([
          db.db.select().from(schema.tenants).where(eq(schema.tenants.id, ctx.tenantId)).limit(1),
          db.db.select().from(schema.businessEntities).where(eq(schema.businessEntities.tenantId, ctx.tenantId)).limit(5)
        ]);
        
        const tenantData = tenant[0]!;
        const contextData = {
          business_name: tenantData?.name ?? "Servicall",
          city: "Paris",
          phone_number: "+33 1 23 45 67 89",
          product: (businessInfo as BusinessEntity[]).find((e) => e.type === "product")?.title || "nos services",
          service: (businessInfo as BusinessEntity[]).find((e) => e.type === "service")?.title || "support client",
        };

        const systemPrompt = `Tu es l'IA Social Media Manager de Servicall v3.
Génère des posts optimisés pour chaque réseau social selon les spécificités de chaque plateforme:
- Facebook: posts engageants avec call-to-action, 1-3 paragraphes
- Instagram: visuels, émojis, hashtags populaires, ton inspirant
- LinkedIn: professionnel, insights business, thought leadership
- Twitter/X: concis (<280 chars), percutant, hashtags tendance
- TikTok: ton jeune et dynamique, trends, hooks accrocheurs, idées de vidéos courtes

Contexte business: ${JSON.stringify(contextData)}
Plateformes demandées: ${input.platforms.join(", ")}

Pour chaque post, fournis:
1. Le contenu adapté à la plateforme
2. 3-5 hashtags pertinents
3. Pour TikTok: une idée de vidéo courte (15-60 secondes)
4. Un score d'engagement estimé (1-10)

Réponds en JSON avec cette structure:
{
  "posts": [
    {
      "platform": "facebook|instagram|linkedin|twitter|tiktok",
      "content": "...",
      "hashtags": ["tag1", "tag2"],
      "tiktokVideoIdea": "...", // uniquement pour TikTok
      "engagementScore": 8,
      "imageUrl": null
    }
  ]
}`;

        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
          model: AI_MODEL.DEFAULT,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.8
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");
        const posts = result.posts || [];

        // Sauvegarder en base de données
        const createdPosts = [];
        for (const post of posts) {
          if (input.platforms.includes(post.platform)) {
            const [newPost] = await db.db.insert(schema.socialPosts).values({
              tenantId: ctx.tenantId,
              platform: post.platform,
              status: "draft",
              content: post.content,
              originalPrompt: input.prompt,
              hashtags: post.hashtags || [],
              imageUrl: post.imageUrl || null,
              mediaMetadata: post.tiktokVideoIdea ? { tiktokVideoIdea: post.tiktokVideoIdea, engagementScore: post.engagementScore } : { engagementScore: post.engagementScore }
            }).returning();
            createdPosts.push({ ...newPost, tiktokVideoIdea: post.tiktokVideoIdea });
          }
        }

        return { success: true, posts: createdPosts };
      } catch (error: unknown) {
        logger.error("[Social Router] Post generation failed", { error, tenantId: ctx.tenantId });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Échec de la génération des posts par l'IA",
          cause: error
        });
       }
    }),

  /**
   * Publier un post sur les réseaux sociaux (incluant TikTok)
   */
  publishPost: tenantProcedure
    .input(z.object({
      postId: z.number(),
      publishNow: z.boolean().default(true)
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });
      
      const posts = await db.db.select().from(schema.socialPosts)
        .where(and(eq(schema.socialPosts.id, input.postId), eq(schema.socialPosts.tenantId, ctx.tenantId)))
        .limit(1);

      const post = posts[0]!;
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post non trouvé" });

      // Logique de publication...
      let publishResult: { success: boolean; simulated?: boolean; postId?: string; error?: string } = { success: false, simulated: false };

      if (post.platform === "tiktok") {
        const tiktokService = createTikTokService();
        publishResult = await tiktokService.publishVideo({
          caption: post.content,
          hashtags: post.hashtags as string[] | undefined,
        });
      } else if (post.platform === "facebook") {
        const fbService = createFacebookService();
        publishResult = await fbService.publishToPage({ message: post.content, imageUrl: post.imageUrl || undefined });
      } else if (post.platform === "linkedin") {
        const liService = createLinkedInService();
        publishResult = await liService.publishPost({ message: post.content, imageUrl: post.imageUrl || undefined });
      } else if (post.platform === "twitter") {
        const twService = createTwitterService();
        publishResult = await twService.publishTweet({ text: post.content, imageUrl: post.imageUrl || undefined });
      }

      await db.db.update(schema.socialPosts)
        .set({
          status: publishResult.success ? "published" : "failed",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.socialPosts.id, input.postId));

      return { success: publishResult.success, simulated: publishResult.simulated };
    }),

  /**
   * Générer des idées TikTok via IA
   */
  generateTikTokIdeas: tenantProcedure
    .input(z.object({
      topic: z.string(),
      style: z.enum(["educational", "entertaining", "promotional", "trending"]).default("entertaining"),
      count: z.number().min(1).max(5).default(3),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });

      const openai = getOpenAIClient();
      const systemPrompt = `Tu es un expert en marketing TikTok. Génère ${input.count} idées de vidéos TikTok sur le sujet "${input.topic}" avec un style "${input.style}".
Chaque idée doit inclure un hook, une durée estimée, une description, 3-5 hashtags et une tendance associée.
Réponds en JSON avec un tableau d'objets.`;

      const response = await openai.chat.completions.create({
        model: AI_MODEL.DEFAULT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.topic }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return { ideas: result.ideas || [] };
    }),

  /**
   * Publier une vidéo TikTok (simulée pour l'instant)
   */
  publishTikTokVideo: tenantProcedure
    .input(z.object({
      idea: z.object({
        title: z.string(),
        hook: z.string(),
        duration: z.string(),
        description: z.string(),
        hashtags: z.array(z.string()),
        trend: z.string(),
      }),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });

      const tiktokService = createTikTokService();
      const result = await tiktokService.publishVideo({
        caption: input.idea.description,
        hashtags: input.idea.hashtags as string[] | undefined,
      });

      // Sauvegarder le post simulé
      await db.db.insert(schema.socialPosts).values({
        tenantId: ctx.tenantId,
        platform: "tiktok",
        status: result.success ? "published" : "failed",
        content: input.idea.description,
        originalPrompt: input.idea.title,
        hashtags: input.idea.hashtags,
        imageUrl: input.imageUrl || null,
        mediaMetadata: { tiktokVideoIdea: input.idea.hook, trend: input.idea.trend },
        publishedAt: new Date(),
      });

      return { success: result.success, simulated: result.simulated };
    }),

  /**
   * Gérer les messages entrants des chatbots (WhatsApp, Web)
   */
  handleChatbotMessage: tenantProcedure
    .input(z.object({
      platform: z.enum(["whatsapp", "web"]),
      sessionId: z.string(),
      message: z.string(),
      prospectId: z.number(),
      scenarioId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenantId) throw new TRPCError({ code: "BAD_REQUEST" });

      try {
        const chatbotService = new ChatbotService({
          platform: input.platform,
          tenantId: ctx.tenantId,
          sessionId: input.sessionId,
        });

        const dialogueOutput = await chatbotService.handleIncomingMessage(
          input.message,
          input.scenarioId,
          input.prospectId
        );

        return { success: true, response: dialogueOutput.response };
      } catch (error: unknown) {
        logger.error("[Social Router] Chatbot message handling failed", { error, tenantId: ctx.tenantId });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Échec du traitement du message du chatbot",
          cause: error
        });
      }
    }),

  /**
   * Récupérer les analyses de commentaires (mock pour l'instant)
   */
  getCommentAnalysis: tenantProcedure.query(async () => {
    return [
      {
        id: "1",
        author: "Marie L.",
        text: "Est-ce que vous livrez à Sidi Henri ? J'aimerais commander !",
        sentiment: "positive",
        intent: "purchase",
        platform: "instagram",
        aiResponse: "Oui, nous livrons partout ! Voici le lien pour commander..."
      },
      {
        id: "2",
        author: "Jean D.",
        text: "Pourquoi les prix ont augmenté ?",
        sentiment: "negative",
        intent: "question",
        platform: "facebook",
        aiResponse: "Merci de votre question. Nous avons amélioré la qualité..."
      },
      {
        id: "3",
        author: "Sophie M.",
        text: "Excellent service ! Très satisfait de ma commande.",
        sentiment: "positive",
        intent: "feedback",
        platform: "linkedin"
      }
    ];
  }),

  /**
   * Analytics agrégées des posts sociaux du tenant
   * Retourne totalPosts, totalLikes, totalReach, breakdown par plateforme
   */
  getAnalytics: tenantProcedure.query(async ({ ctx }) => {
    const posts = await db.db
      .select({
        platform: schema.socialPosts.platform,
        status: schema.socialPosts.status,
        likesCount: schema.socialPosts.likesCount,
        sharesCount: schema.socialPosts.sharesCount,
        commentsCount: schema.socialPosts.commentsCount,
        reachCount: schema.socialPosts.reachCount,
      })
      .from(schema.socialPosts)
      .where(eq(schema.socialPosts.tenantId, ctx.tenantId));

    const totalPosts = posts.length;
    const totalLikes = posts.reduce((s, p) => s + (p.likesCount ?? 0), 0);
    const totalShares = posts.reduce((s, p) => s + (p.sharesCount ?? 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.commentsCount ?? 0), 0);
    const totalReach = posts.reduce((s, p) => s + (p.reachCount ?? 0), 0);

    // Breakdown par plateforme
    const byPlatform: Record<string, { posts: number; likes: number; reach: number }> = {};
    for (const p of posts) {
      if (!byPlatform[p.platform]) byPlatform[p.platform] = { posts: 0, likes: 0, reach: 0 };
      byPlatform[p.platform].posts++;
      byPlatform[p.platform].likes += p.likesCount ?? 0;
      byPlatform[p.platform].reach += p.reachCount ?? 0;
    }

    return {
      totalPosts,
      totalLikes,
      totalShares,
      totalComments,
      totalReach,
      publishedCount: posts.filter((p) => p.status === "published").length,
      scheduledCount: posts.filter((p) => p.status === "scheduled").length,
      draftCount: posts.filter((p) => p.status === "draft").length,
      byPlatform,
    };
  }),

  /**
   * Planifier ou publier immédiatement un post social
   * Crée un enregistrement DB par plateforme cible
   */
  schedulePost: tenantProcedure
    .input(z.object({
      content: z.string().min(1),
      platforms: z.array(z.string()).min(1),
      imageUrl: z.string().optional(),
      hashtags: z.array(z.string()).default([]),
      scheduledAt: z.string().optional(), // ISO date string
      type: z.enum(["promotion", "educational", "testimonial", "news", "event"]).default("news"),
    }))
    .mutation(async ({ ctx, input }) => {
      const scheduledDate = input.scheduledAt ? new Date(input.scheduledAt) : null;
      const isImmediate = !scheduledDate || scheduledDate <= new Date();
      const finalStatus = isImmediate ? "published" : "scheduled";

      const insertedIds: number[] = [];
      for (const platform of input.platforms) {
        const inserted = await db.db
          .insert(schema.socialPosts)
          .values({
            tenantId: ctx.tenantId,
            userId: ctx.user.id,
            platform: platform as "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok",
            content: input.content,
            hashtags: input.hashtags,
            imageUrl: input.imageUrl ?? null,
            scheduledAt: scheduledDate,
            publishedAt: isImmediate ? new Date() : null,
            status: finalStatus as "draft" | "scheduled" | "published" | "failed",
            type: input.type as "promotion" | "educational" | "testimonial" | "news" | "event",
          })
          .returning({ id: schema.socialPosts.id });
        if (inserted[0]?.id) insertedIds.push(inserted[0].id);
      }

      logger.info("[SocialRouter] Post planifié/publié", {
        tenantId: ctx.tenantId,
        platforms: input.platforms,
        status: finalStatus,
        ids: insertedIds as any,
      });

      return {
        success: true,
        status: finalStatus,
        ids: insertedIds as any,
        scheduledAt: scheduledDate?.toISOString() ?? null,
      };
    }),
});

/**
 * Utilitaire de déchiffrement de token OAuth (pour les services sociaux)
 * Utilisé par autoReplyService pour récupérer les tokens d'accès stockés en DB
 */
export function decryptToken(encryptedToken: string): string {
  // En production, les tokens sont stockés en clair ou avec chiffrement AES
  // Cette implémentation retourne le token tel quel (compatible avec le stockage actuel)
  if (!encryptedToken) return "";
  try {
    // Si le token est encodé en base64, on le décode
    const decoded = Buffer.from(encryptedToken, "base64").toString("utf-8");
    // Vérification basique : si le décodage donne un token valide, on le retourne
    if (decoded && decoded.length > 10 && !decoded.includes("\x00")) {
      return decoded;
    }
  } catch {
    // Pas du base64, retourner tel quel
  }
  return encryptedToken;
}
