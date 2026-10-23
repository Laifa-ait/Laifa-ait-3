import "dotenv/config";
import http from "node:http";
import { app } from "./app.ts";
import { initializeSubsystems, rollbackSubsystems, drainAndStopSubsystems } from "./src/services/serverSubsystems";
import { TrendingSearchesService } from "./src/services/TrendingSearchesService";
import { ProductSearchService } from "./src/services/ProductSearchService";
import { safeLogger } from "./src/utils/logger";

/**
 * Port Ingress & Dev : Le serveur Express est lié au port fixe 3000
 * et à l'adresse 0.0.0.0 pour être compatible avec l'ingress Cloud Run et l'environnement Studio.
 * Si process.env.PORT est fourni et différent de 3000 (ex: 8080), un double écouteur (dual-listener)
 * est automatiquement activé sur process.env.PORT.
 */
const PORT = 3000;
const bootStartTime = Date.now();

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

  if (secondaryHttpServer && secondaryHttpServer.listening) {
    try {
      secondaryHttpServer.close();
    } catch {
      // ignore
    }
  }

  if (httpServer.listening) {
    httpServer.close(async () => {
      await drainAndStopSubsystems();
      if (process.env.NODE_ENV !== "production") {
        safeLogger.info("[Olmart Gateway] 💤 Closed remaining active connections.");
      }
      if (process.env.NODE_ENV !== "test") {
        process.exit(0);
      }
    });

    if (process.env.NODE_ENV !== "test") {
      const forceTimer = setTimeout(() => {
        safeLogger.error("[Olmart Gateway] ❌ Forcefully shutting down after 10s timeout.");
        process.exit(1);
      }, 10000);
      if (forceTimer.unref) {
        forceTimer.unref();
      }
    }
  } else {
    if (process.env.NODE_ENV !== "test") {
      process.exit(0);
    }
  }
};

/**
 * Teardown propre pour les tests unitaires et d'intégration Vitest.
 */
export async function stopServerForTesting(): Promise<void> {
  if (startServerPromise) {
    try {
      await startServerPromise;
    } catch {
      // Safe no-op if startup threw or rejected
    }
  }

  rollbackSubsystems();

  if (secondaryHttpServer && secondaryHttpServer.listening) {
    if (typeof secondaryHttpServer.closeAllConnections === "function") {
      secondaryHttpServer.closeAllConnections();
    }
    await new Promise<void>((resolve) => {
      secondaryHttpServer!.close(() => resolve());
    });
    secondaryHttpServer = null;
  }

  if (httpServer && httpServer.listening) {
    if (typeof httpServer.closeAllConnections === "function") {
      httpServer.closeAllConnections();
    }
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  }

  startServerPromise = null;
  isShuttingDown = false;
}

export function startServer(portOverride?: number): Promise<http.Server> {
  if (startServerPromise) {
    return startServerPromise;
  }

  const bindPort = typeof portOverride === "number" ? portOverride : PORT;
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
  const needsSecondary =
    typeof portOverride !== "number" &&
    Boolean(envPort && envPort !== bindPort && !isNaN(envPort));

  startServerPromise = (async () => {
    try {
      await initializeSubsystems(app);

      safeLogger.info(`[Olmart Gateway] 🚀 Booting Express HTTP Server on 0.0.0.0:${bindPort}...`);

      const primaryPromise = new Promise<http.Server>((resolve, reject) => {
        const onError = (err: Error) => {
          httpServer.off("error", onError);
          safeLogger.error("[Olmart Gateway] ❌ HTTP Listen error during startup on primary port", { err: err.message, port: bindPort });
          reject(err);
        };

        httpServer.once("error", onError);

        httpServer.listen(bindPort, "0.0.0.0", () => {
          httpServer.off("error", onError);
          const startupDuration = ((Date.now() - bootStartTime) / 1000).toFixed(2);
          safeLogger.info(`[Olmart Gateway] 🚀 Startup ready - Port: ${bindPort}, Environment: ${process.env.NODE_ENV || "development"}, Duration: ${startupDuration}s`);
          resolve(httpServer);
        });
      });

      const secondaryPromise = needsSecondary && envPort
        ? new Promise<void>((resolve) => {
            try {
              secondaryHttpServer = http.createServer(app);
              secondaryHttpServer.once("error", (secErr: NodeJS.ErrnoException) => {
                if (secErr.code === "EADDRINUSE") {
                  safeLogger.info(`[Olmart Gateway] Port ${envPort} already bound (local proxy active). Main traffic on port ${bindPort}.`);
                } else {
                  safeLogger.warn(`[Olmart Gateway] Secondary listener notice on port ${envPort}`, { err: secErr.message });
                }
                resolve();
              });
              secondaryHttpServer.listen(envPort, "0.0.0.0", () => {
                safeLogger.info(`[Olmart Gateway] Dual-listener active on 0.0.0.0:${envPort} (Cloud Run ingress ready)`);
                resolve();
              });
            } catch (err: unknown) {
              safeLogger.warn("[Olmart Gateway] Secondary listener initialization notice", {
                err: err instanceof Error ? err.message : String(err),
              });
              resolve();
            }
          })
        : Promise.resolve();

      await Promise.all([primaryPromise, secondaryPromise]);

      TrendingSearchesService.warmupTrendingSearches().catch((warmupErr: unknown) => {
        safeLogger.warn("[Startup] Trending searches warm-up non-fatal failure", {
          err: warmupErr instanceof Error ? warmupErr.message : String(warmupErr),
        });
      });

      ProductSearchService.warmupSearchEngine().catch((warmupErr: unknown) => {
        safeLogger.warn("[Startup] Product search warm-up non-fatal failure", {
          err: warmupErr instanceof Error ? warmupErr.message : String(warmupErr),
        });
      });

      return httpServer;
    } catch (bootErr: unknown) {
      startServerPromise = null;
      rollbackSubsystems();
      throw bootErr;
    }
  })();

  return startServerPromise;
}

process.on("SIGTERM", () => {
  if (process.env.NODE_ENV !== "test") shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  if (process.env.NODE_ENV !== "test") shutdown("SIGINT");
});

process.on("unhandledRejection", (reason: unknown) => {
  const errorMsg = reason instanceof Error ? reason.stack || reason.message : String(reason);
  const errorCode = reason && typeof reason === "object" && "code" in reason ? String((reason as { code: unknown }).code) : "";
  safeLogger.error("[Olmart Gateway] ❌ Unhandled Promise Rejection at process level", { err: errorMsg, code: errorCode });

  if (process.env.NODE_ENV === "test") {
    return;
  }

  const criticalCodes = ["EADDRINUSE", "EACCES", "ERR_SERVER_ALREADY_LISTEN"];
  if (
    criticalCodes.includes(errorCode) ||
    (typeof errorMsg === "string" && errorMsg.includes("FATAL_DB_CORRUPTION"))
  ) {
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
  const attemptBoot = async (retries = 5, delayMs = 2000): Promise<void> => {
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
