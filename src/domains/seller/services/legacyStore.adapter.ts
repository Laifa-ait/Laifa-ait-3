import { StoreConfig, StoreLayoutVersion, CustomPageSection } from "../customPage.types";

interface RawSellerData {
  shopName?: string; storeName?: string; displayName?: string;
  shopSlug?: string; slug?: string; shopDescription?: string;
  description?: string; bio?: string; wilaya?: string; commune?: string;
  logoUrl?: string; photoURL?: string; avatarUrl?: string;
  bannerUrl?: string; coverUrl?: string; brandStory?: string;
  returnPolicy?: string; avgPreparationTime?: string; legalStatus?: string;
  phone?: string; phoneNumber?: string; email?: string;
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  if (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) cleaned[key] = stripUndefinedDeep(val);
    }
    return cleaned as T;
  }
  return value;
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
    const shopDescription =
      userData.shopDescription || pubData.shopDescription || userData.description || pubData.description ||
      "Bienvenue dans notre boutique officielle sur Olmart.";
    const wilaya = userData.wilaya || pubData.wilaya || "Alger";
    const commune = userData.commune || pubData.commune || "";
    const logoUrl = userData.logoUrl || pubData.logoUrl || userData.photoURL || pubData.photoURL || userData.avatarUrl || pubData.avatarUrl || "";
    const bannerUrl = userData.bannerUrl || pubData.bannerUrl || userData.coverUrl || pubData.coverUrl || "";
    const ogImage = bannerUrl || logoUrl || "";

    return {
      sellerId, shopName, shopSlug, shopDescription, wilaya, commune,
      ...(logoUrl ? { logoUrl } : {}),
      ...(bannerUrl ? { bannerUrl } : {}),
      brandStory: userData.brandStory || pubData.brandStory || "Sélection contemporaine exigeante, conçue pour durer et livrée rapidement.",
      returnPolicy:
        userData.returnPolicy || pubData.returnPolicy ||
        "Retours acceptés sous 14 jours si le produit est intact dans son emballage d'origine.",
      avgPreparationTime: userData.avgPreparationTime || pubData.avgPreparationTime || "24h - 48h",
      legalStatus: userData.legalStatus || pubData.legalStatus || "Commerçant enregistré",
      theme: {
        sector: "mode",
        primaryColor: "#0F172A",
        secondaryColor: "#1E293B",
        accentColor: "#2563EB",
        canvasColor: "#F8FAFC",
        surfaceColor: "#FFFFFF",
        textColor: "#0F172A",
        mutedTextColor: "#475569",
        borderColor: "#E2E8F0",
        buttonColor: "#0F172A",
        buttonTextColor: "#FFFFFF",
        priceColor: "#0F172A",
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        headingFontFamily: "'Plus Jakarta Sans', sans-serif",
        bodyFontFamily: "'DM Sans', sans-serif",
        accentBadgeColor: "#0F172A",
        badgeTextColor: "#FFFFFF",
        borderRadiusPx: 12,
        spacingYPx: 32,
        titleFontSizePx: 36,
        bodyFontSizePx: 15,
        surfaceTexture: "none",
        ambientLighting: "natural",
        cardMaterial: "solid-matte",
        frameShape: "soft-modern",
        letterSpacing: -0.02,
        lineHeight: 1.15,
        headingAccentStyle: "accent-color",
        headingUnderlineStyle: "hairline",
      },
      seo: {
        metaTitle: `${shopName} | Olmart`,
        metaDescription: shopDescription.slice(0, 160),
        ...(ogImage ? { ogImage } : {}),
      },
      contacts: {},
      updatedAt: new Date().toISOString(),
    };
  }

  static buildDefaultSections(config: StoreConfig, activeProductIds: string[] = []): CustomPageSection[] {
    const cleanBanner = config.bannerUrl && config.bannerUrl.trim() ? config.bannerUrl : "";
    const defaultHeadingStyles = { headingAccentStyle: "accent-color" as const, headingUnderlineStyle: "hairline" as const };

    return [
      {
        id: "sec_hero", type: "hero_banner", title: "Bannière Principale",
        settings: {
          heroLayout: "editorial-split",
          title: config.shopName ? `${config.shopName} — Collection & Essentiels` : "Sélection Contemporaine",
          subtitle: config.shopDescription || "Commandez en ligne en toute confiance avec livraison dans les 69 wilayas.",
          badgeText: "NOUVELLE ÉDITION", imageUrl: cleanBanner,
          ctaText: "Découvrir les Produits", ctaLink: "#catalog",
          secondaryCtaText: "Rayons", secondaryCtaLink: "#collections",
          socialProofBadge: "LIVRAISON 69 WILAYAS • PAIEMENT À LA RÉCEPTION",
          showSocialProofBadge: false, ctaStyle: "solid", textAlignment: "left",
          overlayOpacity: 0, showBadge: true, showSubtitle: true, showCta: true,
        },
        styles: { containerWidth: "full", paddingY: "lg", borderRadius: "none", ...defaultHeadingStyles },
        isVisible: true, order: 0,
      },
      {
        id: "sec_marquee", type: "kinetic_marquee", title: "Bandeau d'Information",
        settings: {
          textFr: "LIVRAISON 69 WILAYAS • PAIEMENT À LA LIVRAISON • QUALITÉ CONTRÔLÉE",
          textAr: "توصيل إلى 69 ولاية • الدفع عند الاستلام • جودة مضمونة",
          showBilingual: true, speed: "normal", textStyle: "alternating",
          separator: "dot", direction: "ltr", tiltDeg: 0, uppercase: true,
        },
        styles: { containerWidth: "full", paddingY: "sm" },
        isVisible: true, order: 1,
      },
      {
        id: "sec_categories", type: "featured_categories", title: "Rayons & Collections",
        settings: {
          title: "Nos *Collections* & {Univers}",
          subtitle: "Parcourez nos sélections thématiques.",
          layout: "grid",
          categories: [
            { id: "cat_signature", name: "Pièces Signature", subtitle: "Lignes contemporaines", slug: "pieces-signature", badge: "01", imageUrl: "" },
            { id: "cat_nouveautes", name: "Nouvelle Édition", subtitle: "Derniers arrivages", slug: "nouvelle-edition", badge: "02", imageUrl: "" },
            { id: "cat_essentiels", name: "Les Intemporels", subtitle: "Qualité & durabilité", slug: "les-intemporels", badge: "03", imageUrl: "" },
          ],
        },
        styles: { containerWidth: "contained", paddingY: "lg", ...defaultHeadingStyles },
        isVisible: true, order: 2,
      },
      {
        id: "sec_featured", type: "featured_products", title: "Sélection Vedette",
        settings: {
          title: "Pièces *Phares* & {Sélection}",
          subtitle: "Nos références les plus demandées, disponibles immédiatement.",
          productIds: activeProductIds.slice(0, 4), layout: "grid", cardAspectRatio: "4/5", columnsDesktop: 4,
        },
        styles: { containerWidth: "contained", paddingY: "md", ...defaultHeadingStyles },
        isVisible: activeProductIds.length > 0, order: 3,
      },
      {
        id: "sec_all_products", type: "product_grid", title: "Catalogue Complet",
        settings: {
          title: "Tout le *Catalogue*",
          subtitle: "Explorez l'ensemble de nos références disponibles à la livraison.",
          maxItems: 12, layout: "grid", cardAspectRatio: "4/5", columnsDesktop: 4,
        },
        styles: { containerWidth: "contained", paddingY: "lg", ...defaultHeadingStyles },
        isVisible: true, order: 4,
      },
      {
        id: "sec_story", type: "brand_story", title: "Manifeste de Marque",
        settings: {
          heading: `L'Approche *${config.shopName}* — Design & {Qualité}`,
          bodyText:
            config.brandStory ||
            "Chaque pièce de notre sélection est contrôlée avec rigueur afin d'offrir un design durable et une expérience irréprochable.",
          imageUrl: cleanBanner, signature: config.shopName, yearsOfExperience: 5, dropCap: true,
        },
        styles: { containerWidth: "contained", paddingY: "lg", borderRadius: "lg", ...defaultHeadingStyles },
        isVisible: true, order: 5,
      },
      {
        id: "sec_delivery", type: "delivery_info", title: "Livraison & Expédition",
        settings: {
          title: "Expédition Rapide sur les 69 Wilayas",
          defaultTimeframe: config.avgPreparationTime || "24h - 48h",
          freeShippingAbove: 15000,
        },
        styles: { containerWidth: "contained", paddingY: "md", borderRadius: "md" },
        isVisible: true, order: 6,
      },
      {
        id: "sec_contact", type: "contact_footer", title: "Coordonnées",
        settings: {
          ...(config.contacts?.phone ? { shopPhone: config.contacts.phone } : {}),
          ...(config.contacts?.email ? { shopEmail: config.contacts.email } : {}),
          wilaya: config.wilaya,
          workingHours: "Samedi - Jeudi : 09h00 - 18h00",
        },
        styles: { containerWidth: "full", paddingY: "md", borderRadius: "none" },
        isVisible: true, order: 7,
      },
    ];
  }

  static buildInitialLayoutVersion(config: StoreConfig, activeProductIds: string[] = []): StoreLayoutVersion {
    return {
      versionNumber: 1,
      sections: this.buildDefaultSections(config, activeProductIds),
      status: "draft",
      updatedAt: new Date().toISOString(),
      changeSummary: "Génération automatique moderne depuis le profil marchand",
    };
  }
}
