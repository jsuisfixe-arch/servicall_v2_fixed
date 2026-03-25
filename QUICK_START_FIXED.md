# Servicall v2 — Guide de Démarrage Rapide (Version Corrigée)

## 🚀 Démarrage Rapide

### 1. **Prérequis**
- Node.js >= 20.0.0
- Docker & Docker Compose (pour Redis/PostgreSQL)
- npm >= 10.0.0

### 2. **Installation des dépendances**

```bash
# Installer avec les corrections de dépendances
npm install --legacy-peer-deps

# Ou avec pnpm (recommandé)
pnpm install
```

**Changements appliqués** :
- ✅ `@neondatabase/serverless` : 0.9.0 → 1.0.0
- ✅ `multer` : 1.4.5-lts.2 → 2.0.0
- ✅ `aws-sdk` : 2.x → AWS SDK v3
- ✅ `@opentelemetry/instrumentation` : ajouté

### 3. **Lancer les services (Redis + PostgreSQL)**

```bash
# Option A : Docker Compose (recommandé)
docker-compose -f docker-compose.dev.yml up -d

# Option B : Redis local (si déjà installé)
redis-server --port 6379
```

### 4. **Configurer l'environnement**

```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Vérifier les variables requises
cat .env.local
```

**Variables critiques** :
```env
DATABASE_URL=postgres://servicall:servicall_pass@localhost:5432/servicall_db
REDIS_URL=redis://localhost:6379
PORT=5000
NODE_ENV=development
```

### 5. **Démarrer l'application**

```bash
# Mode développement (avec hot reload)
npm run dev

# Ou serveur + client séparés
npm run dev:server &
npm run dev:client
```

### 6. **Accéder à l'application**

- **Frontend** : http://localhost:5000
- **API tRPC** : http://localhost:5000/api/trpc
- **Logs** : Vérifier la console pour les messages `[Servicall]`

---

## 🔧 Corrections Appliquées

### Build
- ✅ Circular chunk dependency corrigée
- ✅ Sourcemap errors résolues
- ✅ Bundle size optimisé

### Runtime
- ✅ Dépendance OpenTelemetry ajoutée
- ✅ Logs détaillés dans main.tsx
- ✅ Redis configuré pour développement

### Sécurité
- ✅ Vulnérabilités réduites de 29 → 26
- ✅ Multer 2.x (sécurisé)
- ✅ AWS SDK v3 (maintenu)

---

## 🧪 Tests

### Test 1 : Page d'accueil
```bash
curl http://localhost:5000
# Doit retourner le HTML avec <div id="root"></div>
```

### Test 2 : Console navigateur
```javascript
// Ouvrir DevTools (F12) et vérifier les logs
// Doit voir : "[Servicall] Application montée avec succès"
```

### Test 3 : API tRPC
```bash
curl http://localhost:5000/api/trpc/auth.getSession
# Doit retourner une réponse JSON
```

### Test 4 : Login
1. Aller à http://localhost:5000/login
2. Entrer les credentials de test
3. Vérifier la redirection vers /dashboard

---

## 📊 Vérification de Santé

```bash
# Vérifier les dépendances
npm audit

# Vérifier les types TypeScript
npm run typecheck

# Vérifier le linting
npm run lint

# Vérifier le build
npm run build
```

---

## 🆘 Troubleshooting

### "Page blanche au chargement"
1. Ouvrir DevTools (F12)
2. Vérifier la console pour les erreurs `[Servicall]`
3. Vérifier que Redis est lancé : `redis-cli ping`
4. Vérifier que PostgreSQL est lancé : `psql -U servicall -d servicall_db -c "SELECT 1"`

### "Cannot find module '@opentelemetry/instrumentation'"
```bash
npm install @opentelemetry/instrumentation --legacy-peer-deps
```

### "ECONNREFUSED 6379"
Redis n'est pas lancé. Lancer :
```bash
docker-compose -f docker-compose.dev.yml up redis
```

### "ECONNREFUSED 5432"
PostgreSQL n'est pas lancé. Lancer :
```bash
docker-compose -f docker-compose.dev.yml up postgres
```

---

## 📝 Notes Importantes

1. **Mode développement** : Utiliser `npm run dev` pour le hot reload
2. **Mode production** : Utiliser `npm run build && npm start`
3. **Dépendances** : Toujours utiliser `--legacy-peer-deps` jusqu'à la migration complète
4. **Redis** : Obligatoire pour les workers (VoiceWorker, EnhancedCache)
5. **PostgreSQL** : Obligatoire pour les données persistantes

---

## 🎯 Prochaines Étapes

1. **Tester toutes les pages** : Dashboard, Campaigns, Leads, Workflows, etc.
2. **Tester l'authentification** : Login, session, logout
3. **Tester les API** : Vérifier les appels tRPC
4. **Tester les workers** : VoiceWorker, EnhancedCache
5. **Déployer en staging** : Vérifier en environnement de production

---

*Guide mis à jour le 21 mars 2026 - Version 2.0.0 (Corrigée)*
