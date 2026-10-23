import { admin, db } from "../config/firebase-admin";
import { Request, Response, NextFunction } from "express";
import { safeLogger } from "../utils/logger";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role?: string;
  status?: string;
  admin?: boolean;
  adminValidated?: boolean;
  capabilities?: string[];
  customClaims?: Record<string, unknown>;
  auth_time?: number;
  [key: string]: unknown;
}

export type AuthResolutionResult =
  | { status: "authenticated"; user: AuthenticatedUser; token: string }
  | { status: "anonymous"; token?: undefined }
  | { status: "error"; statusCode: number; error: string; token?: string };

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  authContext?: AuthResolutionResult;
  file?: unknown;
  files?: unknown;
}

export function extractAuthCredential(req: Request): { token: string; isCookie: boolean } | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1]?.trim();
    if (token && token !== "undefined" && token !== "null") {
      return { token, isCookie: false };
    }
  } else if (req.cookies && typeof req.cookies.admin_session === "string" && req.cookies.admin_session.trim()) {
    const token = req.cookies.admin_session.trim();
    if (token && token !== "undefined" && token !== "null") {
      return { token, isCookie: true };
    }
  }
  return undefined;
}

export function extractIdToken(req: Request): string | undefined {
  return extractAuthCredential(req)?.token;
}

interface CachedUserProfile {
  exists: boolean;
  role?: string;
  status: string;
  capabilities: string[];
  cachedAt: number;
  data?: Record<string, unknown>;
  isErrorFallback?: boolean;
}

const userProfileCache = new Map<string, CachedUserProfile>();
const PROFILE_CACHE_TTL_MS = 120 * 1000; // 2 minutes in-memory TTL
const STALE_CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour max age for Stale-While-Revalidate during DB errors

export function clearUserProfileCache(uid?: string) {
  if (uid) {
    userProfileCache.delete(uid);
  } else {
    userProfileCache.clear();
  }
}

export function getUserProfileFromCache(uid: string): Record<string, unknown> | null {
  const cached = userProfileCache.get(uid);
  if (cached && cached.data) {
    return cached.data;
  }
  return null;
}

export function setUserProfileInCache(uid: string, data: Record<string, unknown>): void {
  const existing = userProfileCache.get(uid);
  userProfileCache.set(uid, {
    exists: true,
    role: (data.role as string) || existing?.role || "buyer",
    status: (data.status as string) || existing?.status || "active",
    capabilities: Array.isArray(data.capabilities) ? (data.capabilities as string[]) : existing?.capabilities || [],
    cachedAt: Date.now(),
    data: data,
  });
}

/**
 * Resolves authentication for the incoming request once and memoizes on req.authContext.
 * Guarantees a single cryptographic token verification and single Firestore user read per request,
 * completely eliminating double-authentication bottlenecks across all API routes.
 */
export async function resolveAuthentication(req: AuthenticatedRequest): Promise<AuthResolutionResult> {
  const authCred = extractAuthCredential(req);
  const idToken = authCred?.token;

  // Return cached result if already resolved on this exact request
  if (req.authContext) {
    if (req.authContext.status === "authenticated" && req.authContext.token === idToken) {
      if (!req.user) req.user = req.authContext.user;
      return req.authContext;
    }
    if (req.authContext.status === "anonymous" && !idToken) {
      return req.authContext;
    }
    if (req.authContext.status === "error" && req.authContext.token === idToken) {
      return req.authContext;
    }
  }

  // Fast-path support for pre-authenticated test fixtures STRICTLY in test environment
  if (process.env.NODE_ENV === "test" && req.user && typeof req.user.uid === "string") {
    const result: AuthResolutionResult = {
      status: "authenticated",
      user: req.user,
      token: idToken || "test_token",
    };
    req.authContext = result;
    return result;
  }

  // Outside test environment: NEVER reuse unverified pre-existing req.user
  if (process.env.NODE_ENV !== "test") {
    req.user = undefined;
  }

  // No credentials provided -> anonymous
  if (!authCred || !idToken) {
    const result: AuthResolutionResult = { status: "anonymous" };
    req.authContext = result;
    req.user = undefined;
    return result;
  }

  try {
    let decodedToken: admin.auth.DecodedIdToken;
    if (authCred.isCookie) {
      try {
        decodedToken = await admin.auth().verifySessionCookie(idToken, true);
      } catch {
        decodedToken = await admin.auth().verifyIdToken(idToken, false);
      }
    } else {
      decodedToken = await admin.auth().verifyIdToken(idToken, false);
    }

    const tokenRole = (decodedToken.role as string) || "buyer";
    let dbRole: string | undefined = undefined;
    let dbStatus = "active";
    let dbCapabilities: string[] = [];
    let dbFetchError = false;
    let userDocExists = false;

// In-flight Promise deduplication map to coalesce concurrent requests from same user
const inFlightProfileLookups = new Map<string, Promise<{ exists: boolean; udata?: Record<string, unknown> }>>();
const ERROR_BACKOFF_MS = 60 * 1000; // 60s backoff after lookup failure to prevent hammering Firestore

    // Check in-memory short cache or read from DB
    const now = Date.now();
    const cachedProfile = userProfileCache.get(decodedToken.uid);
    let shouldFetchFromDb = true;

    if (cachedProfile) {
      const age = now - cachedProfile.cachedAt;
      if (!cachedProfile.isErrorFallback && age < PROFILE_CACHE_TTL_MS) {
        userDocExists = cachedProfile.exists;
        dbRole = cachedProfile.role;
        dbStatus = cachedProfile.status;
        dbCapabilities = cachedProfile.capabilities;
        shouldFetchFromDb = false;
      } else if (cachedProfile.isErrorFallback && age < ERROR_BACKOFF_MS) {
        // Within 60s backoff window after a DB failure: fail gracefully without hammering Firestore
        dbFetchError = true;
        shouldFetchFromDb = false;
      }
    }

    if (shouldFetchFromDb) {
      try {
        if (db) {
          // Coalesce concurrent in-flight requests for the same UID to prevent stampedes
          let lookupPromise = inFlightProfileLookups.get(decodedToken.uid);
          if (!lookupPromise) {
            lookupPromise = (async () => {
              // 1500ms timeout prevents request hanging during DB quota limits / cold-starts
              const userDoc = await Promise.race([
                db.collection("users").doc(decodedToken.uid).get(),
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error("Firestore lookup timeout (1500ms)")), 1500)
                ),
              ]);
              return {
                exists: userDoc.exists,
                udata: userDoc.exists ? (userDoc.data() as Record<string, unknown>) : undefined,
              };
            })();

            inFlightProfileLookups.set(decodedToken.uid, lookupPromise);
          }

          let lookupResult: { exists: boolean; udata?: Record<string, unknown> };
          try {
            lookupResult = await lookupPromise;
          } finally {
            inFlightProfileLookups.delete(decodedToken.uid);
          }

          if (lookupResult.exists && lookupResult.udata) {
            userDocExists = true;
            const udata = lookupResult.udata;
            dbRole = udata.role as string | undefined;
            dbStatus = (udata.status as string) || "active";
            if (Array.isArray(udata.capabilities)) {
              dbCapabilities = udata.capabilities as string[];
            }
          }

          userProfileCache.set(decodedToken.uid, {
            exists: userDocExists,
            role: dbRole,
            status: dbStatus,
            capabilities: dbCapabilities,
            cachedAt: now,
            data: lookupResult.udata ? { uid: decodedToken.uid, ...lookupResult.udata } : undefined,
            isErrorFallback: false,
          });
        } else {
          dbFetchError = true;
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        safeLogger.warn("Auth middleware: DB lookup unavailable, using resilient token claim fallback", { uid: decodedToken.uid, err: errorMsg });

        // Stale-While-Revalidate: reuse previously validated profile within 1 hour during transient DB / network failure
        if (cachedProfile && !cachedProfile.isErrorFallback && (now - cachedProfile.cachedAt) < STALE_CACHE_MAX_AGE_MS) {
          userDocExists = cachedProfile.exists;
          dbRole = cachedProfile.role;
          dbStatus = cachedProfile.status;
          dbCapabilities = cachedProfile.capabilities;
          dbFetchError = false;
        } else {
          dbFetchError = true;
          // Cache error fallback for 60s to throttle DB hammering during transient connection / quota failures
          userProfileCache.set(decodedToken.uid, {
            exists: false,
            role: tokenRole,
            status: "active",
            capabilities: [],
            cachedAt: now,
            isErrorFallback: true,
          });
        }
      }
    }

    // Authority evaluation with resilient fallback when DB is temporarily unreachable
    let effectiveRole = "buyer";

    if (tokenRole === "admin" || tokenRole === "superadmin") {
      if (dbFetchError) {
        safeLogger.warn("Auth middleware: DB unreachable, honoring cryptographic Custom Claim for admin access", {
          uid: decodedToken.uid,
          tokenRole,
        });
        effectiveRole = tokenRole;
      } else if (dbStatus === "suspended" || dbStatus === "blocked" || dbRole === "suspended" || dbRole === "blocked") {
        effectiveRole = "suspended";
      } else if (userDocExists && (dbRole === "admin" || dbRole === "superadmin")) {
        effectiveRole = tokenRole;
      } else if (userDocExists && dbRole) {
        effectiveRole = dbRole;
      } else {
        effectiveRole = tokenRole;
      }
    } else {
      if (dbStatus === "suspended" || dbStatus === "blocked" || dbRole === "suspended" || dbRole === "blocked") {
        effectiveRole = "suspended";
      } else if (dbFetchError) {
        effectiveRole = tokenRole || "buyer";
      } else if ((dbRole === "seller" || dbRole === "artisan" || dbRole === "property_owner") && dbStatus === "active") {
        effectiveRole = dbRole;
      } else {
        effectiveRole = tokenRole || "buyer";
      }
    }

    // Purge capabilities when user is suspended or blocked
    const effectiveCapabilities = effectiveRole === "suspended" ? [] : dbCapabilities;

    const authenticatedUser: AuthenticatedUser = {
      ...decodedToken,
      role: effectiveRole,
      status: dbStatus,
      capabilities: effectiveCapabilities,
      adminValidated: effectiveRole === "admin" || effectiveRole === "superadmin",
    };

    req.user = authenticatedUser;
    const result: AuthResolutionResult = {
      status: "authenticated",
      user: authenticatedUser,
      token: idToken,
    };
    req.authContext = result;
    return result;
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    const code = errObj?.code;
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Never leak raw error message e.message to client
    let clientMessage = "Jeton d'authentification invalide ou expiré.";
    if (code === "auth/id-token-revoked" || code === "auth/session-cookie-revoked" || errorMsg.includes("revoked")) {
      clientMessage = authCred?.isCookie
        ? "Session révoquée. Veuillez vous reconnecter."
        : "Jeton révoqué. Veuillez vous reconnecter.";
    } else if (code === "auth/user-disabled" || errorMsg.includes("disabled")) {
      clientMessage = "Compte utilisateur désactivé par l'administration.";
    }

    req.user = undefined;
    const result: AuthResolutionResult = {
      status: "error",
      statusCode: 401,
      error: clientMessage,
      token: idToken,
    };
    req.authContext = result;
    return result;
  }
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authResult = await resolveAuthentication(req);

  if (authResult.status === "authenticated") {
    return next();
  }

  if (authResult.status === "error") {
    return res.status(authResult.statusCode).json({ error: authResult.error });
  }

  return res.status(401).json({ error: "Authentification requise. Jeton manquant." });
};

export const optionalAuthenticateToken = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const authResult = await resolveAuthentication(req);
    if (authResult.status === "error") {
      req.user = undefined;
    }
    return next();
  } catch {
    req.authContext = { status: "anonymous" };
    req.user = undefined;
    return next();
  }
};

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superadmin") ||
    req.user.status === "suspended" ||
    req.user.status === "blocked"
  ) {
    return res.status(403).json({ error: "Accès refusé. Privilèges Administrateur requis." });
  }
  next();
};

export const authorizeSeller = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const isAdmin = (req.user?.role === "admin" || req.user?.role === "superadmin") && req.user?.status !== "suspended" && req.user?.status !== "blocked";
  const isSeller = req.user?.role === "seller" && req.user?.status === "active";

  if (!req.user || (!isAdmin && !isSeller)) {
    return res.status(403).json({ error: "Accès refusé. Privilèges Vendeur actif vérifié ou Administrateur requis." });
  }
  next();
};

export const authorizePropertyOwner = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.status === "suspended" || req.user?.status === "blocked" || req.user?.role === "suspended") {
    return res.status(403).json({ error: "Accès refusé. Compte suspendu ou bloqué." });
  }
  const hasCapability = Array.isArray(req.user?.capabilities) && req.user.capabilities.includes("property_owner");
  const isOwnerRole = req.user?.role === "property_owner" || req.user?.role === "seller" || req.user?.role === "admin" || req.user?.role === "superadmin";

  if (!req.user || (!isOwnerRole && !hasCapability)) {
    return res.status(403).json({ error: "Accès refusé. Privilèges Propriétaire Immobilier, Vendeur ou Administrateur requis." });
  }
  next();
};

export const require2FA = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  const uid = req.user.uid;
  try {
    if (!db) {
      return res.status(503).json({ error: "Service de base de données indisponible pour la vérification 2FA." });
    }

    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const has2FA = userData?.verification?.verified === true || userData?.is2FAEnabled === true;

      if (has2FA) {
        const verifiedAt = userData?.verification?.verifiedAt;
        const authTime = Number(req.user.auth_time || 0);

        if (!authTime) {
          return res.status(403).json({
            error: "MFA_REQUIRED",
            message: "Date d'authentification invalide pour cette session.",
          });
        }

        let isVerifiedForSession = false;
        if (verifiedAt) {
          const verifiedAtMillis = typeof verifiedAt.toMillis === "function"
            ? verifiedAt.toMillis()
            : typeof verifiedAt === "number"
            ? verifiedAt
            : new Date(verifiedAt).getTime();

          const authTimeMillis = authTime * 1000;
          if (verifiedAtMillis >= authTimeMillis) {
            isVerifiedForSession = true;
          }
        }

        if (!isVerifiedForSession) {
          return res.status(403).json({
            error: "MFA_REQUIRED",
            message: "Double authentification requise pour cette session.",
          });
        }
      }
    }
    next();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    safeLogger.error("require2FA middleware error", { err: errorMsg });
    return res.status(500).json({ error: `Erreur vérification 2FA: ${errorMsg}` });
  }
};
