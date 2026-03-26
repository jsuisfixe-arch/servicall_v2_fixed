/**
 * INDUSTRY WORKFLOW TEMPLATES
 * Templates de workflows métiers pré-configurés
 * Couvre les 13 secteurs disponibles dans les blueprints
 */

import type { Rule, ConditionGroup } from "../utils/ConditionEvaluator";

export type IndustryId =
  | 'lawyer' | 'craftsman' | 'delivery'
  | 'hotel' | 'medical' | 'restaurant' | 'real_estate'
  | 'recruitment' | 'commerce' | 'logistique' | 'prospection'
  | 'customer_service' | 'services'
  | string;

export interface WorkflowTemplate {
  industry: IndustryId;
  name: string;
  description: string;
  trigger_type: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name?: string;
  action_type: string;
  config: Record<string, unknown>;
  type?: 'action' | 'condition';
  rules?: Rule | ConditionGroup | (Rule | ConditionGroup)[];
  next_step?: string;
  order?: number;
}

// ─── AVOCATS ─────────────────────────────────────────────────────────────────
export const BLUEPRINT_LAWYER: WorkflowTemplate = {
  industry: 'lawyer',
  name: "Avocats - Résumé Juridique Automatisé",
  description: "Analyse les appels, extrait les faits juridiques et crée une tâche de suivi.",
  trigger_type: 'call.completed',
  steps: [
    { id: 'step1', name: "Transcription", action_type: 'transcribe_call', config: {}, order: 1 },
    { id: 'step2', name: "Résumé Juridique", action_type: 'ai_summary', config: { type: 'legal', format: 'paragraph' }, order: 2 },
    { id: 'step3', name: "Extraction Entités", action_type: 'ai_extract', config: { fields: ['adversaire', 'tribunal', 'date_audience'] }, order: 3 },
    { id: 'step4', name: "Création Tâche", action_type: 'create_task', config: { title: "Suivi Dossier : {{variables.ai.extracted.adversaire}}", priority: "medium" }, order: 4 },
  ],
};

// ─── ARTISANS (craftsman) ────────────────────────────────────────────────────
export const BLUEPRINT_CRAFTSMAN: WorkflowTemplate = {
  industry: 'craftsman',
  name: "Artisans - Gestion des Urgences",
  description: "Détecte les urgences (fuites, pannes) et alerte immédiatement par SMS.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Analyse Sentiment & Urgence", action_type: 'ai_sentiment_analysis', config: { detect_urgency: true }, order: 1 },
    { id: 'step2', name: "Branchement Urgence", action_type: 'logic_if_else', config: {
        condition: 'variables.ai.sentiment.shouldEscalate',
        on_true: 'step3_urgent', on_false: 'step3_standard',
      }, order: 2 },
    { id: 'step3_urgent', name: "Alerte SMS Urgent", action_type: 'send_sms', config: { body: "URGENCE DETECTEE : {{variables.last_message}}" }, order: 3 },
    { id: 'step3_standard', name: "Tâche Standard", action_type: 'create_task', config: { title: "Rappel Client Standard", priority: "low" }, order: 4 },
  ],
};

// ─── LIVRAISON ───────────────────────────────────────────────────────────────
export const BLUEPRINT_DELIVERY: WorkflowTemplate = {
  industry: 'delivery',
  name: "Livraison - Scoring & Qualification",
  description: "Qualifie les demandes de livraison et assigne une priorité logistique.",
  trigger_type: 'prospect.created',
  steps: [
    { id: 'step1', name: "Scoring Logistique", action_type: 'ai_score', config: { criteria: ['volume', 'distance'] }, order: 1 },
    { id: 'step2', name: "Tag Priorité", action_type: 'add_tag', config: { tag: "Score: {{variables.ai.score}}" }, order: 2 },
    { id: 'step3', name: "Assignation", action_type: 'assign_agent', config: { role: "livreur", smart_routing: true }, order: 3 },
  ],
};

// ─── HÔTEL ───────────────────────────────────────────────────────────────────
export const BLUEPRINT_HOTEL: WorkflowTemplate = {
  industry: 'hotel',
  name: "Réservation Hôtel - Qualification & Booking",
  description: "Qualifie les demandes de réservation, vérifie les disponibilités et crée une réservation.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Accueil & Collecte Dates", action_type: 'speak_to_caller', config: { text: "Bienvenue. Pour quelles dates souhaitez-vous réserver ?" }, order: 1 },
    { id: 'step2', name: "Écoute Dates", action_type: 'listen_and_understand', config: { timeout: 10, extract: ['check_in', 'check_out', 'guests'] }, order: 2 },
    { id: 'step3', name: "Vérification Disponibilité", action_type: 'query_business_entities', config: { entity: 'availability', params: ['check_in', 'check_out'] }, order: 3 },
    { id: 'step4', name: "Création Réservation", action_type: 'create_reservation', config: { type: 'hotel' }, order: 4 },
    { id: 'step5', name: "Confirmation SMS", action_type: 'send_sms', config: { body: "Réservation confirmée du {{check_in}} au {{check_out}}. Merci !" }, order: 5 },
  ],
};

// ─── MÉDICAL ─────────────────────────────────────────────────────────────────
export const BLUEPRINT_MEDICAL: WorkflowTemplate = {
  industry: 'medical',
  name: "Secrétariat Médical - Prise de RDV",
  description: "Gère les appels entrants, détecte les urgences et planifie les consultations.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Accueil", action_type: 'speak_to_caller', config: { text: "Bonjour, cabinet médical. S'agit-il d'une urgence ?" }, order: 1 },
    { id: 'step2', name: "Analyse Urgence", action_type: 'ai_intent', config: { intents: ['emergency', 'schedule_appointment', 'info'] }, order: 2 },
    { id: 'step3', name: "Branchement", action_type: 'logic_if_else', config: {
        condition: "variables.intent === 'emergency'",
        on_true: 'step4_urgence', on_false: 'step4_rdv',
      }, order: 3 },
    { id: 'step4_urgence', name: "Redirection Urgence", action_type: 'speak_to_caller', config: { text: "Je vous transfère immédiatement vers le médecin de garde." }, order: 4 },
    { id: 'step4_rdv', name: "Prise de RDV", action_type: 'create_appointment', config: { type: 'consultation', notify_sms: true }, order: 5 },
  ],
};

// ─── RESTAURANT ──────────────────────────────────────────────────────────────
export const BLUEPRINT_RESTAURANT: WorkflowTemplate = {
  industry: 'restaurant',
  name: "Restaurant - Prise de Commande IA",
  description: "Gère les commandes par téléphone, extrait les plats et crée la commande en POS.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Accueil", action_type: 'speak_to_caller', config: { text: "Bonjour, que souhaitez-vous commander ?" }, order: 1 },
    { id: 'step2', name: "Extraction Commande", action_type: 'listen_and_understand', config: { timeout: 30, extract: ['items', 'quantity', 'special_requests'] }, order: 2 },
    { id: 'step3', name: "Confirmation Commande", action_type: 'ai_summary', config: { type: 'order_confirmation' }, order: 3 },
    { id: 'step4', name: "Création Commande POS", action_type: 'create_order', config: { send_to_pos: true }, order: 4 },
    { id: 'step5', name: "Confirmation SMS", action_type: 'send_sms', config: { body: "Votre commande est enregistrée. Temps estimé : 30 min." }, order: 5 },
  ],
};

// ─── IMMOBILIER ──────────────────────────────────────────────────────────────
export const BLUEPRINT_REAL_ESTATE: WorkflowTemplate = {
  industry: 'real_estate',
  name: "Immobilier - Qualification Acheteur/Vendeur",
  description: "Qualifie les prospects immobiliers et planifie les visites ou estimations.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Qualification Projet", action_type: 'ai_intent', config: { intents: ['buy', 'sell', 'rent', 'estimate'] }, order: 1 },
    { id: 'step2', name: "Scoring Lead", action_type: 'ai_score', config: { criteria: ['budget', 'timeline', 'location'] }, order: 2 },
    { id: 'step3', name: "Création Lead CRM", action_type: 'create_lead', config: { pipeline: 'real_estate' }, order: 3 },
    { id: 'step4', name: "Prise de RDV Visite", action_type: 'create_appointment', config: { type: 'visit', notify_email: true, notify_sms: true }, order: 4 },
    { id: 'step5', name: "Assignation Agent", action_type: 'assign_agent', config: { role: 'agent_immobilier', smart_routing: true }, order: 5 },
  ],
};

// ─── RECRUTEMENT ─────────────────────────────────────────────────────────────
export const BLUEPRINT_RECRUITMENT: WorkflowTemplate = {
  industry: 'recruitment',
  name: "Recruteur IA - Présélection Candidats",
  description: "Pré-qualifie les candidats par téléphone, score leur profil et planifie les entretiens.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Accueil Candidat", action_type: 'speak_to_caller', config: { text: "Bonjour, merci de votre candidature. Je vais vous poser quelques questions." }, order: 1 },
    { id: 'step2', name: "Qualification Expérience", action_type: 'listen_and_understand', config: { extract: ['years_experience', 'skills', 'salary_expectation'] }, order: 2 },
    { id: 'step3', name: "Scoring CV", action_type: 'ai_score', config: { criteria: ['experience', 'skills_match', 'availability'] }, order: 3 },
    { id: 'step4', name: "Création Fiche Candidat", action_type: 'create_lead', config: { pipeline: 'recruitment' }, order: 4 },
    { id: 'step5', name: "Planification Entretien", action_type: 'create_appointment', config: { type: 'interview', notify_email: true }, order: 5 },
  ],
};

// ─── COMMERCE SAV ────────────────────────────────────────────────────────────
export const BLUEPRINT_COMMERCE: WorkflowTemplate = {
  industry: 'commerce',
  name: "Commerce SAV - Résolution Client",
  description: "Gère les demandes SAV, identifie le motif et propose une résolution.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Identification Client", action_type: 'query_database', config: { entity: 'customer', match: 'phone' }, order: 1 },
    { id: 'step2', name: "Analyse Motif SAV", action_type: 'ai_intent', config: { intents: ['return', 'exchange', 'complaint', 'tracking'] }, order: 2 },
    { id: 'step3', name: "Résolution Guidée", action_type: 'ai_summary', config: { type: 'sav_resolution' }, order: 3 },
    { id: 'step4', name: "Note CRM", action_type: 'add_note', config: { label: "SAV - {{variables.intent}}" }, order: 4 },
    { id: 'step5', name: "Email Confirmation", action_type: 'send_email', config: { template: 'sav_followup' }, order: 5 },
  ],
};

// ─── LOGISTIQUE ──────────────────────────────────────────────────────────────
export const BLUEPRINT_LOGISTIQUE: WorkflowTemplate = {
  industry: 'logistique',
  name: "Logistique - Suivi & Reprogrammation",
  description: "Permet au client de suivre sa livraison et de reprogrammer si nécessaire.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Demande Numéro Colis", action_type: 'listen_and_understand', config: { extract: ['tracking_number', 'order_id'] }, order: 1 },
    { id: 'step2', name: "Requête Statut", action_type: 'query_database', config: { entity: 'shipment', field: 'tracking_number' }, order: 2 },
    { id: 'step3', name: "Annonce Statut", action_type: 'speak_to_caller', config: { text: "Votre colis est actuellement : {{variables.shipment_status}}" }, order: 3 },
    { id: 'step4', name: "Proposition Reprogrammation", action_type: 'logic_if_else', config: {
        condition: "variables.shipment_status === 'failed'",
        on_true: 'step5_reprogram', on_false: 'step5_end',
      }, order: 4 },
    { id: 'step5_reprogram', name: "Reprogrammation", action_type: 'create_appointment', config: { type: 'delivery_slot' }, order: 5 },
    { id: 'step5_end', name: "Fin & Note", action_type: 'add_note', config: { label: "Suivi colis consulté" }, order: 5 },
  ],
};

// ─── PROSPECTION ─────────────────────────────────────────────────────────────
export const BLUEPRINT_PROSPECTION: WorkflowTemplate = {
  industry: 'prospection',
  name: "Prospection Commerciale - Qualification Lead",
  description: "Appels sortants de prospection : consent RGPD, qualification et scoring.",
  trigger_type: 'call.outbound.started',
  steps: [
    { id: 'step1', name: "Introduction", action_type: 'speak_to_caller', config: { text: "Bonjour, je vous appelle de la part de {{company_name}}." }, order: 1 },
    { id: 'step2', name: "Consentement RGPD", action_type: 'listen_and_understand', config: { extract: ['consent'], required: true }, order: 2 },
    { id: 'step3', name: "Vérif Consent", action_type: 'logic_if_else', config: {
        condition: "variables.consent === true",
        on_true: 'step4_qualify', on_false: 'step4_end',
      }, order: 3 },
    { id: 'step4_qualify', name: "Qualification Besoin", action_type: 'ai_intent', config: { intents: ['interested', 'not_interested', 'call_back'] }, order: 4 },
    { id: 'step4_end', name: "Fin Appel", action_type: 'speak_to_caller', config: { text: "Je respecte votre souhait. Bonne journée." }, order: 4 },
    { id: 'step5', name: "Scoring & CRM", action_type: 'ai_score', config: { criteria: ['interest_level', 'budget', 'timeline'] }, order: 5 },
    { id: 'step6', name: "Création Lead", action_type: 'create_lead', config: { pipeline: 'outbound' }, order: 6 },
  ],
};

// ─── CUSTOMER SERVICE ────────────────────────────────────────────────────────
export const BLUEPRINT_CUSTOMER_SERVICE: WorkflowTemplate = {
  industry: 'customer_service',
  name: "Support Client IA - Résolution Guidée",
  description: "Triage des tickets support, FAQ intelligente et escalade vers agent humain.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Qualification Problème", action_type: 'ai_intent', config: { intents: ['billing', 'technical', 'account', 'general'] }, order: 1 },
    { id: 'step2', name: "Analyse Urgence", action_type: 'ai_sentiment_analysis', config: { detect_urgency: true }, order: 2 },
    { id: 'step3', name: "Branchement Urgence", action_type: 'logic_if_else', config: {
        condition: "variables.ai.sentiment.shouldEscalate",
        on_true: 'step4_escalade', on_false: 'step4_faq',
      }, order: 3 },
    { id: 'step4_escalade', name: "Transfert Agent", action_type: 'assign_agent', config: { role: 'support_senior', notify_agent: true }, order: 4 },
    { id: 'step4_faq', name: "FAQ Intelligente", action_type: 'ai_summary', config: { type: 'faq_answer', knowledge_base: true }, order: 4 },
    { id: 'step5', name: "Création Ticket", action_type: 'create_task', config: { title: "Support : {{variables.intent}}", priority: "{{variables.urgency}}" }, order: 5 },
  ],
};

// ─── SERVICES / ARTISANAT ─────────────────────────────────────────────────────
export const BLUEPRINT_SERVICES: WorkflowTemplate = {
  industry: 'services',
  name: "Artisan / Services - Gestion Interventions",
  description: "Qualifie les demandes d'intervention, détecte l'urgence et planifie.",
  trigger_type: 'call.received',
  steps: [
    { id: 'step1', name: "Qualification Urgence", action_type: 'ai_sentiment_analysis', config: { detect_urgency: true, keywords: ['fuite', 'panne', 'cassé', 'urgence'] }, order: 1 },
    { id: 'step2', name: "Branchement", action_type: 'logic_if_else', config: {
        condition: "variables.ai.sentiment.shouldEscalate",
        on_true: 'step3_urgent', on_false: 'step3_normal',
      }, order: 2 },
    { id: 'step3_urgent', name: "SMS Technicien Urgent", action_type: 'send_sms', config: { body: "URGENCE client : {{variables.last_message}} — Rappeler immédiatement" }, order: 3 },
    { id: 'step3_normal', name: "Planification Intervention", action_type: 'create_appointment', config: { type: 'intervention', notify_sms: true }, order: 3 },
    { id: 'step4', name: "Création Lead", action_type: 'create_lead', config: { pipeline: 'services' }, order: 4 },
  ],
};

// ─── REGISTRE COMPLET ─────────────────────────────────────────────────────────
export const ALL_TEMPLATES: WorkflowTemplate[] = [
  BLUEPRINT_LAWYER,
  BLUEPRINT_CRAFTSMAN,
  BLUEPRINT_DELIVERY,
  BLUEPRINT_HOTEL,
  BLUEPRINT_MEDICAL,
  BLUEPRINT_RESTAURANT,
  BLUEPRINT_REAL_ESTATE,
  BLUEPRINT_RECRUITMENT,
  BLUEPRINT_COMMERCE,
  BLUEPRINT_LOGISTIQUE,
  BLUEPRINT_PROSPECTION,
  BLUEPRINT_CUSTOMER_SERVICE,
  BLUEPRINT_SERVICES,
];

export function getTemplatesByIndustry(industry: IndustryId): WorkflowTemplate[] {
  return ALL_TEMPLATES.filter(t => t.industry === industry);
}

export function getTemplate(name: string): WorkflowTemplate | undefined {
  return ALL_TEMPLATES.find(t => t.name === name);
}
