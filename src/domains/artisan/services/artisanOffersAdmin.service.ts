import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { ArtisanOffer, ArtisanOfferStatus } from "../../../types/artisanOffers";
import { invalidateArtisanOffersCache } from "./artisanOffers.service";

const OFFERS_COLLECTION = "artisan_offers";
const AUDIT_LOGS_COLLECTION = "artisan_admin_audit_logs";

export class ArtisanOffersAdminService {
  static async listAllOffers(filters?: {
    status?: ArtisanOfferStatus | "all";
    tradeId?: string;
    search?: string;
    limit?: number;
  }): Promise<ArtisanOffer[]> {
    if (!db) return [];

    try {
      const snap = await db
        .collection(OFFERS_COLLECTION)
        .limit(Math.min(filters?.limit || 120, 200))
        .get();

      let offers = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanOffer, "id">),
      }));

      if (filters?.status && filters.status !== "all") {
        offers = offers.filter((o) => o.status === filters.status);
      }

      if (filters?.tradeId) {
        offers = offers.filter((o) => o.tradeId === filters.tradeId);
      }

      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        offers = offers.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.artisanName.toLowerCase().includes(q) ||
            o.wilaya.toLowerCase().includes(q)
        );
      }

      return offers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      safeLogger.error("[ArtisanOffersAdminService] listAllOffers error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async moderateOffer(
    adminUid: string,
    adminEmail: string,
    offerId: string,
    status: ArtisanOfferStatus,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };

    const offerRef = db.collection(OFFERS_COLLECTION).doc(offerId);
    const auditRef = db.collection(AUDIT_LOGS_COLLECTION).doc();
    const now = new Date().toISOString();

    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(offerRef);
        if (!snap.exists) {
          throw new Error("OFFER_NOT_FOUND");
        }
        const offerData = snap.data() as ArtisanOffer;

        tx.update(offerRef, {
          status,
          rejectionReason: status === "rejected" ? reason || "Non conforme aux critères de publication" : "",
          updatedAt: now,
        });

        const auditAction =
          status === "active"
            ? "approve"
            : status === "rejected"
            ? "reject"
            : "suspend";

        tx.set(auditRef, {
          adminUid,
          adminEmail,
          action: auditAction,
          targetId: offerId,
          targetType: "service",
          targetName: offerData.title,
          details: `Offre "${offerData.title}" passée au statut "${status}"${reason ? ` — Motif : ${reason}` : ""}`,
          timestamp: now,
        });
      });

      invalidateArtisanOffersCache();
      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg === "OFFER_NOT_FOUND") {
        return { success: false, error: "Offre introuvable" };
      }
      safeLogger.error("[ArtisanOffersAdminService] moderateOffer error", { error: msg });
      return { success: false, error: "Impossible de modérer cette offre" };
    }
  }
}
