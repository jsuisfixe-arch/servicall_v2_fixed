# Guide d'implémentation - Sélection automatique des workflows par métier

## 📋 Vue d'ensemble

Ce guide décrit les modifications apportées au projet Servicall pour permettre :
1. **Sélection automatique des workflows** basée sur le métier choisi
2. **Modification de la liste** des workflows (ajout/suppression)
3. **Import en masse** des workflows sélectionnés

## 🔧 Modifications effectuées

### 1. Enrichissement du catalogue des métiers

**Fichier modifié :** `server/config/INDUSTRIES_CATALOG.json`

**Changements :**
- Ajout d'une propriété `workflows` à chaque métier contenant les IDs des blueprints recommandés
- Mise à jour des emojis des icônes pour une meilleure représentation visuelle
- Ajout du métier "Ressources Humaines" (HR) avec ses workflows associés

**Exemple :**
```json
{
  "id": "restaurant",
  "name": "Restauration",
  "icon": "🍽️",
  "workflows": ["blueprint-1", "blueprint-11", "blueprint-20", "blueprint-21", "blueprint-22", "blueprint-23"]
}
```

### 2. Nouveau composant : IndustryWorkflowsManager

**Fichier créé :** `client/src/components/IndustryWorkflowsManager.tsx`

**Fonctionnalités :**
- ✅ **Auto-sélection** : Les workflows recommandés du métier sont pré-sélectionnés au chargement
- ✅ **Gestion interactive** : L'utilisateur peut ajouter/supprimer des workflows via des checkboxes
- ✅ **Affichage des détails** : Chaque workflow affiche son nom, description, trigger et actions
- ✅ **Import en masse** : Tous les workflows sélectionnés sont importés en parallèle
- ✅ **Feedback utilisateur** : Toasts de succès/erreur et indicateur de progression

**Props :**
```typescript
interface IndustryWorkflowsManagerProps {
  industryId: string;        // ID du métier sélectionné
  tenantId: number;          // ID du tenant
  onWorkflowsSelected?: (workflowIds: string[]) => void;  // Callback optionnel
}
```

**Utilisation :**
```tsx
<IndustryWorkflowsManager
  industryId={selectedIndustryId}
  tenantId={tenantId}
  onWorkflowsSelected={(ids) => console.log('Workflows sélectionnés:', ids)}
/>
```

### 3. Intégration dans la page Workflows

**Fichier modifié :** `client/src/pages/Workflows.tsx`

**Changements :**
- Import du nouveau composant `IndustryWorkflowsManager`
- Remplacement de `IndustryWorkflowsList` par `IndustryWorkflowsManager` à l'étape 3
- Conservation de la compatibilité avec le reste du flux d'onboarding

## 🔄 Flux utilisateur

### Avant (ancien flux)
1. Sélectionner un métier
2. Voir la liste des workflows disponibles
3. Cliquer sur "Activer ce workflow" pour chaque workflow individuellement

### Après (nouveau flux)
1. Sélectionner un métier
2. Les workflows recommandés sont **automatiquement pré-sélectionnés**
3. L'utilisateur peut :
   - Voir tous les workflows disponibles
   - Ajouter/supprimer des workflows via des checkboxes
   - Importer tous les workflows sélectionnés en une seule action
4. Les workflows sont importés en parallèle (plus rapide)

## 📊 Architecture des données

### Mapping métier → workflows

| Métier | Nombre de workflows | Workflows |
|--------|-------------------|-----------|
| Générique | 10 | blueprint-1 à blueprint-10 |
| Centre d'appels | 7 | blueprint-1, 2, 10, 13, 14, 15, 16 |
| Cabinet Médical | 4 | blueprint-1, 3, 20, 21 |
| Agence Immobilière | 5 | blueprint-1, 11, 14, 20, 21 |
| Cabinet Juridique | 4 | blueprint-1, 3, 14, 20 |
| Services IT | 4 | blueprint-1, 2, 17, 18 |
| Restaurant | 6 | blueprint-1, 11, 20, 21, 22, 23 |
| E-commerce | 4 | blueprint-1, 2, 11, 13 |
| Livraison | 5 | blueprint-1, 2, 20, 21, 22 |
| Ressources Humaines | 4 | blueprint-1, 11, 14, 20 |

## 🔌 Points d'intégration avec les APIs existantes

### Endpoints tRPC utilisés

1. **`trpc.industryConfig.getIndustryWorkflows`**
   - Récupère les workflows d'un métier
   - Filtre les blueprints depuis `shared/blueprints.json`
   - Retourne un tableau de workflows

2. **`trpc.workflows.importBlueprint`**
   - Importe un blueprint et crée un workflow
   - Accepte `tenantId` et `blueprintId`
   - Retourne le workflow créé

3. **`trpc.industryConfig.getCurrentConfig`**
   - Récupère la configuration actuelle du tenant
   - Utilisé pour initialiser l'état

## 🚀 Installation et déploiement

### Prérequis
- Node.js 18+
- pnpm ou npm
- Base de données PostgreSQL configurée

### Étapes

1. **Remplacer les fichiers modifiés**
   ```bash
   # Copier les fichiers modifiés dans votre projet
   cp -r servicall-modified/* /path/to/your/servicall/
   ```

2. **Installer les dépendances** (si nécessaire)
   ```bash
   cd /path/to/your/servicall
   pnpm install
   ```

3. **Compiler le projet**
   ```bash
   pnpm build
   ```

4. **Redémarrer le serveur**
   ```bash
   pnpm start
   ```

## 🧪 Tests

### Test manuel

1. Accédez à la page `/workflows`
2. Sélectionnez un métier (ex: "Restaurant")
3. Vérifiez que les workflows recommandés sont pré-sélectionnés
4. Décochez un workflow et vérifiez la mise à jour
5. Cliquez sur "Importer les workflows sélectionnés"
6. Vérifiez que les workflows sont créés dans la base de données

### Points de vérification

- ✅ Les workflows recommandés s'affichent correctement
- ✅ Les checkboxes fonctionnent (sélection/désélection)
- ✅ Le bouton "Importer" est désactivé si aucun workflow n'est sélectionné
- ✅ Les workflows sont importés en parallèle (pas d'attente séquentielle)
- ✅ Les toasts de succès/erreur s'affichent correctement
- ✅ La liste des workflows importés se met à jour après l'import

## 📝 Notes de développement

### Améliorations futures possibles

1. **Persistance des workflows sélectionnés**
   - Sauvegarder les workflows sélectionnés dans `tenantIndustryConfig.enabledWorkflows`
   - Permettre de revenir à la configuration sans réimporter

2. **Filtrage avancé**
   - Filtrer les workflows par trigger type (call_received, call_completed, etc.)
   - Filtrer par type d'action

3. **Prévisualisation**
   - Afficher un aperçu détaillé de chaque workflow avant import
   - Montrer les dépendances entre workflows

4. **Gestion des versions**
   - Versionner les blueprints
   - Permettre la mise à jour des workflows existants

### Considérations de performance

- Les workflows sont importés en parallèle avec `Promise.all()`
- Le composant utilise `staleTime: 0` pour forcer le rechargement des données
- Les mutations sont optimisées avec `invalidate()` pour mettre à jour le cache

## 🐛 Dépannage

### Les workflows ne s'affichent pas

**Cause probable :** Le fichier `INDUSTRIES_CATALOG.json` n'a pas été mis à jour

**Solution :**
1. Vérifiez que le fichier contient la propriété `workflows` pour chaque métier
2. Vérifiez que les IDs des blueprints correspondent à ceux dans `shared/blueprints.json`

### L'import échoue

**Cause probable :** Le blueprint n'existe pas ou le tenantId est invalide

**Solution :**
1. Vérifiez les logs du serveur pour plus de détails
2. Vérifiez que le blueprint existe dans `shared/blueprints.json`
3. Vérifiez que le tenantId est correct

### Les workflows ne sont pas pré-sélectionnés

**Cause probable :** Le composant n'a pas reçu les données correctement

**Solution :**
1. Vérifiez que `industryId` est correctement passé au composant
2. Vérifiez que l'API `getIndustryWorkflows` retourne les données attendues
3. Vérifiez la console du navigateur pour les erreurs

## 📚 Ressources

- [Documentation tRPC](https://trpc.io/)
- [Documentation React](https://react.dev/)
- [Documentation Drizzle ORM](https://orm.drizzle.team/)

## 📞 Support

Pour toute question ou problème, consultez :
1. Les logs du serveur (`server/logs/`)
2. La console du navigateur (F12)
3. Les fichiers de configuration du projet
