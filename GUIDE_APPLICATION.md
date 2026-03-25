# 📦 GUIDE D'APPLICATION — CORRECTIONS SERVICALL (8 PHASES)

## Fichiers à remplacer dans `servicall_FINAL_CORRIGE/`

```
server/_core/index.ts                         ← Phase 1 + Phase 4 + Phase 6
server/routers.ts                             ← Phase 2
server/infrastructure/redis/redis.client.ts   ← Phase 1.1
server/infrastructure/observability/sentry.ts ← Phase 1.2
server/services/envValidationService.ts       ← Phase 1.3
server/workers/index.ts                       ← Phase 1.4
server/middleware/rateLimit.ts                ← Phase 4.2
server/middleware/cspNonceMiddleware.ts       ← Phase 4.3
server/routers/healthRouter.ts                ← Phase 7
client/src/App.tsx                            ← Phase 5
tsconfig.server-only.json                     ← Phase 3
package.json                                  ← Phase 3
```

---

## ✅ Résumé des corrections

| Phase | Fichier | Problème résolu |
|-------|---------|----------------|
| 1.1 | `redis.client.ts` | `process.exit(1)` supprimé — fallback RedisMock systématique |
| 1.2 | `sentry.ts` | Import statique → `require()` dynamique — no-op si absent |
| 1.3 | `envValidationService.ts` | Twilio/OpenAI/Stripe ne bloquent plus le démarrage |
| 1.4 | `workers/index.ts` | `Promise.allSettled()` — un worker cassé n'arrête pas les autres |
| 2   | `routers.ts` | 10 routers optionnels wrappés try/catch avec `emptyRouter` fallback |
| 3   | `tsconfig` + `package.json` | `outDir: dist`, scripts build esbuild alignés sur le référence |
| 4.2 | `rateLimit.ts` | Redis absent → fallback mémoire automatique sans crash |
| 4.3 | `cspNonceMiddleware.ts` | try/catch autour de crypto.randomBytes |
| 4.1 | `index.ts` | CSRF uniquement si `NODE_ENV=production` ET `SESSION_SECRET` défini |
| 5   | `App.tsx` | `lazyWithRetry`, routes `/connected` `/signup` `/prospect/:id` ajoutées |
| 6   | `index.ts` | WebSocket pattern référence : Map, cleanupSession, monitoring 500MB |
| 7   | `healthRouter.ts` | Format `{ status, timestamp, services }` compatible référence |

---

## 🚀 Commandes de validation

```bash
pnpm run typecheck                        # 0 erreurs TypeScript
pnpm run build                            # build esbuild réussi
NODE_ENV=production node dist/index.js    # démarre avec seulement DATABASE_URL
curl http://localhost:5000/health         # → { status: "ok" }
curl http://localhost:5000/api/trpc/auth.me  # → JSON (pas 500)
```

---

## Variables d'environnement minimales pour démarrer

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=un-secret-de-32-caracteres-minimum
JWT_SECRET=un-autre-secret-de-32-caracteres
```

Toutes les autres variables (REDIS_URL, TWILIO_*, OPENAI_API_KEY, STRIPE_*, SENTRY_DSN)
sont **optionnelles** — le serveur démarre et log des warnings si elles sont absentes.
