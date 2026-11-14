import fs from "node:fs";
import os from "node:os";
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

const CRITICAL_RUNTIME_PACKAGES = ["dotenv", "express", "firebase-admin", "firebase", "pino", "zod"];
const DEV_TOOLING_PACKAGES = ["tsx", "vite", "esbuild"];

const isTestMode = (): boolean => Boolean(process.env.VITEST || process.env.NODE_ENV === "test");
const isCloudRunEnv = (): boolean => Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
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

function ensureBootstrapDependencies(): void {
  if (isTestMode()) return;
  const hasBundle = Boolean(resolveActiveServerBundlePath());
  if (isProductionRuntime() && hasBundle) return;

  const requiredPackages = isProductionRuntime()
    ? CRITICAL_RUNTIME_PACKAGES
    : [...CRITICAL_RUNTIME_PACKAGES, ...DEV_TOOLING_PACKAGES];

  const missingPackages = requiredPackages.filter(
    (pkg) => !fs.existsSync(path.join(currentDir, "node_modules", pkg, "package.json"))
  );
  if (missingPackages.length === 0) return;

  process.stderr.write(
    `⚠️ [Olmart Auto-Heal] ⚠️ Missing packages detected (${missingPackages.join(", ")}). Continuing boot without blocking event loop.\n`
  );
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

function getLatestMtimeMs(dirPath: string): number {
  let latest = 0;
  try {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "tests" || entry.name.startsWith(".")) continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        latest = Math.max(latest, getLatestMtimeMs(fullPath));
      } else if (entry.isFile()) {
        latest = Math.max(latest, fs.statSync(fullPath).mtimeMs);
      }
    }
  } catch {
    // Ignore read errors
  }
  return latest;
}

function isBuiltClientFresh(): boolean {
  if (!fs.existsSync(builtClientHtmlPath) || !fs.existsSync(builtClientAssetsDir)) return false;
  if (isProductionRuntime()) return true;
  try {
    const htmlMtime = fs.statSync(builtClientHtmlPath).mtimeMs;
    const rootIndexPath = path.join(currentDir, "index.html");
    const rootIndexMtime = fs.existsSync(rootIndexPath) ? fs.statSync(rootIndexPath).mtimeMs : 0;
    const srcLatestMtime = getLatestMtimeMs(path.join(currentDir, "src"));
    return htmlMtime + 1500 >= Math.max(rootIndexMtime, srcLatestMtime);
  } catch {
    return false;
  }
}

let isBackgroundBuildRunning = false;

function scheduleNonBlockingClientBuildIfNeeded(): void {
  if (
    isBackgroundBuildRunning ||
    isTestMode() ||
    isProductionRuntime() ||
    process.env.FORCE_VITE_DEV === "true" ||
    process.env.DISABLE_BG_BUILD === "true" ||
    !fs.existsSync(builtClientHtmlPath) ||
    !fs.existsSync(path.join(currentDir, "src")) ||
    isBuiltClientFresh()
  ) {
    return;
  }

  isBackgroundBuildRunning = true;
  const timer = setTimeout(() => {
    try {
      const child = spawn("npm", ["run", "build:client"], {
        cwd: currentDir,
        stdio: "ignore",
        env: {
          ...process.env,
          NODE_ENV: "production",
          NODE_OPTIONS: "--max-old-space-size=1536",
        },
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

function isBuiltServerFresh(): boolean {
  const activeBundle = resolveActiveServerBundlePath();
  if (!activeBundle) return false;
  if (isProductionRuntime()) return true;
  try {
    const bundleMtime = fs.statSync(activeBundle).mtimeMs;
    for (const file of ["server.core.ts", "app.ts"]) {
      const full = path.join(currentDir, file);
      if (fs.existsSync(full) && fs.statSync(full).mtimeMs > bundleMtime + 1000) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function compileAndLoadCoreWithEsbuild(): ServerCoreModule {
  const esbuild = requireModule("esbuild") as typeof import("esbuild");
  const entryPath = path.join(currentDir, "server.core.ts");
  const outPath = path.join(os.tmpdir(), `olmart-server-${process.pid}.cjs`);
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

ensureBootstrapDependencies();

try {
  await import("dotenv/config");
} catch {
  loadEnvVariablesFallback();
}

async function loadServerCore(): Promise<ServerCoreModule> {
  if (!isTestMode()) {
    scheduleNonBlockingClientBuildIfNeeded();
  }

  if (!isTestMode() && process.env.FORCE_TSX_SERVER !== "true" && isBuiltServerFresh()) {
    const bundleToLoad = resolveActiveServerBundlePath();
    if (bundleToLoad) {
      try {
        return requireModule(bundleToLoad) as ServerCoreModule;
      } catch (bundleErr: unknown) {
        const msg = bundleErr instanceof Error ? bundleErr.stack || bundleErr.message : String(bundleErr);
        process.stderr.write(`⚠️ [Olmart Gateway] ⚠️ Failed to load prebuilt bundle (${bundleToLoad}): ${msg}\n`);
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
    if (fs.existsSync(path.join(currentDir, "server.core.ts"))) {
      return compileAndLoadCoreWithEsbuild();
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
