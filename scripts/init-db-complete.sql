-- ============================================
-- SERVICALL V2.0 - COMPLETE DATABASE INIT
-- ============================================
-- This script initializes the complete database schema
-- with all tables, columns, and seed data

-- 1. Apply all migrations
\i drizzle/migrations/0000_freezing_quicksilver.sql
\i drizzle/migrations/0001_add_business_configuration.sql
\i drizzle/migrations/0002_add_pos_config_and_vat.sql
\i drizzle/migrations/0003_add_recruitment_module.sql
\i drizzle/migrations/0004_fix_simulated_calls.sql
\i drizzle/migrations/0005_add_recruitment_enhancements.sql

-- 2. Fix missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_agent_type VARCHAR(10) DEFAULT 'AI';
ALTER TABLE agent_performance ADD COLUMN IF NOT EXISTS tenant_id INTEGER;
ALTER TABLE agent_switch_history ADD COLUMN IF NOT EXISTS tenant_id INTEGER;
ALTER TABLE blacklisted_numbers ADD COLUMN IF NOT EXISTS tenant_id INTEGER;
ALTER TABLE coaching_feedback ADD COLUMN IF NOT EXISTS tenant_id INTEGER;
ALTER TABLE failed_jobs ADD COLUMN IF NOT EXISTS queue VARCHAR(255) DEFAULT 'default';
ALTER TABLE stripe_events ADD COLUMN IF NOT EXISTS event_id VARCHAR(255);

-- Fix missing columns in prospects
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS assigned_to INTEGER;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Fix missing columns in campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS activity_type VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS details JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS script TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS max_calls INTEGER DEFAULT 100;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;

-- 3. Create missing tables
CREATE TABLE IF NOT EXISTS ai_memories (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER,
    prospect_id INTEGER,
    user_id INTEGER,
    content TEXT,
    memory_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_configurations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER,
    provider VARCHAR(50),
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER,
    to_email VARCHAR(255),
    subject TEXT,
    status VARCHAR(50),
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Seed default tenant
INSERT INTO tenants (name, slug, is_active, settings)
VALUES ('Servicall Default', 'servicall-default', true, '{}')
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed admin user
INSERT INTO users (open_id, name, email, password_hash, role, login_method, is_active, assigned_agent_type)
VALUES (
  'admin-seed-001',
  'System Admin',
  'admin@servicall.com',
  '$2b$12$EgyVSk0QZCBKJFlpU9psVe15bBK2PCEo4mcaNexOWR90MbmJdm.vC',
  'admin',
  'password',
  true,
  'AI'
)
ON CONFLICT DO NOTHING;

-- 6. Link admin to tenant
INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
SELECT t.id, u.id, 'admin', true
FROM tenants t, users u
WHERE t.slug = 'servicall-default' AND u.email = 'admin@servicall.com'
ON CONFLICT DO NOTHING;

-- 7. Verification
SELECT 'Database initialization complete' as status;
SELECT count(*) as tenant_count FROM tenants;
SELECT count(*) as user_count FROM users;
SELECT count(*) as tenant_user_count FROM tenant_users;
