/**
 * leadExtractionRouter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Router tRPC pour le module d'extraction de leads.
 *
 * Procédures exposées (correspondant aux appels du frontend LeadExtraction.tsx) :
 *   - search          → rechercher des entreprises (OSM / Google / Pages Jaunes)
 *   - importProspects → importer des entreprises sélectionnées dans les prospects CRM
 *   - getApiKeys      → lire le statut des clés BYOK (masquées)
 *   - saveApiKeys     → sauvegarder / mettre à jour les clés BYOK
 *   - testApiKey      → tester une clé avant de la sauvegarder
 *   - history         → historique des extractions du tenant
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import { router } from "../_core/trpc";
import { tenantProcedure } from "../procedures";
import { TRPCError } from "@trpc/server";
import { logger } from "../infrastructure/logger";
import {
  searchBusinesses,
  importBusinessesAsProspects,
  type Business,
} from "../services/leadExtractionService";
import { saveAPIKey, getAPIKey } from "../services/byokService";
import { db } from "../db";
import { leadExtractions } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ── Schémas de validation ────────────────────────────────────────────────────

const businessSchema = z.object({
  _source: z.enum(["osm", "google", "pagesjaunes"]),
  _externalId: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string().optional(),
  country: z.string(),
  phone: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  category: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  openingHours: z.array(z.string()).optional(),
  description: z.string().optional(),
});

const searchSchema = z.object({
  query: z.string().min(1, "Entrez un type d'activité"),
  location: z.string().min(1, "Entrez une ville ou code postal"),
  radius: z.number().min(500).max(100_000).default(5000),
  maxResults: z.number().min(1).max(60).default(20),
  provider: z.enum(["osm", "google", "pagesjaunes", "auto"]).default("auto"),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const leadExtractionRouter = router({

  /**
   * search — Rechercher des entreprises par activité et localisation
   * Supporte OSM (gratuit), Google Maps (BYOK), Pages Jaunes (BYOK)
   */
  search: tenantProcedure
    .input(searchSchema)
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;

      logger.info("[LeadExtraction] Search started", {
        query: input.query,
        location: input.location,
        provider: input.provider,
        tenantId,
      });

      try {
        const result = await searchBusinesses({
          ...input,
          tenantId,
        });

        logger.info("[LeadExtraction] Search completed", {
          total: result.total,
          provider: result.provider,
          tenantId,
        });

        return result;
      } catch (err) {
        logger.error("[LeadExtraction] Search failed", { err, tenantId });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Erreur lors de la recherche. Veuillez réessayer.",
        });
      }
    }),

  /**
   * importProspects — Importer des entreprises sélectionnées dans les prospects CRM
   * Déduplique par téléphone. Retourne le nombre importé/skipped.
   */
  importProspects: tenantProcedure
    .input(
      z.object({
        extractionId: z.number().optional(),
        businesses: z.array(businessSchema).min(1, "Sélectionnez au moins une entreprise").max(60),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;

      logger.info("[LeadExtraction] Import started", {
        count: input.businesses.length,
        tenantId,
      });

      try {
        const result = await importBusinessesAsProspects(
          input.businesses as Business[],
          tenantId,
          input.extractionId
        );

        logger.info("[LeadExtraction] Import completed", { ...result, tenantId });

        return result;
      } catch (err) {
        logger.error("[LeadExtraction] Import failed", { err, tenantId });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Erreur lors de l'import.",
        });
      }
    }),

  /**
   * getApiKeys — Retourner le statut des clés BYOK (masquées, jamais en clair)
   */
  getApiKeys: tenantProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    try {
      const [googleKey, pjKey, defaultProviderKey] = await Promise.all([
        getAPIKey(tenantId, "google_maps").catch(() => null),
        getAPIKey(tenantId, "pages_jaunes").catch(() => null),
        getAPIKey(tenantId, "lead_default_provider").catch(() => null),
      ]);

      // Masquer les clés : afficher seulement les 4 premiers + 4 derniers caractères
      const maskKey = (key: string | null): string | undefined => {
        if (!key || key.length < 10) return undefined;
        return `${key.slice(0, 4)}...${key.slice(-4)}`;
      };

      return {
        hasGoogleKey: !!googleKey,
        googleKeyMasked: maskKey(googleKey),
        hasPagesJaunesKey: !!pjKey,
        pagesJaunesKeyMasked: maskKey(pjKey),
        defaultProvider: (defaultProviderKey as "osm" | "google" | "pagesjaunes" | null) ?? "osm",
      };
    } catch (err) {
      logger.error("[LeadExtraction] getApiKeys error", { err, tenantId });
      return {
        hasGoogleKey: false,
        googleKeyMasked: undefined,
        hasPagesJaunesKey: false,
        pagesJaunesKeyMasked: undefined,
        defaultProvider: "osm" as const,
      };
    }
  }),

  /**
   * saveApiKeys — Sauvegarder les clés API BYOK (chiffrées AES-256)
   * Accepte : googleMapsApiKey, pagesJaunesApiKey, defaultProvider
   */
  saveApiKeys: tenantProcedure
    .input(
      z.object({
        googleMapsApiKey: z.string().optional(),
        pagesJaunesApiKey: z.string().optional(),
        defaultProvider: z.enum(["osm", "google", "pagesjaunes"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      const results: string[] = [];
      const errors: string[] = [];

      if (input.googleMapsApiKey) {
        const r = await saveAPIKey(tenantId, "google_maps", input.googleMapsApiKey);
        if (r.success) results.push("Google Maps");
        else errors.push("Google Maps");
      }

      if (input.pagesJaunesApiKey) {
        const r = await saveAPIKey(tenantId, "pages_jaunes", input.pagesJaunesApiKey);
        if (r.success) results.push("Pages Jaunes");
        else errors.push("Pages Jaunes");
      }

      if (input.defaultProvider) {
        await saveAPIKey(tenantId, "lead_default_provider", input.defaultProvider).catch(
          () => null
        );
        results.push(`Fournisseur par défaut : ${input.defaultProvider}`);
      }

      if (errors.length > 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erreur lors de la sauvegarde de : ${errors.join(", ")}`,
        });
      }

      return {
        success: true,
        saved: results,
        message: `Clés sauvegardées : ${results.join(", ")}`,
      };
    }),

  /**
   * testApiKey — Tester une clé API avant de la sauvegarder
   * Effectue un appel réel pour valider la clé.
   */
  testApiKey: tenantProcedure
    .input(
      z.object({
        provider: z.enum(["google", "pagesjaunes"]),
        apiKey: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.provider === "google") {
          // Test Google Maps avec un geocoding simple
          const testUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
          testUrl.searchParams.set("address", "Paris, France");
          testUrl.searchParams.set("key", input.apiKey);

          const res = await fetch(testUrl.toString(), { signal: AbortSignal.timeout(10_000) });
          const data = (await res.json()) as { status: string; error_message?: string };

          if (data.status === "OK" || data.status === "ZERO_RESULTS") {
            return { success: true, message: "✅ Clé Google Maps valide" };
          } else if (data.status === "REQUEST_DENIED") {
            return {
              success: false,
              message: `❌ Clé refusée par Google : ${data.error_message ?? data.status}`,
            };
          } else {
            return { success: false, message: `❌ Statut inattendu : ${data.status}` };
          }
        } else if (input.provider === "pagesjaunes") {
          // Test Pages Jaunes avec une recherche simple
          const res = await fetch(
            `https://api.pagesjaunes.fr/v1/pros?what=test&where=Paris&count=1`,
            {
              headers: { Authorization: `Bearer ${input.apiKey}` },
              signal: AbortSignal.timeout(10_000),
            }
          );
          if (res.ok || res.status === 400) {
            return { success: true, message: "✅ Clé Pages Jaunes valide" };
          } else if (res.status === 401 || res.status === 403) {
            return { success: false, message: "❌ Clé Pages Jaunes invalide ou expirée" };
          } else {
            return { success: false, message: `❌ Erreur API Pages Jaunes : ${res.status}` };
          }
        }

        return { success: false, message: "Provider inconnu" };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, message: `❌ Erreur réseau : ${msg}` };
      }
    }),

  /**
   * history — Historique des extractions du tenant (10 dernières par défaut)
   */
  history: tenantProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;

      try {
        const rows = await db
          .select({
            id: leadExtractions.id,
            query: leadExtractions.query,
            location: leadExtractions.location,
            provider: leadExtractions.provider,
            resultsCount: leadExtractions.resultsCount,
            importedCount: leadExtractions.importedCount,
            status: leadExtractions.status,
            errorMessage: leadExtractions.errorMessage,
            createdAt: leadExtractions.createdAt,
          })
          .from(leadExtractions)
          .where(eq(leadExtractions.tenantId, tenantId))
          .orderBy(desc(leadExtractions.createdAt))
          .limit(input.limit);

        return rows;
      } catch (err) {
        logger.error("[LeadExtraction] History fetch error", { err, tenantId });
        return [];
      }
    }),
});
