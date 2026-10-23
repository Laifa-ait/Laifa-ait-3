import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type http from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const distServer = path.resolve(__dirname, "dist", "server.cjs");
const buildServer = path.resolve(__dirname, "build", "server.cjs");

// When executing directly as primary entrypoint (e.g., node server.ts / npm start in Cloud Run)
const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
const isCloudRun = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
const isTsxRunner = Boolean(
  process.env.TSX_TSCONFIG_PATH ||
  process.execPath.includes("tsx") ||
  process.argv.some((arg) => arg.includes("tsx"))
);

if (!process.env.NODE_ENV && (isCloudRun || !isTsxRunner)) {
  process.env.NODE_ENV = "production";
}
const isProduction = process.env.NODE_ENV === "production" || isCloudRun || !isTsxRunner;

const isDirectRun =
  !isTestEnv &&
  (Boolean(process.argv[1]) &&
    (process.argv[1].includes("server.ts") ||
      process.argv[1].includes("server.js") ||
      process.argv[1].endsWith("server") ||
      isProduction));

if (isDirectRun) {
  if (!isTsxRunner && fs.existsSync(distServer)) {
    require(distServer);
  } else if (!isTsxRunner && fs.existsSync(buildServer)) {
    require(buildServer);
  } else if (!isTsxRunner) {
    const { execSync } = await import("node:child_process");
    try {
      execSync("npx esbuild server.core.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs", { stdio: "inherit" });
      if (fs.existsSync(distServer)) {
        require(distServer);
      } else {
        await import("./server.core.ts");
      }
    } catch {
      await import("./server.core.ts");
    }
  } else {
    await import("./server.core.ts");
  }
}



let cachedCorePromise: Promise<typeof import("./server.core")> | null = null;
function getCore(): Promise<typeof import("./server.core")> {
  if (!cachedCorePromise) {
    cachedCorePromise = (async () => {
      try {
        return await import("./server.core.ts");
      } catch {
        try {
          return await import("./server.core.js");
        } catch {
          return await import("./server.core");
        }
      }
    })();
  }
  return cachedCorePromise;
}

let activeStartPromise: Promise<http.Server> | null = null;

/**
 * Re-export testing & lifecycle helpers for Vitest test suites.
 */
export function startServer(portOverride?: number): Promise<http.Server> {
  if (activeStartPromise) {
    return activeStartPromise;
  }
  activeStartPromise = (async () => {
    try {
      const core = await getCore();
      return await core.startServer(portOverride);
    } catch (err) {
      activeStartPromise = null;
      throw err;
    }
  })();
  return activeStartPromise;
}

export async function stopServerForTesting(): Promise<void> {
  activeStartPromise = null;
  const core = await getCore();
  return core.stopServerForTesting();
}

export const shutdown = async (signal: string): Promise<void> => {
  activeStartPromise = null;
  const core = await getCore();
  return core.shutdown(signal);
};
