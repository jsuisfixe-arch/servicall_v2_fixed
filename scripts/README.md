# Scripts utilitaires Servicall

## Scripts de migration (one-shot, run once)
- `run-migrations.py` — Lance les migrations Drizzle via subprocess
- `init-admin-direct.py` — Crée le compte admin initial en base

## Scripts de setup (one-shot)
- `setup-complete.sh` — Installation complète sur serveur vierge
- `clean-build.sh` — Nettoyage du dossier dist avant build

## Usage recommandé pour la production
```bash
# 1. Migrations DB
npm run db:migrate

# 2. Seed optionnel
npm run db:seed

# 3. Créer admin
npx tsx scripts/create-admin-direct.ts
```
