# 🔒 Servicall Backend v2 - Corrections de Sécurité Finales

## 📋 Résumé des Corrections

Ce projet a été audité et corrigé pour éliminer toutes les vulnérabilités de sécurité multi-tenant. **Status**: ✅ **PRODUCTION READY**

### Corrections Critiques Appliquées

| # | Vulnérabilité | Fichier | Statut |
|---|---|---|---|
| 1 | IDOR: x-tenant-id header fallback | `server/services/tenantService.ts` | ✅ Corrigé |
| 2 | Double auth DB par requête | `server/_core/trpc.ts` | ✅ Corrigé |
| 3 | Cross-tenant access control | `server/_core/trpc.ts` | ✅ Corrigé |
| 4 | Campaign router IDOR | `server/routers/campaignRouter.ts` | ✅ Corrigé |
| 5 | Campaign updateStatus IDOR | `server/routers/campaignRouter.ts` | ✅ Corrigé |
| 6 | Invoice cross-tenant callId | `server/routers/invoiceRouter.ts` | ✅ Corrigé |
| 7 | upsertUser role escalation | `server/db.ts` | ✅ Corrigé |

---

## 🚀 Démarrage Rapide

### Installation

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs
```

### Variables d'Environnement Requises

```env
# Sécurité
JWT_SECRET=your-32-byte-random-secret
TENANT_JWT_SECRET=your-32-byte-random-secret
NODE_ENV=production

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/servicall

# Redis (optionnel)
REDIS_URL=redis://localhost:6379

# Autres
PORT=5000
```

### Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Exécuter les tests
pnpm test

# Linting
pnpm lint

# Type checking
pnpm typecheck
```

### Production

```bash
# Build
pnpm build

# Démarrer
NODE_ENV=production node dist/index.js

# Ou avec PM2
pm2 start ecosystem.config.js --env production
```

---

## 🔐 Architecture de Sécurité

### 1. Isolation Multi-Tenant

**Niveau 1: JWT Signé**
- Cookie `servicall_tenant` contient JWT signé avec `TENANT_JWT_SECRET`
- Payload inclut: `tenantId`, `userId`, `role`, `issuedAt`
- Validé à chaque requête

**Niveau 2: Middleware tRPC**
- `requireTenantContext` vérifie `ctx.user.tenantId === ctx.tenantId`
- Superadmin peut accéder cross-tenant avec logs d'audit
- Retourne `FORBIDDEN` pour accès non autorisé

**Niveau 3: Filtre Base de Données**
- Toutes les requêtes incluent `WHERE tenantId = ?`
- Parameterized queries (protection SQL injection)
- Transactions avec isolation

### 2. RBAC (Role-Based Access Control)

Rôles disponibles:
- `superadmin`: Accès complet, cross-tenant
- `admin`: Admin du tenant
- `manager`: Gestion des campagnes, factures
- `agent`: Accès lecture seule
- `viewer`: Accès lecture très limité

Procédures tRPC:
- `publicProcedure`: Pas d'auth
- `protectedProcedure`: Auth requise
- `tenantProcedure`: Auth + tenant
- `managerProcedure`: Auth + tenant + manager role
- `adminProcedure`: Auth + tenant + admin role

### 3. Sécurité Express

```typescript
// Helmet: Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS: Contrôle d'accès
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate Limiting
app.use("/api/trpc/auth.login", loginLimiter);
app.use("/api/trpc/auth.register", registerLimiter);
app.use("/api/trpc", apiLimiter);

// Body Limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
```

---

## 🧪 Tests

### Exécuter les Tests

```bash
# Tests unitaires
pnpm test

# Tests avec couverture
pnpm test:coverage

# Tests e2e
pnpm test:e2e

# Tests en mode watch
pnpm test:watch
```

### Tests de Sécurité

Les tests suivants vérifient que les failles ne réapparaissent pas:

```bash
# Tests anti-régression
pnpm test server/tests/security-regression.test.ts
```

---

## 📊 Audit de Sécurité

### Fichiers Auditées

- ✅ `server/_core/trpc.ts` - Procédures et middlewares
- ✅ `server/services/tenantService.ts` - Extraction tenant
- ✅ `server/routers/campaignRouter.ts` - Gestion campagnes
- ✅ `server/routers/invoiceRouter.ts` - Gestion factures
- ✅ `server/db.ts` - Couche base de données
- ✅ `server/index.ts` - Configuration Express
- ✅ `server/middleware/` - Middlewares de sécurité

### Checklist de Déploiement

Voir `DEPLOYMENT_CHECKLIST_FINAL.md` pour la liste complète.

---

## 📚 Documentation

- **SECURITY_FIXES_APPLIED.md**: Détail de chaque correction
- **DEPLOYMENT_CHECKLIST_FINAL.md**: Checklist de déploiement
- **server/tests/security-regression.test.ts**: Tests anti-régression

---

## 🔍 Vérification Rapide

### Vérifier que les fixes sont appliqués

```bash
# 1. Vérifier que x-tenant-id header est rejeté
grep -n "x-tenant-id" server/services/tenantService.ts
# Devrait montrer le code commenté (pas de fallback)

# 2. Vérifier que campaignRouter a ctx
grep -n "ctx, input" server/routers/campaignRouter.ts
# Devrait montrer ctx destructuré dans addProspects et updateStatus

# 3. Vérifier que invoiceRouter vérifie callId
grep -n "call.tenantId !== ctx.tenantId" server/routers/invoiceRouter.ts
# Devrait montrer la vérification cross-tenant

# 4. Vérifier que upsertUser ne modifie pas role
grep -n "role: _ignoredRole" server/db.ts
# Devrait montrer que role est ignoré
```

---

## 🆘 Troubleshooting

### Erreur: "Accès refusé: contexte entreprise manquant"

**Cause**: Cookie JWT tenant invalide ou absent  
**Solution**: 
1. Vérifier que `TENANT_JWT_SECRET` est configuré
2. Vérifier que le cookie `servicall_tenant` est présent
3. Vérifier que le JWT n'a pas expiré (30 jours)

### Erreur: "Cross-tenant access attempt BLOCKED"

**Cause**: Tentative d'accès à un tenant auquel l'utilisateur n'appartient pas  
**Solution**:
1. Vérifier que `ctx.tenantId` correspond à `ctx.user.tenantId`
2. Si superadmin, vérifier les logs d'audit
3. Vérifier la table `user_tenants` pour l'appartenance

### Erreur: "Accès refusé: cette campagne n'appartient pas à votre organisation"

**Cause**: Tentative d'accès à une campagne d'un autre tenant  
**Solution**:
1. Vérifier que la campagne appartient au bon tenant
2. Vérifier que `campaign.tenantId` dans la DB
3. Vérifier les logs pour voir quel tenant a tenté l'accès

---

## 📞 Support

Pour toute question:

1. Consulter la documentation dans `SECURITY_FIXES_APPLIED.md`
2. Vérifier les logs: `tail -f logs/service-errors.log`
3. Exécuter les tests: `pnpm test`
4. Vérifier le code: `grep -r "FIX CRIT" server/`

---

## 📝 Changelog

### v2.0.0 - Security Hardened (2026-03-26)

**Corrections Critiques**:
- ✅ Suppression du fallback x-tenant-id header (IDOR fix)
- ✅ Correction du double auth DB (performance)
- ✅ Amélioration du cross-tenant access control
- ✅ Fix IDOR dans campaignRouter
- ✅ Fix IDOR dans invoiceRouter
- ✅ Protection contre escalade de privilèges (upsertUser)

**Améliorations**:
- ✅ Tests anti-régression ajoutés
- ✅ Documentation de sécurité complétée
- ✅ Checklist de déploiement créée

---

**Version**: 2.0.0 - Security Hardened  
**Status**: ✅ PRODUCTION READY  
**Date**: 2026-03-26
