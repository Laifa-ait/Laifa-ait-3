import crypto from "crypto";
import type { StoreConfig } from "../domains/seller/customPage.types";

const DANGEROUS_OBJECT_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "isAdmin",
  "customClaims",
  "permissions",
  "sellerTrustScore",
  "trustScore",
  "kycStatus",
  "twoFactorSecret",
]);

const XSS_DANGEROUS_PATTERNS =
  /<\s*\/?\s*(script|iframe|object|embed|applet|meta|link|style|base|form|svg|foreignobject)\b|on[a-z]{2,}\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|xlink:href\s*=\s*["']?\s*javascript:/gi;

const SVG_POISON_PATTERNS =
  /<\s*script\b|onload\s*=|onerror\s*=|onclick\s*=|onmouseover\s*=|foreignobject|javascript\s*:|vbscript\s*:/i;

const SAFE_CSS_POSITION_REGEX = /^[0-9a-zA-Z%\s.-]{1,40}$/;
const SAFE_PIXEL_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

const ALLOWED_ANALYTICS_EVENTS = new Set([
  "store_view",
  "product_view",
  "product_click",
  "add_to_cart",
  "checkout_start",
  "whatsapp_click",
  "share_store",
  "category_view",
]);

/** Supprime récursivement les clés de Prototype Pollution et les vecteurs XSS. */
export function sanitizeStudioPayloadDeep<T>(input: T, depth = 0): T {
  if (depth > 12 || input === null || input === undefined) return input;

  if (typeof input === "string") {
    return sanitizeStudioText(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.slice(0, 150).map((item) => sanitizeStudioPayloadDeep(item, depth + 1)) as unknown as T;
  }

  if (typeof input === "object") {
    const cleanObj: Record<string, unknown> = Object.create(null);
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (DANGEROUS_OBJECT_KEYS.has(key) || key.startsWith("__") || key.startsWith("$")) {
        continue;
      }
      cleanObj[key] = sanitizeStudioPayloadDeep(value, depth + 1);
    }
    return { ...cleanObj } as T;
  }

  return input;
}

function stripControlChars(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code !== 0) out += raw[i];
  }
  return out;
}

function stripAsciiControlsAndWhitespace(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code > 32 && code !== 127) out += raw[i];
  }
  return out;
}

/**
 * Nettoie un texte libre du Studio contre l'injection de balises <script>, <iframe>,
 * gestionnaires d'événements inline (onerror=, onload=) et URIs javascript:/vbscript:.
 */
export function sanitizeStudioText(raw: string): string {
  if (typeof raw !== "string") return "";
  return stripControlChars(raw).replace(XSS_DANGEROUS_PATTERNS, "");
}

/**
 * Vérifie qu'une URL de média ou de redirection est strictement sûre :
 * - Refuse javascript:, vbscript:, data:text/html, file:, blob: externes
 * - Inspecte les data:image/svg+xml pour bloquer tout script ou attribut on*
 */
export function isSafeStudioUrl(rawUrl: string): boolean {
  if (typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;

  const decoded = (() => {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  })();

  const lower = stripAsciiControlsAndWhitespace(decoded.toLowerCase());
  if (
    lower.includes("javascript:") ||
    lower.includes("vbscript:") ||
    lower.includes("data:text/") ||
    lower.includes("data:application/")
  ) {
    return false;
  }

  if (trimmed.startsWith("#")) {
    return !SVG_POISON_PATTERNS.test(decoded);
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return !SVG_POISON_PATTERNS.test(decoded);
  }

  if (lower.startsWith("data:image/")) {
    if (lower.startsWith("data:image/svg+xml")) {
      if (lower.includes(";base64,")) {
        try {
          const b64 = trimmed.split(";base64,")[1] || "";
          const svgContent = Buffer.from(b64, "base64").toString("utf8");
          if (SVG_POISON_PATTERNS.test(svgContent)) return false;
        } catch {
          return false;
        }
      }
      return !SVG_POISON_PATTERNS.test(decoded);
    }
    return /^data:image\/(png|jpeg|jpg|webp|gif|avif);/i.test(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Nettoie une valeur de positionnement CSS (object-position / background-position)
 * pour empêcher toute évasion de propriété CSS (; background-image: url(...)).
 */
export function sanitizeCssPositionValue(raw?: string, fallback = "50% 50%"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!SAFE_CSS_POSITION_REGEX.test(trimmed) || /[:;{}()<>\\]/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

/**
 * Nettoie un identifiant de Pixel Marketing (Meta, TikTok, GA4) pour empêcher toute injection.
 */
export function sanitizePixelId(raw?: string): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return SAFE_PIXEL_ID_REGEX.test(trimmed) ? trimmed : undefined;
}

/**
 * Supprime les secrets (passwordProtectionCode, storefrontPassword) et les pages brouillons
 * avant d'exposer StoreConfig sur les endpoints publics (/api/v1/public/stores/*).
 */
export function redactStoreConfigForPublic(config: StoreConfig): StoreConfig & {
  storeStatus?: {
    mode: "open" | "vacation" | "password";
    vacationMessage?: string;
    isPasswordProtected?: boolean;
  };
} {
  const rawStatus = config.storeStatus;
  const hasPassword = Boolean(
    (rawStatus?.passwordProtectionCode && rawStatus.passwordProtectionCode.trim()) ||
      (rawStatus?.storefrontPassword && rawStatus.storefrontPassword.trim())
  );

  const publishedCustomPages = Array.isArray(config.customPages)
    ? config.customPages.filter((cp) => cp.isPublished !== false)
    : undefined;

  return {
    ...config,
    customPages: publishedCustomPages,
    storeStatus: rawStatus
      ? {
          mode: rawStatus.mode || "open",
          vacationMessage: rawStatus.vacationMessage,
          isPasswordProtected: hasPassword,
        }
      : { mode: "open", isPasswordProtected: false },
  };
}

/**
 * Vérifie en temps constant (Anti-Timing Attack) le code d'accès VIP d'une boutique en mode Pré-lancement.
 */
export function verifyStorePrelaunchPassword(
  storedConfig: StoreConfig,
  candidateCode: string
): boolean {
  const secret =
    storedConfig.storeStatus?.passwordProtectionCode?.trim() ||
    storedConfig.storeStatus?.storefrontPassword?.trim() ||
    "";
  const candidate = (candidateCode || "").trim();
  if (!secret || !candidate) return false;

  const secretHash = crypto.createHash("sha256").update(secret, "utf8").digest();
  const candidateHash = crypto.createHash("sha256").update(candidate, "utf8").digest();
  return crypto.timingSafeEqual(secretHash, candidateHash);
}

/**
 * Valide et borne un événement analytique public pour bloquer l'injection de clés ou le flooding.
 */
export function sanitizeTrackEventPayload(body: Record<string, unknown>): {
  valid: boolean;
  eventType: string;
  productId?: string;
  source: string;
} {
  const rawEvent = typeof body?.eventType === "string" ? body.eventType.trim() : "";
  if (!ALLOWED_ANALYTICS_EVENTS.has(rawEvent)) {
    return { valid: false, eventType: "", source: "direct" };
  }
  const productId =
    typeof body?.productId === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(body.productId.trim())
      ? body.productId.trim()
      : undefined;
  const rawSource = typeof body?.source === "string" ? body.source.trim() : "direct";
  const source = /^[a-zA-Z0-9_.-]{1,40}$/.test(rawSource) ? rawSource : "direct";
  return { valid: true, eventType: rawEvent, productId, source };
}
