import { Express } from "express";
import path from "path";
import { promises as fsPromises, existsSync } from "fs";
import { injectNonceToHtml } from "../middlewares/security";
import { safeLogger } from "../utils/logger";

export async function attachDevViteMiddleware(app: Express): Promise<boolean> {
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
  const distIndexPath = path.join(process.cwd(), "dist", "index.html");
  const hasStaticDist = existsSync(distIndexPath);

  // Only disable Vite dev middleware in true Cloud Run container deployments with pre-built client
  if (process.env.NODE_ENV === "production" && isCloudRun && hasStaticDist) {
    return false;
  }

  try {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      if (
        req.originalUrl.startsWith("/api") ||
        req.originalUrl.startsWith("/api-docs") ||
        req.originalUrl.startsWith("/locales")
      ) {
        return next();
      }

      // Never serve index.html for static file requests (.js, .css, .png, .jpg, .svg, .json, .ico, etc.)
      const ext = path.extname(req.path);
      if (ext && ext !== ".html") {
        return res.status(404).end();
      }

      try {
        const indexHtmlPath = path.resolve(process.cwd(), "index.html");
        let template = await fsPromises.readFile(indexHtmlPath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);

        const nonce = res.locals.cspNonce || "";
        if (nonce) {
          template = injectNonceToHtml(template, nonce);
        }

        res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(template);
      } catch (e: unknown) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    return true;
  } catch (err: unknown) {
    safeLogger.error("[Olmart Vite] ❌ Vite dev middleware failed to initialize, falling back to static file serving", {
      err: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
