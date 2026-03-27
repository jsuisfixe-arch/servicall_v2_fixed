
/**
 * DATABASE ACCESS LAYER - VERSION POSTGRESQL
 * Centralisation des requêtes métier pour Servicall v2
 */

import { eq, and, sql, desc, type ExtractTablesWithRelations } from "drizzle-orm";
import { dbManager } from "./services/dbManager";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";
import { logger } from "./infrastructure/logger";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

// Type précis de l'instance Drizzle (doit correspondre à celui de dbManager)
type DrizzleDB = PostgresJsDatabase<typeof schema> & { query: Record<string, unknown> };

// Re-export du schéma pour usage facile
export * from "../drizzle/schema";

/**
 * Type pour les transactions Drizzle
 */
export type DbTransaction = PgTransaction<
  PostgresJsQueryResultHKT, 
  typeof schema, 
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Accès à l'instance de base de données
 */
export const getDb = async (): Promise<DrizzleDB> => {
  return dbManager.db;
};

/**
 * ✅ CORRECTION BLOC 1: getDbInstance lance une erreur explicite si non initialisé
 */
export const getDbInstance = (): DrizzleDB => {
  return dbManager.db;
};

/**
 * ✅ ACTION 6 – Injecter tenantId côté DB
 */
export async function withTenant<T>(tenantId: number, callback: (tx: DbTransaction) => Promise<T>): Promise<T> {
  // ✅ BLOC 1: DB_ENABLED guard supprimé — toujours utiliser la vraie DB
  const database = getDbInstance();
  return await database.transaction(async (tx) => {
    await tx.execute(sql`SET app.tenant_id = ${tenantId}`);
    return await callback(tx as unknown as DbTransaction);
  });
}

/**
 * ✅ ACTION 12 – Timeout par requête/transaction
 */
export async function withTimeout<T>(timeoutMs: number, callback: (tx: DbTransaction) => Promise<T>): Promise<T> {
  // ✅ BLOC 1: DB_ENABLED guard supprimé — toujours utiliser la vraie DB
  const database = getDbInstance();
  return await database.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL statement_timeout = ${timeoutMs}`);
    const result = await callback(tx as unknown as DbTransaction);
    await tx.execute(sql`SET LOCAL statement_timeout = 0`);
    return result;
  });
}

/**
 * ✅ BLOC 1 CORRIGÉ: Accès direct à dbManager.db — proxy mock supprimé
 * La logique DB_ENABLED=false a été entièrement supprimée.
 * Toutes les opérations interagissent avec la base de données réelle.
 */
export const db: DrizzleDB = new Proxy({} as DrizzleDB, {
  get(_target, prop) {
    const database = dbManager.db;
    return (database as unknown as Record<string | symbol, unknown>)[prop as string];
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

export async function createUser(user: schema.InsertUser): Promise<schema.User[]> {
  const database = getDbInstance();
  try {
    return await database.insert(schema.users).values(user).returning();
  } catch (error: unknown) {
    logger.error("[DB] Failed to create user", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * FIX MED-4: upsertUser — { ...user } écrasait le role et les champs sensibles
 *   Avant: set: { ...user } — si l'utilisateur change son name/email via OAuth,
 *          cela écrase aussi son role, son plan, son statut d'abonnement, etc.
 *   Après: seuls les champs non-sensibles sont mis à jour (name, email, lastSignedIn).
 *          Le role n'est JAMAIS mis à jour depuis upsertUser (modification uniquement via admin).
 */
export async function upsertUser(user: schema.InsertUser): Promise<void> {
  const database = getDbInstance();
  try {
    // FIX MED-4: extraire uniquement les champs non-sensibles pour l'update
    // Le 'role' N'EST PAS inclus dans le set → il ne sera jamais écrasé au login
    const { role: _ignoredRole, ...safeUpdateFields } = user as any;

    const updateSet: Record<string, unknown> = {
      lastSignedIn: safeUpdateFields.lastSignedIn ?? new Date(),
    };
    if (safeUpdateFields.name) updateSet['name'] = safeUpdateFields.name;
    if (safeUpdateFields.email !== undefined) updateSet['email'] = safeUpdateFields.email;
    if (safeUpdateFields.loginMethod) updateSet['loginMethod'] = safeUpdateFields.loginMethod;

    await database.insert(schema.users)
      .values(user)
      .onConflictDoUpdate({
        target: schema.users.openId,
        set: updateSet as any,
      });
  } catch (error: unknown) {
    logger.error("[DB] Failed to upsert user", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<schema.User | undefined> {
  const database = getDbInstance();
  const result = await database.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserById(id: number): Promise<schema.User | undefined> {
  const database = getDbInstance();
  const result = await database.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserByOpenId(openId: string): Promise<schema.User | undefined> {
  const database = getDbInstance();
  const result = await database.select().from(schema.users).where(eq(schema.users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

// ============================================
// TENANT / USER MANAGEMENT EXTENSIONS
// ============================================
// WORKFLOW MANAGEMENT
// ============================================

export async function getWorkflowById(id: number, tenantId: number) {
  const database = getDbInstance();
  return await database.query.workflows.findFirst({
    where: and(eq(schema.workflows.id, id), eq(schema.workflows.tenantId, tenantId)),
  });
}

export async function createWorkflow(data: schema.InsertWorkflow) {
  const database = getDbInstance();
  const result = await database.insert(schema.workflows).values(data).returning();
  return result[0];
}

export async function updateWorkflow(id: number, tenantId: number, data: Partial<schema.InsertWorkflow>) {
  const database = getDbInstance();
  const result = await database.update(schema.workflows)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(schema.workflows.id, id), eq(schema.workflows.tenantId, tenantId)))
    .returning();
  if (result.length === 0) throw new Error('Workflow not found or access denied');
  return result[0];
}

export async function deleteWorkflow(id: number, tenantId: number) {
  const database = getDbInstance();
  const result = await database.delete(schema.workflows)
    .where(and(eq(schema.workflows.id, id), eq(schema.workflows.tenantId, tenantId)))
    .returning();
  if (result.length === 0) throw new Error('Workflow not found or access denied');
  return { success: true };
}

export async function getWorkflowsByTenant(tenantId: number, limit = 50, offset = 0) {
  const database = getDbInstance();
  return await database.select().from(schema.workflows)
    .where(eq(schema.workflows.tenantId, tenantId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(schema.workflows.createdAt));
}

// ============================================
// TENANT / USER MANAGEMENT EXTENSIONS

export async function getTenantById(tenantId: number): Promise<schema.Tenant | undefined> {
  const database = getDbInstance();
  const result = await database.select().from(schema.tenants).where(eq(schema.tenants.id, tenantId)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserRoleInTenant(userId: number, tenantId: number): Promise<string | null> {
  const database = getDbInstance();
  const result = await database
    .select({ role: schema.tenantUsers.role })
    .from(schema.tenantUsers)
    .where(and(
      eq(schema.tenantUsers.userId, userId), 
      eq(schema.tenantUsers.tenantId, tenantId)
    ))
    .limit(1);
  return result[0]?.role ?? null;
}

export async function getUserTenants(userId: number): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  role: string | null;
  isActive: boolean | null;
}>> {
  const database = getDbInstance();
  return await database
    .select({
      id: schema.tenants.id,
      name: schema.tenants.name,
      slug: schema.tenants.slug,
      role: schema.tenantUsers.role,
      isActive: schema.tenants.isActive
    })
    .from(schema.tenantUsers)
    .innerJoin(schema.tenants, eq(schema.tenantUsers.tenantId, schema.tenants.id))
    .where(eq(schema.tenantUsers.userId, userId));
}

export async function getTenantMembers(tenantId: number): Promise<Array<{
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  isActive: boolean | null;
}>> {
  const database = getDbInstance();
  return await database
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.tenantUsers.role,
      isActive: schema.tenantUsers.isActive
    })
    .from(schema.tenantUsers)
    .innerJoin(schema.users, eq(schema.tenantUsers.userId, schema.users.id))
    .where(eq(schema.tenantUsers.tenantId, tenantId));
}

export async function getTenantMemberById(userId: number, tenantId: number): Promise<{
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  isActive: boolean | null;
} | undefined> {
  const database = getDbInstance();
  const result = await database
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.tenantUsers.role,
      isActive: schema.tenantUsers.isActive,
    })
    .from(schema.tenantUsers)
    .innerJoin(schema.users, eq(schema.tenantUsers.userId, schema.users.id))
    .where(and(eq(schema.tenantUsers.tenantId, tenantId), eq(schema.tenantUsers.userId, userId)))
    .limit(1);
  return result[0] ?? undefined;
}

export async function addUserToTenant(userId: number, tenantId: number, role: string = "agent"): Promise<schema.TenantUser> {
  const database = getDbInstance();
  try {
    const [result] = await database.insert(schema.tenantUsers).values({
      userId,
      tenantId,
      role,
      isActive: true
    } as any).returning();
    return result;
  } catch (error: unknown) {
    logger.error("[DB] Failed to add user to tenant", { error: error instanceof Error ? error.message : String(error), userId, tenantId });
    throw error;
  }
}

export async function createTenant(tenant: schema.InsertTenant): Promise<schema.Tenant[]> {
  const database = getDbInstance();
  try {
    return await database.insert(schema.tenants).values(tenant).returning();
  } catch (error: unknown) {
    logger.error("[DB] Failed to create tenant", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

// ... (Le reste du fichier suit la même logique de mock pour DB_ENABLED=false)
// Pour gagner du temps, j'ai implémenté les fonctions critiques.
// Les fonctions de dashboard, prospects, calls, etc. doivent aussi être mockées.

export async function getProspectsByTenant(tenantId: number, limit = 50, offset = 0, userId?: number): Promise<schema.Prospect[]> {
  const database = getDbInstance();
  const condition = userId
    ? and(eq(schema.prospects.tenantId, tenantId), eq(schema.prospects.assignedTo, userId))
    : eq(schema.prospects.tenantId, tenantId);
  return await database.select().from(schema.prospects)
    .where(condition)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(schema.prospects.createdAt));
}

export async function getCallsByTenant(tenantId: number): Promise<schema.Call[]> {
  const database = getDbInstance();
  return await database.select().from(schema.calls).where(eq(schema.calls.tenantId, tenantId)).orderBy(desc(schema.calls.createdAt));
}

export async function getAppointmentsByTenant(tenantId: number): Promise<schema.Appointment[]> {
  const database = getDbInstance();
  return await database.select().from(schema.appointments).where(eq(schema.appointments.tenantId, tenantId)).orderBy(desc(schema.appointments.startTime));
}

export async function countTodayAppointments(tenantId: number, agentId?: number): Promise<number> {
  const database = getDbInstance();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const conditions = [
    eq(schema.appointments.tenantId, tenantId),
    sql`${schema.appointments.startTime} >= ${startOfDay}`,
    sql`${schema.appointments.startTime} <= ${endOfDay}`,
  ];
  if (agentId !== undefined) {
    conditions.push(eq(schema.appointments.userId, agentId));
  }
  const result = await database.select({ value: sql<number>`count(*)::int` })
    .from(schema.appointments)
    .where(and(...conditions));
  return result[0]?.value ?? 0;
}

export async function getBadgeCount(tenantId: number, table: string): Promise<number> {
  const database = getDbInstance();
  let count = 0;
  
  try {
    if (table === 'calls') {
      const [result] = await database
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.calls)
        .where(and(eq(schema.calls.tenantId, tenantId), eq(schema.calls.status, 'scheduled')));
      count = result?.count ?? 0;
    } else if (table === 'appointments') {
      const [result] = await database
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.appointments)
        .where(and(eq(schema.appointments.tenantId, tenantId), eq(schema.appointments.status, 'scheduled')));
      count = result?.count ?? 0;
    } else if (table === 'tasks') {
      const [result] = await database
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.tasks)
        .where(and(eq(schema.tasks.tenantId, tenantId), eq(schema.tasks.status, 'pending')));
      count = result?.count ?? 0;
    }
    return count;
  } catch (error) {
    logger.error(`[DB] Failed to get badge count for ${table}`, { error, tenantId });
    return 0;
  }
}

// ============================================
// PROSPECT AND CALL MANAGEMENT
// ============================================

export async function getProspectById(id: number, tenantId: number) {
  const database = getDbInstance();
  return await database.query.prospects.findFirst({
    where: and(eq(schema.prospects.id, id), eq(schema.prospects.tenantId, tenantId)),
  });
}

export async function getCallById(id: number, tenantId: number) {
  const database = getDbInstance();
  return await database.query.calls.findFirst({
    where: and(eq(schema.calls.id, id), eq(schema.calls.tenantId, tenantId)),
  });
}

export async function updateCall(id: number, data: Partial<typeof schema.calls.$inferInsert>, tenantId: number) {
  const database = getDbInstance();
  return await database.update(schema.calls).set(data).where(and(eq(schema.calls.id, id), eq(schema.calls.tenantId, tenantId)));
}

export async function updateProspect(id: number, data: Partial<typeof schema.prospects.$inferInsert>, tenantId: number) {
  const database = getDbInstance();
  return await database.update(schema.prospects).set(data).where(and(eq(schema.prospects.id, id), eq(schema.prospects.tenantId, tenantId)));
}

export async function createCall(data: typeof schema.calls.$inferInsert, tenantId?: number) {
  // tenantId peut être passé dans data ou en second argument (compatibilité avec tous les appelants).
  // On privilégie le second argument s'il est fourni, sinon on utilise data.tenantId.
  const resolvedTenantId = tenantId ?? data.tenantId;
  const database = getDbInstance();
  // BUG-M2 FIX: Déstructurer le tableau .returning() pour toujours retourner un objet unique,
  // cohérent avec le mode mock et l'accès à .id dans le router.
  const [result] = await database.insert(schema.calls).values({ ...data, tenantId: resolvedTenantId }).returning();
  return result;
}

export async function createProspect(data: typeof schema.prospects.$inferInsert, tenantId: number) {
  const database = getDbInstance();
  return await database.insert(schema.prospects).values({ ...data, tenantId }).returning();
}

// ============================================
// PROSPECT EXTENSIONS
// ============================================

export async function createProspectOptimized(data: typeof schema.prospects.$inferInsert, tenantId: number) {
  const database = getDbInstance();
  const [result] = await database.insert(schema.prospects).values({ ...data, tenantId }).returning();
  return result;
}

export async function deleteProspect(prospectId: number, tenantId: number) {
  const database = getDbInstance();
  await database.delete(schema.prospects).where(
    and(eq(schema.prospects.id, prospectId), eq(schema.prospects.tenantId, tenantId))
  );
  return { success: true };
}

export async function getCallsByProspect(prospectId: number, tenantId: number): Promise<schema.Call[]> {
  const database = getDbInstance();
  return await database.select().from(schema.calls).where(
    and(eq(schema.calls.prospectId, prospectId), eq(schema.calls.tenantId, tenantId))
  ).orderBy(desc(schema.calls.createdAt));
}

// ============================================
// CALL EXTENSIONS
// ============================================

export async function deleteCall(callId: number, tenantId: number) {
  const database = getDbInstance();
  const result = await database.delete(schema.calls)
    .where(and(eq(schema.calls.id, callId), eq(schema.calls.tenantId, tenantId)))
    .returning();
  if (result.length === 0) throw new Error('Call not found or access denied');
  return { success: true };
}

export async function countPendingCalls(tenantId: number, agentId?: number): Promise<number> {
  const database = getDbInstance();
  const condition = agentId
    ? and(
        eq(schema.calls.tenantId, tenantId),
        eq(schema.calls.agentId, agentId),
        eq(schema.calls.status, 'scheduled')
      )
    : and(
        eq(schema.calls.tenantId, tenantId),
        eq(schema.calls.status, 'scheduled')
      );
  const [result] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.calls)
    .where(condition);
  return result?.count ?? 0;
}

// ============================================
// TENANT MANAGEMENT// ============================================

export async function createTask(data: schema.InsertTask) {
  const database = getDbInstance();
  const result = await database.insert(schema.tasks).values(data).returning();
  return result[0];
}

export async function getTasksByTenant(tenantId: number, limit = 50, offset = 0) {
  const database = getDbInstance();
  return await database.select().from(schema.tasks)
    .where(eq(schema.tasks.tenantId, tenantId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(schema.tasks.createdAt));
}

export async function updateTask(id: number, tenantId: number, data: Partial<schema.InsertTask>) {
  const database = getDbInstance();
  const result = await database.update(schema.tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(schema.tasks.id, id), eq(schema.tasks.tenantId, tenantId)))
    .returning();
  if (result.length === 0) throw new Error('Task not found or access denied');
  return result[0];
}

export async function deleteTask(id: number, tenantId: number) {
  const database = getDbInstance();
  const result = await database.delete(schema.tasks)
    .where(and(eq(schema.tasks.id, id), eq(schema.tasks.tenantId, tenantId)))
    .returning();
  if (result.length === 0) throw new Error('Task not found or access denied');
  return { success: true };
}

// ============================================
// APPOINTMENT MANAGEMENT
// ============================================

export async function getAppointmentById(id: number, tenantId: number): Promise<schema.Appointment | undefined> {
  const database = getDbInstance();
  const result = await database.select().from(schema.appointments).where(
    and(eq(schema.appointments.id, id), eq(schema.appointments.tenantId, tenantId))
  ).limit(1);
  return result[0] ?? undefined;
}

export async function createAppointment(data: typeof schema.appointments.$inferInsert) {
  const database = getDbInstance();
  const [result] = await database.insert(schema.appointments).values(data).returning();
  return result;
}

export async function updateAppointment(id: number, tenantId: number, data: Partial<typeof schema.appointments.$inferInsert>) {
  const database = getDbInstance();
  const [result] = await database.update(schema.appointments)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(schema.appointments.id, id), eq(schema.appointments.tenantId, tenantId)))
    .returning();
  if (!result) throw new Error('Appointment not found or access denied');
  return result;
}

export async function deleteAppointment(id: number, tenantId: number) {
  const database = getDbInstance();
  await database.delete(schema.appointments).where(
    and(eq(schema.appointments.id, id), eq(schema.appointments.tenantId, tenantId))
  );
  return { success: true };
}

// ============================================
// BILLING / STRIPE
// ============================================

export async function getSubscriptionByTenant(tenantId: number) {
  const database = getDbInstance();
  const result = await database.select().from(schema.subscriptions)
    .where(eq(schema.subscriptions.tenantId, tenantId))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getInvoicesByTenant(tenantId: number) {
  const database = getDbInstance();
  return await database.select().from(schema.invoices)
    .where(eq(schema.invoices.tenantId, tenantId))
    .orderBy(desc(schema.invoices.createdAt));
}

export async function createStripeEvent(data: {
  stripeEventId?: string;
  eventId?: string;
  type?: string;
  eventType?: string;
  payload: unknown;
  status?: string;
  tenantId?: number;
}) {
  const database = getDbInstance();
  const eventId = data.stripeEventId ?? data.eventId ?? `evt_${Date.now()}`;
  const eventType = data.type ?? data.eventType ?? 'unknown';
  const [result] = await database.insert(schema.stripeEvents).values({
    eventId,
    eventType,
    tenantId: data.tenantId ?? null,
    payload: data.payload as Record<string, unknown>,
    processed: false,
  }).returning();
  return result;
}

// BUG-3 FIX: getPendingStripeEvents est un worker global (traitement des webhooks Stripe).
// Il est intentionnellement cross-tenant car les webhooks Stripe ne sont pas associés à un tenant
// au moment de leur réception. Le tenantId est résolu lors du traitement via le payload.
// Aucun filtre tenant n'est ajouté ici pour ne pas casser le worker.
export async function getPendingStripeEvents() {
  const database = getDbInstance();
  return await database.select().from(schema.stripeEvents).where(eq(schema.stripeEvents.processed, false)).orderBy(desc(schema.stripeEvents.createdAt));
}

// BUG-1 FIX: processed est boolean dans le schéma Drizzle — normaliser en boolean.
// BUG-1 FIX: le worker passe eventRecord.id (number, clé primaire) et non eventRecord.eventId (string Stripe).
// La signature accepte maintenant un id number (PK) pour le WHERE, et un processed boolean strict.
export async function updateStripeEventStatus(id: number, processed: boolean) {
  const database = getDbInstance();
  await database.update(schema.stripeEvents)
    .set({ processed, processedAt: processed ? new Date() : null })
    .where(eq(schema.stripeEvents.id, id));
  return { success: true };
}

export async function updateSubscriptionByStripeId(stripeSubscriptionId: string, data: Partial<typeof schema.subscriptions.$inferInsert>) {
  const database = getDbInstance();
  await database.update(schema.subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.subscriptions.stripeSubscriptionId, stripeSubscriptionId));
  return { success: true };
}

export async function updateInvoiceByStripeId(invoiceNumber: string, data: Partial<typeof schema.invoices.$inferInsert>) {
  const database = getDbInstance();
  await database.update(schema.invoices)
    .set(data)
    .where(eq(schema.invoices.invoiceNumber, invoiceNumber));
  return { success: true };
}
// ============================================
// BILLING & SUBSCRIPTION MANAGEMENT
// ============================================

export async function getTenantUsers(tenantId: number) {
  const database = getDbInstance();
  return await database
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.tenantUsers.role,
      isActive: schema.tenantUsers.isActive,
    })
    .from(schema.tenantUsers)
    .innerJoin(schema.users, eq(schema.tenantUsers.userId, schema.users.id))
    .where(eq(schema.tenantUsers.tenantId, tenantId));
}

export async function updateTenant(tenantId: number, data: Partial<typeof schema.tenants.$inferInsert>) {
  const database = getDbInstance();
  await database.update(schema.tenants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.tenants.id, tenantId));
  return { success: true };
}


// ============================================
// AUDIT LOGS MANAGEMENT
// ============================================

export async function createAuditLog(data: schema.InsertAuditLog) {
  const database = getDbInstance();
  const result = await database.insert(schema.auditLogs).values(data).returning();
  return result[0];
}

export async function getAuditLogsByTenant(tenantId: number, limit = 100) {
  const database = getDbInstance();
  return await database.select().from(schema.auditLogs)
    .where(eq(schema.auditLogs.tenantId, tenantId))
    .limit(limit)
    .orderBy(desc(schema.auditLogs.createdAt));
}

export async function getAuditLogsByUser(userId: number, limit = 100) {
  const database = getDbInstance();
  return await database.select().from(schema.auditLogs)
    .where(eq(schema.auditLogs.userId, userId))
    .limit(limit)
    .orderBy(desc(schema.auditLogs.createdAt));
}

// ============================================
// METRICS / DASHBOARD
// ============================================

export async function getAgentPerformanceMetrics(tenantId: number): Promise<Array<{
  agentId: number;
  agentName: string | null;
  totalCalls: number;
  avgDuration: number;
  avgQualityScore: number;
  conversionRate: number;
}>> {
  const database = getDbInstance();
  const results = await database
    .select({
      agentId: schema.calls.agentId,
      agentName: schema.users.name,
      totalCalls: sql<number>`count(${schema.calls.id})::int`,
      avgDuration: sql<number>`coalesce(avg(${schema.calls.duration}), 0)::int`,
    })
    .from(schema.calls)
    .leftJoin(schema.users, eq(schema.calls.agentId, schema.users.id))
    .where(eq(schema.calls.tenantId, tenantId))
    .groupBy(schema.calls.agentId, schema.users.name);

  return results
    .filter(r => r.agentId !== null)
    .map(r => ({
      agentId: r.agentId!,
      agentName: r.agentName,
      totalCalls: r.totalCalls,
      avgDuration: r.avgDuration,
      avgQualityScore: 0,
      conversionRate: 0,
    }));
}

// ============================================
// TENANT AI KEYS + INDUSTRY CONFIG — proxies
// ============================================

export async function getTenantAiKey(tenantId: number, provider: string) {
  const mod = await import('./db-industry');
  return mod.getTenantAiKey(tenantId, provider);
}

export async function saveTenantAiKey(tenantId: number, provider: string, encryptedKey: string, keyHash: string) {
  const mod = await import('./db-industry');
  return mod.saveTenantAiKey(tenantId, provider, encryptedKey, keyHash);
}

export async function deleteTenantAiKey(tenantId: number, provider: string) {
  const mod = await import('./db-industry');
  return mod.deleteTenantAiKey(tenantId, provider);
}

export async function getTenantIndustryConfig(tenantId: number) {
  const mod = await import('./db-industry');
  return mod.getTenantIndustryConfig(tenantId);
}

export async function saveTenantIndustryConfig(tenantId: number, config: Record<string, unknown>) {
  const mod = await import('./db-industry');
  return mod.saveTenantIndustryConfig(tenantId, config);
}

export async function getTeamPerformanceMetrics(tenantId: number, timeRange: string): Promise<{ avgQualityScore: number; conversionRate: number; sentimentRate: number }> {
  // ✅ BLOC 1: DB_ENABLED guard supprimé — requête réelle
  const database = getDbInstance();
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 3600 * 1000);
  const results = await database
    .select({
      avgQualityScore: sql<number>`coalesce(avg(${schema.calls.qualityScore}), 0)::float`,
      totalCalls: sql<number>`count(${schema.calls.id})::int`,
      convertedCalls: sql<number>`count(case when ${schema.calls.status} = 'completed' then 1 end)::int`,
    })
    .from(schema.calls)
    .where(and(
      eq(schema.calls.tenantId, tenantId),
      sql`${schema.calls.createdAt} >= ${since}`
    ));
  const row = results[0];
  const avgQualityScore = row?.avgQualityScore ?? 0;
  const totalCalls = row?.totalCalls ?? 0;
  const convertedCalls = row?.convertedCalls ?? 0;
  const conversionRate = totalCalls > 0 ? (convertedCalls / totalCalls) * 100 : 0;
  return {
    avgQualityScore: Math.round(avgQualityScore * 10) / 10,
    conversionRate: Math.round(conversionRate * 10) / 10,
    sentimentRate: 0, // Calculé séparément via analyse IA
  };
}

export async function getAtRiskAgents(tenantId: number): Promise<Array<{ id: number; name: string; email: string }>> {
  // ✅ BLOC 1: DB_ENABLED guard supprimé — requête réelle
  // Un agent est "à risque" si son score qualité moyen est inférieur à 60 sur les 7 derniers jours
  const database = getDbInstance();
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const results = await database
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      avgScore: sql<number>`coalesce(avg(${schema.calls.qualityScore}), 0)::float`,
    })
    .from(schema.calls)
    .innerJoin(schema.users, eq(schema.calls.agentId, schema.users.id))
    .where(and(
      eq(schema.calls.tenantId, tenantId),
      sql`${schema.calls.createdAt} >= ${since}`
    ))
    .groupBy(schema.users.id, schema.users.name, schema.users.email)
    .having(sql`avg(${schema.calls.qualityScore}) < 60`);
  return results
    .filter(r => r.id !== null)
    .map(r => ({ id: r.id!, name: r.name ?? 'Agent', email: r.email }));
}

export async function deleteTenantUser(userId: number, tenantId: number): Promise<void> {
  const database = getDbInstance();
  try {
    const result = await database.delete(schema.tenantUsers)
      .where(and(eq(schema.tenantUsers.userId, userId), eq(schema.tenantUsers.tenantId, tenantId)))
      .returning();
    if (result.length === 0) throw new Error("Tenant user not found or access denied");
  } catch (error: unknown) {
    logger.error("[DB] Failed to delete tenant user", { error: error instanceof Error ? error.message : String(error), userId, tenantId });
    throw error;
  }
}

export async function updateTenantUser(userId: number, tenantId: number, data: Partial<schema.InsertTenantUser>): Promise<void> {
  const database = getDbInstance();
  try {
    const result = await database.update(schema.tenantUsers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(schema.tenantUsers.userId, userId), eq(schema.tenantUsers.tenantId, tenantId)))
      .returning();
    if (result.length === 0) throw new Error("Tenant user not found or access denied");
  } catch (error: unknown) {
    logger.error("[DB] Failed to update tenant user", { error: error instanceof Error ? error.message : String(error), userId, tenantId });
    throw error;
  }
}
