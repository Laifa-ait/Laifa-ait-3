import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import {
  ArtisanJobBroadcast,
  ArtisanJobBroadcastPayload,
} from "../../../types/artisan";

const BROADCASTS_COLLECTION = "artisan_job_broadcasts";

export class ArtisanBroadcastsService {
  /**
   * Client creates a public job broadcast / recherche d'artisan
   */
  static async createBroadcast(
    clientId: string,
    payload: ArtisanJobBroadcastPayload
  ): Promise<{ success: boolean; broadcast?: ArtisanJobBroadcast; error?: string }> {
    if (!db) return { success: false, error: "Base de données non disponible" };

    try {
      const now = new Date().toISOString();
      const newBroadcast: Omit<ArtisanJobBroadcast, "id"> = {
        clientId: clientId || "guest",
        clientName: payload.clientName.trim(),
        clientPhone: payload.clientPhone.trim(),
        clientEmail: payload.clientEmail?.trim() || "",
        tradeId: payload.tradeId.trim(),
        tradeName: payload.tradeName.trim(),
        categoryPreset: payload.categoryPreset?.trim() || "",
        title: payload.title.trim(),
        description: payload.description.trim(),
        wilaya: payload.wilaya.trim(),
        wilayaCode: payload.wilayaCode?.trim() || "",
        commune: payload.commune.trim(),
        address: payload.address?.trim() || "",
        urgency: payload.urgency || "standard",
        estimatedBudget: payload.estimatedBudget ? Number(payload.estimatedBudget) : undefined,
        status: "open",
        repliesCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection(BROADCASTS_COLLECTION).add(newBroadcast);

      safeLogger.info("[ArtisanBroadcastsService] Job broadcast published successfully", {
        broadcastId: docRef.id,
        tradeId: payload.tradeId,
        wilaya: payload.wilaya,
      });

      return {
        success: true,
        broadcast: { id: docRef.id, ...newBroadcast },
      };
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] createBroadcast error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, error: "Impossible de publier l'annonce de recherche d'artisan" };
    }
  }

  /**
   * List open job broadcasts for artisans or public
   */
  static async listBroadcasts(filters: {
    tradeId?: string;
    wilaya?: string;
    urgency?: string;
    limit?: number;
  }): Promise<ArtisanJobBroadcast[]> {
    if (!db) return [];

    try {
      let query = db.collection(BROADCASTS_COLLECTION).where("status", "==", "open");

      if (filters.tradeId && filters.tradeId !== "all") {
        query = query.where("tradeId", "==", filters.tradeId);
      }

      if (filters.wilaya) {
        query = query.where("wilaya", "==", filters.wilaya);
      }

      if (filters.urgency) {
        query = query.where("urgency", "==", filters.urgency);
      }

      const snapshot = await query
        .orderBy("createdAt", "desc")
        .limit(filters.limit || 50)
        .get();

      const maskClientName = (fullName: unknown): string => {
        const cleaned = String(fullName || "Client Olmart").trim();
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length <= 1) return parts[0] || "Client";
        return `${parts[0]} ${parts[1][0]?.toUpperCase() || ""}.`;
      };

      return snapshot.docs.map((doc) => {
        const d = doc.data() as Partial<ArtisanJobBroadcast>;
        return {
          id: doc.id,
          clientId: d.clientId || "",
          clientName: maskClientName(d.clientName),
          tradeId: d.tradeId || "",
          tradeName: d.tradeName || "",
          categoryPreset: d.categoryPreset,
          title: d.title || "",
          description: d.description || "",
          wilaya: d.wilaya || "",
          wilayaCode: d.wilayaCode,
          commune: d.commune || "",
          urgency: d.urgency || "standard",
          estimatedBudget: d.estimatedBudget,
          status: d.status || "open",
          repliesCount: d.repliesCount ?? 0,
          createdAt: d.createdAt || "",
          updatedAt: d.updatedAt || "",
        };
      });
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] listBroadcasts error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get client's own broadcasts
   */
  static async getClientBroadcasts(clientId: string): Promise<ArtisanJobBroadcast[]> {
    if (!db || !clientId) return [];

    try {
      const snapshot = await db
        .collection(BROADCASTS_COLLECTION)
        .where("clientId", "==", clientId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArtisanJobBroadcast, "id">),
      }));
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] getClientBroadcasts error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Update broadcast status with strict IDOR ownership or admin enforcement
   */
  static async updateStatus(
    broadcastId: string,
    status: ArtisanJobBroadcast["status"],
    callerUid?: string,
    isAdmin = false
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!db) return { success: false, statusCode: 503, error: "Base de données non disponible" };
    if (!callerUid) return { success: false, statusCode: 401, error: "Authentification requise" };

    try {
      const docRef = db.collection(BROADCASTS_COLLECTION).doc(broadcastId);
      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        if (!snap.exists) {
          return { success: false, statusCode: 404, error: "Annonce introuvable" };
        }
        const data = snap.data() as Partial<ArtisanJobBroadcast>;
        if (!isAdmin && data.clientId !== callerUid) {
          return { success: false, statusCode: 403, error: "Accès refusé. Vous ne pouvez modifier que vos propres annonces." };
        }
        tx.update(docRef, {
          status,
          updatedAt: new Date().toISOString(),
        });
        return { success: true, statusCode: 200 };
      });
      return result;
    } catch (error) {
      safeLogger.error("[ArtisanBroadcastsService] updateStatus error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, statusCode: 500, error: "Impossible de modifier le statut de l'annonce" };
    }
  }
}
