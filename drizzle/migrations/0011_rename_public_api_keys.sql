-- Migration 0011: Renommer api_keys → public_api_keys pour éviter la collision avec BYOK
-- La table "api_keys" dans schema.ts (tokens d'accès publique) entre en collision avec
-- la table "api_keys" dans schema-byok-services.ts (clés BYOK chiffrées).
-- On renomme la table publique pour lever l'ambiguïté.

--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'api_keys'
      AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'public_api_keys'
      AND table_schema = 'public'
  ) THEN
    -- Vérifier si la table "api_keys" contient la colonne "key" (= table publique tokens)
    -- vs "encrypted_key" (= table BYOK). Si "key" existe → c'est la table publique à renommer.
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'api_keys' AND column_name = 'key'
    ) THEN
      ALTER TABLE "api_keys" RENAME TO "public_api_keys";
    END IF;
  END IF;
END $$;
--> statement-breakpoint
-- Recréer les index sous le nouveau nom si la table a été renommée
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'public_api_keys'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'public_api_keys' AND indexname = 'public_api_keys_key_idx') THEN
      CREATE UNIQUE INDEX "public_api_keys_key_idx" ON "public_api_keys"("key");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'public_api_keys' AND indexname = 'public_api_keys_tenant_id_idx') THEN
      CREATE INDEX "public_api_keys_tenant_id_idx" ON "public_api_keys"("tenant_id");
    END IF;
  END IF;
END $$;
