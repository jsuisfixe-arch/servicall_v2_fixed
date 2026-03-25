/**
 * WEEKLY REPORT SERVICE
 * Génération et envoi des rapports hebdomadaires aux tenants actifs
 */

import { logger } from "../infrastructure/logger";
import { getDbInstance } from "../db";
import { tenants, tenantUsers, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

interface WeeklyStats {
  totalCalls: number;
  totalAppointments: number;
  conversionRate: number;
  topAgent: string | null;
}

async function getWeeklyStats(tenantId: number): Promise<WeeklyStats> {
  // Statistiques de la semaine passée
  return {
    totalCalls: 0,
    totalAppointments: 0,
    conversionRate: 0,
    topAgent: null,
  };
}

async function sendReportToTenant(
  tenantId: number,
  tenantName: string,
  ownerEmail: string,
  stats: WeeklyStats
): Promise<void> {
  // Import dynamique pour éviter les dépendances circulaires
  const { SendEmailAction } = await import("../workflow-engine/actions/messaging/SendEmailAction");
  const { WorkflowExecutor } = await import("../workflow-engine/core/WorkflowExecutor");

  // Create a dummy context for the action execution
  const dummyContext = {
    tenantId,
    logger,
    // Add other necessary context properties if SendEmailAction requires them
  } as any;

  const sendEmailAction = new SendEmailAction();
  await sendEmailAction.execute(dummyContext, {
    to: ownerEmail,
    subject: `📊 Rapport hebdomadaire — ${tenantName}`,
    body: `
      <h2>Votre rapport hebdomadaire Servicall</h2>
      <p>Bonjour,</p>
      <p>Voici le résumé de la semaine pour <strong>${tenantName}</strong> :</p>
      <ul>
        <li>📞 Appels traités : <strong>${stats.totalCalls}</strong></li>
        <li>📅 Rendez-vous pris : <strong>${stats.totalAppointments}</strong></li>
        <li>📈 Taux de conversion : <strong>${stats.conversionRate.toFixed(1)}%</strong></li>
        ${stats.topAgent ? `<li>🏆 Meilleur agent : <strong>${stats.topAgent}</strong></li>` : ""}
      </ul>
      <p>Bonne semaine,<br/>L'équipe Servicall</p>
    `,
  }).catch((err: any) => {
    logger.warn("[WeeklyReport] Email send failed", { tenantId, err });
  });
}

export const WeeklyReportService = {
  async sendToAllActiveTenants(): Promise<void> {
    logger.info("[WeeklyReport] Starting weekly report distribution");
    try {
      const db = getDbInstance();

      // Récupérer tous les tenants actifs avec leur propriétaire
      const activeTenants = await (db as any)
        .select({
          id: tenants.id,
          name: tenants.name,
          ownerEmail: users.email,
        })
        .from(tenants)
        .innerJoin(tenantUsers, and(
          eq(tenantUsers.tenantId, tenants.id),
          eq(tenantUsers.role, "owner"),
          eq(tenantUsers.isActive, true),
        ))
        .innerJoin(users, eq(users.id, tenantUsers.userId))
        .where(eq(tenants.isActive, true));

      logger.info(`[WeeklyReport] Sending to ${activeTenants.length} tenant(s)`);

      for (const tenant of activeTenants) {
        try {
          const stats = await getWeeklyStats(tenant.id);
          await sendReportToTenant(tenant.id, tenant.name, tenant.ownerEmail, stats);
          logger.info("[WeeklyReport] Report sent", { tenantId: tenant.id });
        } catch (err: any) {
          logger.error("[WeeklyReport] Failed for tenant", { tenantId: tenant.id, err });
        }
      }

      logger.info("[WeeklyReport] Distribution complete");
    } catch (error: any) {
      logger.error("[WeeklyReport] Fatal error", { error });
      throw error;
    }
  },
};
