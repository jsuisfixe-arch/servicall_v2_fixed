/**
 * BYOK (Bring Your Own Key) & 10 Services Métier
 * Architecture centralisée pour les clés API et les services avancés
 */

import { pgTable, integer, varchar, text, timestamp, boolean, json, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// BYOK: API Keys Management (Centralized)
// ============================================
export const apiKeys = pgTable(
  "api_keys",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    provider: varchar("provider", { length: 100 }).notNull(), // 'google_maps', 'pages_jaunes', 'openai', 'stripe', 'sendgrid', etc.
    encryptedKey: text("encrypted_key").notNull(), // Clé chiffrée AES-256-CBC
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantProviderIdx: uniqueIndex("api_keys_tenant_provider_idx").on(table.tenantId, table.provider),
    tenantIdIdx: index("api_keys_tenant_id_idx").on(table.tenantId),
  })
);

export type APIKey = typeof apiKeys.$inferSelect;
export type InsertAPIKey = typeof apiKeys.$inferInsert;

// ============================================
// BYOK: Audit Log
// ============================================
export const byokAuditLogs = pgTable(
  "byok_audit_logs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    action: varchar("action", { length: 50 }).notNull(), // 'create', 'update', 'delete', 'test'
    provider: varchar("provider", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed'
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("byok_audit_logs_tenant_id_idx").on(table.tenantId),
    createdAtIdx: index("byok_audit_logs_created_at_idx").on(table.createdAt),
  })
);

export type BYOKAuditLog = typeof byokAuditLogs.$inferSelect;
export type InsertBYOKAuditLog = typeof byokAuditLogs.$inferInsert;

// ============================================
// SERVICE 1: Leads Management
// ============================================
export const leads = pgTable(
  "leads",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    company: varchar("company", { length: 255 }),
    industry: varchar("industry", { length: 100 }),
    source: varchar("source", { length: 50 }), // 'google_maps', 'pages_jaunes', 'manual', 'csv'
    sourceData: json("source_data"),
    enrichmentStatus: varchar("enrichment_status", { length: 50 }).default("pending"), // 'pending', 'enriched', 'failed'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("leads_tenant_id_idx").on(table.tenantId),
    emailIdx: index("leads_email_idx").on(table.email),
    createdAtIdx: index("leads_created_at_idx").on(table.createdAt),
  })
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================
// SERVICE 2: Contact Memory (AI)
// ============================================
export const contactMemories = pgTable(
  "contact_memories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    contactId: integer("contact_id").notNull(),
    interactionType: varchar("interaction_type", { length: 50 }).notNull(), // 'call', 'email', 'meeting'
    summary: text("summary").notNull(),
    sentiment: varchar("sentiment", { length: 20 }), // 'positive', 'neutral', 'negative'
    keyPoints: json("key_points"), // Array of key discussion points
    nextActions: json("next_actions"), // Array of recommended next steps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("contact_memories_tenant_id_idx").on(table.tenantId),
    contactIdIdx: index("contact_memories_contact_id_idx").on(table.contactId),
    createdAtIdx: index("contact_memories_created_at_idx").on(table.createdAt),
  })
);

export type ContactMemory = typeof contactMemories.$inferSelect;
export type InsertContactMemory = typeof contactMemories.$inferInsert;

// ============================================
// SERVICE 3: Workflow Builder (BYOK visual builder — table distincte de "workflows" CRM)
// ============================================
// NB: Renommé byokWorkflows (table "byok_workflows") pour éviter la collision
//     avec la table "workflows" CRM définie dans schema.ts (actions, triggerType, etc.)
export const byokWorkflows = pgTable(
  "byok_workflows",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    definition: json("definition").notNull(), // Visual workflow definition
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("byok_workflows_tenant_id_idx").on(table.tenantId),
  })
);

/** @deprecated use byokWorkflows */
export { byokWorkflows as workflows };

export type ByokWorkflow = typeof byokWorkflows.$inferSelect;
export type InsertByokWorkflow = typeof byokWorkflows.$inferInsert;

// ============================================
// SERVICE 4: Weekly Reports
// ============================================
export const reports = pgTable(
  "reports",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    reportType: varchar("report_type", { length: 50 }).notNull(), // 'weekly', 'monthly', 'custom'
    htmlContent: text("html_content").notNull(),
    sentTo: varchar("sent_to", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("reports_tenant_id_idx").on(table.tenantId),
    createdAtIdx: index("reports_created_at_idx").on(table.createdAt),
  })
);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ============================================
// SERVICE 5: Webhook Subscriptions
// ============================================
export const webhookSubscriptions = pgTable(
  "webhook_subscriptions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    events: json("events").notNull(), // Array of event types
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("webhook_subscriptions_tenant_id_idx").on(table.tenantId),
  })
);

export type WebhookSubscription = typeof webhookSubscriptions.$inferSelect;
export type InsertWebhookSubscription = typeof webhookSubscriptions.$inferInsert;

// ============================================
// SERVICE 5: Webhook Deliveries (Audit)
// ============================================
export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    subscriptionId: integer("subscription_id").notNull(),
    event: varchar("event", { length: 100 }).notNull(),
    payload: json("payload"),
    statusCode: integer("status_code"),
    response: text("response"),
    retryCount: integer("retry_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    subscriptionIdIdx: index("webhook_deliveries_subscription_id_idx").on(table.subscriptionId),
    createdAtIdx: index("webhook_deliveries_created_at_idx").on(table.createdAt),
  })
);

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

// ============================================
// SERVICE 6: Blueprint Marketplace
// ============================================
export const blueprints = pgTable(
  "blueprints",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(), // 'sales', 'support', 'recruitment', etc.
    definition: json("definition").notNull(), // Workflow template
    rating: integer("rating").default(0),
    downloads: integer("downloads").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("blueprints_category_idx").on(table.category),
  })
);

export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = typeof blueprints.$inferInsert;

// ============================================
// SERVICE 7: Stripe Connect
// ============================================
export const stripeConnections = pgTable(
  "stripe_connections",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    stripeAccountId: varchar("stripe_account_id", { length: 255 }).notNull().unique(),
    isConnected: boolean("is_connected").default(false).notNull(),
    commissionRate: integer("commission_rate").default(5), // Percentage
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: uniqueIndex("stripe_connections_tenant_id_idx").on(table.tenantId),
  })
);

export type StripeConnection = typeof stripeConnections.$inferSelect;
export type InsertStripeConnection = typeof stripeConnections.$inferInsert;

// ============================================
// SERVICE 8: Email Configuration
// ============================================
export const emailConfigs = pgTable(
  "email_configs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    provider: varchar("provider", { length: 50 }).notNull(), // 'sendgrid', 'gmail', 'outlook'
    encryptedCredentials: text("encrypted_credentials").notNull(),
    fromEmail: varchar("from_email", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("email_configs_tenant_id_idx").on(table.tenantId),
  })
);

export type EmailConfig = typeof emailConfigs.$inferSelect;
export type InsertEmailConfig = typeof emailConfigs.$inferInsert;

// ============================================
// SERVICE 9: AI Metrics & Monitoring
// ============================================
export const aiMetrics = pgTable(
  "ai_metrics",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    metricType: varchar("metric_type", { length: 100 }).notNull(), // 'latency', 'success_rate', 'error'
    value: integer("value").notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("ai_metrics_tenant_id_idx").on(table.tenantId),
    metricTypeIdx: index("ai_metrics_metric_type_idx").on(table.metricType),
    createdAtIdx: index("ai_metrics_created_at_idx").on(table.createdAt),
  })
);

export type AIMetric = typeof aiMetrics.$inferSelect;
export type InsertAIMetric = typeof aiMetrics.$inferInsert;

// ============================================
// SERVICE 10: Training Modules
// ============================================
export const trainingModules = pgTable(
  "training_modules",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tenantId: integer("tenant_id").notNull(),
    userId: integer("user_id").notNull(),
    moduleType: varchar("module_type", { length: 50 }).notNull(), // 'personalized_path', 'quiz', 'coach'
    progress: integer("progress").default(0).notNull(), // 0-100%
    score: integer("score"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index("training_modules_tenant_id_idx").on(table.tenantId),
    userIdIdx: index("training_modules_user_id_idx").on(table.userId),
  })
);

export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = typeof trainingModules.$inferInsert;

// ============================================
// Relations
// ============================================
export const apiKeysRelations = relations(apiKeys, ({ many }) => ({
  auditLogs: many(byokAuditLogs),
}));

export const byokAuditLogsRelations = relations(byokAuditLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [byokAuditLogs.tenantId],
    references: [apiKeys.tenantId],
  }),
}));

export const leadsRelations = relations(leads, ({ many }) => ({
  memories: many(contactMemories),
}));

export const contactMemoriesRelations = relations(contactMemories, ({ one }) => ({
  lead: one(leads, {
    fields: [contactMemories.contactId],
    references: [leads.id],
  }),
}));

export const webhookSubscriptionsRelations = relations(webhookSubscriptions, ({ many }) => ({
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  subscription: one(webhookSubscriptions, {
    fields: [webhookDeliveries.subscriptionId],
    references: [webhookSubscriptions.id],
  }),
}));
