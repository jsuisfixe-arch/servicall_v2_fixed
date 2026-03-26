# SERVICALL v2.0 — Changelog

## v2.0.3 — STABLE PRODUCTION (2026-03-21)

### Corrections critiques

**Build & Compilation**
- ✅ Correction du chemin `INDUSTRIES_CATALOG.json` dans `workflowRouter.ts` (était `process.cwd()`, maintenant `server/config/`)
- ✅ Suppression de la dépendance manquante `streamdown` (remplacée par un composant inline)
- ✅ Correction des erreurs TypeScript bloquantes dans `useAuth.ts`, `AISuggestionsPanel.tsx`, `InvoiceForm.tsx`, `InvoicePreview.tsx`

**Affichage**
- ✅ Catalogue métier : icônes emoji (📞 🎧 ⚕️ 🏠 ⚖️ 💻 🍽️ 🛒 🚚 👥) — affichage correct vs noms lucide texte brut
- ✅ Nouveau composant `IndustryWorkflowsManager` intégré (gestion des workflows par secteur)
- ✅ Secteur RH (`hr`) ajouté au catalogue avec 4 workflows

**Connexion & Dashboard**
- ✅ CSRF : token correctement géré en HTTP (SameSite=lax) et HTTPS (SameSite=none+Secure)
- ✅ Headers `Origin-Agent-Cluster: ?0` pour éviter la page blanche via proxy
- ✅ SPA fallback correct pour toutes les routes non-API

**Catalogue métier**
- ✅ 10 secteurs d'activité : generic, call_center, medical_practice, real_estate, legal_firm, it_services, restaurant, e_commerce, delivery, hr
- ✅ 53 workflows référencés dans le catalogue (tous validés dans blueprints.json)
- ✅ `getIndustryWorkflows()` utilise maintenant les IDs du catalogue en priorité

**Production VPS**
- ✅ Script `scripts/deploy-vps.sh` complet pour Ubuntu
- ✅ `ecosystem.config.js` PM2 mis à jour
- ✅ `.env.example` avec toutes les variables requises et PORT=5000

### Fichiers modifiés
- `client/src/components/IndustryWorkflowsManager.tsx` (nouveau)
- `client/src/pages/Workflows.tsx` (intégration IndustryWorkflowsManager)
- `server/config/INDUSTRIES_CATALOG.json` (emojis + secteur hr + workflows)
- `server/routers/workflowRouter.ts` (chemin catalogue corrigé)
- `server/services/tenantIndustryService.ts` (getIndustryWorkflows amélioré + typage)
- `client/src/components/AIChatBox.tsx` (suppression dépendance streamdown)
- `client/src/_core/hooks/useAuth.ts` (erreurs TS corrigées)
- `client/src/components/AISuggestionsPanel.tsx` (erreurs TS corrigées)
- `client/src/components/InvoiceForm.tsx` (erreurs TS corrigées)
- `client/src/components/InvoicePreview.tsx` (erreurs TS corrigées)
- `ecosystem.config.js` (PM2 production)
- `.env.example` (variables complètes)
- `scripts/deploy-vps.sh` (nouveau script déploiement)
- `start-prod.sh` (mis à jour)

## v2.0.2 — CORRIGE_FINAL (base stable)

- Version de référence stable avec affichage fonctionnel
- Connexion et dashboard opérationnels
