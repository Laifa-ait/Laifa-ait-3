import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, "..");

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
  "helmet",
  "cors",
];

const CRITICAL_BINARIES = [
  path.join(rootDir, "node_modules", "tsx", "dist", "cli.mjs"),
  path.join(rootDir, "node_modules", "vite", "bin", "vite.js"),
  path.join(rootDir, "node_modules", "esbuild", "bin", "esbuild"),
];

export function ensureCriticalServicesInstalled() {
  const missingItems = [];

  for (const pkg of CRITICAL_PACKAGES) {
    const pkgJsonPath = path.join(rootDir, "node_modules", pkg, "package.json");
    if (!fs.existsSync(pkgJsonPath)) {
      missingItems.push(`pkg:${pkg}`);
    }
  }

  for (const binPath of CRITICAL_BINARIES) {
    if (!fs.existsSync(binPath)) {
      missingItems.push(`bin:${path.relative(rootDir, binPath)}`);
    }
  }

  if (missingItems.length > 0) {
    process.stdout.write(
      `⚙️ [Olmart Auto-Heal] ⚡ Missing critical services/packages detected (${missingItems.join(", ")}). Reinstalling automatically...\n`
    );
    try {
      execSync("npm install --no-audit --no-fund --prefer-offline", {
        cwd: rootDir,
        stdio: "inherit",
        env: {
          ...process.env,
          SCARF_ANALYTICS: "false",
          HUSKY: "0",
          CI: "true",
        },
      });
      process.stdout.write(
        "🟢 [Olmart Auto-Heal] ✅ Critical dependencies and binaries restored successfully.\n"
      );
      return { repaired: true, missingItems };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(
        `❌ [Olmart Auto-Heal] ❌ Automatic dependency installation failed: ${msg}\n`
      );
      return { repaired: false, missingItems };
    }
  }

  return { repaired: false, missingItems: [] };
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  ensureCriticalServicesInstalled();
}
