# Servicall v3 - Guide de Mise en Production (Production-Ready)

Cette version de Servicall v3 a été optimisée pour un déploiement sécurisé et automatisé.

## 🚀 Améliorations de Sécurité & Stabilité

| Composant | Amélioration Apportée |
| :--- | :--- |
| **Authentification** | Passage exclusif à **Bcrypt (Cost: 12)**. Suppression des méthodes MD5/Clair. |
| **Initialisation** | Script de **Seed Admin** automatisé et idempotent (`scripts/seed-admin.ts`). |
| **Environnement** | Validation stricte des variables `.env` via **Zod** au démarrage du serveur. |
| **Multi-Tenant** | Création automatique et synchrone du premier Tenant lors du premier login. |

## 🛠️ Installation

1. **Dépendances :**
   ```bash
   pnpm install
   ```

2. **Configuration :**
   Copiez le fichier `.env.example` en `.env` et renseignez les variables critiques :
   - `DATABASE_URL` (PostgreSQL)
   - `REDIS_URL` (Redis)
   - `SESSION_SECRET` (Min 32 caractères)
   - `JWT_SECRET` (Min 32 caractères)

3. **Base de Données :**
   Le serveur initialisera automatiquement les tables et le compte admin au premier démarrage.
   Si vous souhaitez le faire manuellement :
   ```bash
   pnpm db:push
   pnpm admin:init
   ```

## 🔐 Identifiants par défaut (Seed)

- **Email :** `admin@servicall.com`
- **Mot de passe :** `Admin_password123!`

---
*Note : Pour changer ces identifiants, modifiez le fichier `scripts/seed-admin.ts` avant le premier lancement.*
