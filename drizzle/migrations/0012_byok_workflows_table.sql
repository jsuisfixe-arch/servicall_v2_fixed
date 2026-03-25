-- Migration 0012: Créer table byok_workflows (renommage depuis workflows BYOK)
-- La table "workflows" BYOK (schema-byok-services) entre en collision avec
-- la table "workflows" CRM (schema.ts). On crée byok_workflows pour séparer.

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "byok_workflows" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "tenant_id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "definition" json NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'byok_workflows' AND indexname = 'byok_workflows_tenant_id_idx'
  ) THEN
    CREATE INDEX "byok_workflows_tenant_id_idx" ON "byok_workflows"("tenant_id");
  END IF;
END $$;
