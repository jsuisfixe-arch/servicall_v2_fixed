# Corrections TypeScript Servicall

## Fichiers serveur critiques
- [x] server/middleware/rlsMiddleware.ts - Corriger fusion commentaire/code (ligne 34)
- [x] server/_core/index.ts - Vérifier import WebSocketServer (ligne 40) - Déjà correct
- [x] server/index.ts - Corriger PORT parsing (ligne 120) - Déjà correct

## Routers serveur
- [ ] server/routers/agentSwitchRouter.ts - Vérifier tenantSettings et comparaison "AI"
- [ ] server/routers/coachingRouter.ts - Ajouter listScenarios et getAgentSimulationHistory
- [x] server/routers/phoneRouter.ts - Corriger ctx non défini (ligne 186) - CORRIGÉ
- [x] server/routers/twilioRouter.ts - Corriger appel sendSms (ligne 81) - CORRIGÉ
- [x] server/routers/securityRouter.ts - Corriger cast string (lignes 377-378) - CORRIGÉ
- [x] server/routers/recruitmentEnhancedRouter.ts - Corriger cast CVParseResult (ligne 273) - CORRIGÉ
- [x] server/routers/billingRouter.ts - Typer résultats Drizzle (lignes 78-79, 275, 283, 334) - CORRIGÉ

## Services serveur
- [x] server/services/asrStreamingService.ts - Extends EventEmitter - Déjà correct
- [x] server/services/voicePipelineService.ts - Extends EventEmitter - Déjà correct
- [ ] server/services/realtimeVoicePipeline.ts - Extends EventEmitter
- [ ] server/services/DialogueEngineService.ts - Corriger Action[], __dirname, types
- [x] server/services/chatbotService.ts - Exporter DialogueOutput (ligne 2) - Déjà correct
- [x] server/services/weeklyReportService.ts - Corriger type FinalExecutionContext (ligne 46) - CORRIGÉ
- [x] server/services/tenantService.ts - Caster rôle (ligne 98) - CORRIGÉ
- [x] server/services/messagingService.ts - Corriger appels (lignes 79, 199) - CORRIGÉ
- [x] server/services/appointmentReminderService.ts - Corriger appel (ligne 150) - CORRIGÉ

## APIs serveur
- [x] server/api/twilio.ts - Convertir number en string (ligne 129) - CORRIGÉ
- [x] server/api/stripe.ts - Caster unknown (ligne 48) - CORRIGÉ

## Workflow engine
- [ ] server/workflow-engine/actions/messaging/SendEmailAction.ts - Ajouter data? à SendEmailResponse

## Fichiers config
- [x] vite.config.ts - Ajouter déclaration ESM pour __dirname - Déjà correct

## Fichiers client utils
- [x] client/src/lib/safeAccess.ts - Corriger cast (ligne 94) - CORRIGÉ
- [x] client/src/lib/utils.ts - Corriger accès $$typeof (ligne 20) - Déjà correct
- [x] client/src/hooks/useCsrfToken.ts - Corriger cast window (ligne 1) - Déjà correct
- [x] client/src/pages/Training.tsx - Corriger cast window (ligne 93) - Déjà correct
- [x] client/src/main.tsx - Utiliser import.meta.env (lignes 23, 34, 125) - CORRIGÉ

## Composants client
- [ ] Composants Kanban - Ajouter key?: React.Key aux interfaces props

## Validation finale
- [ ] Compiler le projet avec pnpm build
- [ ] Vérifier absence d'erreurs TypeScript
- [ ] Créer checkpoint final
