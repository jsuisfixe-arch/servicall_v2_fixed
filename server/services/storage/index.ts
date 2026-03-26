import { IStorageService } from "./IStorageService";
import { LocalStorageService } from "./LocalStorageService";
import { ForgeStorageService } from "./ForgeStorageService";
import { logger } from "../../infrastructure/logger";

/**
 * Storage Factory - Gère l'instanciation du service de stockage
 * ✅ BLOC 2: Priorité au stockage S3 (ForgeStorageService) pour la scalabilité
 */
class StorageFactory {
  private static instance: IStorageService;

  static getInstance(): IStorageService {
    if (!this.instance) {
      // ✅ Priorité aux credentials AWS/Forge pour forcer S3 en production
      const hasAwsCredentials = !!process.env['AWS_ACCESS_KEY_ID'] && !!process.env['AWS_SECRET_ACCESS_KEY'];
      const forceForge = process.env['STORAGE_TYPE'] === "forge";
      
      if (forceForge || hasAwsCredentials) {
        logger.info("[StorageFactory] Using ForgeStorageService (S3-compatible)");
        this.instance = new ForgeStorageService();
      } else {
        logger.info("[StorageFactory] Using LocalStorageService (fallback)");
        this.instance = new LocalStorageService();
      }
    }
    return this.instance;
  }
}

export const storageService = StorageFactory.getInstance();
export * from "./IStorageService";
export * from "./LocalStorageService";
export * from "./ForgeStorageService";
