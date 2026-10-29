import { Router, Response } from "express";
import { AuthenticatedRequest, authenticateToken } from "../../middlewares/auth";
import { chatLimiter } from "../../middlewares/rateLimiters";
import { SAFE_RESOURCE_ID_REGEX } from "../../middlewares/validation";
import {
  InitiateConversationSchema,
  ReportMessageSchema,
  SendMessageSchema,
} from "../../schemas/messaging";
import { MessagingService } from "./services/MessagingService";
import negotiationRouter from "./negotiation.routes";
import { safeLogger } from "../../utils/logger";

const router = Router();
router.use(chatLimiter);

/**
 * GET /api/v1/messaging/conversations
 * List all conversations for the authenticated user
 */
router.get("/conversations", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const before = typeof req.query.before === "string" ? req.query.before : undefined;
    const isArchived = req.query.isArchived === "true";

    const result = await MessagingService.listConversations(callerUid, { limit, before, isArchived });
    return res.status(200).json({
      success: true,
      data: result.conversations,
      hasMore: result.hasMore,
    });
  } catch (err: unknown) {
    safeLogger.error("[MessagingRoutes] listConversations failed", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Erreur interne lors de la récupération des conversations." });
  }
});

/**
 * POST /api/v1/messaging/conversations/initiate
 * Initiate a new conversation with context verification
 */
router.post("/conversations/initiate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const parsed = InitiateConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Données de conversation invalides", details: parsed.error.issues });
    }

    const result = await MessagingService.initiateConversation(callerUid, parsed.data);
    return res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (
      errorMsg === "PROPERTY_NOT_FOUND" ||
      errorMsg === "ORDER_NOT_FOUND" ||
      errorMsg === "PRODUCT_NOT_FOUND" ||
      errorMsg === "QUOTE_REQUEST_NOT_FOUND"
    ) {
      return res.status(404).json({ error: "Ressource de contexte introuvable." });
    }

    if (
      errorMsg === "SELF_CONVERSATION_FORBIDDEN" ||
      errorMsg === "FORBIDDEN_NOT_ORDER_PARTICIPANT" ||
      errorMsg === "FORBIDDEN_NOT_QUOTE_PARTICIPANT"
    ) {
      return res.status(403).json({ error: "Action non autorisée sur cette ressource." });
    }

    if (
      errorMsg === "PROPERTY_ID_REQUIRED" ||
      errorMsg === "ORDER_ID_REQUIRED" ||
      errorMsg === "PRODUCT_ID_REQUIRED" ||
      errorMsg === "QUOTE_REQUEST_ID_REQUIRED"
    ) {
      return res.status(400).json({ error: errorMsg });
    }

    safeLogger.error("[MessagingRoutes] initiateConversation failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors de l'initialisation de la conversation." });
  }
});

/**
 * GET /api/v1/messaging/conversations/:id/messages
 * List messages in a conversation
 */
router.get("/conversations/:id/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const conversationId = req.params.id;
    if (!conversationId || !SAFE_RESOURCE_ID_REGEX.test(conversationId.trim())) {
      return res.status(400).json({ error: "Identifiant de conversation invalide" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const before = typeof req.query.before === "string" ? req.query.before : undefined;
    const isAdminUser = req.user?.role === "admin" || req.user?.role === "superadmin";

    const result = await MessagingService.listMessages(callerUid, conversationId.trim(), { limit, before }, isAdminUser);
    return res.status(200).json({
      success: true,
      data: result.messages,
      hasMore: result.hasMore,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg === "CONVERSATION_NOT_FOUND") return res.status(404).json({ error: "Conversation introuvable." });
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant de cette conversation." });
    }
    safeLogger.error("[MessagingRoutes] listMessages failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors de la récupération des messages." });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/messages
 * Send a message in an existing conversation
 */
router.post("/conversations/:id/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const conversationId = req.params.id;
    if (!conversationId || !SAFE_RESOURCE_ID_REGEX.test(conversationId.trim())) {
      return res.status(400).json({ error: "Identifiant de conversation invalide" });
    }

    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Message invalide", details: parsed.error.issues });
    }

    const message = await MessagingService.sendMessage(callerUid, conversationId.trim(), parsed.data);
    return res.status(201).json({ success: true, data: message });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg === "CONVERSATION_NOT_FOUND") return res.status(404).json({ error: "Conversation introuvable." });
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant." });
    if (errorMsg === "CONVERSATION_BLOCKED" || errorMsg === "CONVERSATION_ARCHIVED") {
      return res.status(400).json({ error: "Impossible d'envoyer un message dans une conversation bloquée ou archivée." });
    }
    if (errorMsg === "INVALID_ATTACHMENT_CONVERSATION_MISMATCH") {
      return res.status(400).json({ error: "Pièce jointe invalide pour cette conversation." });
    }
    safeLogger.error("[MessagingRoutes] sendMessage failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors de l'envoi du message." });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/block
 */
router.post("/conversations/:id/block", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const conversationId = req.params.id;
    if (!conversationId || !SAFE_RESOURCE_ID_REGEX.test(conversationId.trim())) {
      return res.status(400).json({ error: "Identifiant de conversation invalide" });
    }

    await MessagingService.blockConversation(callerUid, conversationId.trim());
    return res.status(200).json({ success: true, message: "Conversation bloquée avec succès." });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg === "CONVERSATION_NOT_FOUND") return res.status(404).json({ error: "Conversation introuvable." });
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") return res.status(403).json({ error: "Accès refusé." });
    safeLogger.error("[MessagingRoutes] blockConversation failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors du blocage de la conversation." });
  }
});

/**
 * POST /api/v1/messaging/conversations/:id/read
 */
router.post("/conversations/:id/read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const conversationId = req.params.id;
    if (!conversationId || !SAFE_RESOURCE_ID_REGEX.test(conversationId.trim())) {
      return res.status(400).json({ error: "Identifiant de conversation invalide" });
    }

    await MessagingService.markConversationRead(callerUid, conversationId.trim());
    return res.status(200).json({ success: true, message: "Conversation marquée comme lue." });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg === "CONVERSATION_NOT_FOUND") return res.status(404).json({ error: "Conversation introuvable." });
    if (errorMsg === "FORBIDDEN_NOT_PARTICIPANT") return res.status(403).json({ error: "Accès refusé." });
    safeLogger.error("[MessagingRoutes] markConversationRead failed", { err: errorMsg });
    return res.status(500).json({ error: "Erreur interne lors du marquage de la conversation." });
  }
});

/**
 * POST /api/v1/messaging/messages/:id/report
 */
router.post("/messages/:id/report", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) return res.status(401).json({ error: "Authentification requise" });

    const messageId = req.params.id;
    if (!messageId || !SAFE_RESOURCE_ID_REGEX.test(messageId.trim())) {
      return res.status(400).json({ error: "Identifiant de message invalide" });
    }

    const parsed = ReportMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Signalement invalide", details: parsed.error.issues });
    }

    await MessagingService.reportMessage(callerUid, messageId.trim(), parsed.data.reason, parsed.data.description);
    return res.status(200).json({ success: true, message: "Message signalé avec succès à l'équipe de modération." });
  } catch (err: unknown) {
    safeLogger.error("[MessagingRoutes] reportMessage failed", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Erreur interne lors du signalement du message." });
  }
});

router.use(negotiationRouter);

export default router;
