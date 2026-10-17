import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { requestContextStorage, RequestTraceContext, getRequestContext } from "../utils/requestContext";
import { safeLogger, setLogContextProvider } from "../utils/logger";

// Liaison automatique du fournisseur de contexte de trace pour les logs du serveur
setLogContextProvider(getRequestContext);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Valide strictement un identifiant fourni par le client.
 * Évite les attaques par injection d'en-têtes CRLF (CWE-113) et log injection (CWE-117).
 */
export function isValidClientId(id: string): boolean {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length < 8 || trimmed.length > 64) return false;
  return /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

/**
 * Middleware central de corrélation de requêtes (Observabilité Olmart Gateway).
 * 
 * 1. Attribue un Request ID sécurisé (serveur UUID ou client validé)
 * 2. Retourne le header standard X-Request-ID
 * 3. Propage le contexte via AsyncLocalStorage
 * 4. Calcule et enregistre la durée de traitement sans aucune requête Firestore additionnelle
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const rawClientHeader = req.headers["x-request-id"];
  let finalRequestId: string;

  if (typeof rawClientHeader === "string" && isValidClientId(rawClientHeader)) {
    finalRequestId = rawClientHeader.trim();
  } else {
    finalRequestId = randomUUID();
  }

  req.requestId = finalRequestId;
  res.setHeader("X-Request-ID", finalRequestId);

  const startTime = Date.now();
  const startHr = process.hrtime.bigint();

  const traceContext: RequestTraceContext = {
    requestId: finalRequestId,
    method: req.method,
    path: req.baseUrl ? `${req.baseUrl}${req.path}` : req.path,
    startTime,
    ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown",
  };

  // Enregistrement des métriques à la fin de la réponse HTTP
  res.once("finish", () => {
    const endHr = process.hrtime.bigint();
    const durationMs = Number(endHr - startHr) / 1_000_000;
    const statusCode = res.statusCode;

    const logData = {
      requestId: finalRequestId,
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: traceContext.ip,
    };

    if (statusCode >= 500) {
      safeLogger.error(
        `❌ [Olmart Gateway] HTTP ${req.method} ${req.path} -> ${statusCode} (${durationMs.toFixed(2)}ms)`,
        logData
      );
    } else if (statusCode >= 400) {
      safeLogger.warn(
        `⚠️ [Olmart Gateway] HTTP ${req.method} ${req.path} -> ${statusCode} (${durationMs.toFixed(2)}ms)`,
        logData
      );
    } else {
      safeLogger.info(
        `🟢 [Olmart Gateway] HTTP ${req.method} ${req.path} -> ${statusCode} (${durationMs.toFixed(2)}ms)`,
        logData
      );
    }
  });

  // Propagation du contexte asynchrone à toute la chaîne d'exécution
  requestContextStorage.run(traceContext, () => {
    next();
  });
}
