import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { MonitoredServiceId, ServiceCheckResult, ServiceHealthStatus } from "../types/systemHealth";
import { isFrontendReady } from "./ViteStaticService";

const CRITICAL_PACKAGES = ["express", "dotenv", "tsx", "vite", "esbuild", "firebase-admin", "firebase", "pino", "zod"];
const PROD_CRITICAL_PACKAGES = ["express", "dotenv", "firebase-admin", "firebase", "pino", "zod"];
const SUPPORTED_LOCALES = ["fr", "ar", "en"];

export const isTestEnv = (): boolean => Boolean(process.env.NODE_ENV === "test" || process.env.VITEST);

export const isDevPreviewRuntime = (): boolean =>
  process.env.NODE_ENV === "development" || String(process.env.K_SERVICE || "").startsWith("ais-dev-");

export const isProdOrCloudRun = (): boolean =>
  !isTestEnv() &&
  !isDevPreviewRuntime() &&
  (process.env.NODE_ENV === "production" || Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB));

export function makeCheckResult(
  id: MonitoredServiceId,
  label: string,
  status: ServiceHealthStatus,
  autoRepaired: boolean,
  detail: string,
  start: number
): ServiceCheckResult {
  return { id, label, status, autoRepaired, detail, checkedAt: new Date().toISOString(), durationMs: Date.now() - start };
}

export function checkAndHealNpmDependencies(): ServiceCheckResult {
  const start = Date.now();
  const rootDir = process.cwd();
  const packagesToCheck = isProdOrCloudRun() ? PROD_CRITICAL_PACKAGES : CRITICAL_PACKAGES;
  const missing = packagesToCheck.filter(
    (pkg) => !fs.existsSync(path.join(rootDir, "node_modules", pkg, "package.json"))
  );

  if (missing.length === 0) {
    return makeCheckResult(
      "npm_dependencies",
      "Modules & Binaires NPM Critiques",
      "healthy",
      false,
      `${packagesToCheck.length}/${packagesToCheck.length} packages critiques vérifiés.`,
      start
    );
  }
  return makeCheckResult(
    "npm_dependencies",
    "Modules & Binaires NPM Critiques",
    "degraded",
    false,
    `Packages manquants détectés: ${missing.join(", ")}`,
    start
  );
}

export function checkAndHealLocales(): ServiceCheckResult {
  const start = Date.now();
  const rootDir = process.cwd();
  const publicLocalesDir = path.join(rootDir, "public", "locales");
  const distLocalesDir = path.join(rootDir, "dist", "locales");
  let repairedCount = 0;
  const missingLocales: string[] = [];
  const readOnlyMode = isTestEnv() || isProdOrCloudRun();

  for (const lang of SUPPORTED_LOCALES) {
    const publicFile = path.join(publicLocalesDir, `${lang}.json`);
    const distFile = path.join(distLocalesDir, `${lang}.json`);
    const existsAny = fs.existsSync(publicFile) || fs.existsSync(distFile);
    if (!existsAny) {
      if (readOnlyMode) {
        missingLocales.push(lang);
      } else {
        try {
          if (!fs.existsSync(publicLocalesDir)) fs.mkdirSync(publicLocalesDir, { recursive: true });
          fs.writeFileSync(publicFile, "{}", "utf-8");
          repairedCount++;
        } catch {
          missingLocales.push(lang);
        }
      }
    } else if (!fs.existsSync(publicFile) && fs.existsSync(distFile) && !readOnlyMode) {
      try {
        if (!fs.existsSync(publicLocalesDir)) fs.mkdirSync(publicLocalesDir, { recursive: true });
        fs.copyFileSync(distFile, publicFile);
        repairedCount++;
      } catch { /* Non-fatal */ }
    }
  }

  const status: ServiceHealthStatus = missingLocales.length > 0 ? "degraded" : repairedCount > 0 ? "repaired" : "healthy";
  const detail = repairedCount > 0
    ? `${repairedCount} fichier(s) de langue restauré(s) automatiquement.`
    : missingLocales.length > 0
      ? `Dictionnaires manquants: ${missingLocales.join(", ")}`
      : "Tous les dictionnaires FR/AR/EN sont disponibles.";
  return makeCheckResult("i18n_locales", "Dictionnaires Multilingues (FR/AR/EN)", status, repairedCount > 0, detail, start);
}

export function checkAndHealCsrfSecurity(): ServiceCheckResult {
  const start = Date.now();
  if (Boolean(process.env.CSRF_SECRET) && (process.env.CSRF_SECRET?.trim().length ?? 0) >= 32) {
    return makeCheckResult("csrf_security", "Service Cryptographique CSRF", "healthy", false, "Clé HMAC CSRF active (>= 32 octets).", start);
  }
  const seed = process.env.K_SERVICE || process.env.FIREBASE_PROJECT_ID || "olmart-self-healed-csrf-seed";
  process.env.CSRF_SECRET = crypto.createHmac("sha256", "olmart-auto-heal-csrf-v1").update(seed).digest("hex");
  return makeCheckResult("csrf_security", "Service Cryptographique CSRF", "repaired", true, "Clé HMAC CSRF régénérée automatiquement.", start);
}

export function checkAndHealFrontendAndBundle(): ServiceCheckResult[] {
  const start = Date.now();
  const rootDir = process.cwd();
  const hasClientDist = fs.existsSync(path.join(rootDir, "dist", "index.html")) && isFrontendReady();
  const hasServerBundle =
    fs.existsSync(path.join(rootDir, "dist-server", "server.cjs")) ||
    fs.existsSync(path.join(rootDir, "dist", "server.cjs"));
  const devMode = isDevPreviewRuntime();

  const frontendStatus: ServiceHealthStatus =
    hasClientDist || (devMode && isFrontendReady()) ? "healthy" : "degraded";

  const bundleStatus: ServiceHealthStatus =
    hasServerBundle || devMode ? "healthy" : "degraded";

  return [
    makeCheckResult(
      "frontend_pipeline",
      "Serveur Frontend Vite & Assets",
      frontendStatus,
      false,
      frontendStatus === "healthy"
        ? "Pipeline Vite / Assets statiques opérationnel."
        : "Build statique dist/index.html indisponible.",
      start
    ),
    makeCheckResult(
      "backend_bundle",
      "Bundle Serveur Express Isolé",
      bundleStatus,
      false,
      hasServerBundle
        ? "Bundle dist-server/server.cjs prêt."
        : devMode
          ? "Runtime TSX dev opérationnel."
          : "Bundle dist-server/server.cjs indisponible.",
      start
    ),
  ];
}
