import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
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

const CRITICAL_BOOT_PACKAGES = [
  "dotenv",
  "express",
  "tsx",
  "vite",
  "esbuild",
  "firebase-admin",
  "firebase",
  "pino",
  "zod",
];

function ensureBootstrapDependencies(): void {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return;
  }

  const missingPackages = CRITICAL_BOOT_PACKAGES.filter(
    (pkg) => !fs.existsSync(path.join(currentDir, "node_modules", pkg, "package.json"))
  );

  if (missingPackages.length === 0) {
    return;
  }

  process.stdout.write(
    `⚙️ [Olmart Auto-Heal] ⚡ Missing critical packages at bootstrap (${missingPackages.join(", ")}). Reinstalling automatically...\n`
  );

  try {
    execSync("npm install --no-audit --no-fund --prefer-offline", {
      cwd: currentDir,
      stdio: "inherit",
      env: {
        ...process.env,
        SCARF_ANALYTICS: "false",
        HUSKY: "0",
        CI: "true",
      },
    });
    process.stdout.write(
      "🟢 [Olmart Auto-Heal] ✅ Bootstrap dependencies reinstalled successfully.\n"
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `❌ [Olmart Auto-Heal] ❌ Bootstrap dependency repair failed: ${msg}\n`
    );
  }
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
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === "tests" || entry.name.startsWith(".")) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subLatest = getLatestMtimeMs(fullPath);
        if (subLatest > latest) latest = subLatest;
      } else if (entry.isFile()) {
        const mtime = fs.statSync(fullPath).mtimeMs;
        if (mtime > latest) latest = mtime;
      }
    }
  } catch {
    // Ignore read errors
  }
  return latest;
}

function isBuiltClientFresh(): boolean {
  if (!fs.existsSync(builtClientHtmlPath) || !fs.existsSync(builtClientAssetsDir)) {
    return false;
  }
  // In read-only production containers (e.g. Cloud Run Docker runner), if dist/index.html exists, trust it
  if (process.env.NODE_ENV === "production" && Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB)) {
    return true;
  }
  try {
    const htmlMtime = fs.statSync(builtClientHtmlPath).mtimeMs;
    const rootIndexMtime = fs.existsSync(path.join(currentDir, "index.html"))
      ? fs.statSync(path.join(currentDir, "index.html")).mtimeMs
      : 0;
    const srcLatestMtime = getLatestMtimeMs(path.join(currentDir, "src"));
    return htmlMtime + 1500 >= Math.max(rootIndexMtime, srcLatestMtime);
  } catch {
    return false;
  }
}

function ensureFreshClientBundle(): void {
  if (process.env.NODE_ENV === "test" || process.env.VITEST || process.env.FORCE_VITE_DEV === "true") {
    return;
  }
  if (isBuiltClientFresh()) {
    return;
  }
  process.stdout.write(
    "⚙️ [Olmart Auto-Heal] ⚡ Building fresh pre-compiled client bundle (dist/index.html) for instant loading...\n"
  );
  try {
    execSync("npm run build:client", {
      cwd: currentDir,
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    });
    process.stdout.write("🟢 [Olmart Auto-Heal] ✅ Pre-compiled client bundle ready in dist/.\n");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`⚠️ [Olmart Auto-Heal] ⚠️ Client bundle build notice: ${msg}\n`);
  }
}

function resolveActiveServerBundlePath(): string | null {
  if (fs.existsSync(isolatedServerPath)) return isolatedServerPath;
  if (fs.existsSync(legacyServerPath)) return legacyServerPath;
  return null;
}

function isBuiltServerFresh(): boolean {
  const activeBundle = resolveActiveServerBundlePath();
  if (!activeBundle) return false;
  try {
    const bundleMtime = fs.statSync(activeBundle).mtimeMs;
    const coreFiles = ["server.core.ts", "app.ts"];
    for (const file of coreFiles) {
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

ensureBootstrapDependencies();

try {
  await import("dotenv/config");
} catch {
  loadEnvVariablesFallback();
}

const isTestMode = Boolean(process.env.VITEST || process.env.NODE_ENV === "test");

async function loadServerCore(): Promise<ServerCoreModule> {
  if (!isTestMode) {
    ensureFreshClientBundle();
  }

  if (!isTestMode && process.env.FORCE_TSX_SERVER !== "true") {
    if (!isBuiltServerFresh()) {
      try {
        execSync("npm run build:server", {
          cwd: currentDir,
          stdio: "ignore",
          env: { ...process.env, NODE_ENV: "production" },
        });
      } catch {
        // Fallback if esbuild is unavailable
      }
    }
    const bundleToLoad = resolveActiveServerBundlePath();
    if (bundleToLoad) {
      try {
        return requireModule(bundleToLoad) as ServerCoreModule;
      } catch {
        // Fallback to tsx below
      }
    }
  }

  try {
    return (await import("./server.core.ts")) as ServerCoreModule;
  } catch {
    const bundleToLoad = resolveActiveServerBundlePath();
    if (bundleToLoad) {
      return requireModule(bundleToLoad) as ServerCoreModule;
    }
    return (await import("./server.core.ts")) as ServerCoreModule;
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
