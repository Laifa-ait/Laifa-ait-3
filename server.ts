import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type http from "node:http";
import type { Express } from "express";

interface ServerCoreModule {
  app: Express;
  httpServer: http.Server;
  secondaryHttpServer: http.Server | null;
  startServer: (portOverride?: number) => Promise<http.Server>;
  stopServerForTesting: () => Promise<void>;
  shutdown: (signal: string) => void;
}

const requireModule = createRequire(import.meta.url);
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const isolatedServerPath = path.join(currentDir, "dist-server", "server.cjs");
const legacyServerPath = path.join(currentDir, "dist", "server.cjs");
const builtClientHtmlPath = path.join(currentDir, "dist", "index.html");
const builtClientAssetsDir = path.join(currentDir, "dist", "assets");

const isTestMode = (): boolean => Boolean(process.env.VITEST || process.env.NODE_ENV === "test");
const isCloudRunEnv = (): boolean => Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
const isTsxRuntime = (): boolean =>
  Boolean(
    process.env.TSX_TSCONFIG_PATH ||
      process.env.NODE_OPTIONS?.includes("tsx") ||
      process.execArgv.some((arg) => arg.includes("tsx")) ||
      process.argv.some((arg) => arg.includes("tsx"))
  );
const isProductionRuntime = (): boolean =>
  process.env.NODE_ENV === "production" ||
  (isCloudRunEnv() &&
    process.env.NODE_ENV !== "development" &&
    !String(process.env.K_SERVICE || "").startsWith("ais-dev-"));

function resolveActiveServerBundlePath(): string | null {
  if (fs.existsSync(isolatedServerPath)) return isolatedServerPath;
  if (fs.existsSync(legacyServerPath)) return legacyServerPath;
  return null;
}

function loadEnvVariablesFallback(): void {
  const envPath = path.join(currentDir, ".env");
  if (!fs.existsSync(envPath)) return;
  try {
    const raw = fs.readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx <= 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch {
    // Non-fatal fallback
  }
}

let isBackgroundBuildRunning = false;

function scheduleNonBlockingClientBuildIfNeeded(): void {
  if (
    process.env.ENABLE_BG_CLIENT_BUILD !== "true" ||
    isBackgroundBuildRunning ||
    isTestMode() ||
    isProductionRuntime() ||
    process.env.FORCE_VITE_DEV === "true" ||
    process.env.DISABLE_BG_BUILD === "true" ||
    !fs.existsSync(builtClientHtmlPath) ||
    !fs.existsSync(builtClientAssetsDir)
  ) {
    return;
  }

  isBackgroundBuildRunning = true;
  const timer = setTimeout(() => {
    try {
      const child = spawn("npm", ["run", "build:client"], {
        cwd: currentDir,
        stdio: "ignore",
        env: { ...process.env, NODE_ENV: "production", NODE_OPTIONS: "--max-old-space-size=1024" },
      });
      child.on("close", () => { isBackgroundBuildRunning = false; });
      child.on("error", () => { isBackgroundBuildRunning = false; });
      child.unref();
    } catch {
      isBackgroundBuildRunning = false;
    }
  }, 1500);
  timer.unref?.();
}

function compileAndLoadCoreWithEsbuild(): ServerCoreModule {
  const esbuild = requireModule("esbuild") as typeof import("esbuild");
  const entryPath = path.join(currentDir, "server.core.ts");
  const outDir = path.join(currentDir, "dist-server");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, "server.cjs");
  esbuild.buildSync({
    entryPoints: [entryPath],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    outfile: outPath,
  });
  return requireModule(outPath) as ServerCoreModule;
}

try {
  await import("dotenv/config");
} catch {
  loadEnvVariablesFallback();
}

async function loadServerCore(): Promise<ServerCoreModule> {
  if (!isTestMode()) {
    scheduleNonBlockingClientBuildIfNeeded();
  }

  const useDirectTsxImport =
    isTestMode() ||
    (!isProductionRuntime() && isTsxRuntime() && process.env.USE_PREBUILT_DEV_BUNDLE !== "true");

  if (!useDirectTsxImport) {
    const bundleToLoad = resolveActiveServerBundlePath();
    if (bundleToLoad) {
      try {
        return requireModule(bundleToLoad) as ServerCoreModule;
      } catch (bundleErr: unknown) {
        const msg = bundleErr instanceof Error ? bundleErr.stack || bundleErr.message : String(bundleErr);
        process.stderr.write(`⚠️ [Olmart Gateway] ⚠️ Failed to load prebuilt bundle (${bundleToLoad}): ${msg}\n`);
      }
    }
    if (fs.existsSync(path.join(currentDir, "server.core.ts")) && !isTsxRuntime()) {
      try {
        return compileAndLoadCoreWithEsbuild();
      } catch (esbuildErr: unknown) {
        const msg = esbuildErr instanceof Error ? esbuildErr.message : String(esbuildErr);
        process.stderr.write(`⚠️ [Olmart Gateway] ⚠️ Fast esbuild bundle step skipped: ${msg}\n`);
      }
    }
  }

  try {
    return (await import("./server.core.ts")) as ServerCoreModule;
  } catch (tsImportErr: unknown) {
    const bundleToLoad = resolveActiveServerBundlePath();
    if (bundleToLoad) {
      return requireModule(bundleToLoad) as ServerCoreModule;
    }
    throw tsImportErr;
  }
}

const core = await loadServerCore();

export const app = core.app;
export const httpServer = core.httpServer;
export const secondaryHttpServer = core.secondaryHttpServer;
export const startServer = core.startServer;
export const stopServerForTesting = core.stopServerForTesting;
export const shutdown = core.shutdown;

export default app;
