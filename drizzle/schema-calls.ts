/**
 * SCHEMA — Domaine Appels (Calls)
 * Tables : recordings, callScoring, simulatedCalls, agentSwitchHistory, blacklistedNumbers
 */
import { pgTable, varchar, integer, timestamp, text, boolean, json, decimal, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants, users, campaigns } from "./schema";

// ============================================
// RECORDINGS TABLE
// ============================================
export const recordings = pgTable("recordings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  callId: integer("call_id"),
  callSid: varchar("call_sid", { length: 255 }),
  recordingSid: varchar("recording_sid", { length: 255 }),
  url: text("url"),
  duration: integer("duration"),
  status: varchar("status", { length: 50 }).default("pending"),
  transcription: text("transcription"),
  sentiment: varchar("sentiment", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tenantIdIdx: index("idx_recordings_tenant_id_idx").on(table.tenantId),
  callIdIdx: index("idx_recordings_call_id_idx").on(table.callId),
  callSidIdx: index("idx_recordings_call_sid_idx").on(table.callSid),
}));

export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = typeof recordings.$inferInsert;

// ============================================
// CALL_SCORING TABLE
// ============================================
export const callScoring = pgTable("call_scoring", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  callId: integer("call_id"),
  agentId: integer("agent_id"),
  overallScore: integer("overall_score"),
  empathyScore: integer("empathy_score"),
  clarityScore: integer("clarity_score"),
  resolutionScore: integer("resolution_score"),
  complianceScore: integer("compliance_score"),
  sentiment: varchar("sentiment", { length: 50 }),
  keyPhrases: json("key_phrases"),
  improvements: json("improvements"),
  strengths: json("strengths"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tenantIdIdx: index("idx_call_scoring_tenant_id_idx").on(table.tenantId),
  callIdIdx: index("idx_call_scoring_call_id_idx").on(table.callId),
  agentIdIdx: index("idx_call_scoring_agent_id_idx").on(table.agentId),
}));

export type CallScoring = typeof callScoring.$inferSelect;
export type InsertCallScoring = typeof callScoring.$inferInsert;

// ============================================
// SIMULATED_CALLS TABLE (Coaching)
// ============================================
export const simulatedCalls = pgTable("simulated_calls", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").references(() => users.id, { onDelete: "set null" }),
  scenarioId: varchar("scenario_id", { length: 255 }),
  scenarioName: varchar("scenario_name", { length: 255 }),
  status: text("status").default("in_progress"), // 'in_progress', 'completed', 'abandoned'
  duration: integer("duration").default(0),
  score: integer("score").default(0),
  transcript: json("transcript").$type<Array<{ timestamp: number; speaker: string; text: string; sentiment?: number }>>(),
  feedback: json("feedback").$type<{ strengths: string[]; weaknesses: string[]; recommendations: string[] }>(),
  objectivesAchieved: json("objectives_achieved").$type<string[]>(),
  metadata: json("metadata"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tenantIdIdx: index("idx_simulated_calls_tenant_id_idx").on(table.tenantId),
  agentIdIdx: index("idx_simulated_calls_agent_id_idx").on(table.agentId),
  scenarioIdIdx: index("idx_simulated_calls_scenario_id_idx").on(table.scenarioId),
}));

export type SimulatedCall = typeof simulatedCalls.$inferSelect;
export type InsertSimulatedCall = typeof simulatedCalls.$inferInsert;

// ============================================
// AGENT_SWITCH_HISTORY TABLE
// ============================================
export const agentSwitchHistory = pgTable("agent_switch_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  previousAgentType: varchar("previous_agent_type", { length: 10 }),
  newAgentType: varchar("new_agent_type", { length: 10 }),
  callId: integer("call_id"),
  triggeredBy: varchar("triggered_by", { length: 50 }),
  triggeredByUserId: integer("triggered_by_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tenantIdIdx: index("idx_agent_switch_history_tenant_id_idx").on(table.tenantId),
  userIdIdx: index("idx_agent_switch_history_user_id_idx").on(table.userId),
  createdAtIdx: index("idx_agent_switch_history_created_at_idx").on(table.createdAt),
}));

export type AgentSwitchHistory = typeof agentSwitchHistory.$inferSelect;
export type InsertAgentSwitchHistory = typeof agentSwitchHistory.$inferInsert;

// ============================================
// BLACKLISTED_NUMBERS TABLE
// ============================================
export const blacklistedNumbers = pgTable("blacklisted_numbers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  reason: text("reason"),
  addedBy: integer("added_by"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tenantIdIdx: index("idx_blacklisted_numbers_tenant_id_idx").on(table.tenantId),
  phoneNumberIdx: uniqueIndex("idx_blacklisted_numbers_phone_unique").on(table.tenantId, table.phoneNumber),
}));

export type BlacklistedNumber = typeof blacklistedNumbers.$inferSelect;
export type InsertBlacklistedNumber = typeof blacklistedNumbers.$inferInsert;

// ============================================
// CALL_EXECUTION_METRICS TABLE
// ============================================
export const callExecutionMetrics = pgTable("call_execution_metrics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  callId: integer("call_id").references(() => campaigns.id, { onDelete: "cascade" }),
  callReceivedAt: timestamp("call_received_at"),
  timestamps: json("timestamps"),
  executionTime: integer("execution_time"),
  apiCalls: integer("api_calls"),
  tokensUsed: integer("tokens_used"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tenantIdIdx: index("idx_call_execution_metrics_tenant_id_idx").on(table.tenantId),
  callIdIdx: index("idx_call_execution_metrics_call_id_idx").on(table.callId),
}));

export type CallExecutionMetric = typeof callExecutionMetrics.$inferSelect;
export type InsertCallExecutionMetric = typeof callExecutionMetrics.$inferInsert;

// ============================================
// SCHEDULED_CALLBACKS TABLE
// Rappels automatiques planifiés par l'IA quand :
//  - L'humain n'est pas disponible au moment du transfert
//  - L'IA ne dispose pas de l'info demandée
//  - L'appelant le demande explicitement
// ============================================
export const scheduledCallbacks = pgTable("scheduled_callbacks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  // Prospect à rappeler
  prospectPhone: varchar("prospect_phone", { length: 50 }).notNull(),
  prospectName: varchar("prospect_name", { length: 255 }),
  prospectId: integer("prospect_id"),
  // Origine du rappel
  callSid: varchar("call_sid", { length: 255 }),          // SID de l'appel source
  callId: integer("call_id"),
  triggerReason: varchar("trigger_reason", { length: 50 }).notNull(),
  // 'no_info' : IA sans réponse  |  'human_unavailable' : humain absent
  // 'caller_request' : appelant demande  |  'manual' : planifié manuellement
  // Planification
  scheduledAt: timestamp("scheduled_at").notNull(),        // Quand rappeler
  notifyMode: varchar("notify_mode", { length: 20 }).notNull().default("crm"),
  // 'crm' : notification CRM uniquement
  // 'phone' : appel sur numéro configuré
  // 'both' : CRM + appel
  assignedUserId: integer("assigned_user_id").references(() => users.id, { onDelete: "set null" }),
  // Statut
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  // 'pending' | 'notified' | 'called' | 'completed' | 'failed' | 'cancelled'
  callbackCallSid: varchar("callback_call_sid", { length: 255 }), // SID du rappel sortant
  completedAt: timestamp("completed_at"),
  // Contexte IA résumé de la conversation précédente
  conversationSummary: text("conversation_summary"),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tenantIdIdx: index("idx_callbacks_tenant_id").on(table.tenantId),
  statusIdx: index("idx_callbacks_status").on(table.status),
  scheduledAtIdx: index("idx_callbacks_scheduled_at").on(table.scheduledAt),
  prospectPhoneIdx: index("idx_callbacks_prospect_phone").on(table.tenantId, table.prospectPhone),
}));

export type ScheduledCallback = typeof scheduledCallbacks.$inferSelect;
export type InsertScheduledCallback = typeof scheduledCallbacks.$inferInsert;
