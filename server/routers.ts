/**
 * AppRouter — Chargement défensif (Phase 2)
 * ─────────────────────────────────────────
 * Routers CRITIQUES  : import statique — crash si absent (voulu)
 * Routers OPTIONNELS : import dynamique try/catch → emptyRouter si échec
 */
import { router } from "./_core/trpc";
import { logger } from "./infrastructure/logger";

// ── emptyRouter fallback (Phase 2.2) ─────────────────────────────────────
const emptyRouter = router({});
type AnyRouter = ReturnType<typeof router>;

// ═══════════════════════════════════════════════════════════════════════
// ROUTERS CRITIQUES — doivent charger ou le serveur ne démarre pas
// ═══════════════════════════════════════════════════════════════════════
import { systemRouter }            from "./_core/systemRouter";
import { authRouter }              from "./routers/authRouter";
import { userRouter }              from "./routers/userRouter";
import { tenantRouter }            from "./routers/tenantRouter";
import { securityRouter }          from "./routers/securityRouter";
import { callsRouter }             from "./routers/callsRouter";
import { prospectRouter }          from "./routers/prospectRouter";
import { workflowRouter }          from "./routers/workflowRouter";
import { billingRouter }           from "./routers/billingRouter";
import { messagingRouter }         from "./routers/messagingRouter";
import { dashboardRouter }         from "./routers/dashboardRouter";

// ═══════════════════════════════════════════════════════════════════════
// ROUTERS STABLES (présents dans la version référence)
// ═══════════════════════════════════════════════════════════════════════
import { phoneRouter }             from "./routers/phoneRouter";
import { softphoneRouter }         from "./routers/softphoneRouter";
import { twilioRouter }            from "./routers/twilioRouter";
import { recordingRouter }         from "./routers/recordingRouter";
import { campaignRouter }          from "./routers/campaignRouter";
import { appointmentRouter }       from "./routers/appointmentRouter";
import { appointmentReminderRouter } from "./routers/appointmentReminderRouter";
import { realEstateRouter }        from "./routers/realEstateRouter";
import { businessEntitiesRouter }  from "./routers/businessEntitiesRouter";
import { posRouter }               from "./routers/posRouter";
import { realTimeMonitoringRouter } from "./routers/realTimeMonitoringRouter";
import { aiRouter }                from "./routers/aiRouter";
import { dialogueRouter }          from "./routers/dialogueRouter";
import { agentSwitchRouter }       from "./routers/agentSwitchRouter";
import { leadScoringRouter }       from "./routers/leadScoringRouter";
import { workflowEngineRouter }    from "./routers/workflowEngineRouter";
import { realtimeWorkflowRouter }  from "./routers/realtimeWorkflowRouter";
import { industryConfigRouter }    from "./routers/industryConfigRouter";
import { industryRouter }          from "./routers/industryRouter";
import { callScoringRouter }       from "./routers/callScoringRouter";
import { coachingRouter }          from "./routers/coachingRouter";
import { recruitmentRouter }       from "./routers/recruitmentRouter";
import { recruitmentEnhancedRouter } from "./routers/recruitmentEnhancedRouter";
import { invoiceRouter }           from "./routers/invoiceRouter";
import { orderRouter }             from "./routers/orderRouter";
import { paymentRouter }           from "./routers/paymentRouter";
import { rgpdRouter }              from "./routers/rgpdRouter";
import { documentRouter }          from "./routers/documentRouter";
import { predictiveRouter }        from "./routers/predictiveRouter";
import { commandValidationRouter } from "./routers/commandValidationRouter";
import { healthRouter }            from "./routers/healthRouter";
import { aiSuggestionsRouter }     from "./routers/aiSuggestionsRouter";
import { copilotRouter }           from "./routers/copilotRouter";
import { roiRouter }               from "./routers/roiRouter";
import { contactRouter }           from "./routers/contactRouter";
import { socialRouter }            from "./routers/socialRouter";
import { servicallV3Router }       from "./routers/servicallV3Router";

// ═══════════════════════════════════════════════════════════════════════
// ROUTERS OPTIONNELS (nouveaux dans version CORRIGÉE)
// Chargement défensif : emptyRouter si le module échoue
// ═══════════════════════════════════════════════════════════════════════

let emailConfigRouter: AnyRouter = emptyRouter;
try { emailConfigRouter = (await import("./routers/emailConfigRouter")).emailConfigRouter; }
catch (e) { logger.warn("[Router] emailConfigRouter non chargé", { error: e }); }

let callsTwilioRouter: AnyRouter = emptyRouter;
try { callsTwilioRouter = (await import("./routers/callsRouter-twilio")).callsTwilioRouter; }
catch (e) { logger.warn("[Router] callsTwilioRouter non chargé", { error: e }); }

let aiMemoryRouter: AnyRouter = emptyRouter;
try { aiMemoryRouter = (await import("./routers/aiMemoryRouter")).aiMemoryRouter; }
catch (e) { logger.warn("[Router] aiMemoryRouter non chargé", { error: e }); }

let workflowBuilderRouter: AnyRouter = emptyRouter;
try { workflowBuilderRouter = (await import("./routers/workflowBuilderRouter")).workflowBuilderRouter; }
catch (e) { logger.warn("[Router] workflowBuilderRouter non chargé", { error: e }); }

let reportRouter: AnyRouter = emptyRouter;
try { reportRouter = (await import("./routers/reportRouter")).reportRouter; }
catch (e) { logger.warn("[Router] reportRouter non chargé", { error: e }); }

let webhookRouter: AnyRouter = emptyRouter;
try { webhookRouter = (await import("./routers/webhookRouter")).webhookRouter; }
catch (e) { logger.warn("[Router] webhookRouter non chargé", { error: e }); }

let blueprintMarketplaceRouter: AnyRouter = emptyRouter;
try { blueprintMarketplaceRouter = (await import("./routers/blueprintMarketplaceRouter")).blueprintMarketplaceRouter; }
catch (e) { logger.warn("[Router] blueprintMarketplaceRouter non chargé", { error: e }); }

let stripeConnectRouter: AnyRouter = emptyRouter;
try { stripeConnectRouter = (await import("./routers/stripeConnectRouter")).stripeConnectRouter; }
catch (e) { logger.warn("[Router] stripeConnectRouter non chargé", { error: e }); }

let leadExtractionRouter: AnyRouter = emptyRouter;

let byokRouter: AnyRouter = emptyRouter;
try {
  byokRouter = (await import("./routers/byokRouter")).byokRouter;
} catch (e) {
  logger.warn("[Router] byokRouter non chargé", { error: e });
}

let servicesRouter: AnyRouter = emptyRouter;
try {
  servicesRouter = (await import("./routers/servicesRouter")).servicesRouter;
} catch (e) {
  logger.warn("[Router] servicesRouter non chargé", { error: e });
}
try { leadExtractionRouter = (await import("./routers/leadExtractionRouter")).leadExtractionRouter; }
catch (e) { logger.warn("[Router] leadExtractionRouter non chargé", { error: e }); }

let whatsappRouter: AnyRouter = emptyRouter;
try { whatsappRouter = (await import("./routers/whatsappRouter")).whatsappRouter; }
catch (e) { logger.warn("[Router] whatsappRouter non chargé", { error: e }); }

// Procedures re-export pour compatibilité
import { tenantProcedure, managerProcedure, adminProcedure } from "./procedures";
export { tenantProcedure, managerProcedure, adminProcedure };

export const appRouter = router({
  // ── Core (CRITIQUES) ─────────────────────────────────────────────────
  system:   systemRouter,
  auth:     authRouter,
  user:     userRouter,
  tenant:   tenantRouter,
  security: securityRouter,

  // ── Communication (CRITIQUES) ─────────────────────────────────────────
  calls:     callsRouter,
  messaging: messagingRouter,

  // ── Communication (STABLES) ───────────────────────────────────────────
  phone:     phoneRouter,
  softphone: softphoneRouter,
  twilio:    twilioRouter,
  recording: recordingRouter,

  // ── Communication (OPTIONNELS) ────────────────────────────────────────
  emailConfig: emailConfigRouter,
  callsTwilio: callsTwilioRouter,
  whatsapp:    whatsappRouter,

  // ── Business (CRITIQUES) ─────────────────────────────────────────────
  prospect:  prospectRouter,
  dashboard: dashboardRouter,

  // ── Business (STABLES) ───────────────────────────────────────────────
  campaign:            campaignRouter,
  appointment:         appointmentRouter,
  appointmentReminder: appointmentReminderRouter,
  realEstate:          realEstateRouter,
  businessEntities:    businessEntitiesRouter,
  pos:                 posRouter,
  monitoring:          realTimeMonitoringRouter,

  // ── Business (OPTIONNELS) ─────────────────────────────────────────────
  aiMemory: aiMemoryRouter,

  // ── AI & Automation (CRITIQUES) ───────────────────────────────────────
  workflow:  workflowRouter,
  workflows: workflowRouter, // alias compatibilité client

  // ── AI & Automation (STABLES) ─────────────────────────────────────────
  ai:                 aiRouter,
  dialogue:           dialogueRouter,
  agentSwitch:        agentSwitchRouter,
  leadScoring:        leadScoringRouter,
  workflowEngine:     workflowEngineRouter,
  realtimeWorkflow:   realtimeWorkflowRouter,
  industryConfig:     industryConfigRouter,
  industry:           industryRouter,
  callScoring:        callScoringRouter,
  coaching:           coachingRouter,
  recruitment:        recruitmentRouter,
  recruitmentEnhanced: recruitmentEnhancedRouter,
  aiSuggestions:      aiSuggestionsRouter,
  copilot:            copilotRouter,
  roi:                roiRouter,
  servicallV3:        servicallV3Router,

  // ── AI & Automation (OPTIONNELS) ──────────────────────────────────────
  workflowBuilder:     workflowBuilderRouter,
  report:              reportRouter,
  webhook:             webhookRouter,
  blueprintMarketplace: blueprintMarketplaceRouter,
  leadExtraction:      leadExtractionRouter,

  // ── Billing & Legal (CRITIQUES) ───────────────────────────────────────
  billing: billingRouter,
  invoice: invoiceRouter,
  order:   orderRouter,
  payment: paymentRouter,
  rgpd:    rgpdRouter,

  // ── Billing (OPTIONNELS) ─────────────────────────────────────────────
  stripeConnect: stripeConnectRouter,

  // ── Data & Utils (STABLES) ───────────────────────────────────────────
  documents:         documentRouter,
  predictive:        predictiveRouter,
  commandValidation: commandValidationRouter,
  health:            healthRouter,
  contact:           contactRouter,
  social:            socialRouter,

  // ── Nouvelles fonctionnalités (OPTIONNELLES) ─────────────────────────
  byok:     byokRouter,
  services: servicesRouter,
});

export type AppRouter = typeof appRouter;

// Export createCaller pour les tests
export const createCaller = appRouter.createCaller;
