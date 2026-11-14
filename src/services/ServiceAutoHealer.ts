import type { ServiceCheckResult, SystemSelfHealReport } from "../types/systemHealth";
import { isFirebaseReady, verifyAndFixDb } from "../config/firebase-admin";
import { startProductCacheCleanupTimer } from "./ProductSeoService";
import {
  isTestEnv,
  makeCheckResult,
  checkAndHealNpmDependencies,
  checkAndHealLocales,
  checkAndHealCsrfSecurity,
  checkAndHealFrontendAndBundle,
} from "./autoHealerChecks";

let lastReport: SystemSelfHealReport | null = null;
let watchdogTimer: NodeJS.Timeout | null = null;
let isHealRunning = false;

export async function verifyAndHealAllServices(): Promise<SystemSelfHealReport> {
  if (isHealRunning && lastReport) return lastReport;
  isHealRunning = true;

  try {
    const results: ServiceCheckResult[] = [
      checkAndHealNpmDependencies(),
      checkAndHealCsrfSecurity(),
      checkAndHealLocales(),
      ...checkAndHealFrontendAndBundle(),
    ];

    const fbStart = Date.now();
    let fbReady = isFirebaseReady();
    let fbRepaired = false;
    if (!fbReady && !isTestEnv() && process.env.RUN_MIGRATIONS === "true") {
      try {
        await verifyAndFixDb();
        fbReady = isFirebaseReady();
        fbRepaired = fbReady;
      } catch {
        // Handled in status below
      }
    }
    results.push(
      makeCheckResult(
        "firebase_admin",
        "Firebase Admin & Firestore Core",
        fbRepaired ? "repaired" : fbReady ? "healthy" : "degraded",
        fbRepaired,
        fbReady ? "Connexion Firebase Admin active." : "Firebase Admin en attente ou dégradé.",
        fbStart
      )
    );

    const seoStart = Date.now();
    startProductCacheCleanupTimer();
    results.push(
      makeCheckResult("seo_cache_worker", "Worker Cache SEO & Catalogue", "healthy", false, "Timer de nettoyage SEO actif.", seoStart)
    );

    const healthyCount = results.filter((r) => r.status === "healthy").length;
    const repairedCount = results.filter((r) => r.status === "repaired").length;
    const degradedCount = results.filter((r) => r.status === "degraded").length;

    lastReport = {
      overallStatus: degradedCount > 0 ? "degraded" : repairedCount > 0 ? "repaired" : "healthy",
      timestamp: new Date().toISOString(),
      totalServices: results.length,
      healthyCount,
      repairedCount,
      degradedCount,
      services: results,
    };
    return lastReport;
  } finally {
    isHealRunning = false;
  }
}

export function getLastSelfHealReport(): SystemSelfHealReport | null {
  return lastReport;
}

export function startServiceWatchdog(intervalMs = 60_000): void {
  if (isTestEnv() || watchdogTimer) return;
  watchdogTimer = setInterval(() => {
    verifyAndHealAllServices().catch(() => {});
  }, intervalMs);
  watchdogTimer.unref?.();
}

export function stopServiceWatchdog(): void {
  if (watchdogTimer) {
    clearInterval(watchdogTimer);
    watchdogTimer = null;
  }
}

