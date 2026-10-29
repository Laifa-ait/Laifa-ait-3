import { db } from "../../config/firebase-admin";
import { IReviewRepository } from "./review.repository";
import { SubmitReviewData } from "./review.types";

export class ReviewService {
  constructor(private readonly repo: IReviewRepository) {}

  async submitReview(userId: string, userName: string, data: SubmitReviewData): Promise<{ success: boolean }> {
    const { orderId, productId, rating } = data;
    if (!orderId || !productId || rating === undefined) {
      throw new Error("Missing review fields");
    }

    await this.repo.addReview(userId, userName, data);
    return { success: true };
  }

  async reportReview(reviewId: string, reason: string): Promise<{ success: boolean }> {
    if (!reviewId || !reason || typeof reason !== "string" || reason.trim().length > 500) {
      throw new Error("ID de l'avis et raison valide requis");
    }
    await this.repo.reportReview(reviewId, reason.trim());
    return { success: true };
  }

  async approveReview(reviewId: string): Promise<{ success: boolean }> {
    if (!reviewId) throw new Error("ID de l'avis requis");
    await this.repo.approveReview(reviewId);
    return { success: true };
  }

  async replyToReview(reviewId: string, sellerId: string, replyText: string, isAdmin = false): Promise<{ success: boolean }> {
    if (!reviewId || !replyText || typeof replyText !== "string" || replyText.trim().length === 0) {
      throw new Error("ID de l'avis et texte de réponse requis");
    }
    if (replyText.length > 1000) {
      throw new Error("La réponse est trop longue (maximum 1000 caractères)");
    }

    const review = await this.repo.getReview(reviewId);
    if (!review) throw new Error("Avis introuvable");

    if (!isAdmin && review.productId && db) {
      const productSnap = await db.collection("products").doc(review.productId).get();
      if (!productSnap.exists) {
        throw new Error("Produit introuvable");
      }
      const productData = productSnap.data() || {};
      const ownerId = (productData.sellerId as string) || (productData.ownerId as string) || (productData.userId as string);
      if (ownerId && ownerId !== sellerId) {
        throw new Error("Accès refusé. Vous ne pouvez répondre qu'aux avis de vos propres produits.");
      }
    }

    await this.repo.addReply(reviewId, {
      sellerId,
      text: replyText.trim(),
    });

    return { success: true };
  }

  async deleteReview(reviewId: string): Promise<{ success: boolean }> {
    if (!reviewId) throw new Error("ID de l'avis requis");
    await this.repo.deleteReview(reviewId);
    return { success: true };
  }

  async listAdminReviews(params: { status?: string; limit?: number; startAfter?: string }) {
    return this.repo.listAdminReviews(params);
  }
}
