#!/bin/bash
# ============================================================
# SERVICALL v2.0 - Démarrage rapide en production
# ============================================================
set -e

echo "🚀 Démarrage Servicall v2 en mode production..."

# Vérifier que le build existe
if [ ! -f "dist/index.js" ]; then
  echo "❌ dist/index.js introuvable. Lancez d'abord: pnpm run build"
  exit 1
fi

# Vérifier le .env
if [ ! -f ".env" ]; then
  echo "❌ Fichier .env manquant. Copiez .env.example vers .env et configurez-le."
  exit 1
fi

# Démarrer PostgreSQL et Redis si disponibles
sudo service postgresql start 2>/dev/null || true
sudo service redis-server start 2>/dev/null || true
sleep 1

# Créer le dossier logs
mkdir -p logs

# Démarrer le serveur
echo "▶ Démarrage du serveur Node.js sur le port ${PORT:-5000}..."
NODE_ENV=production node dist/index.js
