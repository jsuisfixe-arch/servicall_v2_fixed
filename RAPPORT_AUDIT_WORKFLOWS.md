# Audit Senior SaaS : Workflows & Logique Métier (Servicall v2)

Ce rapport présente l'audit fonctionnel approfondi des workflows utilisateur, de la logique métier et de l'intégration frontend/backend de l'application Servicall v2. L'analyse s'est concentrée sur les ruptures de processus, les incohérences entre les services et les erreurs d'intégration tRPC.

## 1. Analyse des Workflows Utilisateur

### 1.1. Login / Register
Le processus d'authentification fonctionne globalement bien d'un point de vue fonctionnel. Lors de l'inscription ou de la connexion, le backend vérifie les informations, crée un token de session et l'injecte dans un cookie. Une amélioration notable a été apportée pour garantir qu'un utilisateur dispose toujours d'un tenant par défaut (création synchrone si inexistant). Le frontend met à jour son cache optimiste et redirige vers le tableau de bord. Cependant, le changement de contexte (tenant) post-login présente des failles majeures (voir section 3).

### 1.2. Lead Extraction
Le workflow d'extraction de leads est conçu pour être asynchrone. L'utilisateur soumet une requête via le frontend, qui appelle `leadExtractionRouter.search`. Le backend enregistre la demande en base de données avec un statut "pending" et pousse un job dans BullMQ. Un worker traite ensuite la recherche via des fournisseurs externes (OSM, Google, Pages Jaunes) et met à jour la base. Bien que la logique backend soit robuste, l'interface utilisateur manque de mécanismes de polling ou de WebSockets pour informer l'utilisateur de la fin de l'extraction en temps réel.

### 1.3. Dialer (Softphone)
Le workflow du Dialer présente des ruptures critiques. L'utilisateur saisit un numéro, valide le consentement RGPD, puis le frontend déclenche un appel via `callsRouter.create`. Le backend enregistre l'appel en base de données. Cependant, la gestion de l'état de l'appel (durée, mise en attente, raccrochage) est purement simulée côté client. Le composant `Softphone.tsx` utilise un timer local et ne communique pas les changements d'état (comme le raccrochage) au backend, ce qui entraîne une désynchronisation totale entre l'interface et la réalité métier.

### 1.4. Actions Admin (Gestion des Tenants et Campagnes)
Les actions d'administration, telles que la création de campagnes ou l'importation de workflows métiers, souffrent de graves incohérences d'intégration. Le frontend envoie souvent des données qui ne correspondent pas aux schémas attendus par le backend, ou tente de forcer des identifiants de locataires (tenantId) qui devraient être gérés de manière sécurisée via le contexte de session.

## 2. Incohérences de la Logique Métier

L'audit a révélé plusieurs écarts entre le comportement attendu et l'implémentation réelle :

| Composant / Service | Comportement Attendu | Implémentation Actuelle | Impact |
| :--- | :--- | :--- | :--- |
| **Workers Asynchrones** | Les workers doivent exécuter des tâches réelles (transcription, analyse de sentiment). | Plusieurs workers (ex: `ai-transcription`, `sentiment-analysis`) retournent des résultats factices (stubs). | Les fonctionnalités d'IA post-appel ne produisent aucune valeur réelle. |
| **Gestion des Appels** | Le cycle de vie complet d'un appel (début, fin, durée) doit être synchronisé avec le backend. | Le frontend simule la durée et le raccrochage sans informer le backend via une mutation de mise à jour. | Les statistiques d'appels et la facturation sont faussées. |
| **Changement de Tenant** | Changer d'espace de travail doit mettre à jour le contexte backend (cookie/session). | Le composant `TenantSelector` modifie uniquement l'URL (`?tenantId=...`) sans appeler `switchTenant`. | L'utilisateur voit l'UI d'un tenant mais effectue des actions sur un autre. |

## 3. Intégration Frontend ↔ Backend (tRPC)

L'analyse des appels tRPC a mis en évidence des mismatches critiques entre les contrats définis par le backend et les payloads envoyés par le frontend.

### 🟠 MAJOR FUNCTIONAL ISSUES

#### Issue 1 : Désynchronisation du cycle de vie des appels (Dialer)
- **Flow / Route** : Workflow Dialer / `Softphone.tsx` ↔ `callsRouter`
- **Description** : Le composant `Softphone.tsx` appelle `calls.create` pour initier un appel, mais gère la durée et le raccrochage localement. Aucune mutation `calls.update` n'est appelée lors du raccrochage (`handleHangup`). De plus, le frontend envoie explicitement `tenantId` dans le payload de création, alors que le backend l'extrait du contexte.
- **Impact** : Les appels restent indéfiniment "en cours" côté backend. Les durées enregistrées sont nulles ou incorrectes, ce qui casse les rapports, la facturation et le suivi des agents.
- **Recommendation** : Implémenter l'appel à `calls.update` dans `handleHangup` pour transmettre le statut final et la durée réelle. Supprimer l'envoi manuel de `tenantId` depuis le frontend pour respecter le contrat tRPC basé sur le contexte.

#### Issue 2 : Faux changement de contexte (Tenant Switcher)
- **Flow / Route** : Workflow Admin / `TenantSelector.tsx` ↔ `tenantRouter`
- **Description** : Le composant `TenantSelector` se contente de modifier le paramètre `tenantId` dans l'URL lors d'un changement d'espace de travail. Il n'invoque jamais la mutation `tenant.switchTenant` pour mettre à jour le cookie de session côté backend.
- **Impact** : L'utilisateur pense avoir changé de tenant (l'UI peut s'adapter via l'URL), mais toutes ses requêtes tRPC continuent d'être exécutées dans le contexte de son tenant précédent. Cela entraîne des créations de ressources dans le mauvais espace de travail.
- **Recommendation** : Modifier `handleTenantChange` pour appeler `trpc.tenant.switchTenant.useMutation()`. Attendre le succès de la mutation avant de recharger la page ou d'invalider le cache tRPC pour garantir la cohérence du contexte.

#### Issue 3 : Mismatch des contrats sur l'importation de Workflows
- **Flow / Route** : Workflow Admin / `IndustryWorkflowsManager.tsx` ↔ `workflows.importBlueprint`
- **Description** : Le frontend envoie `tenantId` (manuel) et `blueprintId` sous forme de chaîne de caractères (`string`). Le backend attend un contexte tenant implicite et un `blueprintId` de type numérique (`number`).
- **Impact** : L'importation des workflows métiers échoue systématiquement en raison d'une erreur de validation Zod côté backend, bloquant l'onboarding des nouveaux locataires.
- **Recommendation** : Supprimer `tenantId` du payload frontend. Convertir `blueprintId` en nombre avant l'appel à la mutation, ou ajuster le schéma Zod du backend pour accepter et parser une chaîne de caractères.

#### Issue 4 : Mismatch des contrats sur la création de Campagnes
- **Flow / Route** : Workflow Admin / `CampaignWizard.tsx` ↔ `campaignRouter.create`
- **Description** : Le wizard frontend collecte de nombreuses données (`targetAudience`, `prospectCount`, `aiEnabled`, `aiRoleId`, `conversionGoal`) et les envoie à la mutation de création. Le backend n'accepte que `name`, `description`, `activityType`, `type` et `config`.
- **Impact** : Les données de ciblage et de configuration IA saisies par l'utilisateur sont ignorées et perdues lors de la création de la campagne.
- **Recommendation** : Mettre à jour le schéma Zod de `campaignRouter.create` pour accepter ces champs supplémentaires (potentiellement dans un objet `config` ou `details` JSON) et s'assurer qu'ils sont correctement persistés en base de données.

## Conclusion
L'architecture globale de Servicall v2 est solide, notamment grâce à l'utilisation de tRPC et BullMQ. Cependant, l'application souffre de "fausses intégrations" où le frontend simule des comportements (Dialer) ou ignore les contrats stricts du backend (Tenants, Campagnes). La correction de ces quatre problèmes majeurs est indispensable pour garantir l'intégrité des données et le bon fonctionnement des processus métier en production.
