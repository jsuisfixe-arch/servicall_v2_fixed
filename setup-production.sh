#!/bin/bash
# ============================================================
# SERVICALL V3 — Setup initial de production (Ubuntu/Debian)
# Usage: sudo bash setup-production.sh
# ============================================================
set -e

echo "========================================"
echo "  SERVICALL V3 — Setup Production"
echo "========================================"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 1. Installation des dépendances système
echo "[1/8] Installation des dépendances système..."
apt-get update -qq
apt-get install -y postgresql postgresql-contrib redis-server curl

# 2. Configuration PostgreSQL
echo "[2/8] Configuration PostgreSQL..."
service postgresql start
sleep 2
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE servicall OWNER postgres;" 2>/dev/null || echo "DB existe déjà"
# Autoriser l'authentification md5
sed -i 's/scram-sha-256/md5/g' /etc/postgresql/*/main/pg_hba.conf 2>/dev/null || true
service postgresql restart
sleep 2

# 3. Démarrage Redis
echo "[3/8] Démarrage Redis..."
service redis-server start
sleep 1

# 4. Installation Node.js 20+ si nécessaire
if ! node --version 2>/dev/null | grep -qE "v(20|21|22)"; then
  echo "[4/8] Installation Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "[4/8] Node.js $(node --version) déjà installé"
fi

# 5. Installation pnpm
echo "[5/8] Installation pnpm..."
npm install -g pnpm@9 2>/dev/null || true

# 6. Installation des dépendances npm
echo "[6/8] Installation des dépendances npm..."
pnpm install --frozen-lockfile 2>&1 | tail -5

# 7. Build de production
echo "[7/8] Build de production..."
NODE_OPTIONS='--max-old-space-size=4096' pnpm exec vite build 2>&1 | tail -5
pnpm exec esbuild server/index.ts --platform=node --packages=external --bundle --format=esm \
  --external:vite --external:../../vite.config --outdir=dist 2>&1 | tail -3
echo "[✓] Build terminé"

# 8. Migrations et seed admin
echo "[8/8] Migrations et création du compte admin..."
# Appliquer le schéma principal
PGPASSWORD=postgres psql -U postgres -d servicall -h localhost \
  -f drizzle/0000_lonely_vance_astro.sql > /dev/null 2>&1 || true
# Appliquer les migrations
for f in drizzle/migrations/*.sql; do
  PGPASSWORD=postgres psql -U postgres -d servicall -h localhost -f "$f" > /dev/null 2>&1 || true
done
# Colonnes manquantes
PGPASSWORD=postgres psql -U postgres -d servicall -h localhost \
  -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_agent_type VARCHAR(10) DEFAULT 'AI';" > /dev/null 2>&1 || true
PGPASSWORD=postgres psql -U postgres -d servicall -h localhost \
  -c "ALTER TABLE calls ADD COLUMN IF NOT EXISTS assigned_agent_type VARCHAR(10) DEFAULT 'AI';" > /dev/null 2>&1 || true
# Créer le compte admin
pnpm exec tsx server/scripts/create-admin-standalone.ts 2>&1 | grep -E "✅|❌|Admin"

echo ""
echo "========================================"
echo "  SERVICALL V3 — Setup terminé !"
echo ""
echo "  Démarrer avec: bash start-complete.sh"
echo "  Admin: admin@servicall.com"
echo "  Mot de passe: Admin@Servicall2024!"
echo "========================================"
