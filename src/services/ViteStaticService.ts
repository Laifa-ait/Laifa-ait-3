import express, { Express, Response } from "express";
import path from "path";
import { promises as fsPromises, existsSync } from "fs";
import { getProductSeoData, injectProductSeo } from "./ProductSeoService";
import { injectNonceToHtml } from "../middlewares/security";
import { safeLogger } from "../utils/logger";
import { LocaleStorageService } from "./LocaleStorageService";
import { attachDevViteMiddleware } from "./devViteMiddleware";

let cachedHtmlTemplate = "";
let isStaticBuildValid = false;

/**
 * Resets or overrides static state for testing purposes only.
 */
export function setStaticStateForTesting(valid: boolean, template: string): void {
  isStaticBuildValid = valid;
  cachedHtmlTemplate = template;
}

/**
 * Returns true if the frontend static build is ready in production,
 * or if running in development mode.
 */
export function isFrontendReady(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  if (!isStaticBuildValid) {
    return false;
  }
  return cachedHtmlTemplate.length > 50 && cachedHtmlTemplate.includes('id="root"');
}

import { validateProductionHtmlTemplate } from "./htmlValidationService";
export { validateProductionHtmlTemplate };

export async function setupViteAndStaticServing(app: Express): Promise<void> {
  const distPath = existsSync(path.join(process.cwd(), "dist"))
    ? path.join(process.cwd(), "dist")
    : path.join(process.cwd(), "build");
  const publicLocalesPath = path.join(process.cwd(), "public", "locales");
  const distLocalesPath = path.join(distPath, "locales");

  // Security Guard: Block public HTTP access to sourcemap (.map) files across all static routes
  app.use((req, res, next) => {
    const rawPath = (req.path || "").toLowerCase();
    if (rawPath.endsWith(".map") || rawPath.includes(".map?")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(404).type("text/plain").send("Not Found");
    }
    next();
  });

  // Dedicated, fail-safe /locales/:lang.json handler: registered FIRST so it works in both dev & prod
  // and NEVER falls through to Vite middlewares or SPA HTML serving.
  app.get("/locales/:lang.json", async (req, res) => {
    const lang = req.params.lang;
    if (!["fr", "ar", "en"].includes(lang)) {
      return res.status(404).json({ error: `Langue non supportée: ${lang}` });
    }

    try {
      const data = await LocaleStorageService.getMergedLocale(lang);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
      return res.json(data);
    } catch (err: unknown) {
      safeLogger.error("[Olmart Locales] Error serving merged locale, falling back to disk", {
        lang,
        err: err instanceof Error ? err.message : String(err),
      });
      const distLocale = path.join(distLocalesPath, `${lang}.json`);
      const publicLocale = path.join(publicLocalesPath, `${lang}.json`);
      const targetPath = existsSync(distLocale) ? distLocale : publicLocale;
      const data = LocaleStorageService.safeReadJson(targetPath, {});
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json(data);
    }
  });

  // Fail-safe handler for service worker cleanup in dev / preview environments
  app.get(["/sw.js", "/registerSW.js"], (req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(
      "self.addEventListener('install', function(e) { self.skipWaiting(); });\n" +
      "self.addEventListener('activate', function(e) { self.registration.unregister(); });\n"
    );
  });

  // Serve static assets from public/ directory
  app.use(express.static(path.join(process.cwd(), "public")));

  // Serve compiled assets from dist/assets if they exist
  if (existsSync(path.join(distPath, "assets"))) {
    app.use("/assets", express.static(path.join(distPath, "assets"), { maxAge: "1d" }));
  }

  if (await attachDevViteMiddleware(app)) {
    return;
  }


  const indexHtmlPath = path.join(distPath, "index.html");

  app.use("/locales", express.static(path.join(distPath, "locales"), { maxAge: "1h", immutable: false, setHeaders: (res) => { res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate"); } }));
  app.use("/locales", express.static(path.join(process.cwd(), "public", "locales"), { maxAge: "1h", immutable: false, setHeaders: (res) => { res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate"); } }));
  app.use("/avatars", express.static(path.join(distPath, "avatars"), { maxAge: "7d" }));
  app.use("/avatars", express.static(path.join(process.cwd(), "public", "avatars"), { maxAge: "7d" }));
  app.get(["/", "/index.html"], async (req, res) => {
    await sendOptimizedHtml(res, cachedHtmlTemplate);
  });

  app.use(
    express.static(distPath, {
      index: false,
      maxAge: 0,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.includes("/locales/")) {
          res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
        }
      },
    })
  );

  try {
    if (existsSync(indexHtmlPath)) {
      const content = await fsPromises.readFile(indexHtmlPath, "utf-8");
      if (validateProductionHtmlTemplate(content, distPath)) {
        cachedHtmlTemplate = content;
        isStaticBuildValid = true;
      } else {
        safeLogger.error("[CRITICAL BUILD ERROR] dist/index.html failed production structural/asset verification");
        isStaticBuildValid = false;
      }
    } else {
      safeLogger.error("[CRITICAL BUILD ERROR] dist/index.html does not exist in production build");
      isStaticBuildValid = false;
    }
  } catch (e: unknown) {
    safeLogger.error("[CRITICAL BUILD ERROR] index.html loading failed from distPath", { err: e instanceof Error ? e.message : String(e) });
    isStaticBuildValid = false;
  }

  const sendOptimizedHtml = async (res: Response, htmlContent: string) => {
    let content = htmlContent;
    if (!content || content.trim() === "") {
      if (isStaticBuildValid && cachedHtmlTemplate) {
        content = cachedHtmlTemplate;
      } else {
        try {
          const directHtmlPath = existsSync(path.join(distPath, "index.html"))
            ? path.join(distPath, "index.html")
            : existsSync(path.join(process.cwd(), "build", "index.html"))
            ? path.join(process.cwd(), "build", "index.html")
            : path.join(process.cwd(), "index.html");
          if (existsSync(directHtmlPath)) {
            content = await fsPromises.readFile(directHtmlPath, "utf-8");
            cachedHtmlTemplate = content;
            isStaticBuildValid = true;
          }
        } catch {
          // ignore
        }
      }
    }

    const nonce = res.locals.cspNonce || "";

    if (!content || content.trim() === "") {
      safeLogger.error("[CRITICAL ALERT] Serving HTTP 500 because frontend static assets are missing or corrupted");
      res.status(500).setHeader("Content-Type", "text/html; charset=utf-8");
      let errorPage = '<!doctype html><html lang="fr"><head><meta charset="UTF-8"><title>500 - Service Indisponible</title></head><body><div style="font-family:sans-serif;text-align:center;padding:50px;"><h1>500 - Service Indisponible</h1><p>Les ressources de la plateforme sont indisponibles. Veuillez réessayer ultérieurement.</p></div></body></html>';
      if (nonce) {
        errorPage = injectNonceToHtml(errorPage, nonce);
      }
      res.send(errorPage);
      return;
    }

    if (nonce) {
      content = injectNonceToHtml(content, nonce);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(content);
  };

  app.get("/", async (req, res) => {
    await sendOptimizedHtml(res, cachedHtmlTemplate);
  });

  app.get("/product/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await getProductSeoData(productId);
      let html = cachedHtmlTemplate || "";

      if (product) {
        html = injectProductSeo(html, product);
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
      }
      await sendOptimizedHtml(res, html);
    } catch (err: unknown) {
      safeLogger.error("Erreur SSR Produit", { err: err instanceof Error ? err.message : String(err) });
      await sendOptimizedHtml(res, cachedHtmlTemplate);
    }
  });

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/api-docs") || req.path.startsWith("/locales")) {
      return res.status(404).json({ error: `Ressource introuvable: ${req.method} ${req.path}` });
    }
    const ext = path.extname(req.path);
    if (ext && ext !== ".html") {
      return res.status(404).end();
    }
    return sendOptimizedHtml(res, cachedHtmlTemplate);
  });
}

