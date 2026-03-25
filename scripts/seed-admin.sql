-- Seed de production : Tenant par défaut + Admin
BEGIN;

-- 1. Tenant par défaut
INSERT INTO tenants (name, slug, is_active, settings)
VALUES ('Servicall Default', 'servicall-default', true, '{}')
ON CONFLICT (slug) DO NOTHING;

-- 2. Admin principal
INSERT INTO users (open_id, name, email, password_hash, role, login_method)
VALUES (
  'admin-seed-001',
  'System Admin',
  'admin@servicall.com',
  '$2b$12$EgyVSk0QZCBKJFlpU9psVe15bBK2PCEo4mcaNexOWR90MbmJdm.vC',
  'admin',
  'password'
)
ON CONFLICT DO NOTHING;

-- 3. Liaison tenant-user
INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
SELECT t.id, u.id, 'admin', true
FROM tenants t, users u
WHERE t.slug = 'servicall-default' AND u.email = 'admin@servicall.com'
ON CONFLICT DO NOTHING;

COMMIT;

-- Vérification
SELECT 'Tenants:' as info, count(*) FROM tenants;
SELECT 'Users:' as info, count(*) FROM users;
SELECT id, name, email, role FROM users;
