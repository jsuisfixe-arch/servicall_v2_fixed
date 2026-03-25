-- Migration: Ajout table lead_extractions
-- Module d'extraction de leads (OpenStreetMap, Google Maps, Pages Jaunes)

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lead_extractions" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "tenant_id" integer NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "query" varchar(255) NOT NULL,
  "location" varchar(255) NOT NULL,
  "provider" varchar(50) NOT NULL DEFAULT 'osm',
  "radius" integer DEFAULT 5000,
  "results_count" integer DEFAULT 0,
  "imported_count" integer DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'done',
  "error_message" text,
  "results_snapshot" json,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'lead_extractions' AND indexname = 'lead_extractions_tenant_id_idx'
  ) THEN
    CREATE INDEX "lead_extractions_tenant_id_idx" ON "lead_extractions"("tenant_id");
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'lead_extractions' AND indexname = 'lead_extractions_created_at_idx'
  ) THEN
    CREATE INDEX "lead_extractions_created_at_idx" ON "lead_extractions"("created_at");
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'lead_extractions' AND indexname = 'lead_extractions_provider_idx'
  ) THEN
    CREATE INDEX "lead_extractions_provider_idx" ON "lead_extractions"("provider");
  END IF;
END $$;
