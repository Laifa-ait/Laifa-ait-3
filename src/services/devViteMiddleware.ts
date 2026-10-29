import express, { Express } from "express";
import path from "path";
import { promises as fsPromises, existsSync } from "fs";
import type { ViteDevServer } from "vite";
import { injectNonceToHtml } from "../middlewares/security";
import { safeLogger } from "../utils/logger";

let activeViteServer: ViteDevServer | null = null;

export async function closeDevViteServer(): Promise<void> {
  if (activeViteServer) {
    const serverToClose = activeViteServer;
    activeViteServer = null;
    try {
      await serverToClose.close();
    } catch {
      // ignore close errors during shutdown
    }
  }
}

export async function attachDevViteMiddleware(app: Express): Promise<boolean> {
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
  const distIndexPath = path.join(process.cwd(), "dist", "index.html");
  const hasStaticDist = existsSync(distIndexPath);

  if (process.env.NODE_ENV === "test") {
    return false;
  }

  const isTsxDev = Boolean(
    process.env.npm_lifecycle_event === "dev" ||
    process.execArgv.some((arg) => arg.includes("tsx")) ||
    process.env.FORCE_VITE_DEV === "true" ||
    process.env.NODE_ENV === "development"
  );

  // Serve pre-built dist/ in Cloud Run or production only when NOT in tsx dev mode
  if (!isTsxDev && hasStaticDist && (isCloudRun || process.env.NODE_ENV === "production")) {
    return false;
  }

  let viteInstance: ViteDevServer | null = null;
  let viteFailed = false;

  const viteInitPromise = (async () => {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          allowedHosts: true,
        },
        appType: "spa",
      });
      viteInstance = vite;
      activeViteServer = vite;
      safeLogger.info("[Olmart Gateway] ⚡ Vite Dev Server middleware ready");
    } catch (err: unknown) {
      viteFailed = true;
      safeLogger.error("[Olmart Vite] ❌ Vite dev middleware failed to initialize, falling back to static file serving", {
        err: err instanceof Error ? err.message : String(err),
      });
    }
  })();

  const devRouter = express.Router();

  devRouter.use(async (req, res, next) => {
    if (
      req.originalUrl.startsWith("/api") ||
      req.originalUrl.startsWith("/api-docs") ||
      req.originalUrl.startsWith("/locales") ||
      req.originalUrl.startsWith("/health") ||
      req.originalUrl === "/healthz" ||
      req.originalUrl === "/livez" ||
      req.originalUrl === "/readyz"
    ) {
      return next();
    }

    if (!viteInstance && !viteFailed) {
      await viteInitPromise;
    }

    if (viteFailed || !viteInstance) {
      return next();
    }

    return viteInstance.middlewares(req, res, next);
  });

  devRouter.get("*", async (req, res, next) => {
    if (
      req.originalUrl.startsWith("/api") ||
      req.originalUrl.startsWith("/api-docs") ||
      req.originalUrl.startsWith("/locales") ||
      req.originalUrl.startsWith("/health") ||
      req.originalUrl === "/healthz" ||
      req.originalUrl === "/livez" ||
      req.originalUrl === "/readyz"
    ) {
      return next();
    }

    if (!viteInstance && !viteFailed) {
      await viteInitPromise;
    }

    // Never serve index.html for static file requests (.js, .css, .png, .jpg, .svg, .json, .ico, etc.)
    const ext = path.extname(req.path);
    if (ext && ext !== ".html") {
      return res.status(404).end();
    }

    if (viteFailed || !viteInstance) {
      if (hasStaticDist) {
        try {
          let fallbackHtml = await fsPromises.readFile(distIndexPath, "utf-8");
          const nonce = res.locals.cspNonce || "";
          if (nonce) {
            fallbackHtml = injectNonceToHtml(fallbackHtml, nonce);
          }
          return res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(fallbackHtml);
        } catch {
          return next();
        }
      }
      return next();
    }

    try {
      const indexHtmlPath = path.resolve(process.cwd(), "index.html");
      let template = await fsPromises.readFile(indexHtmlPath, "utf-8");
      template = await viteInstance.transformIndexHtml(req.originalUrl, template);

      const nonce = res.locals.cspNonce || "";
      if (nonce) {
        template = injectNonceToHtml(template, nonce);
      }

      res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(template);
    } catch (e: unknown) {
      viteInstance.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.use(devRouter);
  return true;
}

