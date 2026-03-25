import { Router, Request, Response } from "express";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { db } from "../infrastructure/db";
import { campaigns, campaignProspects, prospects } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { DialerEngine } from "../services/dialer/dialer-engine";
import { logger } from "../infrastructure/logger";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
let dialerEngine: DialerEngine;

/**
 * Initialiser le moteur de dialer
 */
export function initializeCampaignRoutes(engine: DialerEngine) {
  dialerEngine = engine;
}

/**
 * GET /api/campaigns - Récupérer toutes les campagnes
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const allCampaigns = await db.select().from(campaigns);
    res.json(allCampaigns);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error fetching campaigns:", msg);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

/**
 * GET /api/campaigns/:id - Récupérer une campagne spécifique
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, parseInt(id)));

    if (campaign.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(campaign[0]);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error fetching campaign:", msg);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

/**
 * POST /api/campaigns - Créer une nouvelle campagne
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;

    const newCampaign = await db
      .insert(campaigns)
      .values({
        name,
        description,
        status: (status as any) || "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(newCampaign[0]);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error creating campaign:", msg);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

/**
 * PUT /api/campaigns/:id - Mettre à jour une campagne
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const updated = await db
      .update(campaigns)
      .set({
        name,
        description,
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(updated[0]);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error updating campaign:", msg);
    res.status(500).json({ error: "Failed to update campaign" });
  }
});

/**
 * POST /api/campaigns/:id/start - Démarrer une campagne
 */
router.post("/:id/start", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Mettre à jour le statut de la campagne
    await db
      .update(campaigns)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, parseInt(id)));

    // Démarrer le moteur de dialer
    // ✅ FIX P4: req.tenantId est déjà dans le type global
    const tenantId = req.tenantId ?? 1;
    await dialerEngine.startCampaign(parseInt(id), tenantId, {
      maxAttempts: 3,
      maxConcurrentCalls: 5,
    });

    res.json({ message: "Campaign started successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error starting campaign:", msg);
    res.status(500).json({ error: "Failed to start campaign" });
  }
});

/**
 * POST /api/campaigns/:id/stop - Arrêter une campagne
 */
router.post("/:id/stop", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Mettre à jour le statut de la campagne
    await db
      .update(campaigns)
      .set({
        status: "paused",
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, parseInt(id)));

    // Arrêter le moteur de dialer
    await dialerEngine.stopCampaign(parseInt(id));

    res.json({ message: "Campaign stopped successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error stopping campaign:", msg);
    res.status(500).json({ error: "Failed to stop campaign" });
  }
});

/**
 * GET /api/campaigns/:id/status - Obtenir le statut d'une campagne
 */
router.get("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const status = await dialerEngine.getCampaignStatus(parseInt(id));

    res.json(status);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error fetching campaign status:", msg);
    res.status(500).json({ error: "Failed to fetch campaign status" });
  }
});

/**
 * GET /api/campaigns/:id/prospects - Récupérer les prospects d'une campagne
 */
router.get("/:id/prospects", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prospectsData = await db
      .select()
      .from(campaignProspects)
      .where(eq(campaignProspects.campaignId, parseInt(id)));

    res.json(prospectsData);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error fetching prospects:", msg);
    res.status(500).json({ error: "Failed to fetch prospects" });
  }
});

/**
 * POST /api/campaigns/:id/import-prospects - Importer des prospects via CSV
 */
router.post("/:id/import-prospects", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaignId = parseInt(id);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const prospectsToInsert: Array<typeof campaignProspects.$inferInsert> = [];
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    bufferStream
      .pipe(csv())
      .on("data", async (row) => {
        if (row.phone) {
          // Check if prospect already exists
          let existingProspect = await db.select().from(prospects).where(eq(prospects.phone, row.phone)).limit(1);
          let prospectId;

          if (existingProspect.length > 0) {
            prospectId = existingProspect[0].id;
          } else {
            // Create new prospect if not exists
            const newProspect = await db.insert(prospects).values({
              tenantId: req.tenantId,
              firstName: row.name || "",
              phone: row.phone,
              status: "new",
              createdAt: new Date(),
              updatedAt: new Date(),
            }).returning();
            prospectId = newProspect[0]?.id;
          }

          if (prospectId) {
            prospectsToInsert.push({
              campaignId: campaignId,
              prospectId: prospectId,
              status: "pending",
              callAttempts: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      })
      .on("end", async () => {
        try {
          if (prospectsToInsert.length > 0) {
            // ✅ FIX P4: Retrait de "as any" car prospectsToInsert est déjà typé correctement
            await db.insert(campaignProspects).values(prospectsToInsert);
            res.status(200).json({ message: `${prospectsToInsert.length} prospects imported successfully` });
          } else {
            res.status(400).json({ error: "No valid prospects found in CSV" });
          }
        } catch (dbError: unknown) {
          const msg = dbError instanceof Error ? dbError.message : String(dbError);
          logger.error("Database error during CSV import:", msg);
          res.status(500).json({ error: "Failed to save prospects to database" });
        }
      });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error importing prospects:", msg);
    res.status(500).json({ error: "Failed to import prospects" });
  }
});

/**
 * DELETE /api/campaigns/:id - Supprimer une campagne
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Supprimer d'abord les prospects associés
    await db.delete(campaignProspects).where(eq(campaignProspects.campaignId, parseInt(id)));

    // Puis supprimer la campagne
    await db.delete(campaigns).where(eq(campaigns.id, parseInt(id)));

    res.json({ message: "Campaign deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error deleting campaign:", msg);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

export default router;
