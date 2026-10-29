import { Router, Response } from "express";
import { AuthenticatedRequest, authenticateToken } from "../../middlewares/auth";
import { SAFE_RESOURCE_ID_REGEX } from "../../middlewares/validation";
import {
  CreateNegotiationSchema,
  ResolveNegotiationSchema,
} from "../../schemas/messaging";
import { NegotiationService } from "./services/NegotiationService";
import { PushNotificationService } from "../notifications/services/PushNotificationService";
import { safeLogger } from "../../utils/logger";

const negotiationRouter = Router();

/**
 * POST /api/v1/messaging/conversations/:id/negotiate
 * Create a new negotiation offer
 */
negotiationRouter.post("/conversations/:id/negotiate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const conversationId = req.params.id;
    if (!conversationId || !SAFE_RESOURCE_ID_REGEX.test(conversationId.trim())) {
      return res.status(400).json({ error: "Identifiant de conversation invalide" });
    }

    const parsed = CreateNegotiationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Offre de négociation invalide", details: parsed.error.issues });
    }

    const offer = await NegotiationService.createOffer({
      callerUid,
      conversationId: conversationId.trim(),
      amountDZD: parsed.data.amountDZD,
      terms: parsed.data.terms,
    });

    return res.status(201).json({ success: true, data: offer });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg === "CONVERSATION_NOT_FOUND") return res.status(404).json({ error: "Conversation introuvable." });
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant." });
    if (errorMsg === "ACTIVE_OFFER_ALREADY_EXISTS") return res.status(400).json({ error: "Une offre de négociation est déjà active sur cette conversation." });
    if (errorMsg === "CONVERSATION_BLOCKED" || errorMsg === "CONVERSATION_ARCHIVED") {
      return res.status(400).json({ error: "Négociation impossible dans une conversation bloquée ou archivée." });
    }
    safeLogger.error("[NegotiationRoutes] createOffer failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors de la création de l'offre de négociation." });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/negotiate/resolve
 * Resolve or counter an active negotiation offer
 */
negotiationRouter.post("/conversations/:id/negotiate/resolve", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const conversationId = req.params.id;
    if (!conversationId || !SAFE_RESOURCE_ID_REGEX.test(conversationId.trim())) {
      return res.status(400).json({ error: "Identifiant de conversation invalide" });
    }

    const parsed = ResolveNegotiationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Résolution d'offre invalide", details: parsed.error.issues });
    }

    const offer = await NegotiationService.resolveOffer({
      callerUid,
      conversationId: conversationId.trim(),
      payload: parsed.data,
    });

    return res.status(200).json({ success: true, data: offer });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg === "CONVERSATION_NOT_FOUND" || errorMsg === "OFFER_NOT_FOUND_OR_MISMATCH") {
      return res.status(404).json({ error: "Offre ou conversation introuvable." });
    }
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT" || errorMsg === "UNAUTHORIZED_OFFER_RESOLUTION") {
      return res.status(403).json({ error: "Action non autorisée : seul le destinataire de l'offre peut y répondre." });
    }
    if (errorMsg === "OFFER_EXPIRED") return res.status(400).json({ error: "Cette offre a expiré." });
    if (errorMsg.startsWith("CANNOT_TRANSITION_FROM_")) {
      return res.status(400).json({ error: "Transition d'état impossible pour cette offre." });
    }
    safeLogger.error("[NegotiationRoutes] resolveOffer failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors de la résolution de l'offre." });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/negotiate/cancel
 * Cancel a pending offer by the proposer
 */
negotiationRouter.post("/conversations/:id/negotiate/cancel", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const conversationId = req.params.id;
    const offerId = req.body?.offerId;
    if (
      !conversationId || !SAFE_RESOURCE_ID_REGEX.test(conversationId.trim()) ||
      typeof offerId !== "string" || !SAFE_RESOURCE_ID_REGEX.test(offerId.trim())
    ) {
      return res.status(400).json({ error: "Identifiants de conversation et d'offre invalides ou requis" });
    }

    const offer = await NegotiationService.cancelOffer(callerUid, conversationId.trim(), offerId.trim());
    return res.status(200).json({ success: true, data: offer });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg === "CONVERSATION_NOT_FOUND" || errorMsg === "OFFER_NOT_FOUND_OR_MISMATCH") {
      return res.status(404).json({ error: "Offre ou conversation introuvable." });
    }
    if (errorMsg === "UNAUTHORIZED_OFFER_CANCELLATION") {
      return res.status(403).json({ error: "Seul l'émetteur de l'offre peut l'annuler." });
    }
    safeLogger.error("[NegotiationRoutes] cancelOffer failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors de l'annulation de l'offre." });
  }
});

/**
 * POST /api/v1/messaging/push-token
 * Register or update an FCM push token for the authenticated user
 */
negotiationRouter.post("/push-token", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const { token, deviceType } = req.body || {};
    if (!token || typeof token !== "string" || !token.trim() || token.trim().length > 1024) {
      return res.status(400).json({ error: "Jeton PUSH FCM invalide" });
    }

    await PushNotificationService.registerPushToken(callerUid, token.trim(), deviceType);
    return res.status(200).json({ success: true, message: "Jeton PUSH enregistré avec succès." });
  } catch (err: unknown) {
    safeLogger.error("[NegotiationRoutes] registerPushToken failed", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Erreur interne lors de l'enregistrement du jeton PUSH." });
  }
});

/**
 * DELETE /api/v1/messaging/push-token
 * Unregister an FCM push token for the authenticated user
 */
negotiationRouter.delete("/push-token", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const { token } = req.body || {};
    if (!token || typeof token !== "string" || !token.trim() || token.trim().length > 1024) {
      return res.status(400).json({ error: "Jeton PUSH FCM invalide" });
    }

    await PushNotificationService.unregisterPushToken(callerUid, token.trim());
    return res.status(200).json({ success: true, message: "Jeton PUSH supprimé avec succès." });
  } catch (err: unknown) {
    safeLogger.error("[NegotiationRoutes] unregisterPushToken failed", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Erreur interne lors de la suppression du jeton PUSH." });
  }
});

export default negotiationRouter;
