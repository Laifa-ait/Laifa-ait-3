import { admin, db } from "../config/firebase-admin";
import { Request, Response, NextFunction } from "express";
import { safeLogger } from "../utils/logger";
import {
  clearUserProfileCache,
  getUserProfileFromCache,
  setUserProfileInCache,
  resolveUserProfileFromCacheOrDb,
} from "./authProfileCache";

export { clearUserProfileCache, getUserProfileFromCache, setUserProfileInCache };

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

export async function resolveAuthentication(req: AuthenticatedRequest): Promise<AuthResolutionResult> {
  const authCred = extractAuthCredential(req);
  const idToken = authCred?.token;

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

  if (process.env.NODE_ENV === "test" && req.user && typeof req.user.uid === "string") {
    const result: AuthResolutionResult = {
      status: "authenticated",
      user: req.user,
      token: idToken || "test_token",
    };
    req.authContext = result;
    return result;
  }

  if (process.env.NODE_ENV !== "test") {
    req.user = undefined;
  }

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
    const { userDocExists, dbRole, dbStatus, dbCapabilities, dbFetchError } =
      await resolveUserProfileFromCacheOrDb(decodedToken.uid, tokenRole);

    let effectiveRole = "buyer";
    if (tokenRole === "admin" || tokenRole === "superadmin") {
      if (dbFetchError) {
        safeLogger.warn("Auth middleware: DB unreachable, failing closed for admin access", {
          uid: decodedToken.uid,
          tokenRole,
        });
        effectiveRole = "suspended";
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

    const authenticatedUser: AuthenticatedUser = {
      ...decodedToken,
      role: effectiveRole,
      status: effectiveRole === "suspended" ? "suspended" : dbStatus,
      capabilities: effectiveRole === "suspended" ? [] : dbCapabilities,
      adminValidated: effectiveRole === "admin" || effectiveRole === "superadmin",
    };

    req.user = authenticatedUser;
    const result: AuthResolutionResult = { status: "authenticated", user: authenticatedUser, token: idToken };
    req.authContext = result;
    return result;
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    const code = errObj?.code;
    const errorMsg = error instanceof Error ? error.message : String(error);

    let clientMessage = "Jeton d'authentification invalide ou expiré.";
    if (code === "auth/id-token-revoked" || code === "auth/session-cookie-revoked" || errorMsg.includes("revoked")) {
      clientMessage = authCred?.isCookie ? "Session révoquée. Veuillez vous reconnecter." : "Jeton révoqué. Veuillez vous reconnecter.";
    } else if (code === "auth/user-disabled" || errorMsg.includes("disabled")) {
      clientMessage = "Compte utilisateur désactivé par l'administration.";
    }

    req.user = undefined;
    const result: AuthResolutionResult = { status: "error", statusCode: 401, error: clientMessage, token: idToken };
    req.authContext = result;
    return result;
  }
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authResult = await resolveAuthentication(req);
  if (authResult.status === "authenticated") return next();
  if (authResult.status === "error") return res.status(authResult.statusCode).json({ error: authResult.error });
  return res.status(401).json({ error: "Authentification requise. Jeton manquant." });
};

export const optionalAuthenticateToken = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const authResult = await resolveAuthentication(req);
    if (authResult.status === "error") req.user = undefined;
    return next();
  } catch {
    req.authContext = { status: "anonymous" };
    req.user = undefined;
    return next();
  }
};

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin") || req.user.status === "suspended" || req.user.status === "blocked") {
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
  if (!req.user) return res.status(401).json({ error: "Authentification requise." });
  try {
    if (!db) return res.status(503).json({ error: "Service de base de données indisponible pour la vérification 2FA." });
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.verification?.verified === true || userData?.is2FAEnabled === true) {
        const verifiedAt = userData?.verification?.verifiedAt;
        const authTime = Number(req.user.auth_time || 0);
        if (!authTime) return res.status(403).json({ error: "MFA_REQUIRED", message: "Date d'authentification invalide pour cette session." });
        const verifiedAtMillis = verifiedAt
          ? typeof verifiedAt.toMillis === "function" ? verifiedAt.toMillis() : typeof verifiedAt === "number" ? verifiedAt : new Date(verifiedAt).getTime()
          : 0;
        if (verifiedAtMillis < authTime * 1000) {
          return res.status(403).json({ error: "MFA_REQUIRED", message: "Double authentification requise pour cette session." });
        }
      }
    }
    next();
  } catch (error: unknown) {
    safeLogger.error("require2FA middleware error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la vérification de la double authentification." });
  }
};
