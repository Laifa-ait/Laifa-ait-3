import express, { Express, Response } from "express";
import path from "path";
import { promises as fsPromises, existsSync, statSync, readdirSync } from "fs";
import { getProductSeoData, injectProductSeo } from "./ProductSeoService";
import { injectNonceToHtml } from "../middlewares/security";
import { safeLogger } from "../utils/logger";
import { LocaleStorageService } from "./LocaleStorageService";
import { attachDevViteMiddleware } from "./devViteMiddleware";
import { validateProductionHtmlTemplate } from "./htmlValidationService";

export { validateProductionHtmlTemplate };

let cachedHtmlTemplate = "";
let cachedHtmlMtimeMs = 0;
let isStaticBuildValid = false;
let isTestOverrideActive = false;

/**
 * Resets or overrides static state for testing purposes only.
 */
export function setStaticStateForTesting(valid: boolean, template: string): void {
  isStaticBuildValid = valid;
  cachedHtmlTemplate = template;
  isTestOverrideActive = true;
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

async function getFreshHtmlTemplate(distPath: string): Promise<string> {
  if (isTestOverrideActive && process.env.NODE_ENV === "test") {
    return cachedHtmlTemplate;
  }
  const indexHtmlPath = path.join(distPath, "index.html");
  try {
    if (existsSync(indexHtmlPath)) {
      const stat = statSync(indexHtmlPath);
      if (!cachedHtmlTemplate || stat.mtimeMs !== cachedHtmlMtimeMs) {
        const content = await fsPromises.readFile(indexHtmlPath, "utf-8");
        if (validateProductionHtmlTemplate(content, distPath)) {
          cachedHtmlTemplate = content;
          cachedHtmlMtimeMs = stat.mtimeMs;
          isStaticBuildValid = true;
        }
      }
    }
  } catch {
    // Keep last known valid template if concurrent build is writing index.html
  }
  return cachedHtmlTemplate;
}

const SW_UNREGISTER_SCRIPT =
  "self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>self.registration.unregister()).then(()=>self.clients.matchAll({type:'window'})).then(cs=>cs.forEach(c=>{if(c.url&&'navigate'in c)c.navigate(c.url);})));});\n";
const REGISTER_SW_CLEANUP_SCRIPT =
  "if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>{if(!r.active||!r.active.scriptURL.includes('firebase-messaging-sw.js'))r.unregister();})).catch(()=>{});}\n";

export async function setupViteAndStaticServing(app: Express): Promise<void> {
  const distPath = existsSync(path.join(process.cwd(), "dist"))
    ? path.join(process.cwd(), "dist")
    : path.join(process.cwd(), "build");
  const publicLocalesPath = path.join(process.cwd(), "public", "locales");
  const distLocalesPath = path.join(distPath, "locales");

  app.get("/locales/:lang.json", async (req, res) => {
    const rawLang = req.params.lang || "fr";
    const lang = rawLang.split("-")[0].toLowerCase();
    if (!["fr", "ar", "en"].includes(lang)) {
      return res.status(404).json({ error: `Langue non supportée: ${rawLang}` });
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
      const data = LocaleStorageService.safeReadJson(existsSync(distLocale) ? distLocale : publicLocale, {});
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json(data);
    }
  });

  app.get("/sw.js", (_req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(SW_UNREGISTER_SCRIPT);
  });

  app.get("/registerSW.js", (_req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(REGISTER_SW_CLEANUP_SCRIPT);
  });

  app.use(express.static(path.join(process.cwd(), "public")));
  const assetsDir = path.join(distPath, "assets");
  app.use("/assets", express.static(assetsDir, { maxAge: "1h" }));

  app.get("/assets/:filename", (req, res, next) => {
    try {
      const requested = path.basename(req.params.filename || "");
      const exactPath = path.join(assetsDir, requested);
      if (existsSync(exactPath)) return res.sendFile(exactPath);

      const match = requested.match(/^(.+)-[A-Za-z0-9_-]{6,12}\.(js|css)$/);
      if (match && existsSync(assetsDir)) {
        const [, prefix, ext] = match;
        const replacement = readdirSync(assetsDir).find(
          (f) => f.startsWith(`${prefix}-`) && f.endsWith(`.${ext}`) && !f.endsWith(".map")
        );
        if (replacement) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          return res.sendFile(path.join(assetsDir, replacement));
        }
      }
    } catch {
      // fall through
    }
    return next();
  });

  if (await attachDevViteMiddleware(app)) return;

  const indexHtmlPath = path.join(distPath, "index.html");
  app.use("/locales", express.static(distLocalesPath, { maxAge: "1h", immutable: false, setHeaders: (res) => { res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate"); } }));
  app.use("/locales", express.static(publicLocalesPath, { maxAge: "1h", immutable: false, setHeaders: (res) => { res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate"); } }));
  app.use("/avatars", express.static(path.join(distPath, "avatars"), { maxAge: "7d" }));
  app.use("/avatars", express.static(path.join(process.cwd(), "public", "avatars"), { maxAge: "7d" }));

  try {
    if (existsSync(indexHtmlPath)) {
      const stat = statSync(indexHtmlPath);
      const content = await fsPromises.readFile(indexHtmlPath, "utf-8");
      if (validateProductionHtmlTemplate(content, distPath)) {
        cachedHtmlTemplate = content;
        cachedHtmlMtimeMs = stat.mtimeMs;
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

  const sendOptimizedHtml = async (res: Response, customHtmlContent?: string) => {
    let content = customHtmlContent || (await getFreshHtmlTemplate(distPath));
    if (!content || content.trim() === "") {
      for (const candidate of [
        path.join(distPath, "index.html"),
        path.join(process.cwd(), "build", "index.html"),
        path.join(process.cwd(), "index.html"),
      ]) {
        try {
          if (existsSync(candidate)) {
            content = await fsPromises.readFile(candidate, "utf-8");
            cachedHtmlTemplate = content;
            isStaticBuildValid = true;
            break;
          }
        } catch {
          // try next candidate
        }
      }
    }

    const nonce = res.locals.cspNonce || "";
    if (!content || content.trim() === "") {
      safeLogger.error("[CRITICAL ALERT] Serving HTTP 500 because frontend static assets are missing or corrupted");
      res.status(500).setHeader("Content-Type", "text/html; charset=utf-8");
      let errorPage = '<!doctype html><html lang="fr"><head><meta charset="UTF-8"><title>500 - Service Indisponible</title></head><body><div style="font-family:sans-serif;text-align:center;padding:50px;"><h1>500 - Service Indisponible</h1><p>Les ressources de la plateforme sont indisponibles. Veuillez réessayer ultérieurement.</p></div></body></html>';
      if (nonce) errorPage = injectNonceToHtml(errorPage, nonce);
      res.send(errorPage);
      return;
    }

    if (nonce) content = injectNonceToHtml(content, nonce);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(content);
  };

  app.get(["/", "/index.html"], async (_req, res) => { await sendOptimizedHtml(res); });
  app.use(express.static(distPath, {
    index: false,
    maxAge: 0,
    setHeaders: (res, filePath) => {
      res.setHeader("Cache-Control", filePath.endsWith(".html") ? "no-cache, no-store, must-revalidate" : "public, max-age=3600, must-revalidate");
    },
  }));

  app.get("/product/:id", async (req, res) => {
    try {
      const product = await getProductSeoData(req.params.id);
      let html = await getFreshHtmlTemplate(distPath);
      if (product && html) {
        html = injectProductSeo(html, product);
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
      }
      await sendOptimizedHtml(res, html);
    } catch (err: unknown) {
      safeLogger.error("Erreur SSR Produit", { err: err instanceof Error ? err.message : String(err) });
      await sendOptimizedHtml(res);
    }
  });

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/api-docs") || req.path.startsWith("/locales")) {
      return res.status(404).json({ error: `Ressource introuvable: ${req.method} ${req.path}` });
    }
    const ext = path.extname(req.path);
    if (ext && ext !== ".html") return res.status(404).end();
    return sendOptimizedHtml(res);
  });
}
