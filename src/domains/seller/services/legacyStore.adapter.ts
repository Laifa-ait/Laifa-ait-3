import { StoreConfig, StoreLayoutVersion, CustomPageSection } from "../customPage.types";

interface RawSellerData {
  shopName?: string;
  storeName?: string;
  displayName?: string;
  shopSlug?: string;
  slug?: string;
  shopDescription?: string;
  description?: string;
  bio?: string;
  wilaya?: string;
  commune?: string;
  logoUrl?: string;
  photoURL?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  coverUrl?: string;
  brandStory?: string;
  returnPolicy?: string;
  avgPreparationTime?: string;
  legalStatus?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
}

export class LegacyStoreAdapter {
  static buildDefaultSlug(sellerId: string, shopName?: string): string {
    const base = (shopName || "boutique")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const cleanBase = base.length >= 3 ? base.slice(0, 30) : "boutique";
    const shortId = sellerId.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, "0");
    return `${cleanBase}-${shortId}`;
  }

  static buildStoreConfig(sellerId: string, userData: RawSellerData, pubData: RawSellerData = {}): StoreConfig {
    const shopName = userData.shopName || pubData.shopName || userData.storeName || userData.displayName || "Boutique Olmart";
    const shopSlug = userData.shopSlug || pubData.shopSlug || userData.slug || pubData.slug || this.buildDefaultSlug(sellerId, shopName);
    const shopDescription = userData.shopDescription || pubData.shopDescription || userData.description || pubData.description || "Bienvenue dans notre boutique officielle sur Olmart Algérie.";
    const wilaya = userData.wilaya || pubData.wilaya || "Alger";
    const commune = userData.commune || pubData.commune || "";
    const logoUrl = userData.logoUrl || pubData.logoUrl || userData.photoURL || pubData.photoURL || userData.avatarUrl || pubData.avatarUrl;
    const bannerUrl = userData.bannerUrl || pubData.bannerUrl || userData.coverUrl || pubData.coverUrl;

    return {
      sellerId,
      shopName,
      shopSlug,
      shopDescription,
      wilaya,
      commune,
      logoUrl: logoUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      brandStory: userData.brandStory || pubData.brandStory || "Artisanat et commerce d'excellence en direct d'Algérie.",
      returnPolicy: userData.returnPolicy || pubData.returnPolicy || "Retours acceptés sous 14 jours si le produit est intact dans son emballage d'origine.",
      avgPreparationTime: userData.avgPreparationTime || pubData.avgPreparationTime || "24h - 48h",
      legalStatus: userData.legalStatus || pubData.legalStatus || "Commerçant enregistré",
      theme: {
        sector: "mode",
        primaryColor: "#023859",
        secondaryColor: "#26658C",
        accentColor: "#54ACBF",
        canvasColor: "#F8FBFC",
        surfaceColor: "#FFFFFF",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        accentBadgeColor: "#54ACBF",
      },
      seo: {
        metaTitle: `${shopName} | Olmart Algérie`,
        metaDescription: shopDescription.slice(0, 160),
        ogImage: bannerUrl || logoUrl || undefined,
      },
      contacts: {
        phone: userData.phone || userData.phoneNumber || undefined,
        email: userData.email || undefined,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  static buildDefaultSections(config: StoreConfig, activeProductIds: string[] = []): CustomPageSection[] {
    const sections: CustomPageSection[] = [
      {
        id: "sec_hero",
        type: "hero_banner",
        title: "Bannière d'accueil",
        settings: {
          title: config.shopName,
          subtitle: config.shopDescription || "Découvrez notre catalogue exclusif",
          badgeText: "Boutique Officielle",
          imageUrl: config.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
          ctaText: "Découvrir la sélection",
          ctaLink: "#catalog",
          textAlignment: "center",
          overlayOpacity: 40,
        },
        styles: {
          containerWidth: "full",
          paddingY: "lg",
          borderRadius: "none",
        },
        isVisible: true,
        order: 0,
      },
      {
        id: "sec_featured",
        type: "featured_products",
        title: "Nos Produits Vedettes",
        settings: {
          title: "Sélection Vedette",
          productIds: activeProductIds.slice(0, 4),
          layout: "grid",
        },
        styles: {
          containerWidth: "contained",
          paddingY: "md",
          borderRadius: "md",
        },
        isVisible: activeProductIds.length > 0,
        order: 1,
      },
      {
        id: "sec_all_products",
        type: "product_grid",
        title: "Tous les Articles",
        settings: {
          title: "Catalogue de la Boutique",
          subtitle: "Explorez l'ensemble de notre assortiment",
          maxItems: 12,
          layout: "grid",
        },
        styles: {
          containerWidth: "contained",
          paddingY: "lg",
          borderRadius: "none",
        },
        isVisible: true,
        order: 2,
      },
      {
        id: "sec_story",
        type: "brand_story",
        title: "Notre Histoire",
        settings: {
          heading: "À Propos de Notre Maison",
          bodyText: config.brandStory || "Depuis notre création, nous nous engageons à offrir les meilleurs produits avec un savoir-faire authentique.",
          imageUrl: config.logoUrl,
          signature: config.shopName,
          yearsOfExperience: 5,
        },
        styles: {
          backgroundColor: "#F9FAFB",
          containerWidth: "contained",
          paddingY: "lg",
          borderRadius: "lg",
        },
        isVisible: true,
        order: 3,
      },
      {
        id: "sec_delivery",
        type: "delivery_info",
        title: "Livraison & Expédition",
        settings: {
          title: "Expédition Rapide sur les 69 Wilayas",
          defaultTimeframe: config.avgPreparationTime || "24h - 48h",
          freeShippingAbove: 15000,
        },
        styles: {
          containerWidth: "contained",
          paddingY: "md",
          borderRadius: "md",
        },
        isVisible: true,
        order: 4,
      },
      {
        id: "sec_contact",
        type: "contact_footer",
        title: "Coordonnées",
        settings: {
          shopPhone: config.contacts?.phone,
          shopEmail: config.contacts?.email,
          wilaya: config.wilaya,
          workingHours: "Samedi - Jeudi : 09h00 - 18h00",
        },
        styles: {
          containerWidth: "full",
          paddingY: "md",
          borderRadius: "none",
        },
        isVisible: true,
        order: 5,
      },
    ];

    return sections;
  }

  static buildInitialLayoutVersion(config: StoreConfig, activeProductIds: string[] = []): StoreLayoutVersion {
    return {
      versionNumber: 1,
      sections: this.buildDefaultSections(config, activeProductIds),
      status: "draft",
      updatedAt: new Date().toISOString(),
      changeSummary: "Génération automatique initiale depuis le profil marchand",
    };
  }
}
