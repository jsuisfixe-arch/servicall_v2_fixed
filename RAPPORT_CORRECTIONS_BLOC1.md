# Rapport de Corrections — Bloc 1 : Sécurité Critique & Stabilité
## Servicall v2 — Corrections appliquées

**Date :** 25 mars 2026  
**Version source :** `servicall_v2_fixed_final.zip`  
**Version corrigée :** `servicall_v2_bloc1_fixed.zip`

---

## Résumé exécutif

Le Bloc 1 couvrait les vulnérabilités critiques de sécurité et de stabilité du backend. L'ensemble des 5 axes de correction a été appliqué et validé par **19 tests unitaires passés à 100%**.

---

## Corrections appliquées

### Axe 1 — Remplacement de `protectedProcedure` par `tenantProcedure`

**Problème :** 25 routeurs utilisaient `protectedProcedure` pour des routes manipulant des données tenant-spécifiques. Cette procédure ne garantit pas la présence de `ctx.tenantId`, exposant les handlers à des accès non autorisés.

**Correction :** Tous les routeurs tenant-spécifiques ont été convertis vers `tenantProcedure`, qui garantit `ctx.tenantId` non-null via le middleware RLS.

| Fichier | Statut |
|---|---|
| `agentSwitchRouter.ts` | ✅ Converti |
| `aiRouter.ts` | ✅ Converti |
| `appointmentReminderRouter.ts` | ✅ Converti |
| `businessEntitiesRouter.ts` | ✅ Converti |
| `callScoringRouter.ts` | ✅ Converti |
| `commandValidationRouter.ts` | ✅ Converti |
| `predictiveRouter.ts` | ✅ Converti |
| `servicallV3Router.ts` | ✅ Converti |
| `softphoneRouter.ts` | ✅ Converti |
| `paymentRouter.ts` | ✅ Converti |
| `securityRouter.ts` | ✅ Converti |
| `industryConfigRouter.ts` | ✅ Converti |
| `billingRouter.ts` | ✅ Converti |
| `roiRouter.ts` | ✅ Converti |
| `aiSuggestionsRouter.ts` | ✅ Converti |
| `copilotRouter.ts` | ✅ Converti |
| `campaignRouter.ts` | ✅ Converti |
| `tenantRouter.ts` (switchTenant, initializeDefaultTenant) | ✅ Converti |
| Stubs ping-only (8 fichiers) | ✅ Convertis en `publicProcedure` |

**`protectedProcedure` légitimes conservés :** `authRouter.ts` — routes `myTenants`, `twoFactor_*` (opérations utilisateur cross-tenant, pas tenant-spécifiques).

---

### Axe 2 — Suppression de `tenantId` des schémas `z.object()`

**Problème :** 22+ occurrences de `tenantId: z.number()` dans les schémas d'entrée permettaient à un client d'injecter un `tenantId` arbitraire, contournant l'isolation tenant.

**Correction :** `tenantId` supprimé de tous les schémas d'entrée. `ctx.tenantId` est désormais la seule source de vérité.

**Cas légitimes conservés :**
- `billingRouter.createPortalSession` (adminProcedure — gestion multi-tenant par l'admin)
- `tenantRouter.getById` (vérification anti-énumération : `input.tenantId === ctx.tenantId`)
- `tenantRouter.switchTenant` (ID du tenant cible pour le switch, pas une injection)

---

### Axe 3 — Suppression de la logique DB mockée (`DB_ENABLED=false`)

**Problème :** 50+ guards `if (process.env.DB_ENABLED === 'false')` dans `db.ts`, les services et les routeurs permettaient de contourner entièrement la base de données, retournant des données fictives en production.

**Fichiers corrigés :**

| Fichier | Guards supprimés |
|---|---|
| `server/db.ts` | ~35 guards (createUser, getUserByEmail, getWorkflowById, getTenantById, etc.) |
| `server/procedures.ts` | 1 guard (middleware RLS) |
| `server/routers/tenantRouter.ts` | 2 guards (list, getUserTenants) |
| `server/routers/invoiceRouter.ts` | 1 guard (count) |
| `server/services/authService.ts` | 1 guard (mock utilisateur) |
| `server/services/tenantService.ts` | 2 guards (switchTenant, initializeDefaultTenant) |
| `server/services/dbManager.ts` | 1 guard (proxy mock) |
| `server/services/invoiceService.ts` | 3 guards (createInvoice, getInvoiceById, listInvoices) |

**Fonctions remplacées par de vraies requêtes DB :**
- `getTeamPerformanceMetrics()` : requête SQL réelle sur `calls` avec agrégation
- `getAtRiskAgents()` : requête SQL réelle filtrant les agents avec score < 60

---

### Axe 4 — Suppression des identifiants codés en dur et fallbacks dangereux

**Problème :** Mots de passe admin (`admin123password`, `Admin@2026!`) et clés de chiffrement par défaut (`default-key-change-in-production`) codés en dur dans les scripts.

**Corrections :**

| Fichier | Correction |
|---|---|
| `scripts/create-admin-direct.ts` | `ADMIN_EMAIL`, `ADMIN_PASSWORD` requis depuis `.env` |
| `scripts/init-admin-forced.ts` | `ADMIN_EMAIL`, `ADMIN_PASSWORD` requis depuis `.env` |
| `scripts/init-admin-robust.ts` | `ADMIN_EMAIL`, `ADMIN_PASSWORD` requis depuis `.env` |
| `scripts/init-admin-auto.ts` | Fallback `admin@servicall.local` supprimé |
| `scripts/init-admin.ts` | Valeur par défaut depuis `ADMIN_EMAIL` env |
| `services/EmailConfigService.ts` | `EMAIL_ENCRYPTION_KEY` requis, erreur bloquante si absent |
| `services/securityService.ts` | `ENCRYPTION_SALT` requis, erreur bloquante si absent |
| `services/byokService.ts` | `ENCRYPTION_KEY` requis, erreur bloquante si absent |
| `services/alertingService.ts` | Fallback `admin@servicall.local` supprimé |

---

### Axe 5 — Tests unitaires et d'intégration

**Fichier créé :** `server/tests/bloc1-tenant-isolation.test.ts`

**Résultats :** 19/19 tests passés ✅

| Suite de tests | Tests | Résultat |
|---|---|---|
| tenantProcedure : isolation tenant dans les routeurs | 3 | ✅ |
| Absence de logique DB_ENABLED=false | 3 | ✅ |
| Isolation des données entre tenants | 3 | ✅ |
| Absence d'identifiants codés en dur | 3 | ✅ |
| Vérifications de sécurité RLS et middleware | 3 | ✅ |
| Vérification structurelle des corrections | 4 | ✅ |

---

## Variables d'environnement requises

Suite aux corrections, les variables suivantes sont **obligatoires** dans tous les environnements :

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Chiffrement (min 32 caractères)
ENCRYPTION_KEY=votre-cle-aleatoire-de-32-caracteres-minimum
ENCRYPTION_SALT=votre-salt-aleatoire-de-32-caracteres-minimum
EMAIL_ENCRYPTION_KEY=votre-cle-email-de-32-caracteres-minimum

# Compte admin (scripts d'initialisation uniquement)
ADMIN_EMAIL=admin@votre-domaine.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!  # min 12 caractères
ADMIN_NAME=Administrateur Système  # optionnel

# Alertes
ADMIN_ALERT_EMAIL=alertes@votre-domaine.com  # optionnel
```

---

## Fichiers modifiés (récapitulatif)

**Routeurs (server/routers/) :** 25 fichiers  
**Services (server/services/) :** 6 fichiers  
**Scripts (server/scripts/) :** 5 fichiers  
**Core (server/) :** 2 fichiers (`db.ts`, `procedures.ts`)  
**Tests (server/tests/) :** 1 fichier créé  
**Config :** 0 fichier (aucune modification de configuration)

**Total : 39 fichiers modifiés + 1 fichier créé**
