/**
 * DATABASE MANAGER SERVICE - VERSION POSTGRESQL (PRODUCTION GRADE)
 * Centralise tout l'accès à la base de données PostgreSQL
 */

import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../drizzle/schema";
import { logger } from "../infrastructure/logger";
import { sql } from "drizzle-orm";

type DrizzleDB = PostgresJsDatabase<typeof schema>;

export class DBManager {
  private static instance: DBManager;
  private _db: DrizzleDB | null = null;
  private _client: postgres.Sql | null = null;
  private _initPromise: Promise<void> | null = null;
  private _isInitialized = false;

  private constructor() {}

  public static getInstance(): DBManager {
    if (!DBManager.instance) {
      DBManager.instance = new DBManager();
    }
    return DBManager.instance;
  }

  /**
   * Initialise la connexion PostgreSQL de manière robuste
   */
  public async initialize(): Promise<void> {
    // Si déjà initialisé, retourner
    if (this._isInitialized && this._db) {
      logger.debug("[DBManager] Déjà initialisé, retour immédiat");
      return;
    }

    // Si une initialisation est en cours, attendre sa fin
    if (this._initPromise) {
      logger.debug("[DBManager] Initialisation en cours, attente...");
      return this._initPromise;
    }

    // Créer la promesse d'initialisation
    this._initPromise = this._performInitialization();
    return this._initPromise;
  }

  private async _performInitialization(): Promise<void> {
    const databaseUrl = process.env["DATABASE_URL"];

    if (!databaseUrl || !databaseUrl.startsWith("postgres")) {
      const error = "[DBManager] ❌ DATABASE_URL invalide ou manquante (PostgreSQL requis)";
      logger.error(error);
      throw new Error(error);
    }

    try {
      logger.info("[DBManager] Connexion à PostgreSQL...");

      this._client = postgres(databaseUrl, {
        max: 25,
        idle_timeout: 10,
        connect_timeout: 10,
        max_lifetime: 60 * 15,
        connection: {
          statement_timeout: 25000,
        },
        onnotice: () => {},
        onparameter: (_name: string, _value: string) => {},
        ssl:
          process.env["NODE_ENV"] === "production" &&
          !databaseUrl.includes("localhost")
            ? "require"
            : false,
      });

      this._db = drizzle(this._client, { schema });

      // Test de connexion immédiat
      logger.info("[DBManager] Test de connexion...");
      await this._client`SELECT 1`;

      this._isInitialized = true;
      logger.info("[DBManager] ✅ PostgreSQL initialisé et connexion réussie");
    } catch (error: unknown) {
      this._db = null;
      this._client = null;
      this._isInitialized = false;

      const errorMsg =
        error instanceof Error ? error.message : String(error);
      logger.error(
        "[DBManager] ❌ Erreur lors de l'initialisation PostgreSQL : " + errorMsg
      );

      throw error;
    }
  }

  public get db(): DrizzleDB {
    if (!this._db || !this._isInitialized) {
      throw new Error(
        "[DBManager] Base de données non initialisée. Appelez initialize() avant toute opération."
      );
    }
    return this._db;
  }

  public get client() {
    if (!this._client || !this._isInitialized) {
      throw new Error(
        "[DBManager] ❌ Tentative d'accès au client avant initialisation."
      );
    }
    return this._client;
  }

  public isReady(): boolean {
    return this._isInitialized && this._db !== null;
  }

  public async transaction<T>(
    callback: (tx: any) => Promise<T>
  ): Promise<T> {
    if (!this._isInitialized) {
      await this.initialize();
    }
    return await this.db.transaction(callback);
  }

  public async withTenantContext<T>(
    tenantId: number,
    callback: (tx: any) => Promise<T>
  ): Promise<T> {
    if (!this._isInitialized) {
      await this.initialize();
    }

    return await this.db.transaction(async (tx: any) => {
      await tx.execute(
        sql`SELECT set_config('app.current_tenant_id', ${tenantId.toString()}, true)`
      );
      return await callback(tx);
    });
  }

  public async close() {
    if (this._client) {
      try {
        await this._client.end();
        logger.info("[DBManager] PostgreSQL connections closed");
      } catch (error: unknown) {
        logger.error(
          "[DBManager] Erreur lors de la fermeture des connexions : " +
          (error instanceof Error ? error.message : String(error))
        );
      } finally {
        this._client = null;
        this._db = null;
        this._isInitialized = false;
        this._initPromise = null;
      }
    }
  }
}

export const dbManager = DBManager.getInstance();
