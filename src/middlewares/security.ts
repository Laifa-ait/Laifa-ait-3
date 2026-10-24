import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import { safeLogger } from "../utils/logger";

function getParsedAllowedOrigins(): string[] {
  const list = ["https://olmart.dz", "https://www.olmart.dz"];
  const canonicalDomain = process.env.CANONICAL_DOMAIN;
  if (canonicalDomain) {
    const clean = canonicalDomain.replace(/^https?:\/\//, "").trim();
    if (clean) {
      list.push(`https://${clean}`, `https://www.${clean}`);
    }
  }
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    envOrigins.split(",").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) list.push(trimmed);
    });
  }
  return list;
}

function isAllowedPreviewOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    const isGoogleOrCloudRun =
      hostname === "ai.studio" ||
      hostname === "aistudio.google.com" ||
      hostname.endsWith(".ai.studio") ||
      hostname.endsWith(".aistudio.google.com") ||
      hostname === "google.com" ||
      hostname.endsWith(".google.com") ||
      hostname.endsWith(".run.app") ||
      hostname.endsWith(".googleusercontent.com");

    if (isGoogleOrCloudRun && (url.protocol === "https:" || url.protocol === "http:")) {
      return true;
    }

    if (process.env.NODE_ENV === "production") {
      return false;
    }

    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    return isLocal && (url.protocol === "https:" || url.protocol === "http:");
  } catch {
    return false;
  }
}

export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = getParsedAllowedOrigins();
    if (allowedOrigins.includes(origin) || isAllowedPreviewOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "X-XSRF-Token",
    "csrf-token",
  ],
};

export const corsMiddleware = cors(corsOptions);

export function preventDirectCloudRunAccess(req: Request, res: Response, next: NextFunction) {
  const enforceCanonical = process.env.ENFORCE_CANONICAL_DOMAIN === "true";
  const canonicalDomain = process.env.CANONICAL_DOMAIN;

  if (enforceCanonical && canonicalDomain) {
    if (
      req.path === "/health" ||
      req.path.startsWith("/health/") ||
      req.path.startsWith("/api/health") ||
      req.path.startsWith("/api/v1/health")
    ) {
      return next();
    }
    const host = (req.headers.host || "").toLowerCase();
    const cleanCanonical = canonicalDomain.replace(/^https?:\/\//, "").trim().toLowerCase();
    const isCanonicalHost = host === cleanCanonical || host === `www.${cleanCanonical}`;

    if (!isCanonicalHost) {
      safeLogger.warn("[Olmart Security] ⚠️ Redirecting non-canonical host to canonical domain", {
        host,
        canonicalDomain: cleanCanonical,
      });
      if (req.method === "GET" && !req.path.startsWith("/api/")) {
        return res.redirect(301, `https://${cleanCanonical}${req.originalUrl}`);
      }
      return res.status(403).json({
        success: false,
        error: `L'accès direct via ${host} n'est pas autorisé. Veuillez utiliser https://${cleanCanonical}`,
      });
    }
  }
  next();
}

export function nonceMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
}

export function injectNonceToHtml(html: string, nonce: string): string {
  if (!nonce) return html;
  return html
    .replace(/%%CSP_NONCE%%/g, nonce)
    .replace(/<script\b([^>]*)>/gi, (match, attrs) => {
      if (attrs.includes("nonce=") || attrs.includes("src=")) {
        return match;
      }
      return `<script nonce="${nonce}"${attrs}>`;
    });
}

const sharedFrameAncestors = [
  "'self'",
  "https://olmart.dz",
  "https://www.olmart.dz",
  "https://*.google.com",
  "https://*.aistudio.google.com",
  "https://aistudio.google.com",
  "https://*.google.dev",
  "https://google.dev",
  "https://*.ai.studio",
  "https://ai.studio",
  "https://*.googleusercontent.com",
];

const sharedScriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "blob:",
  "https://apis.google.com",
  "https://maps.googleapis.com",
  "https://*.googleapis.com",
  "https://www.gstatic.com",
  "https://*.gstatic.com",
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://cdn.jsdelivr.net",
];

const sharedConnectSrc = [
  "'self'",
  "https://olmart.dz",
  "https://www.olmart.dz",
  "https://*.googleapis.com",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://*.gstatic.com",
  "https://*.firebaseio.com",
  "https://*.firebase.com",
  "https://*.ai.studio",
  "https://*.google.com",
  "https://*.clients6.google.com",
  "https://*.google-analytics.com",
  "wss://*.firebaseio.com",
  "wss:",
  "ws:",
];

const helmetProd = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: sharedScriptSrc,
      scriptSrcElem: sharedScriptSrc,
      workerSrc: ["'self'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:", "https://cdn.jsdelivr.net"],
      imgSrc: ["*", "data:", "blob:"],
      connectSrc: sharedConnectSrc,
      frameSrc: ["'self'", "https://*.firebaseapp.com", "https://*.google.com", "https://apis.google.com"],
      frameAncestors: sharedFrameAncestors,
      objectSrc: ["'none'"],
      reportUri: "/api/v1/csp-report",
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  xFrameOptions: false,
  noSniff: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
});

const helmetDev = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [...sharedScriptSrc, "'unsafe-eval'"],
      scriptSrcElem: [...sharedScriptSrc, "'unsafe-eval'"],
      workerSrc: ["'self'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:", "https://cdn.jsdelivr.net"],
      imgSrc: ["*", "data:", "blob:"],
      connectSrc: sharedConnectSrc,
      frameSrc: ["'self'", "https://*.firebaseapp.com", "https://*.google.com", "https://apis.google.com"],
      frameAncestors: [...sharedFrameAncestors, "http://localhost:*", "http://127.0.0.1:*"],
      objectSrc: ["'none'"],
      reportUri: "/api/v1/csp-report",
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  xFrameOptions: false,
  noSniff: true,
});

export function helmetMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "production") {
    return helmetProd(req, res, next);
  }
  return helmetDev(req, res, next);
}
