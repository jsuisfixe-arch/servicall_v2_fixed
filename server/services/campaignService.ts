
/**
 * Campaign Service - Orchestration des campagnes multi-flux
 * Gère la logique spécifique à chaque type de campagne (Call, SMS, WhatsApp).
 */

import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { campaignProspects } from "../../drizzle/schema-campaigns";
import { prospects } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "../infrastructure/logger";

export class CampaignService {
  /**
   * Récupérer une campagne par son ID
   */
  static async getCampaignById(campaignId: number) {
    const db = await getDb();
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);
    return campaign;
  }

  /**
   * Récupérer les campagnes pour un tenant
   */
  static async getCampaigns(tenantId: number, options: { limit?: number; offset?: number; status?: string } = {}) {
    const { limit = 50, offset = 0, status } = options;
    const db = await getDb();
    
    let whereClause = eq(schema.campaigns.tenantId, tenantId);
    
    if (status) {
      whereClause = and(whereClause, eq(schema.campaigns.status, status));
    }

    return await db.query.campaigns.findMany({
      where: whereClause,
      orderBy: schema.campaigns.createdAt,
      limit,
      offset,
    });
  }

  /**
   * Créer une nouvelle campagne
   */
  static async createCampaign(data: typeof schema.campaigns.$inferInsert) {
    const db = await getDb();
    logger.info(`[Campaign] Creating new campaign: ${data.name}`, { type: data.type });
    const [newCampaign] = await db.insert(schema.campaigns).values(data).returning();
    return newCampaign;
  }

  /**
   * Mettre à jour une campagne
   */
  static async updateCampaign(campaignId: number, data: Partial<typeof schema.campaigns.$inferInsert>) {
    const db = await getDb();
    logger.info(`[Campaign] Updating campaign ${campaignId}`, { campaignId, fields: Object.keys(data) });
    return await db
      .update(schema.campaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.campaigns.id, campaignId))
      .returning();
  }

  /**
   * Changer l'état d'une campagne
   */
  static async updateStatus(campaignId: number, status: "draft" | "ready" | "active" | "paused" | "completed") {
    return await this.updateCampaign(campaignId, { status });
  }

  /**
   * Ajouter des prospects à une campagne
   */
  static async addProspects(campaignId: number, prospectIds: number[]) {
    logger.info(`[Campaign] Adding ${prospectIds.length} prospects to campaign ${campaignId}`);
    if (prospectIds.length === 0) return [];
    const db = await getDb();

    // Récupérer les infos des prospects (pour stocker en metadata)
    const prospectRecords = await db
      .select({
        id: prospects.id,
        phone: prospects.phone,
        firstName: prospects.firstName,
        lastName: prospects.lastName,
      })
      .from(prospects)
      .where(inArray(prospects.id, prospectIds));

    if (prospectRecords.length === 0) {
      logger.warn(`[Campaign] No valid prospects found for ids: ${prospectIds.join(",")}`);
      return [];
    }

    // Filtrer les prospects sans téléphone
    const withPhone = prospectRecords.filter(p => !!p.phone);
    if (withPhone.length === 0) {
      logger.warn(`[Campaign] No prospects with phone number for campaign ${campaignId}`);
      return [];
    }

    // Insertion avec gestion des doublons (colonnes réelles en DB : campaign_id, prospect_id, status, metadata)
    const values = withPhone.map(p => ({
      campaignId,
      prospectId: p.id,
      status: "pending" as const,
      metadata: {
        phone: p.phone,
        name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Inconnu",
        addedAt: new Date().toISOString(),
      },
    }));

    const inserted = await db
      .insert(campaignProspects)
      .values(values)
      .onConflictDoNothing()
      .returning();

    logger.info(`[Campaign] ${inserted.length} prospects added to campaign ${campaignId}`);
    return inserted;
  }

  /**
   * Récupérer les prospects d'une campagne
   */
  static async getCampaignProspects(campaignId: number) {
    const db = await getDb();
    return await db
      .select({
        id: schema.campaignProspects.id,
        status: schema.campaignProspects.status,
        prospect: schema.prospects
      })
      .from(schema.campaignProspects)
      .innerJoin(schema.prospects, eq(schema.campaignProspects.prospectId, schema.prospects.id))
      .where(eq(schema.campaignProspects.campaignId, campaignId));
  }
}
