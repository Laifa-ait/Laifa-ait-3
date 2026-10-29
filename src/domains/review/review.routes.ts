import { Router, Response } from "express";
import { authenticateToken, authorizeAdmin, authorizeSeller, AuthenticatedRequest } from "../../middlewares/auth";
import { FirebaseReviewRepository } from "./review.repository";
import { ReviewService } from "./review.service";
import { enqueueSellerVelocityCheck } from "../../utils/velocity";
import { safeLogger } from "../../utils/logger";

const router = Router();
const reviewRepo = new FirebaseReviewRepository();
const reviewService = new ReviewService(reviewRepo);

function handleReviewRouteError(res: Response, error: unknown, context: string): Response {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("introuvable")) {
    return res.status(404).json({ error: msg });
  }
  if (msg.includes("Accès refusé") || msg.includes("livraison finale")) {
    return res.status(403).json({ error: msg });
  }
  if (
    msg.includes("partie de cette commande") ||
    msg.includes("déjà évalué") ||
    msg.includes("Note") ||
    msg.includes("commentaire") ||
    msg.includes("images") ||
    msg.includes("requis") ||
    msg.includes("trop longue") ||
    msg.includes("Missing")
  ) {
    return res.status(400).json({ error: msg });
  }
  safeLogger.error(`[Review Domain] ${context}`, { err: msg });
  return res.status(500).json({ error: "Erreur interne lors du traitement de l'avis." });
}

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid || "";
    const userName = (req.user?.name as string) || req.user?.email || "Client Olma";
    const { orderId, productId, rating, comment, images } = req.body;

    const result = await reviewService.submitReview(userId, userName, {
      orderId,
      productId,
      rating,
      comment,
      images,
    });

    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "submitReview failed");
  }
});

router.get("/my-reviews", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const userReviews = await reviewRepo.findByUserId(userId);
    return res.json({ reviews: userReviews });
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "findByUserId failed");
  }
});

router.post("/report", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reviewId, reason } = req.body;
    const result = await reviewService.reportReview(reviewId, reason);
    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "reportReview failed");
  }
});

router.get("/admin", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const startAfter = req.query.startAfter as string | undefined;

    const result = await reviewService.listAdminReviews({ status, limit, startAfter });
    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "listAdminReviews failed");
  }
});

router.post("/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reviewId } = req.body;
    const result = await reviewService.approveReview(reviewId);
    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "approveReview failed");
  }
});

router.post("/:id/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewId = req.params.id;
    const result = await reviewService.approveReview(reviewId);
    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "approveReview by id failed");
  }
});

router.delete("/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewId = req.params.id;
    const result = await reviewService.deleteReview(reviewId);
    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "deleteReview failed");
  }
});

router.post("/:id/delete", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewId = req.params.id;
    const result = await reviewService.deleteReview(reviewId);
    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "deleteReview POST failed");
  }
});

router.post("/reply", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reviewId, replyText } = req.body;
    const userId = req.user?.uid || "";
    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    const result = await reviewService.replyToReview(reviewId, userId, replyText, isAdmin);

    enqueueSellerVelocityCheck(userId);
    return res.json(result);
  } catch (error: unknown) {
    return handleReviewRouteError(res, error, "replyToReview failed");
  }
});

export default router;
