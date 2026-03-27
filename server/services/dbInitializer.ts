/**
 * DB INITIALIZER - Gestion robuste de l'initialisation PostgreSQL
 * Garantit que la base de données est prête avant tout accès
 */

import { dbManager } from "./dbManager";
import { logger } from "../infrastructure/logger";

let initializationPromise: Promise<void> | null = null;
let isInitialized = false;

export async function ensureDatabaseInitialized(): Promise<void> {
  // Si déjà initialisé, retourner immédiatement
  if (isInitialized) {
    return;
  }

  // Si une initialisation est en cours, attendre sa fin
  if (initializationPromise) {
    return initializationPromise;
  }

  // Lancer l'initialisation
  initializationPromise = (async () => {
    try {
      logger.info("[DBInitializer] Début de l'initialisation de la base de données...");
      
      // Attendre l'initialisation du DBManager
      await dbManager.initialize();
      
      logger.info("[DBInitializer] ✅ Base de données initialisée avec succès");
      isInitialized = true;
    } catch (error: unknown) {
      logger.error("[DBInitializer] ❌ Erreur lors de l'initialisation de la base de données", error);
      isInitialized = false;
      throw error;
    }
  })();

  return initializationPromise;
}

export function isDatabaseReady(): boolean {
  return isInitialized;
}

export async function resetInitialization(): Promise<void> {
  isInitialized = false;
  initializationPromise = null;
}
