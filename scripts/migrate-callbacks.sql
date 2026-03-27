-- ============================================================
-- MIGRATION : Rappels IA + Config callback agents
-- À appliquer sur la base de production
-- ============================================================

-- 1. Colonnes callback sur la table users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS callback_phone        VARCHAR(50),
  ADD COLUMN IF NOT EXISTS callback_notify_mode  VARCHAR(20) NOT NULL DEFAULT 'crm',
  ADD COLUMN IF NOT EXISTS is_available_for_transfer BOOLEAN NOT NULL DEFAULT true;

-- 2. Table scheduled_callbacks
CREATE TABLE IF NOT EXISTS scheduled_callbacks (
  id                    SERIAL PRIMARY KEY,
  tenant_id             INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  prospect_phone        VARCHAR(50)  NOT NULL,
  prospect_name         VARCHAR(255),
  prospect_id           INTEGER,
  call_sid              VARCHAR(255),
  call_id               INTEGER,
  trigger_reason        VARCHAR(50)  NOT NULL,
  scheduled_at          TIMESTAMP    NOT NULL,
  notify_mode           VARCHAR(20)  NOT NULL DEFAULT 'crm',
  assigned_user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status                VARCHAR(30)  NOT NULL DEFAULT 'pending',
  callback_call_sid     VARCHAR(255),
  completed_at          TIMESTAMP,
  conversation_summary  TEXT,
  metadata              JSONB        NOT NULL DEFAULT '{}',
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 3. Index performance
CREATE INDEX IF NOT EXISTS idx_callbacks_tenant_id     ON scheduled_callbacks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_callbacks_status        ON scheduled_callbacks(status);
CREATE INDEX IF NOT EXISTS idx_callbacks_scheduled_at  ON scheduled_callbacks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_callbacks_prospect_phone ON scheduled_callbacks(tenant_id, prospect_phone);

-- 4. Commentaires
COMMENT ON TABLE  scheduled_callbacks                        IS 'Rappels planifiés par l''IA ou manuellement';
COMMENT ON COLUMN scheduled_callbacks.trigger_reason         IS 'no_info | caller_request | sentiment_low | manual';
COMMENT ON COLUMN scheduled_callbacks.notify_mode            IS 'crm | phone | both';
COMMENT ON COLUMN scheduled_callbacks.status                 IS 'pending | notified | called | completed | failed | cancelled';
COMMENT ON COLUMN users.callback_notify_mode                 IS 'crm | phone | both — canal de notification rappels';
COMMENT ON COLUMN users.is_available_for_transfer            IS 'true = agent dispo pour transfert direct IA';
