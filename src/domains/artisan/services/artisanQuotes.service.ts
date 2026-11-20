import { admin, db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { ArtisanQuoteRequest } from "../../../types/artisan";
import { ArtisanPublicService } from "./artisanPublic.service";
import { ArtisanProfileService } from "./artisanProfile.service";

const ARTISANS_COLLECTION = "artisan_profiles";
const OFFERS_COLLECTION = "artisan_offers";
const QUOTE_REQUESTS_COLLECTION = "artisan_quote_requests";

export class ArtisanQuotesService {
  static async submitQuoteRequest(
    clientId: string,
    clientEmail: string,
    payload: {
      artisanId: string;
      offerId?: string;
      offerTitle?: string;
      offerImageUrl?: string;
      clientName: string;
      clientPhone?: string;
      tradeId: string;
      serviceTitle?: string;
      title: string;
      description: string;
      wilaya: string;
      commune: string;
      address?: string;
      urgency: "urgent" | "standard" | "flexible";
      preferredDate?: string;
      estimatedBudget?: number;
    }
  ): Promise<{ success: boolean; request?: ArtisanQuoteRequest; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const artisan = await ArtisanPublicService.getArtisanById(payload.artisanId, false);
      if (!artisan) {
        return { success: false, error: "Artisan introuvable" };
      }

      if (clientId && artisan.userId && clientId === artisan.userId) {
        return { success: false, error: "Vous ne pouvez pas vous envoyer une demande de devis à vous-même." };
      }

      const now = new Date().toISOString();
      const quoteRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc();
      const artisanRef = db.collection(ARTISANS_COLLECTION).doc(payload.artisanId);

      const newRequest: Omit<ArtisanQuoteRequest, "id"> = {
        artisanId: payload.artisanId,
        artisanUserId: artisan.userId,
        artisanName: artisan.professionalName || artisan.fullName || "Artisan Olmart",
        ...(payload.offerId ? { offerId: payload.offerId } : {}),
        ...(payload.offerTitle ? { offerTitle: payload.offerTitle.trim() } : {}),
        ...(payload.offerImageUrl ? { offerImageUrl: payload.offerImageUrl } : {}),
        clientId,
        clientName: payload.clientName.trim(),
        ...(payload.clientPhone?.trim() ? { clientPhone: payload.clientPhone.trim() } : {}),
        clientEmail: clientEmail || "",
        tradeId: payload.tradeId || artisan.tradeId,
        tradeName: artisan.tradeName,
        serviceTitle: payload.serviceTitle || payload.offerTitle || "",
        title: payload.title.trim(),
        description: payload.description.trim(),
        wilaya: payload.wilaya,
        commune: payload.commune,
        address: payload.address || "",
        urgency: payload.urgency || "standard",
        preferredDate: payload.preferredDate || "",
        status: "pending",
        ...(payload.estimatedBudget ? { estimatedBudget: Number(payload.estimatedBudget) } : {}),
        createdAt: now,
        updatedAt: now,
      };

      await db.runTransaction(async (tx) => {
        const artisanSnap = await tx.get(artisanRef);
        if (!artisanSnap.exists) {
          throw new Error("ARTISAN_NOT_FOUND");
        }

        if (payload.offerId) {
          const offerRef = db.collection(OFFERS_COLLECTION).doc(payload.offerId);
          const offerSnap = await tx.get(offerRef);
          if (offerSnap.exists) {
            tx.update(offerRef, {
              quoteRequestsCount: admin.firestore.FieldValue.increment(1),
              updatedAt: now,
            });
          }
        }

        tx.set(quoteRef, newRequest);
        tx.update(artisanRef, {
          quoteRequestsCount: admin.firestore.FieldValue.increment(1),
        });
      });

      return { success: true, request: { id: quoteRef.id, ...newRequest } };
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] submitQuoteRequest error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible d'envoyer la demande" };
    }
  }

  static async getArtisanQuoteRequests(userId: string): Promise<ArtisanQuoteRequest[]> {
    if (!db) return [];

    try {
      const profile = await ArtisanProfileService.getMyArtisanProfile(userId);
      if (!profile) return [];

      const snapshot = await db
        .collection(QUOTE_REQUESTS_COLLECTION)
        .where("artisanId", "==", profile.id)
        .limit(100)
        .get();

      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ArtisanQuoteRequest, "id">),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] getArtisanQuoteRequests error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async getClientQuoteRequests(clientId: string): Promise<ArtisanQuoteRequest[]> {
    if (!db) return [];

    try {
      const snapshot = await db
        .collection(QUOTE_REQUESTS_COLLECTION)
        .where("clientId", "==", clientId)
        .limit(60)
        .get();

      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ArtisanQuoteRequest, "id">),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] getClientQuoteRequests error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async updateQuoteRequestStatus(
    userId: string,
    requestId: string,
    status: ArtisanQuoteRequest["status"],
    extra?: {
      artisanResponse?: string;
      proposedPriceDzd?: number;
      proposedDelay?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const docRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(requestId);
      const doc = await docRef.get();
      if (!doc.exists) return { success: false, error: "Demande introuvable" };

      const request = doc.data() as ArtisanQuoteRequest;
      const profile = await ArtisanProfileService.getMyArtisanProfile(userId);
      const isArtisanOwner = Boolean(profile && request.artisanId === profile.id);
      const isClientOwner = request.clientId === userId;

      if (!isArtisanOwner && !isClientOwner) {
        return { success: false, error: "Accès refusé. Vous n'êtes pas participant de cette demande." };
      }

      if (isClientOwner && !isArtisanOwner && !["accepted", "declined", "completed"].includes(status)) {
        return { success: false, error: "Action non autorisée pour le demandeur." };
      }

      const patch: Partial<ArtisanQuoteRequest> = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (isArtisanOwner && extra) {
        if (extra.artisanResponse !== undefined) patch.artisanResponse = extra.artisanResponse.trim();
        if (extra.proposedPriceDzd !== undefined && Number(extra.proposedPriceDzd) > 0) {
          patch.proposedPriceDzd = Number(extra.proposedPriceDzd);
        }
        if (extra.proposedDelay !== undefined) patch.proposedDelay = extra.proposedDelay.trim();
      }

      await docRef.update(patch);
      return { success: true };
    } catch (error) {
      safeLogger.error("[ArtisanQuotesService] updateQuoteRequestStatus error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de mettre à jour le statut" };
    }
  }
}
