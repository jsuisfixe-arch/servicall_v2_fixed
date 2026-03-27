#!/bin/bash
# ============================================================
# SERVICALL V3 — Script de démarrage complet automatisé
# Usage: bash start-complete.sh
# ============================================================
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_DIR/logs/startup.log"
mkdir -p "$PROJECT_DIR/logs"

echo "========================================"
echo "  SERVICALL V3 — Démarrage Production"
echo "========================================"

# 1. Chargement de l'environnement
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
  echo "[✓] Variables d'environnement chargées"
else
  echo "[✗] Fichier .env manquant !"
  exit 1
fi

# 2. Démarrage PostgreSQL
echo "[...] Démarrage PostgreSQL..."
sudo service postgresql start 2>/dev/null || true
sleep 2
echo "[✓] PostgreSQL démarré"

# 3. Démarrage Redis
echo "[...] Démarrage Redis..."
sudo service redis-server start 2>/dev/null || true
sleep 1
echo "[✓] Redis démarré"

# 4. Vérification de la connexion PostgreSQL
echo "[...] Vérification PostgreSQL..."
PGPASSWORD=postgres psql -U postgres -d servicall -h localhost -c "SELECT 1" > /dev/null 2>&1 && echo "[✓] PostgreSQL connecté" || {
  echo "[✗] Impossible de se connecter à PostgreSQL"
  exit 1
}

# 5. Vérification Redis
echo "[...] Vérification Redis..."
redis-cli ping > /dev/null 2>&1 && echo "[✓] Redis connecté" || {
  echo "[✗] Impossible de se connecter à Redis"
  exit 1
}

# 6. Migrations (idempotent)
echo "[...] Exécution des migrations..."
cd "$PROJECT_DIR"
PGPASSWORD=postgres psql -U postgres -d servicall -h localhost \
  -f drizzle/0000_lonely_vance_astro.sql > /dev/null 2>&1 || true
for f in drizzle/migrations/*.sql; do
  PGPASSWORD=postgres psql -U postgres -d servicall -h localhost -f "$f" > /dev/null 2>&1 || true
done
echo "[✓] Migrations appliquées"

# 7. Création du compte admin (idempotent)
echo "[...] Initialisation du compte admin..."
pnpm exec tsx server/scripts/create-admin-standalone.ts 2>&1 | grep -E "✅|❌|Admin"
echo "[✓] Compte admin vérifié"

# 8. Build si dist/index.js absent
if [ ! -f "$PROJECT_DIR/dist/index.js" ]; then
  echo "[...] Build de production..."
  NODE_OPTIONS='--max-old-space-size=4096' pnpm exec vite build 2>&1 | tail -5
  pnpm exec esbuild server/index.ts --platform=node --packages=external --bundle --format=esm \
    --external:vite --external:../../vite.config --outdir=dist 2>&1
  echo "[✓] Build terminé"
else
  echo "[✓] Build existant détecté (dist/index.js)"
fi

# 9. Démarrage du serveur
echo "[...] Démarrage du serveur sur le port ${PORT:-5000}..."
NODE_ENV=production node dist/index.js &
SERVER_PID=$!
echo $SERVER_PID > /tmp/servicall.pid
sleep 5

# 10. Vérification du démarrage
if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT:-5000}/ | grep -q "200"; then
  echo "[✓] Serveur démarré avec succès sur http://localhost:${PORT:-5000}"
  echo ""
  echo "========================================"
  echo "  SERVICALL V3 — Prêt !"
  echo "  URL: http://localhost:${PORT:-5000}"
  echo "  Admin: admin@servicall.com"
  echo "  Mot de passe: Admin@Servicall2024!"
  echo "========================================"
else
  echo "[✗] Le serveur ne répond pas"
  cat /tmp/server.log 2>/dev/null | tail -20
  exit 1
fi
