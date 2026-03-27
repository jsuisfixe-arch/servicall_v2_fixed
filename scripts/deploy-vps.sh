#!/bin/bash
# ============================================================
# SERVICALL v2.0 - Script de déploiement VPS Ubuntu
# ============================================================
# Usage: bash deploy-vps.sh
# Prérequis: Node.js 20+, PostgreSQL 14+, Redis 6+, pnpm 9+
set -e

echo "============================================"
echo "  SERVICALL v2.0 - Déploiement VPS Ubuntu"
echo "============================================"

# ── Couleurs ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ── 1. Prérequis ──────────────────────────────────────────
echo ""
echo "[1/7] Vérification des prérequis..."
command -v node >/dev/null 2>&1 || err "Node.js requis (v20+). Installez avec: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
command -v psql >/dev/null 2>&1 || err "PostgreSQL requis. Installez avec: sudo apt-get install -y postgresql"
command -v redis-cli >/dev/null 2>&1 || err "Redis requis. Installez avec: sudo apt-get install -y redis-server"
command -v pnpm >/dev/null 2>&1 || { warn "pnpm absent, installation..."; npm install -g pnpm; }

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  err "Node.js v18+ requis (actuel: v$NODE_VERSION)"
fi
ok "Prérequis OK (Node.js v$(node --version))"

# ── 2. Configuration .env ─────────────────────────────────
echo ""
echo "[2/7] Configuration de l'environnement..."
if [ ! -f .env ]; then
  cp .env.example .env
  warn "Fichier .env créé depuis .env.example"
  warn "IMPORTANT: Éditez .env avec vos vraies valeurs avant de continuer!"
  warn "Variables critiques: DATABASE_URL, SESSION_SECRET, JWT_SECRET, CSRF_SECRET"
  echo ""
  read -p "Appuyez sur Entrée pour continuer après avoir configuré .env..."
fi

# Vérifier les variables critiques
source .env 2>/dev/null || true
MISSING_VARS=""
for VAR in DATABASE_URL SESSION_SECRET JWT_SECRET CSRF_SECRET ENCRYPTION_KEY; do
  if [ -z "${!VAR}" ]; then
    MISSING_VARS="$MISSING_VARS $VAR"
  fi
done

if [ -n "$MISSING_VARS" ]; then
  err "Variables manquantes dans .env:$MISSING_VARS"
fi
ok "Configuration .env OK"

# ── 3. Services PostgreSQL et Redis ───────────────────────
echo ""
echo "[3/7] Démarrage des services..."
sudo service postgresql start 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || warn "PostgreSQL déjà démarré ou démarrage manuel requis"
sudo service redis-server start 2>/dev/null || sudo systemctl start redis-server 2>/dev/null || warn "Redis déjà démarré ou démarrage manuel requis"
sleep 2

# Vérifier la connexion PostgreSQL
if ! PGPASSWORD="${PGPASSWORD:-}" psql "${DATABASE_URL}" -c "SELECT 1" >/dev/null 2>&1; then
  warn "Connexion PostgreSQL échouée - vérifiez DATABASE_URL dans .env"
  warn "Créez la base de données avec:"
  warn "  sudo -u postgres psql -c \"CREATE USER servicall WITH PASSWORD 'servicall_pass';\""
  warn "  sudo -u postgres psql -c \"CREATE DATABASE servicall_db OWNER servicall;\""
fi
ok "Services démarrés"

# ── 4. Dépendances Node.js ────────────────────────────────
echo ""
echo "[4/7] Installation des dépendances..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
ok "Dépendances installées"

# ── 5. Migration base de données ──────────────────────────
echo ""
echo "[5/7] Migration de la base de données..."
if [ -f "scripts/init-db-complete.sql" ]; then
  DB_URL="${DATABASE_URL}"
  # Extraire les composants de l'URL
  DB_USER=$(echo $DB_URL | sed 's|.*://\([^:]*\):.*|\1|')
  DB_PASS=$(echo $DB_URL | sed 's|.*://[^:]*:\([^@]*\)@.*|\1|')
  DB_HOST=$(echo $DB_URL | sed 's|.*@\([^:/]*\).*|\1|')
  DB_PORT=$(echo $DB_URL | sed 's|.*:\([0-9]*\)/.*|\1|')
  DB_NAME=$(echo $DB_URL | sed 's|.*/\([^?]*\).*|\1|')
  
  PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h "$DB_HOST" -p "${DB_PORT:-5432}" -d "$DB_NAME" -f scripts/init-db-complete.sql 2>/dev/null || warn "Migration SQL ignorée (peut-être déjà appliquée)"
else
  pnpm exec drizzle-kit push 2>/dev/null || warn "Migration Drizzle ignorée"
fi
ok "Base de données migrée"

# ── 6. Build de production ────────────────────────────────
echo ""
echo "[6/7] Build de production..."
NODE_OPTIONS='--max-old-space-size=8192' pnpm exec vite build
pnpm exec esbuild server/_core/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist
ok "Build terminé (dist/index.js: $(du -sh dist/index.js 2>/dev/null | cut -f1))"

# ── 7. Démarrage ──────────────────────────────────────────
echo ""
echo "[7/7] Démarrage du serveur..."
mkdir -p logs

if command -v pm2 >/dev/null 2>&1; then
  pm2 stop servicall 2>/dev/null || true
  pm2 start ecosystem.config.js --env production
  pm2 save
  ok "Serveur démarré avec PM2"
  echo ""
  echo "Vérification: pm2 logs servicall"
else
  warn "PM2 absent. Démarrage direct (non recommandé pour la prod):"
  warn "  NODE_ENV=production node dist/index.js"
  warn "Pour PM2: npm install -g pm2 && pm2 start ecosystem.config.js"
fi

echo ""
echo "============================================"
echo "  ✅ DÉPLOIEMENT TERMINÉ!"
echo "============================================"
echo ""
echo "🌐 Application: http://localhost:${PORT:-5000}"
echo "🏥 Health check: curl http://localhost:${PORT:-5000}/health"
echo ""
echo "Compte admin par défaut:"
echo "  Email: ${ADMIN_EMAIL:-admin@servicall.com}"
echo "  Mot de passe: ${ADMIN_PASSWORD:-Admin2026Prod}"
echo ""
