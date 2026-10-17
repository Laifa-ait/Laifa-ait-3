import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import { AdminModerationListingItemDto, AdminReportItemDto } from "./autoAdmin.types";
import { canTransitionStatus } from "./auto.service";

const COLLECTION_NAME = "auto_listings";
const REPORTS_COLLECTION = "auto_reports";

export class AutoAdminService {
  async listPendingModeration(): Promise<{
    pending: AdminModerationListingItemDto[];
    rejected: AdminModerationListingItemDto[];
  }> {
    if (!db) return { pending: [], rejected: [] };

    try {
      const snap = await db.collection(COLLECTION_NAME).where("deletedAt", "==", null).get();
      const all: AdminModerationListingItemDto[] = [];

      snap.forEach((doc) => {
        const d = doc.data();
        all.push({
          id: doc.id,
          title: String(d.title || `${d.brand} ${d.model}`),
          brand: String(d.brand || ""),
          model: String(d.model || ""),
          year: Number(d.year || 0),
          mileage: Number(d.mileage || 0),
          priceDZD: Number(d.priceDZD || 0),
          priceType: d.priceType || "fixe",
          wilayaId: Number(d.wilayaId || 16),
          commune: String(d.commune || ""),
          paperStatus: d.paperStatus || "autre",
          primaryImageUrl: String(d.primaryImageUrl || d.images?.[0] || ""),
          images: Array.isArray(d.images) ? d.images : [],
          ownerUid: String(d.ownerUid || ""),
          sellerDisplayName: String(d.sellerDisplayName || "Vendeur"),
          sellerPhoneNumber: String(d.sellerPhoneNumber || ""),
          status: d.status || "pending_review",
          createdAt: String(d.createdAt || ""),
          reviewedAt: d.reviewedAt,
          reviewedBy: d.reviewedBy,
          rejectionReason: d.rejectionReason,
          isVerifiedDealer: Boolean(d.isVerifiedDealer),
        });
      });

      const pending = all.filter((l) => l.status === "pending_review");
      const rejected = all.filter((l) => l.status === "rejected");

      return { pending, rejected };
    } catch (e) {
      safeLogger.error("[AutoAdminService] listPendingModeration error", { err: String(e) });
      return { pending: [], rejected: [] };
    }
  }

  async approveListing(adminUid: string, listingId: string): Promise<void> {
    if (!db) throw new Error("Base de données indisponible");
    const docRef = db.collection(COLLECTION_NAME).doc(listingId);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) throw new Error("Annonce introuvable");
      const data = doc.data()!;

      const check = canTransitionStatus(data.status, "active", true, false);
      if (!check.allowed) {
        throw new Error(check.reason || "Transition non autorisée");
      }

      const now = new Date().toISOString();
      transaction.update(docRef, {
        status: "active",
        isListingModerated: true,
        reviewedBy: adminUid,
        reviewedAt: now,
        publishedAt: now,
        updatedAt: now,
        rejectionReason: null,
      });
    });

    safeLogger.info("[AutoAdminService] 🟢 Annonce approuvée par admin", { listingId, adminUid });
  }

  async rejectListing(adminUid: string, listingId: string, reason: string): Promise<void> {
    if (!db) throw new Error("Base de données indisponible");
    if (!reason || !reason.trim()) {
      throw new Error("Un motif de rejet explicite est obligatoire");
    }

    const docRef = db.collection(COLLECTION_NAME).doc(listingId);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) throw new Error("Annonce introuvable");
      const data = doc.data()!;

      const check = canTransitionStatus(data.status, "rejected", true, false);
      if (!check.allowed) {
        throw new Error(check.reason || "Transition non autorisée");
      }

      const now = new Date().toISOString();
      transaction.update(docRef, {
        status: "rejected",
        rejectionReason: reason.trim(),
        reviewedBy: adminUid,
        reviewedAt: now,
        updatedAt: now,
      });
    });

    safeLogger.info("[AutoAdminService] 🔴 Annonce rejetée par admin", { listingId, reason, adminUid });
  }

  async toggleVerifiedBadge(adminUid: string, listingId: string, isVerified: boolean): Promise<void> {
    if (!db) throw new Error("Base de données indisponible");
    const docRef = db.collection(COLLECTION_NAME).doc(listingId);
    await docRef.update({
      isVerifiedDealer: isVerified,
      verifiedBy: adminUid,
      updatedAt: new Date().toISOString(),
    });
    safeLogger.info("[AutoAdminService] Badge concessionnaire/véhicule vérifié mis à jour", { listingId, isVerified });
  }

  async listReports(): Promise<AdminReportItemDto[]> {
    if (!db) return [];
    try {
      const snap = await db.collection(REPORTS_COLLECTION).where("status", "==", "pending").get();
      return snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          listingId: String(d.listingId || ""),
          reporterUid: String(d.reporterUid || ""),
          reason: String(d.reason || ""),
          details: d.details ? String(d.details) : undefined,
          status: d.status || "pending",
          createdAt: String(d.createdAt || ""),
        };
      });
    } catch (e) {
      safeLogger.error("[AutoAdminService] listReports error", { err: String(e) });
      return [];
    }
  }

  async dismissReport(adminUid: string, reportId: string): Promise<void> {
    if (!db) throw new Error("Base de données indisponible");
    const docRef = db.collection(REPORTS_COLLECTION).doc(reportId);
    await docRef.update({
      status: "dismissed",
      dismissedBy: adminUid,
      dismissedAt: new Date().toISOString(),
    });
    safeLogger.info("[AutoAdminService] Signalement classé sans suite", { reportId, adminUid });
  }
}

export const autoAdminService = new AutoAdminService();
