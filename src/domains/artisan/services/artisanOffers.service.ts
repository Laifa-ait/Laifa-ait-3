import { admin, db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import {
  ArtisanOffer,
  ArtisanOfferFilters,
  ArtisanOfferPayload,
  ArtisanOfferStatus,
} from "../../../types/artisanOffers";
import { ArtisanProfileService } from "./artisanProfile.service";

const OFFERS_COLLECTION = "artisan_offers";
const PUBLIC_CACHE_TTL_MS = 3 * 60 * 1000;

interface OffersCacheEntry {
  expiresAt: number;
  offers: ArtisanOffer[];
}

let publicOffersCache: OffersCacheEntry | null = null;

export function invalidateArtisanOffersCache(): void {
  publicOffersCache = null;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export class ArtisanOffersService {
  private static async loadActiveOffersCached(): Promise<ArtisanOffer[]> {
    if (!db) return [];
    const now = Date.now();
    if (publicOffersCache && publicOffersCache.expiresAt > now) {
      return publicOffersCache.offers;
    }

    const snap = await db
      .collection(OFFERS_COLLECTION)
      .where("status", "==", "active")
      .limit(150)
      .get();

    const offers = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ArtisanOffer, "id">),
    }));

    offers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    publicOffersCache = { expiresAt: now + PUBLIC_CACHE_TTL_MS, offers };
    return offers;
  }

  static async listPublicOffers(filters: ArtisanOfferFilters = {}): Promise<ArtisanOffer[]> {
    try {
      const allActive = await this.loadActiveOffersCached();
      let list = [...allActive];

      if (filters.tradeId) {
        const target = normalizeText(filters.tradeId);
        list = list.filter(
          (o) =>
            normalizeText(o.tradeId) === target ||
            normalizeText(o.tradeId).includes(target) ||
            normalizeText(o.tradeName).includes(target)
        );
      }

      if (filters.wilaya) {
        const targetWilaya = normalizeText(filters.wilaya);
        list = list.filter((o) => normalizeText(o.wilaya).includes(targetWilaya));
      }

      if (filters.commune) {
        const targetCommune = normalizeText(filters.commune);
        list = list.filter(
          (o) =>
            o.communes.length === 0 ||
            o.communes.some((c) => normalizeText(c).includes(targetCommune))
        );
      }

      if (filters.pricingType) {
        list = list.filter((o) => o.pricingType === filters.pricingType);
      }

      if (filters.maxPrice && filters.maxPrice > 0) {
        list = list.filter(
          (o) => o.pricingType === "sur_devis" || (o.priceDzd !== undefined && o.priceDzd <= filters.maxPrice!)
        );
      }

      if (filters.availableOnly) {
        list = list.filter((o) => o.isAvailable);
      }

      if (filters.q) {
        const query = normalizeText(filters.q);
        list = list.filter(
          (o) =>
            normalizeText(o.title).includes(query) ||
            normalizeText(o.description).includes(query) ||
            normalizeText(o.tradeName).includes(query) ||
            normalizeText(o.artisanName).includes(query) ||
            normalizeText(o.wilaya).includes(query)
        );
      }

      switch (filters.sort) {
        case "rating":
          list.sort((a, b) => b.artisanRating - a.artisanRating || b.artisanReviewCount - a.artisanReviewCount);
          break;
        case "price_asc":
          list.sort((a, b) => (a.priceDzd || Number.MAX_SAFE_INTEGER) - (b.priceDzd || Number.MAX_SAFE_INTEGER));
          break;
        case "price_desc":
          list.sort((a, b) => (b.priceDzd || 0) - (a.priceDzd || 0));
          break;
        case "recent":
          list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          break;
        default:
          list.sort((a, b) => {
            const boostDiff = (b.isSponsored ? 1 : 0) - (a.isSponsored ? 1 : 0);
            if (boostDiff !== 0) return boostDiff;
            return b.artisanRating - a.artisanRating || b.createdAt.localeCompare(a.createdAt);
          });
      }

      const maxLimit = Math.min(Math.max(1, filters.limit || 40), 100);
      return list.slice(0, maxLimit);
    } catch (error) {
      safeLogger.error("[ArtisanOffersService] listPublicOffers error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async getOfferById(offerId: string, incrementViews = false): Promise<ArtisanOffer | null> {
    if (!db) return null;
    try {
      const ref = db.collection(OFFERS_COLLECTION).doc(offerId);
      const snap = await ref.get();
      if (!snap.exists) return null;

      if (incrementViews) {
        ref
          .update({ viewsCount: admin.firestore.FieldValue.increment(1) })
          .catch(() => {});
      }

      return { id: snap.id, ...(snap.data() as Omit<ArtisanOffer, "id">) };
    } catch (error) {
      safeLogger.error("[ArtisanOffersService] getOfferById error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  static async listMyOffers(ownerUid: string): Promise<ArtisanOffer[]> {
    if (!db) return [];
    try {
      const snap = await db
        .collection(OFFERS_COLLECTION)
        .where("ownerId", "==", ownerUid)
        .limit(60)
        .get();

      const offers = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanOffer, "id">),
      }));
      return offers.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      safeLogger.error("[ArtisanOffersService] listMyOffers error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  static async createOffer(
    ownerUid: string,
    payload: ArtisanOfferPayload
  ): Promise<{ success: boolean; offer?: ArtisanOffer; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };

    const profile = await ArtisanProfileService.getMyArtisanProfile(ownerUid);
    if (!profile) {
      return { success: false, error: "Créez d'abord votre profil artisan pour publier une offre." };
    }

    const cleanImages = (payload.images || []).filter((url) => typeof url === "string" && url.trim().length > 0).slice(0, 6);
    const coverImageUrl = payload.coverImageUrl?.trim() || cleanImages[0] || "";
    const now = new Date().toISOString();

    let resolvedStatus: ArtisanOfferStatus = "pending_review";
    if (payload.status === "draft") {
      resolvedStatus = "draft";
    } else if (profile.status === "approved") {
      resolvedStatus = payload.status === "paused" ? "paused" : "active";
    }

    const docData: Omit<ArtisanOffer, "id"> = {
      artisanId: profile.id,
      ownerId: ownerUid,
      artisanName: profile.professionalName || profile.fullName,
      artisanAvatarUrl: profile.avatarUrl || undefined,
      artisanVerified: profile.status === "approved",
      artisanRating: profile.rating || 5,
      artisanReviewCount: profile.reviewCount || 0,
      artisanYearsExp: profile.yearsOfExperience || 1,
      title: payload.title.trim(),
      tradeId: payload.tradeId,
      tradeName: payload.tradeName.trim(),
      description: payload.description.trim(),
      includedItems: (payload.includedItems || []).map((item) => item.trim()).filter(Boolean).slice(0, 12),
      images: cleanImages,
      coverImageUrl,
      pricingType: payload.pricingType,
      priceDzd: payload.pricingType === "sur_devis" ? undefined : Number(payload.priceDzd || 0) || undefined,
      wilaya: payload.wilaya.trim(),
      wilayaCode: payload.wilayaCode || profile.wilayaCode || "16",
      communes: (payload.communes || []).map((c) => c.trim()).filter(Boolean).slice(0, 20),
      interventionDelay: payload.interventionDelay.trim() || "Sous 24 à 48h",
      isAvailable: payload.isAvailable ?? profile.isAvailable,
      status: resolvedStatus,
      viewsCount: 0,
      quoteRequestsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(OFFERS_COLLECTION).add(docData);
    invalidateArtisanOffersCache();
    return { success: true, offer: { id: ref.id, ...docData } };
  }

  static async updateOffer(
    ownerUid: string,
    offerId: string,
    updates: Partial<ArtisanOfferPayload>
  ): Promise<{ success: boolean; offer?: ArtisanOffer; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };

    const ref = db.collection(OFFERS_COLLECTION).doc(offerId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: "Offre introuvable" };

    const existing = snap.data() as ArtisanOffer;
    if (existing.ownerId !== ownerUid) {
      return { success: false, error: "Accès refusé : cette offre ne vous appartient pas." };
    }

    const patch: Partial<ArtisanOffer> = { updatedAt: new Date().toISOString() };
    if (updates.title !== undefined) patch.title = updates.title.trim();
    if (updates.tradeId !== undefined) patch.tradeId = updates.tradeId;
    if (updates.tradeName !== undefined) patch.tradeName = updates.tradeName.trim();
    if (updates.description !== undefined) patch.description = updates.description.trim();
    if (updates.includedItems !== undefined) {
      patch.includedItems = updates.includedItems.map((i) => i.trim()).filter(Boolean).slice(0, 12);
    }
    if (updates.images !== undefined) {
      patch.images = updates.images.filter((url) => typeof url === "string" && url.trim().length > 0).slice(0, 6);
      patch.coverImageUrl = updates.coverImageUrl?.trim() || patch.images[0] || "";
    }
    if (updates.pricingType !== undefined) {
      patch.pricingType = updates.pricingType;
      patch.priceDzd = updates.pricingType === "sur_devis" ? undefined : Number(updates.priceDzd || existing.priceDzd || 0) || undefined;
    } else if (updates.priceDzd !== undefined) {
      patch.priceDzd = Number(updates.priceDzd) || undefined;
    }
    if (updates.wilaya !== undefined) patch.wilaya = updates.wilaya.trim();
    if (updates.wilayaCode !== undefined) patch.wilayaCode = updates.wilayaCode;
    if (updates.communes !== undefined) patch.communes = updates.communes.map((c) => c.trim()).filter(Boolean).slice(0, 20);
    if (updates.interventionDelay !== undefined) patch.interventionDelay = updates.interventionDelay.trim();
    if (updates.isAvailable !== undefined) patch.isAvailable = updates.isAvailable;
    if (updates.status && ["draft", "active", "paused"].includes(updates.status)) {
      patch.status = existing.artisanVerified ? updates.status : updates.status === "draft" ? "draft" : "pending_review";
    }

    await ref.update(patch);
    invalidateArtisanOffersCache();
    return { success: true, offer: { ...existing, ...patch, id: offerId } };
  }

  static async deleteOffer(ownerUid: string, offerId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Base de données indisponible" };

    const ref = db.collection(OFFERS_COLLECTION).doc(offerId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: "Offre introuvable" };

    const existing = snap.data() as ArtisanOffer;
    if (existing.ownerId !== ownerUid) {
      return { success: false, error: "Accès refusé : cette offre ne vous appartient pas." };
    }

    await ref.delete();
    invalidateArtisanOffersCache();
    return { success: true };
  }
}
