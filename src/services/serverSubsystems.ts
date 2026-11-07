import crypto from "node:crypto";
import type { Express } from "express";
import { verifyAndFixDb } from "../config/firebase-admin";
import { startProductPublisherWorker, stopProductPublisherWorker } from "../workers/productPublisher";
import { startVelocityWorker, stopVelocityWorker, drainVelocityChecks } from "../utils/velocity";
import { startProductCacheCleanupTimer, stopProductCacheCleanupTimer } from "./ProductSeoService";
import { setupViteAndStaticServing } from "./ViteStaticService";
import { closeDevViteServer } from "./devViteMiddleware";
import {
  verifyAndHealAllServices,
  startServiceWatchdog,
  stopServiceWatchdog,
} from "./ServiceAutoHealer";
import { validateCsrfConfiguration } from "../middlewares/csrf";
import { safeLogger } from "../utils/logger";

let isStaticPipelineAttached = false;

export async function initializeSubsystems(app: Express): Promise<void> {
  const logDev = (msg: string) => {
    if (process.env.NODE_ENV !== "production") {
      safeLogger.info(msg);
    }
  };

  if (
    process.env.NODE_ENV !== "production" &&
    (!process.env.CSRF_SECRET || process.env.CSRF_SECRET.trim().length < 32)
  ) {
    process.env.CSRF_SECRET = crypto.randomBytes(32).toString("hex");
  }
  validateCsrfConfiguration();

  if (!isStaticPipelineAttached) {
    try {
      await setupViteAndStaticServing(app);
      isStaticPipelineAttached = true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      safeLogger.error("[Olmart Gateway] ❌ Failed to initialize Vite/static serving pipeline", { err: errorMsg });
    }
  }

  try {
    startProductCacheCleanupTimer();
  } catch (err: unknown) {
    safeLogger.error("[Olmart Gateway] ❌ Failed to start SEO cache timer", { err: String(err) });
  }

  // Run Auto-Healer non-blocking after port 3000 binds
  setImmediate(() => {
    verifyAndHealAllServices()
      .then((report) => {
        if (report.repairedCount > 0) {
          safeLogger.info(
            `⚙️ [Olmart Workers] ⚡ Auto-Healer repaired ${report.repairedCount} service(s) during startup.`
          );
        }
        startServiceWatchdog();
      })
      .catch((err: unknown) => {
        safeLogger.warn("[Olmart Gateway] ⚠️ Auto-Healer startup check notice", {
          err: err instanceof Error ? err.message : String(err),
        });
      });
  });

  if (process.env.RUN_MIGRATIONS === "true") {
    logDev("[Database] 🔄 Running startup database checks and migrations...");
    try {
      await verifyAndFixDb();
      logDev("[Database] ✅ Startup database checks completed successfully.");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      safeLogger.error("[Database] ❌ Firestore Admin verification/migration failed", { err: errorMsg });
    }
  }

  if (process.env.ENABLE_WORKERS === "true" || process.env.ENABLE_BACKGROUND_WORKERS === "true") {
    try {
      startVelocityWorker();
    } catch (err: unknown) {
      safeLogger.error("[Olmart Workers] ❌ Failed to initialize velocity reconciliation worker", { err: String(err) });
    }

    try {
      startProductPublisherWorker();
    } catch (err: unknown) {
      safeLogger.error("[Olmart Workers] ❌ Failed to initialize background worker", { err: String(err) });
    }
  }
}

export function rollbackSubsystems(): void {
  stopServiceWatchdog();
  closeDevViteServer().catch(() => {});

  try {
    stopProductCacheCleanupTimer();
  } catch (err) {
    safeLogger.warn("[Shutdown] Error stopping product cache timer", { err: String(err) });
  }

  try {
    stopProductPublisherWorker();
  } catch (err) {
    safeLogger.warn("[Shutdown] Error stopping publisher worker", { err: String(err) });
  }

  try {
    stopVelocityWorker();
  } catch (err) {
    safeLogger.warn("[Shutdown] Error stopping velocity worker", { err: String(err) });
  }
}

export async function drainAndStopSubsystems(): Promise<void> {
  rollbackSubsystems();
  try {
    await drainVelocityChecks(4000);
  } catch (err) {
    safeLogger.warn("[Shutdown] Error draining velocity checks", { err: String(err) });
  }
}
