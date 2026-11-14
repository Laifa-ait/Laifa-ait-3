import "dotenv/config";
import crypto from "node:crypto";
import http from "node:http";
import { app } from "./app.ts";
import { initializeSubsystems, rollbackSubsystems, drainAndStopSubsystems } from "./src/services/serverSubsystems";
import { TrendingSearchesService } from "./src/services/TrendingSearchesService";
import { ProductSearchService } from "./src/services/ProductSearchService";
import { safeLogger } from "./src/utils/logger";

const PORT = 3000;
const bootStartTime = Date.now();
const WEAK_CSRF_SECRETS = new Set([
  "changeit", "password", "secret", "1234567890",
  "olmart_dev_csrf_secret_key_2026",
  "olmart_prod_csrf_secret_key_fallback_32bytes_min_2026",
  "olmart_live_production_secure_csrf_secret_32bytes_v1",
]);

export { app };
export const httpServer = http.createServer(app);
export let secondaryHttpServer: http.Server | null = null;

let isShuttingDown = false;
let startServerPromise: Promise<http.Server> | null = null;

export const shutdown = (signal: string): void => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  if (process.env.NODE_ENV !== "production") {
    safeLogger.info(`[Olmart Gateway] 🛑 Received ${signal}. Shutting down gracefully...`);
  }
  rollbackSubsystems();
  if (secondaryHttpServer?.listening) {
    try { secondaryHttpServer.closeAllConnections?.(); secondaryHttpServer.close(); } catch { /* ignore */ }
  }
  if (httpServer.listening) {
    httpServer.closeAllConnections?.();
    httpServer.close(async () => {
      await drainAndStopSubsystems();
      if (process.env.NODE_ENV !== "production") safeLogger.info("[Olmart Gateway] 💤 Closed remaining active connections.");
      if (process.env.NODE_ENV !== "test") process.exit(0);
    });
    if (process.env.NODE_ENV !== "test") {
      const forceTimer = setTimeout(() => {
        safeLogger.error("[Olmart Gateway] ❌ Forcefully shutting down after timeout.");
        process.exit(1);
      }, 1500);
      forceTimer.unref?.();
    }
  } else if (process.env.NODE_ENV !== "test") {
    process.exit(0);
  }
};

export async function stopServerForTesting(): Promise<void> {
  if (startServerPromise) {
    try { await startServerPromise; } catch { /* ignore */ }
  }
  rollbackSubsystems();
  if (secondaryHttpServer?.listening) {
    secondaryHttpServer.closeAllConnections?.();
    await new Promise<void>((resolve) => secondaryHttpServer!.close(() => resolve()));
    secondaryHttpServer = null;
  }
  if (httpServer?.listening) {
    httpServer.closeAllConnections?.();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  }
  startServerPromise = null;
  isShuttingDown = false;
}

function listenOnPort(server: http.Server, port: number): Promise<http.Server> {
  return new Promise<http.Server>((resolve, reject) => {
    const onError = (err: Error) => { server.off("error", onError); reject(err); };
    server.once("error", onError);
    server.listen(port, "0.0.0.0", () => { server.off("error", onError); resolve(server); });
  });
}

function scheduleWarmups(): void {
  if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
    const t = setTimeout(() => {
      TrendingSearchesService.warmupTrendingSearches().catch(() => {});
      ProductSearchService.warmupSearchEngine().catch(() => {});
    }, 4000);
    t.unref?.();
  } else {
    TrendingSearchesService.warmupTrendingSearches().catch(() => {});
    ProductSearchService.warmupSearchEngine().catch(() => {});
  }
}

export function startServer(portOverride?: number): Promise<http.Server> {
  if (startServerPromise) return startServerPromise;

  const bindPort = typeof portOverride === "number" ? portOverride : PORT;
  const parsedEnvPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
  const hasValidEnvPort = typeof parsedEnvPort === "number" && Number.isInteger(parsedEnvPort) && parsedEnvPort > 0;
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
  const envPort =
    typeof portOverride === "number"
      ? undefined
      : hasValidEnvPort && parsedEnvPort !== bindPort
        ? parsedEnvPort
        : isCloudRun && !hasValidEnvPort && bindPort === 3000 ? 8080 : undefined;

  startServerPromise = (async () => {
    try {
      await initializeSubsystems(app);
      safeLogger.info(`[Olmart Gateway] 🚀 Booting Express HTTP Server on 0.0.0.0:${bindPort}...`);

      const primaryPromise = listenOnPort(httpServer, bindPort);
      const secondaryPromise = envPort
        ? (secondaryHttpServer?.listening
            ? Promise.resolve(secondaryHttpServer)
            : listenOnPort((secondaryHttpServer = http.createServer(app)), envPort))
        : null;

      const [primaryRes, secondaryRes] = await Promise.allSettled([
        primaryPromise,
        secondaryPromise ?? Promise.resolve(null),
      ]);

      const primaryOk = primaryRes.status === "fulfilled";
      const secondaryOk = Boolean(envPort && secondaryRes.status === "fulfilled" && secondaryRes.value);

      if (primaryOk) {
        const startupDuration = ((Date.now() - bootStartTime) / 1000).toFixed(2);
        safeLogger.info(
          `[Olmart Gateway] 🚀 Startup ready - Port: ${bindPort}, Environment: ${process.env.NODE_ENV || "development"}, Duration: ${startupDuration}s`
        );
      }
      if (envPort && secondaryOk) {
        safeLogger.info(`[Olmart Gateway] Dual-listener active on 0.0.0.0:${envPort} (Cloud Run ingress ready)`);
      } else if (envPort && secondaryRes.status === "rejected") {
        const secErr = secondaryRes.reason as NodeJS.ErrnoException;
        secondaryHttpServer = null;
        if (secErr?.code === "EADDRINUSE" && primaryOk) {
          safeLogger.info(`[Olmart Gateway] Port ${envPort} already bound (local proxy active). Main traffic on port ${bindPort}.`);
        } else {
          safeLogger.warn(`[Olmart Gateway] Secondary listener notice on port ${envPort}`, {
            err: secErr instanceof Error ? secErr.message : String(secErr),
          });
        }
      }

      if (!primaryOk) {
        const priErr = primaryRes.reason;
        if (secondaryOk && secondaryHttpServer && (isCloudRun || hasValidEnvPort)) {
          safeLogger.warn(`[Olmart Gateway] ⚠️ Port ${bindPort} unavailable, serving traffic cleanly via Cloud Run PORT ${envPort}.`, {
            err: priErr instanceof Error ? priErr.message : String(priErr),
          });
          scheduleWarmups();
          return secondaryHttpServer;
        }
        safeLogger.error("[Olmart Gateway] ❌ HTTP Listen error during startup on primary port", {
          err: priErr instanceof Error ? priErr.message : String(priErr),
          port: bindPort,
        });
        throw priErr;
      }

      scheduleWarmups();
      return httpServer;
    } catch (bootErr: unknown) {
      startServerPromise = null;
      if (secondaryHttpServer?.listening) {
        try {
          secondaryHttpServer.closeAllConnections?.();
          secondaryHttpServer.close();
        } catch { /* ignore */ }
        secondaryHttpServer = null;
      }
      rollbackSubsystems();
      throw bootErr;
    }
  })();

  return startServerPromise;
}

process.on("SIGTERM", () => { if (process.env.NODE_ENV !== "test") shutdown("SIGTERM"); });
process.on("SIGINT", () => { if (process.env.NODE_ENV !== "test") shutdown("SIGINT"); });

process.on("unhandledRejection", (reason: unknown) => {
  const errorMsg = reason instanceof Error ? reason.stack || reason.message : String(reason);
  const errorCode = reason && typeof reason === "object" && "code" in reason ? String((reason as { code: unknown }).code) : "";
  safeLogger.error("[Olmart Gateway] ❌ Unhandled Promise Rejection at process level", { err: errorMsg, code: errorCode });
  if (process.env.NODE_ENV === "test") return;
  const criticalCodes = ["EADDRINUSE", "EACCES", "ERR_SERVER_ALREADY_LISTEN"];
  if (criticalCodes.includes(errorCode) || errorMsg.includes("FATAL_DB_CORRUPTION")) {
    safeLogger.error("[Olmart Gateway] 🚨 Critical unhandled rejection encountered. Initiating emergency shutdown...", { code: errorCode });
    shutdown("CRITICAL_UNHANDLED_REJECTION");
  }
});

process.on("uncaughtException", (error: Error) => {
  const errorCode = error && typeof error === "object" && "code" in error ? String((error as { code: unknown }).code) : "";
  const nonFatalNetworkCodes = ["ECONNRESET", "EPIPE", "ERR_STREAM_PREMATURE_CLOSE", "ERR_STREAM_DESTROYED", "ETIMEDOUT", "ECANCELED"];
  if (nonFatalNetworkCodes.includes(errorCode)) {
    safeLogger.warn("[Olmart Gateway] ⚠️ Non-fatal network socket reset caught in uncaughtException, server preserved", { code: errorCode, message: error.message });
    return;
  }
  safeLogger.error("[Olmart Gateway] ❌ Uncaught Exception at process level", { err: error.stack || error.message });
  shutdown("UNCAUGHT_EXCEPTION");
});

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  const attemptBoot = async (retries = 12, delayMs = 1000): Promise<void> => {
    if (process.env.NODE_ENV !== "production") {
      const rawSecret = (process.env.CSRF_SECRET || "").trim();
      if (rawSecret.length < 32 || WEAK_CSRF_SECRETS.has(rawSecret.toLowerCase())) {
        process.env.CSRF_SECRET = crypto.randomBytes(32).toString("hex");
      }
    }
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await startServer();
        return;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const errorCode = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "";
        safeLogger.error(`[Olmart Gateway] ❌ Boot attempt ${attempt}/${retries} failed`, { err: errorMsg, code: errorCode });
        if (attempt < retries && (errorCode === "EADDRINUSE" || errorCode === "EAGAIN")) {
          safeLogger.info(`[Olmart Gateway] ⏳ Port in use, retrying startup in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          process.exit(1);
        }
      }
    }
  };
  attemptBoot();
}

