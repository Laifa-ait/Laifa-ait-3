import { db } from "../../config/firebase-admin";
import { safeLogger } from "../../utils/logger";
import {
  AutoPartDto,
  AutoPartFilterParams,
  CreateAutoPartInput,
} from "./autoParts.types";

const SEED_PARTS: Omit<AutoPartDto, "id" | "createdAt">[] = [
  {
    title: "Moteur Complet 2.0 TDI 140/150ch (Injecteurs & Turbo inclus)",
    category: "moteur",
    condition: "tres_bon_etat",
    priceDZD: 420000,
    isPriceNegotiable: true,
    wilayaId: 16,
    commune: "Bab Ezzouar",
    compatibilities: [
      { brand: "Volkswagen", model: "Golf 7", yearStart: 2013, yearEnd: 2020, engineType: "2.0 TDI", isCertified: true },
      { brand: "Seat", model: "Leon 3", yearStart: 2013, yearEnd: 2020, engineType: "2.0 TDI", isCertified: true },
      { brand: "Audi", model: "A3 8V", yearStart: 2013, yearEnd: 2019, engineType: "2.0 TDI", isCertified: true },
    ],
    description: "Moteur importé d'Europe avec carnet de suivi. Faible kilométrage (98 000 km certifié). Test compression OK.",
    images: ["https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"],
    isJunkYard: false,
    sellerId: "seller_moteur_dz",
    sellerName: "Auto Pièces Express Alger",
    sellerPhoneMasked: "0550 •• •• 89",
    status: "active",
  },
  {
    title: "Optiques Avant Full LED Facelift Origine (Paire)",
    category: "optique",
    condition: "tres_bon_etat",
    priceDZD: 165000,
    isPriceNegotiable: false,
    wilayaId: 31,
    commune: "Bir El Djir",
    compatibilities: [
      { brand: "Volkswagen", model: "Golf 7.5", yearStart: 2017, yearEnd: 2020, isCertified: true },
    ],
    description: "Paire de phares avant d'origine Valeo en parfait état. Aucune fixation cassée ni micro-rayure. Prêt à monter.",
    images: ["https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"],
    isJunkYard: false,
    sellerId: "seller_optique_oran",
    sellerName: "Wahran Auto Éclairage",
    sellerPhoneMasked: "0770 •• •• 12",
    status: "active",
  },
  {
    title: "Véhicule Complet Peugeot 208 Phase 2 pour Dépeçage & Pièces",
    category: "casse_depecage",
    condition: "pour_pieces",
    priceDZD: 650000,
    isPriceNegotiable: true,
    wilayaId: 19,
    commune: "Sétif",
    compatibilities: [
      { brand: "Peugeot", model: "208", yearStart: 2015, yearEnd: 2019, isCertified: true },
    ],
    description: "Casse auto Sétif : 208 accidentée arrière. Mécanique 1.6 HDi 92ch intacte (75 000 km), intérieur cuir comme neuf, train avant complet.",
    images: ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"],
    isJunkYard: true,
    sellerId: "casse_setif_pro",
    sellerName: "Casse Moderne des Hauts Plateaux",
    sellerPhoneMasked: "0661 •• •• 45",
    status: "active",
  },
];

export class AutoPartsService {
  private isOfflineTestMode(): boolean {
    return !db || (process.env.NODE_ENV === "test" && process.env.FIREBASE_EMULATOR_ACTIVE === "false");
  }

  private async ensureSeed() {
    if (this.isOfflineTestMode() || !db) return;
    try {
      const snap = await db.collection("auto_parts").limit(1).get();
      if (snap.empty) {
        const batch = db.batch();
        for (const part of SEED_PARTS) {
          const ref = db.collection("auto_parts").doc();
          batch.set(ref, {
            ...part,
            createdAt: new Date().toISOString(),
            sellerPhoneFull: "0550123456",
          });
        }
        await batch.commit();
        safeLogger.info("[AutoPartsService] Seeded initial auto parts in Firestore");
      }
    } catch (e) {
      safeLogger.warn("[AutoPartsService] Seed check skipped", { err: String(e) });
    }
  }

  async listParts(filters: AutoPartFilterParams): Promise<{ items: AutoPartDto[]; total: number }> {
    await this.ensureSeed();
    if (this.isOfflineTestMode() || !db) {
      return {
        items: SEED_PARTS.map((p, i) => ({ ...p, id: `seed_${i}`, createdAt: new Date().toISOString() })),
        total: SEED_PARTS.length,
      };
    }

    try {
      let query: FirebaseFirestore.Query = db.collection("auto_parts").where("status", "==", "active");
      if (filters.category) query = query.where("category", "==", filters.category);
      if (filters.condition) query = query.where("condition", "==", filters.condition);
      if (filters.isJunkYard !== undefined) query = query.where("isJunkYard", "==", filters.isJunkYard);
      if (filters.wilayaId) query = query.where("wilayaId", "==", filters.wilayaId);

      const snap = await query.get();
      let docs: AutoPartDto[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          category: data.category,
          condition: data.condition,
          priceDZD: data.priceDZD,
          isPriceNegotiable: data.isPriceNegotiable,
          wilayaId: data.wilayaId,
          commune: data.commune,
          compatibilities: data.compatibilities || [],
          description: data.description,
          images: data.images || [],
          isJunkYard: Boolean(data.isJunkYard),
          sellerId: data.sellerId,
          sellerName: data.sellerName,
          sellerPhoneMasked: data.sellerPhoneMasked || (data.sellerPhoneFull ? `${data.sellerPhoneFull.slice(0, 4)} •• •• ${data.sellerPhoneFull.slice(-2)}` : undefined),
          createdAt: data.createdAt,
          status: data.status,
        };
      });

      // Filtre de compatibilité mécanique en mémoire
      if (filters.brand || filters.model || filters.year) {
        docs = docs.filter((item) => {
          return item.compatibilities.some((c) => {
            if (c.isUniversal) return true;
            const matchBrand = !filters.brand || c.brand.toLowerCase() === filters.brand.toLowerCase();
            const matchModel = !filters.model || c.model.toLowerCase().includes(filters.model.toLowerCase());
            const matchYear = !filters.year || ((!c.yearStart || filters.year >= c.yearStart) && (!c.yearEnd || filters.year <= c.yearEnd));
            return matchBrand && matchModel && matchYear;
          });
        });
      }

      // Recherche plein texte si query
      if (filters.query) {
        const q = filters.query.toLowerCase();
        docs = docs.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
      }

      const total = docs.length;
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const items = docs.slice((page - 1) * limit, page * limit);
      return { items, total };
    } catch (e) {
      safeLogger.error("[AutoPartsService] Error listing parts", { err: String(e) });
      return { items: [], total: 0 };
    }
  }

  async getPartById(id: string): Promise<AutoPartDto | null> {
    if (!db) return null;
    const doc = await db.collection("auto_parts").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      title: data.title,
      category: data.category,
      condition: data.condition,
      priceDZD: data.priceDZD,
      isPriceNegotiable: data.isPriceNegotiable,
      wilayaId: data.wilayaId,
      commune: data.commune,
      compatibilities: data.compatibilities || [],
      description: data.description,
      images: data.images || [],
      isJunkYard: Boolean(data.isJunkYard),
      sellerId: data.sellerId,
      sellerName: data.sellerName,
      sellerPhoneMasked: data.sellerPhoneMasked || (data.sellerPhoneFull ? `${data.sellerPhoneFull.slice(0, 4)} •• •• ${data.sellerPhoneFull.slice(-2)}` : undefined),
      createdAt: data.createdAt,
      status: data.status,
    };
  }

  async revealPartContact(id: string): Promise<{ phone: string; whatsapp: string } | null> {
    if (!db) return null;
    const doc = await db.collection("auto_parts").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    const phone = data.sellerPhoneFull || "0550000000";
    const cleanPhone = phone.replace(/\D/g, "");
    const wa = cleanPhone.startsWith("0") ? `213${cleanPhone.slice(1)}` : cleanPhone;
    return {
      phone,
      whatsapp: `https://wa.me/${wa}?text=${encodeURIComponent(`Bonjour, je vous contacte concernant votre pièce Olma Auto : ${data.title}`)}`,
    };
  }

  async createPart(sellerId: string, sellerName: string, input: CreateAutoPartInput): Promise<{ partId: string }> {
    if (!db) throw new Error("Database unavailable");
    const masked = `${input.sellerPhone.slice(0, 4)} •• •• ${input.sellerPhone.slice(-2)}`;
    const ref = db.collection("auto_parts").doc();
    await ref.set({
      ...input,
      sellerId,
      sellerName,
      sellerPhoneFull: input.sellerPhone,
      sellerPhoneMasked: masked,
      status: "active",
      createdAt: new Date().toISOString(),
    });
    return { partId: ref.id };
  }
}

export const autoPartsService = new AutoPartsService();
