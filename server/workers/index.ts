/**
 * WORKERS INDEX — SÉCURISÉ (Phase 1.4)
 * Chaque worker démarre dans un try/catch indépendant.
 * Un échec de worker ne bloque pas le serveur.
 */
import { logger } from "../infrastructure/logger";

let roiIntervalId: ReturnType<typeof setInterval> | null = null;
let weeklyReportIntervalId: ReturnType<typeof setInterval> | null = null;

function isWeeklyReportTime(): boolean {
  const now = new Date();
  return now.getUTCDay() === 1 && now.getUTCHours() === 8;
}

async function startVoiceWorker(): Promise<void> {
  try {
    const { startVoiceProcessingWorker } = await import("./voiceProcessingWorker");
    startVoiceProcessingWorker();
    logger.info("[Workers] Voice processing worker started");
  } catch (e) {
    logger.warn("[Workers] Voice processing worker non démarré (Redis absent ?)", { error: e });
  }
}

async function startROICronJob(): Promise<void> {
  try {
    const { ROICacheJob } = await import("../services/roiCacheJob");
    ROICacheJob.run().catch((e) => logger.error("[Workers] ROI cache boot run failed", e));
    roiIntervalId = setInterval(() => {
      ROICacheJob.run().catch((e) => logger.error("[Workers] ROI cache job failed", e));
    }, 60 * 60 * 1000);
    logger.info("[Workers] ROI cache cron started (every 1h)");
  } catch (e) {
    logger.warn("[Workers] ROI cache cron non démarré", { error: e });
  }
}

async function startWeeklyReportCron(): Promise<void> {
  if (process.env["ENABLE_WEEKLY_REPORT"] !== "true") {
    logger.info("[Workers] Weekly report cron DISABLED (ENABLE_WEEKLY_REPORT != true)");
    return;
  }
  try {
    const { WeeklyReportService } = await import("../services/weeklyReportService");
    weeklyReportIntervalId = setInterval(() => {
      if (isWeeklyReportTime()) {
        WeeklyReportService.sendToAllActiveTenants().catch((e) =>
          logger.error("[Workers] Weekly report job failed", e)
        );
      }
    }, 5 * 60 * 1000);
    logger.info("[Workers] Weekly report cron started (checks every 5min, fires Monday 8h UTC)");
  } catch (e) {
    logger.warn("[Workers] Weekly report cron non démarré", { error: e });
  }
}

/**
 * Démarre tous les workers. Ne throw jamais.
 */
export async function startAllWorkers(): Promise<void> {
  logger.info("[Workers] Démarrage de tous les workers...");
  await Promise.allSettled([startVoiceWorker(), startROICronJob(), startWeeklyReportCron()]);
  logger.info("[Workers] ✅ Workers initialisés");
}

export async function stopAllWorkers(): Promise<void> {
  logger.info("[Workers] Arrêt des workers...");
  try {
    const { stopVoiceProcessingWorker } = await import("./voiceProcessingWorker");
    await stopVoiceProcessingWorker();
  } catch (_e) { /* ignore */ }
  if (roiIntervalId) { clearInterval(roiIntervalId); roiIntervalId = null; }
  if (weeklyReportIntervalId) { clearInterval(weeklyReportIntervalId); weeklyReportIntervalId = null; }
  logger.info("[Workers] ✅ Workers arrêtés");
}

// Re-exports pour compatibilité
export { voiceProcessingQueue, enqueueVoiceJob } from "./voiceProcessingWorker";
