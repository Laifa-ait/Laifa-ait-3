import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";
import {
  ArtisanOffer,
  ArtisanOfferFilters,
  ArtisanOfferPayload,
  ArtisanOfferStatus,
  OfferQuoteSubmissionPayload,
} from "../types/artisanOffers";
import { ArtisanQuoteRequest } from "../types/artisan";
import { messagingApi } from "./messagingApi";
import { invalidateClientReadCache } from "../utils/clientReadCache";

export async function fetchPublicArtisanOffers(
  filters?: ArtisanOfferFilters
): Promise<ArtisanOffer[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.q) params.set("q", filters.q);
    if (filters?.tradeId) params.set("tradeId", filters.tradeId);
    if (filters?.wilaya) params.set("wilaya", filters.wilaya);
    if (filters?.commune) params.set("commune", filters.commune);
    if (filters?.pricingType) params.set("pricingType", filters.pricingType);
    if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.availableOnly) params.set("availableOnly", "true");
    if (filters?.sort) params.set("sort", filters.sort);
    if (filters?.limit) params.set("limit", String(filters.limit));

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiGet<{ success: boolean; data: ArtisanOffer[] }>(
      `/api/v1/artisans/offers${qs}`
    );
    return res?.data || [];
  } catch {
    return [];
  }
}

export async function fetchPublicArtisanOfferById(id: string): Promise<ArtisanOffer | null> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanOffer }>(
      `/api/v1/artisans/offers/${encodeURIComponent(id)}`
    );
    return res?.data || null;
  } catch {
    return null;
  }
}

export async function fetchMyArtisanOffers(): Promise<ArtisanOffer[]> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanOffer[] }>(
      "/api/v1/artisans/me/offers"
    );
    return res?.data || [];
  } catch {
    return [];
  }
}

export async function createArtisanOffer(
  payload: ArtisanOfferPayload
): Promise<{ success: boolean; data?: ArtisanOffer; error?: string }> {
  const res = await apiPost<{ success: boolean; data?: ArtisanOffer; error?: string }>(
    "/api/v1/artisans/me/offers",
    payload
  );
  if (res.success) invalidateClientReadCache("artisans:offers");
  return res;
}

export async function updateArtisanOffer(
  offerId: string,
  payload: Partial<ArtisanOfferPayload>
): Promise<{ success: boolean; data?: ArtisanOffer; error?: string }> {
  const res = await apiPut<{ success: boolean; data?: ArtisanOffer; error?: string }>(
    `/api/v1/artisans/me/offers/${encodeURIComponent(offerId)}`,
    payload
  );
  if (res.success) invalidateClientReadCache("artisans:offers");
  return res;
}

export async function deleteArtisanOffer(
  offerId: string
): Promise<{ success: boolean; error?: string }> {
  const res = await apiDelete<{ success: boolean; error?: string }>(
    `/api/v1/artisans/me/offers/${encodeURIComponent(offerId)}`
  );
  if (res.success) invalidateClientReadCache("artisans:offers");
  return res;
}

export async function submitOfferQuoteAndOpenChat(
  payload: OfferQuoteSubmissionPayload
): Promise<{
  success: boolean;
  quote?: ArtisanQuoteRequest;
  conversationId?: string;
  error?: string;
}> {
  const quoteRes = await apiPost<{
    success: boolean;
    data?: ArtisanQuoteRequest;
    error?: string;
  }>("/api/v1/artisans/requests", {
    artisanId: payload.artisanId,
    offerId: payload.offerId,
    offerTitle: payload.offerTitle,
    offerImageUrl: payload.offerImageUrl,
    clientName: payload.clientName,
    tradeId: payload.tradeId,
    serviceTitle: payload.offerTitle,
    title: payload.offerTitle,
    description: payload.description,
    wilaya: payload.wilaya,
    commune: payload.commune,
    address: payload.address,
    urgency: payload.urgency,
    preferredDate: payload.preferredDate,
    estimatedBudget: payload.estimatedBudget,
  });

  if (!quoteRes.success || !quoteRes.data) {
    return { success: false, error: quoteRes.error || "Impossible d'envoyer la demande de devis." };
  }

  let conversationId: string | undefined;
  try {
    const convRes = await messagingApi.initiateConversation({
      type: "BRICOLAGE_QUOTE",
      recipientId: quoteRes.data.artisanUserId || payload.artisanId,
      context: {
        quoteRequestId: quoteRes.data.id,
      },
      initialMessage: `Bonjour, je souhaite un devis pour « ${payload.offerTitle} » à ${payload.commune} (${payload.wilaya}).\n\nBesoin : ${payload.description}`,
    });
    const convPayload = convRes?.data as unknown as {
      conversation?: { id?: string };
      id?: string;
    };
    conversationId = convPayload?.conversation?.id || convPayload?.id;
  } catch {
    // Conversation can also be opened later from Mes Demandes
  }

  return { success: true, quote: quoteRes.data, conversationId };
}

export async function adminFetchArtisanOffers(filters?: {
  status?: ArtisanOfferStatus | "all";
  tradeId?: string;
  search?: string;
}): Promise<ArtisanOffer[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.tradeId) params.set("tradeId", filters.tradeId);
    if (filters?.search) params.set("search", filters.search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiGet<{ success: boolean; data: ArtisanOffer[] }>(
      `/api/v1/artisans/admin/offers${qs}`
    );
    return res?.data || [];
  } catch {
    return [];
  }
}

export async function adminModerateArtisanOffer(
  offerId: string,
  status: ArtisanOfferStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  return await apiPut<{ success: boolean; error?: string }>(
    `/api/v1/artisans/admin/offers/${encodeURIComponent(offerId)}/status`,
    { status, reason }
  );
}
