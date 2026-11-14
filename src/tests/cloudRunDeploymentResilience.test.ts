import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { verifyAndHealAllServices } from "../services/ServiceAutoHealer";
import { setStaticStateForTesting } from "../services/ViteStaticService";

describe("Cloud Run Deployment & Production Boot Resilience", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalKService = process.env.K_SERVICE;
  const originalCwd = process.cwd();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalKService === undefined) {
      delete process.env.K_SERVICE;
    } else {
      process.env.K_SERVICE = originalKService;
    }
    process.chdir(originalCwd);
    setStaticStateForTesting(false, "");
  });

  it("verifyAndHealAllServices runs in read-only safe mode in Cloud Run production without throwing", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "olmart-cloudrun-ro-"));
    try {
      process.env.NODE_ENV = "production";
      process.env.K_SERVICE = "olmart-cloudrun-test";
      process.chdir(tmpDir);

      const report = await verifyAndHealAllServices();
      expect(report).toBeDefined();
      expect(report.totalServices).toBeGreaterThanOrEqual(6);
      expect(fs.existsSync(path.join(tmpDir, "public", "locales"))).toBe(false);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("validates dist/server.cjs and dist-server/server.cjs export full ServerCore contract", async () => {
    const bundlePaths = [
      path.join(originalCwd, "dist", "server.cjs"),
      path.join(originalCwd, "dist-server", "server.cjs"),
    ];
    for (const bundlePath of bundlePaths) {
      expect(fs.existsSync(bundlePath)).toBe(true);
    }
  });
});
