# Servicall V2.0 - Quick Start Deployment Guide

## ⚡ Installation Rapide (5 minutes)

### Prérequis
- Node.js v20+ 
- PostgreSQL 14+
- Redis 6+
- pnpm v9+

### 1️⃣ Installation des dépendances

```bash
cd servicall
pnpm install
```

### 2️⃣ Configuration de l'environnement

```bash
# Le fichier .env est déjà configuré avec les valeurs par défaut
# Vérifiez que DATABASE_URL et REDIS_URL pointent vers vos services
cat .env
```

**Variables critiques à vérifier :**
```env
DATABASE_URL=postgres://servicall:servicall_pass@localhost:5432/servicall_db
REDIS_URL=redis://localhost:6379
NODE_ENV=production
PORT=5000
ADMIN_EMAIL=admin@servicall.com
ADMIN_PASSWORD=Admin2026Prod
```

### 3️⃣ Initialisation de la base de données

```bash
# Créer la DB et l'utilisateur PostgreSQL
sudo -u postgres psql << 'EOF'
CREATE USER servicall WITH PASSWORD 'servicall_pass';
CREATE DATABASE servicall_db OWNER servicall;
GRANT ALL PRIVILEGES ON DATABASE servicall_db TO servicall;
EOF

# Appliquer toutes les migrations et seed
PGPASSWORD=servicall_pass psql -U servicall -h localhost -d servicall_db -f scripts/init-db-complete.sql

# Vérifier que tout est OK
PGPASSWORD=servicall_pass psql -U servicall -h localhost -d servicall_db -c "SELECT count(*) as tables FROM information_schema.tables WHERE table_schema = 'public';"
```

### 4️⃣ Build de production

```bash
pnpm run build
```

✅ Le build produit un fichier `dist/index.js` de ~1.3MB

### 5️⃣ Démarrage du serveur

```bash
# Mode production
NODE_ENV=production node dist/index.js

# Ou avec PM2 pour la persistance
pm2 start dist/index.js --name servicall --env production
```

### 6️⃣ Vérification du démarrage

```bash
# Health check
curl http://localhost:5000/health

# Réponse attendue:
# {"status":"ok","checks":{"database":{"status":"ok"},"redis":{"status":"ok"},...}}
```

### 7️⃣ Connexion à l'application

1. Ouvrez `http://localhost:5000` dans votre navigateur
2. Cliquez sur **Connexion**
3. Identifiants par défaut:
   - Email: `admin@servicall.com`
   - Mot de passe: `Admin2026Prod`
4. Sélectionnez le tenant **Servicall Default**

## 🔍 Vérification Post-Déploiement

### Tables créées (85 tables)
```bash
PGPASSWORD=servicall_pass psql -U servicall -h localhost -d servicall_db -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### Admin créé
```bash
PGPASSWORD=servicall_pass psql -U servicall -h localhost -d servicall_db -c "SELECT id, name, email, role FROM users WHERE email = 'admin@servicall.com';"
```

### Tenant créé
```bash
PGPASSWORD=servicall_pass psql -U servicall -h localhost -d servicall_db -c "SELECT id, name, slug FROM tenants WHERE slug = 'servicall-default';"
```

## 🛠️ Dépannage

### Erreur: "column is_active does not exist"
→ Réappliquez le script `scripts/init-db-complete.sql`

### Erreur: "Database connection refused"
→ Vérifiez que PostgreSQL est démarré: `sudo service postgresql status`

### Erreur: "Redis connection refused"
→ Vérifiez que Redis est démarré: `redis-cli ping` (doit retourner PONG)

### Port 5000 déjà utilisé
```bash
# Trouver le processus
lsof -i :5000

# Changer le port dans .env
PORT=3000
```

## 📊 Architecture

- **Frontend**: React 18 + Vite (SPA)
- **Backend**: Express + tRPC + Socket.io
- **Database**: PostgreSQL 14 (Drizzle ORM)
- **Cache/Queue**: Redis + BullMQ
- **Build**: esbuild + Vite
- **Security**: JWT + bcrypt + AES-256 encryption

## 📝 Notes importantes

- ✅ Toutes les 85 tables sont créées et synchronisées
- ✅ Admin par défaut est créé et fonctionnel
- ✅ Tenant par défaut est créé et lié à l'admin
- ✅ Toutes les migrations sont appliquées
- ✅ Build de production est testé et validé
- ✅ Pas d'erreurs de schéma ou de colonnes manquantes

## 🚀 Production

Pour un déploiement production complet, consultez `DEPLOYMENT_PROD.md`

---

**Version**: 2.0.0  
**Date**: 2026-03-19  
**Status**: ✅ Production Ready
