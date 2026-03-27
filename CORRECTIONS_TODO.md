# Corrections Servicall Backend - TODO

## Phase 1: Sécurité Multi-Tenant Critique
- [ ] Corriger fallback `x-tenant-id` header dans `tenantService.ts` (IDOR risk)
- [ ] Ajouter validation stricte du tenantId au niveau DB
- [ ] Auditer toutes les requêtes DB pour filtrage tenant obligatoire
- [ ] Corriger `extractTenantContext` pour rejeter header sans cookie

## Phase 2: Dépendances et Versions
- [ ] Mettre à jour `drizzle-zod` vers version compatible Zod v3
- [ ] Vérifier cohérence Zod partout (v3.25.76)
- [ ] Auditer dépendances circulaires entre routers/services

## Phase 3: Routers Critiques
- [ ] Auditer `campaignRouter` pour IDOR
- [ ] Auditer `invoiceRouter` pour IDOR
- [ ] Corriger `whatsappRouter` (stub vide)
- [ ] Vérifier `upsertUser` ne modifie pas le rôle

## Phase 4: Sécurité Express
- [ ] Vérifier CORS configuration
- [ ] Vérifier helmet configuration
- [ ] Vérifier rate limiting
- [ ] Ajouter CSRF protection
- [ ] Ajouter protection SSRF

## Phase 5: RBAC et Permissions
- [ ] Vérifier `RBACService.validatePermission`
- [ ] Vérifier `RBACService.validateRole`
- [ ] Tester permissions par tenant
- [ ] Tester permissions par rôle

## Phase 6: Tests Anti-Régression
- [ ] Tests isolation multi-tenant
- [ ] Tests IDOR protection
- [ ] Tests authentification
- [ ] Tests validation Zod
- [ ] Tests RBAC

## Phase 7: Documentation
- [ ] Documenter architecture finale
- [ ] Documenter fixes appliqués
- [ ] Documenter checklist déploiement
- [ ] Créer guide sécurité

## Phase 8: Livraison
- [ ] Générer archive ZIP finale
- [ ] Vérifier tous les fichiers
- [ ] Créer CHANGELOG final
- [ ] Créer README corrections
