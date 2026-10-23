import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import {
  VehicleListingStatus,
  VehicleCatalogItemDto,
  VehiclePublicDetailDto,
  VehicleSellerPrivateDto,
  VehicleContactRevealDto,
  VehicleFilterParams,
  VehicleReportInput,
} from "./auto.types";
import { z } from "zod";
import { createVehicleListingSchema, updateVehicleListingSchema } from "./auto.validation";

type CreateInput = z.infer<typeof createVehicleListingSchema>;
type UpdateInput = z.infer<typeof updateVehicleListingSchema>;

const COLLECTION_NAME = "auto_listings";
const REPORTS_COLLECTION = "auto_reports";

import {
  canTransitionStatus,
  toCatalogItemDto,
  toPublicDetailDto,
  toSellerPrivateDto,
} from "./auto.dto";

export { canTransitionStatus, toCatalogItemDto, toPublicDetailDto, toSellerPrivateDto };

export const autoService = {
  async listPublicVehicles(filters: VehicleFilterParams): Promise<{ items: VehicleCatalogItemDto[]; total: number; page: number }> {
    if (!db) return { items: [], total: 0, page: 1 };
    try {
      let query = db.collection(COLLECTION_NAME).where("status", "==", "active").where("deletedAt", "==", null);

      if (filters.brand) query = query.where("brand", "==", filters.brand);
      if (filters.fuel) query = query.where("fuel", "==", filters.fuel);
      if (filters.wilayaId) query = query.where("wilayaId", "==", filters.wilayaId);
      if (filters.paperStatus) query = query.where("paperStatus", "==", filters.paperStatus);

      const snapshot = await query.limit(filters.limit || 20).get();
      const items = snapshot.docs.map((doc) => toCatalogItemDto(doc.id, doc.data()));
      return { items, total: items.length, page: filters.page || 1 };
    } catch (err: unknown) {
      safeLogger.warn("[AutoService] listPublicVehicles query fallback", {
        err: err instanceof Error ? err.message : String(err),
      });
      return { items: [], total: 0, page: filters.page || 1 };
    }
  },

  async getPublicVehicleById(id: string): Promise<VehiclePublicDetailDto | null> {
    if (!db) return null;
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data || data.deletedAt != null || data.status !== "active") return null;

    doc.ref.update({ viewCount: (data.viewCount || 0) + 1 }).catch(() => {});
    return toPublicDetailDto(doc.id, data);
  },

  async createVehicle(ownerUid: string, sellerDisplayName: string, input: CreateInput): Promise<{ id: string; status: VehicleListingStatus }> {
    if (!db) throw new Error("Base de données indisponible");
    const initialStatus: VehicleListingStatus = input.submitForReview ? "pending_review" : "draft";
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const record = {
      ...input,
      ownerUid,
      sellerDisplayName,
      status: initialStatus,
      viewCount: 0,
      favoriteCount: 0,
      isSellerVerified: false,
      isListingModerated: false,
      isVehicleInspected: false,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      deletedAt: null,
    };

    const docRef = await db.collection(COLLECTION_NAME).add(record);
    safeLogger.info("[Olma Auto] 🟢 Véhicule créé avec succès", { id: docRef.id, ownerUid, status: initialStatus });
    return { id: docRef.id, status: initialStatus };
  },

  async updateVehicle(id: string, requesterUid: string, isAdmin: boolean, input: UpdateInput): Promise<void> {
    if (!db) throw new Error("Base de données indisponible");
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Annonce introuvable");
    const existing = doc.data()!;

    if (!isAdmin && existing.ownerUid !== requesterUid) {
      throw new Error("ACCÈS_INTERDIT: Vous n'êtes pas propriétaire de cette annonce");
    }

    const updates: Record<string, unknown> = {
      ...input,
      updatedAt: new Date().toISOString(),
    };

    // Si modifiée substantiellement par un propriétaire, remise en vérification
    if (!isAdmin && existing.status === "active") {
      updates.status = "pending_review";
      updates.isListingModerated = false;
    }

    await docRef.update(updates);
    safeLogger.info("[Olma Auto] 📝 Annonce mise à jour", { id, requesterUid });
  },

  async transitionStatus(
    id: string,
    requesterUid: string,
    isAdmin: boolean,
    targetStatus: VehicleListingStatus,
    rejectionReason?: string
  ): Promise<void> {
    if (!db) throw new Error("Base de données indisponible");
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Annonce introuvable");
    const data = doc.data()!;
    const isOwner = data.ownerUid === requesterUid;

    const check = canTransitionStatus(data.status, targetStatus, isAdmin, isOwner);
    if (!check.allowed) {
      throw new Error(`TRANSITION_ILLÉGALE: ${check.reason}`);
    }

    const updates: Record<string, unknown> = {
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    if (targetStatus === "active") {
      updates.publishedAt = new Date().toISOString();
      updates.isListingModerated = true;
    }
    if (targetStatus === "rejected") {
      updates.rejectionReason = rejectionReason || "Non conforme aux critères de modération";
    }

    await docRef.update(updates);
    safeLogger.info("[Olma Auto] ⚡ Transition de statut effectuée", { id, from: data.status, to: targetStatus });
  },

  async revealContact(id: string, requesterUid?: string): Promise<VehicleContactRevealDto> {
    if (!db) throw new Error("Base de données indisponible");
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) throw new Error("Annonce introuvable");
    const data = doc.data()!;
    if (data.status !== "active" && data.ownerUid !== requesterUid) {
      throw new Error("Annonce inactive ou non publiée");
    }

    const rawPhone = String(data.sellerPhoneNumber || "");
    const rawWa = String(data.sellerWhatsappNumber || rawPhone);
    const cleanWaNumber = rawWa.replace(/[^0-9]/g, "").replace(/^0/, "213");
    const titleText = `${data.brand} ${data.model} (${data.year})`;
    const waText = encodeURIComponent(`Bonjour, je vous contacte depuis Olma Auto au sujet de votre annonce pour : ${titleText} (Réf #${id}).`);

    safeLogger.info("[Olma Auto] 📞 Contact dévoilé avec succès (journalisation sécurisée)");

    return {
      listingId: id,
      sellerDisplayName: String(data.sellerDisplayName || "Vendeur"),
      phoneNumber: rawPhone,
      whatsappUrl: `https://wa.me/${cleanWaNumber}?text=${waText}`,
      expiresInSeconds: 3600,
    };
  },

  async reportListing(listingId: string, reporterUid: string, input: VehicleReportInput): Promise<void> {
    if (!db) throw new Error("Base de données indisponible");
    await db.collection(REPORTS_COLLECTION).add({
      listingId,
      reporterUid,
      reason: input.reason,
      details: input.details || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    safeLogger.info("[Olma Auto] ⚠️ Signalement enregistré pour l'annonce", { listingId });
  },

  async listSellerVehicles(sellerUid: string): Promise<VehicleSellerPrivateDto[]> {
    if (!db) return [];
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("ownerUid", "==", sellerUid)
      .where("deletedAt", "==", null)
      .get();
    return snapshot.docs.map((doc) => toSellerPrivateDto(doc.id, doc.data()));
  },
};
