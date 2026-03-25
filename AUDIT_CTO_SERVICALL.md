# Rapport d'Audit CTO — Servicall v3
**Date :** 22 Mars 2026
**Statut :** Critique / En cours de remédiation

---

## 1. Résumé Exécutif
Le projet Servicall v3 présente une architecture moderne (tRPC, React, Drizzle, PostgreSQL, Redis) mais souffre de **dettes techniques critiques** au niveau de la couche de données et de l'intégration IA. Plusieurs "bugs fantômes" ont été identifiés dans les modules Coaching et Lead Extraction, principalement dus à des mismatches de types et des instabilités d'APIs tierces.

---

## 2. Analyse des Modules Critiques

### 2.1 Module Lead Extraction (Recherche)
*   **Problème Détecté :** La recherche OSM (OpenStreetMap) échoue fréquemment ou retourne 0 résultats sans erreur explicite.
*   **Cause Racine :** Le `buildOverpassQuery` utilise un système de mapping (`amenityMap`, `shopMap`) trop restrictif. Si le terme n'est pas dans la liste, il fait une recherche par regex (`~`) qui est extrêmement lente sur l'API publique Overpass, causant des timeouts (30s).
*   **Risque :** Perte de confiance utilisateur sur la fonctionnalité principale de prospection.

### 2.2 Module Coaching & Simulation
*   **Problème Détecté :** Impossibilité de démarrer certaines simulations ou crash lors de la récupération de l'historique.
*   **Cause Racine :** 
    1.  **Mismatch ID :** Le frontend envoie des IDs numériques ("1") tandis que le backend attend des préfixes ("scenario-1"). Bien que corrigé partiellement dans le service, des incohérences subsistent dans les types Drizzle.
    2.  **Types de données :** Utilisation de `parseInt` sur des UUIDs (varchar) dans les requêtes Drizzle, provoquant des erreurs `invalid input syntax for integer`.
*   **Risque :** Blocage complet de la formation des agents.

### 2.3 Dashboard & Performance
*   **Problème Détecté :** Lenteur d'affichage des KPIs manager.
*   **Cause Racine :** Agrégations SQL complexes effectuées à chaque rendu. Bien qu'un cache Redis soit présent, la clé de cache n'inclut pas toujours le `tenantId`, risquant des fuites de données entre clients (Data Leakage).
*   **Risque :** Sécurité (RGPD) et Performance.

---

## 3. Audit Sécurité & Infrastructure

| Composant | État | Observations |
| :--- | :--- | :--- |
| **Authentification** | ✅ OK | JWT sécurisé, mais manque de rotation de clé automatique. |
| **Base de données** | ⚠️ Warning | Migrations Drizzle incohérentes avec le schéma réel (`job_offers`). |
| **IA (OpenAI)** | ⚠️ Warning | Manque de gestion robuste des quotas par tenant. |
| **Redis** | ✅ OK | Utilisé pour le cache et les sessions, stable. |

---

## 4. Plan de Remédiation (Action Plan)

### Immédiat (Priorité P0)
1.  **Correction Lead Extraction :** Optimiser la requête Overpass pour utiliser des filtres plus larges et augmenter le timeout à 60s avec un indicateur de progression UI.
2.  **Fix Coaching IDs :** Unifier tous les IDs en `string` (UUID) pour éviter les erreurs de cast SQL.
3.  **Migration DB :** Aligner le dossier `drizzle/migrations` avec le `schema_export.sql` fourni.

### Court Terme (Priorité P1)
1.  **Observabilité IA :** Implémenter un logging centralisé des coûts OpenAI par utilisateur.
2.  **Validation Zod :** Renforcer les schémas tRPC pour interdire les inputs malformés avant qu'ils n'atteignent le service.

---

## 5. Conclusion
Le projet est **production-ready** sur le plan structurel, mais nécessite une passe de stabilisation sur les services externes (OSM/OpenAI). Les corrections appliquées lors de cet audit permettent de restaurer les fonctionnalités de recherche et de simulation.
