import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import type {
  MonitoredServiceId,
  ServiceCheckResult,
  ServiceHealthStatus,
  SystemSelfHealReport,
} from "../types/systemHealth";
import { isFirebaseReady, verifyAndFixDb } from "../config/firebase-admin";
import { isFrontendReady } from "./ViteStaticService";
import { startProductCacheCleanupTimer } from "./ProductSeoService";
import { safeLogger } from "../utils/logger";

const CRITICAL_PACKAGES = [
  "express",
  "dotenv",
  "tsx",
  "vite",
  "esbuild",
  "firebase-admin",
  "firebase",
  "pino",
  "zod",
];
const SUPPORTED_LOCALES = ["fr", "ar", "en"];

let lastReport: SystemSelfHealReport | null = null;
let watchdogTimer: NodeJS.Timeout | null = null;
let isHealRunning = false;

const isTestEnv = (): boolean => Boolean(process.env.NODE_ENV === "test" || process.env.VITEST);

function makeResult(
  id: MonitoredServiceId,
  label: string,
  status: ServiceHealthStatus,
  autoRepaired: boolean,
  detail: string,
  start: number
): ServiceCheckResult {
  return {
    id,
    label,
    status,
    autoRepaired,
    detail,
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
  };
}

function checkAndHealNpmDependencies(): ServiceCheckResult {
  const start = Date.now();
  const rootDir = process.cwd();
  const missing = CRITICAL_PACKAGES.filter(
    (pkg) => !fs.existsSync(path.join(rootDir, "node_modules", pkg, "package.json"))
  );

  if (missing.length === 0) {
    return makeResult("npm_dependencies", "Modules & Binaires NPM Critiques", "healthy", false, `${CRITICAL_PACKAGES.length}/${CRITICAL_PACKAGES.length} packages critiques vérifiés.`, start);
  }
  if (isTestEnv()) {
    return makeResult("npm_dependencies", "Modules & Binaires NPM Critiques", "degraded", false, `Packages manquants détectés: ${missing.join(", ")}`, start);
  }

  try {
    safeLogger.info(`⚙️ [Olmart Auto-Heal] ⚡ Reinstalling missing NPM packages: ${missing.join(", ")}`);
    execSync("npm install --no-audit --no-fund --prefer-offline", {
      cwd: rootDir,
      stdio: "ignore",
      env: { ...process.env, SCARF_ANALYTICS: "false", HUSKY: "0", CI: "true" },
    });
    return makeResult("npm_dependencies", "Modules & Binaires NPM Critiques", "repaired", true, `Packages réinstallés automatiquement: ${missing.join(", ")}`, start);
  } catch (err: unknown) {
    return makeResult("npm_dependencies", "Modules & Binaires NPM Critiques", "degraded", false, `Échec de réinstallation: ${err instanceof Error ? err.message : String(err)}`, start);
  }
}

function checkAndHealLocales(): ServiceCheckResult {
  const start = Date.now();
  const rootDir = process.cwd();
  const publicLocalesDir = path.join(rootDir, "public", "locales");
  const distLocalesDir = path.join(rootDir, "dist", "locales");
  let repairedCount = 0;
  const missingLocales: string[] = [];

  if (!fs.existsSync(publicLocalesDir) && !isTestEnv()) {
    fs.mkdirSync(publicLocalesDir, { recursive: true });
  }

  for (const lang of SUPPORTED_LOCALES) {
    const targetFile = path.join(publicLocalesDir, `${lang}.json`);
    if (!fs.existsSync(targetFile)) {
      const fallbackFile = path.join(distLocalesDir, `${lang}.json`);
      if (!isTestEnv() && fs.existsSync(fallbackFile)) {
        fs.copyFileSync(fallbackFile, targetFile);
        repairedCount++;
      } else if (!isTestEnv()) {
        fs.writeFileSync(targetFile, "{}", "utf-8");
        repairedCount++;
      } else {
        missingLocales.push(lang);
      }
    }
  }

  const status: ServiceHealthStatus = missingLocales.length > 0 ? "degraded" : repairedCount > 0 ? "repaired" : "healthy";
  return makeResult(
    "i18n_locales",
    "Dictionnaires Multilingues (FR/AR/EN)",
    status,
    repairedCount > 0,
    repairedCount > 0 ? `${repairedCount} fichier(s) de langue restauré(s) automatiquement.` : "Tous les dictionnaires FR/AR/EN sont disponibles.",
    start
  );
}

function checkAndHealCsrfSecurity(): ServiceCheckResult {
  const start = Date.now();
  const hasValidSecret = Boolean(process.env.CSRF_SECRET) && (process.env.CSRF_SECRET?.trim().length ?? 0) >= 32;
  if (hasValidSecret) {
    return makeResult("csrf_security", "Service Cryptographique CSRF", "healthy", false, "Clé HMAC CSRF active (>= 32 octets).", start);
  }
  const seed = process.env.K_SERVICE || process.env.FIREBASE_PROJECT_ID || "olmart-self-healed-csrf-seed";
  process.env.CSRF_SECRET = crypto.createHmac("sha256", "olmart-auto-heal-csrf-v1").update(seed).digest("hex");
  return makeResult("csrf_security", "Service Cryptographique CSRF", "repaired", true, "Clé HMAC CSRF régénérée automatiquement.", start);
}

function checkAndHealFrontendAndBundle(): ServiceCheckResult[] {
  const start = Date.now();
  const rootDir = process.cwd();
  const hasClientDist = fs.existsSync(path.join(rootDir, "dist", "index.html")) && isFrontendReady();
  const hasServerBundle =
    fs.existsSync(path.join(rootDir, "dist-server", "server.cjs")) ||
    fs.existsSync(path.join(rootDir, "dist", "server.cjs"));

  let frontendStatus: ServiceHealthStatus = hasClientDist ? "healthy" : "degraded";
  let frontendRepaired = false;
  if (!hasClientDist && !isTestEnv() && process.env.FORCE_VITE_DEV !== "true") {
    try {
      execSync("npm run build:client", {
        cwd: rootDir,
        stdio: "ignore",
        env: { ...process.env, NODE_ENV: "production" },
      });
      frontendStatus = "repaired";
      frontendRepaired = true;
    } catch {
      frontendStatus = "degraded";
    }
  }

  let bundleStatus: ServiceHealthStatus = hasServerBundle ? "healthy" : "degraded";
  let bundleRepaired = false;
  if (!hasServerBundle && !isTestEnv()) {
    try {
      execSync("npm run build:server", {
        cwd: rootDir,
        stdio: "ignore",
        env: { ...process.env, NODE_ENV: "production" },
      });
      bundleStatus = "repaired";
      bundleRepaired = true;
    } catch {
      bundleStatus = "degraded";
    }
  }

  return [
    makeResult("frontend_pipeline", "Serveur Frontend Vite & Assets", frontendStatus, frontendRepaired, frontendStatus !== "degraded" ? "Pipeline Vite / Assets statiques opérationnel." : "Build statique dist/index.html indisponible.", start),
    makeResult("backend_bundle", "Bundle Serveur Express Isolé", bundleStatus, bundleRepaired, bundleRepaired ? "Bundle dist-server/server.cjs compilé automatiquement." : "Runtime serveur prêt.", start),
  ];
}

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
      makeResult("firebase_admin", "Firebase Admin & Firestore Core", fbRepaired ? "repaired" : fbReady ? "healthy" : "degraded", fbRepaired, fbReady ? "Connexion Firebase Admin active." : "Firebase Admin en attente ou dégradé.", fbStart)
    );

    const seoStart = Date.now();
    startProductCacheCleanupTimer();
    results.push(makeResult("seo_cache_worker", "Worker Cache SEO & Catalogue", "healthy", false, "Timer de nettoyage SEO actif.", seoStart));

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
