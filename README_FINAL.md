# Servicall v3 — Guide de Déploiement Production

## Résumé

Servicall v3 est une plateforme CRM SaaS complète avec IA, téléphonie cloud, recrutement automatisé et gestion multi-tenant. Ce guide couvre le déploiement complet en production.

---

## Prérequis

| Composant | Version minimale |
|-----------|-----------------|
| Node.js | 20.x |
| pnpm | 9.x |
| PostgreSQL | 14.x |
| Redis | 6.x |
| Ubuntu | 22.04 LTS |

---

## Installation rapide (première fois)

```bash
# Cloner ou extraire le projet
cd servicall-v3

# Setup complet automatisé (nécessite sudo)
sudo bash setup-production.sh
```

## Démarrage

```bash
# Démarrage du serveur de production
bash start-complete.sh
```

L'application sera disponible sur `http://localhost:5000`.

---

## Compte Administrateur

| Champ | Valeur |
|-------|--------|
| Email | `admin@servicall.com` |
| Mot de passe | `Admin@Servicall2024!` |
| Rôle | `admin` |

> **Important** : Changez le mot de passe après la première connexion.

---

## Variables d'environnement

Le fichier `.env` contient toutes les configurations. Les variables critiques sont :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `REDIS_URL` | URL de connexion Redis |
| `SESSION_SECRET` | Secret de session (min. 32 chars) |
| `JWT_SECRET` | Secret JWT (min. 32 chars) |
| `PORT` | Port d'écoute (défaut: 5000) |

---

## Build manuel

```bash
# Build du frontend (Vite)
NODE_OPTIONS='--max-old-space-size=4096' pnpm exec vite build

# Build du serveur (esbuild)
pnpm exec esbuild server/index.ts \
  --platform=node --packages=external \
  --bundle --format=esm \
  --external:vite --external:../../vite.config \
  --outdir=dist
```

---

## Migrations

```bash
# Appliquer le schéma principal
PGPASSWORD=postgres psql -U postgres -d servicall -h localhost \
  -f drizzle/0000_lonely_vance_astro.sql

# Appliquer les migrations supplémentaires
for f in drizzle/migrations/*.sql; do
  PGPASSWORD=postgres psql -U postgres -d servicall -h localhost -f "$f"
done
```

---

## Seed du compte admin

```bash
pnpm exec tsx server/scripts/create-admin-standalone.ts
```

---

## Architecture

```
servicall-v3/
├── client/          # Frontend React + TypeScript + Vite
├── server/          # Backend Express + tRPC + Drizzle ORM
│   ├── _core/       # Contexte, env, vite, cookies
│   ├── config/      # Schéma de validation des variables
│   ├── infrastructure/ # Logger Pino, Redis, DB
│   ├── middleware/  # Auth, rate-limit, erreurs
│   ├── routers/     # Routes tRPC
│   ├── scripts/     # Scripts de migration et seed
│   └── services/    # Services métier
├── drizzle/         # Schéma et migrations Drizzle ORM
├── dist/            # Build de production
│   ├── index.js     # Serveur compilé (esbuild)
│   └── public/      # Frontend compilé (Vite)
├── .env             # Variables d'environnement
├── setup-production.sh  # Setup initial
└── start-complete.sh    # Démarrage production
```

---

## Flux de connexion

1. L'utilisateur accède à `/login`
2. Il saisit ses identifiants (email + mot de passe)
3. L'API tRPC `/api/trpc/auth.login` valide les credentials
4. Un JWT est créé et stocké dans un cookie sécurisé
5. L'utilisateur est redirigé vers `/select-tenant`
6. Après sélection du tenant, redirection vers `/dashboard`

---

## Corrections appliquées

| Problème | Correction |
|----------|-----------|
| Colonne `assigned_agent_type` manquante | Ajoutée via `ALTER TABLE` |
| Script admin non-autonome | Nouveau script `create-admin-standalone.ts` |
| Auth PostgreSQL `scram-sha-256` | Changé en `md5` dans `pg_hba.conf` |
| Variables `.env` incomplètes | Complétées avec toutes les variables optionnelles |
| Build esbuild warnings | Normaux (1.2MB bundle) |

---

## Statut des services

| Service | Statut |
|---------|--------|
| Frontend (Vite build) | Opérationnel |
| Backend (esbuild) | Opérationnel |
| PostgreSQL | Opérationnel |
| Redis | Opérationnel |
| API tRPC `/api/trpc/auth.login` | HTTP 200 |
| Dashboard `/dashboard` | Accessible |
