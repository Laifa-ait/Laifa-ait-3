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

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
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
    const shopName =
      userData.shopName || pubData.shopName || userData.storeName || userData.displayName || "Boutique Olmart";
    const shopSlug =
      userData.shopSlug || pubData.shopSlug || userData.slug || pubData.slug || this.buildDefaultSlug(sellerId, shopName);
    const shopDescription =
      userData.shopDescription ||
      pubData.shopDescription ||
      userData.description ||
      pubData.description ||
      "Bienvenue dans notre boutique officielle sur Olmart Algérie.";
    const wilaya = userData.wilaya || pubData.wilaya || "Alger";
    const commune = userData.commune || pubData.commune || "";
    const logoUrl =
      userData.logoUrl || pubData.logoUrl || userData.photoURL || pubData.photoURL || userData.avatarUrl || pubData.avatarUrl || "";
    const bannerUrl = userData.bannerUrl || pubData.bannerUrl || userData.coverUrl || pubData.coverUrl || "";
    const ogImage = bannerUrl || logoUrl || "";
    const phone = userData.phone || userData.phoneNumber || "";
    const email = userData.email || "";

    return {
      sellerId,
      shopName,
      shopSlug,
      shopDescription,
      wilaya,
      commune,
      ...(logoUrl ? { logoUrl } : {}),
      ...(bannerUrl ? { bannerUrl } : {}),
      brandStory:
        userData.brandStory || pubData.brandStory || "Artisanat et commerce d'excellence en direct d'Algérie.",
      returnPolicy:
        userData.returnPolicy ||
        pubData.returnPolicy ||
        "Retours acceptés sous 14 jours si le produit est intact dans son emballage d'origine.",
      avgPreparationTime: userData.avgPreparationTime || pubData.avgPreparationTime || "24h - 48h",
      legalStatus: userData.legalStatus || pubData.legalStatus || "Commerçant enregistré",
      theme: {
        sector: "artisanat",
        primaryColor: "#B45309",
        secondaryColor: "#18181B",
        accentColor: "#B45309",
        canvasColor: "#FAF6F0",
        surfaceColor: "#FFFFFF",
        fontFamily: "'Cormorant Garamond', 'Plus Jakarta Sans', system-ui, sans-serif",
        accentBadgeColor: "#B45309",
        borderRadiusPx: 16,
        spacingYPx: 28,
        titleFontSizePx: 36,
        bodyFontSizePx: 15,
        surfaceTexture: "cotton-paper",
        ambientLighting: "golden-hour",
        cardMaterial: "solid-matte",
        frameShape: "casbah-arch",
        letterSpacing: 0.01,
        lineHeight: 1.12,
        headingAccentStyle: "metallic-gold",
        headingUnderlineStyle: "brush-stroke",
      },
      seo: {
        metaTitle: `${shopName} | Olmart Algérie`,
        metaDescription: shopDescription.slice(0, 160),
        ...(ogImage ? { ogImage } : {}),
      },
      contacts: {
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
      },
      updatedAt: new Date().toISOString(),
    };
  }

  static buildDefaultSections(config: StoreConfig, activeProductIds: string[] = []): CustomPageSection[] {
    const cleanBanner =
      config.bannerUrl && config.bannerUrl.trim()
        ? config.bannerUrl
        : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80";

    return [
      {
        id: "sec_hero",
        type: "hero_banner",
        title: "Acte 1 — Hero Scénographique",
        settings: {
          heroLayout: "editorial-split",
          title: `L'Art de *${config.shopName}* — Pièces {Authentiques}`,
          subtitle: config.shopDescription || "Découvrez notre collection façonnée avec exigence, livrée dans les 69 wilayas.",
          badgeText: "MAISON D'EXCELLENCE • ALGÉRIE",
          imageUrl: cleanBanner,
          ctaText: "Explorer la Collection",
          ctaLink: "#catalog",
          secondaryCtaText: "Notre Histoire",
          secondaryCtaLink: "#story",
          socialProofBadge: "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •",
          ctaStyle: "pill",
          textAlignment: "left",
          overlayOpacity: 35,
          showBadge: true,
          showSubtitle: true,
          showCta: true,
        },
        styles: {
          containerWidth: "full",
          paddingY: "lg",
          borderRadius: "none",
          headingAccentStyle: "metallic-gold",
          headingUnderlineStyle: "brush-stroke",
        },
        isVisible: true,
        order: 0,
      },
      {
        id: "sec_marquee",
        type: "kinetic_marquee",
        title: "Acte 2 — Ruban Cinétique",
        settings: {
          textFr: "LIVRAISON 69 WILAYAS • PAIEMENT À LA LIVRAISON (COD) • PIÈCES CERTIFIÉES & VÉRIFIÉES",
          textAr: "توصيل إلى 69 ولاية • الدفع عند الاستلام • قطع أصلية ومضمونة",
          showBilingual: true,
          speed: "normal",
          textStyle: "alternating",
          separator: "star",
          direction: "ltr",
          tiltDeg: 0,
          uppercase: true,
        },
        styles: { containerWidth: "full", paddingY: "sm" },
        isVisible: true,
        order: 1,
      },
      {
        id: "sec_categories",
        type: "featured_categories",
        title: "Acte 3 — Portes des Collections",
        settings: {
          title: "Nos *Collections* & {Univers}",
          subtitle: "Parcourez nos sélections thématiques façonnées pour chaque instant.",
          layout: "arch",
          categories: [
            {
              id: "cat_signature",
              name: "Pièces Signature",
              subtitle: "Créations iconiques",
              slug: "pieces-signature",
              badge: "N° 01",
              imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            },
            {
              id: "cat_nouveautes",
              name: "Nouvelle Édition",
              subtitle: "Arrivages & séries limitées",
              slug: "nouvelle-edition",
              badge: "N° 02",
              imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
            },
            {
              id: "cat_essentiels",
              name: "Les Intemporels",
              subtitle: "Savoir-faire & élégance durable",
              slug: "les-intemporels",
              badge: "N° 03",
              imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80",
            },
          ],
        },
        styles: {
          containerWidth: "contained",
          paddingY: "lg",
          headingAccentStyle: "metallic-gold",
          headingUnderlineStyle: "brush-stroke",
        },
        isVisible: true,
        order: 2,
      },
      {
        id: "sec_featured",
        type: "featured_products",
        title: "Acte 4 — Pièces Maîtresses",
        settings: {
          title: "Pièces *Maîtresses* & {Sélection}",
          subtitle: "Nos créations les plus convoitées, disponibles immédiatement.",
          productIds: activeProductIds.slice(0, 4),
          layout: "grid",
          cardAspectRatio: "4/5",
          columnsDesktop: 4,
        },
        styles: {
          containerWidth: "contained",
          paddingY: "md",
          headingAccentStyle: "metallic-gold",
          headingUnderlineStyle: "brush-stroke",
        },
        isVisible: activeProductIds.length > 0,
        order: 3,
      },
      {
        id: "sec_all_products",
        type: "product_grid",
        title: "Acte 5 — Catalogue Complet",
        settings: {
          title: "Tout le *Catalogue* de la {Maison}",
          subtitle: "Explorez l'ensemble de nos créations disponibles à la livraison.",
          maxItems: 12,
          layout: "grid",
          cardAspectRatio: "4/5",
          columnsDesktop: 4,
        },
        styles: {
          containerWidth: "contained",
          paddingY: "lg",
          headingAccentStyle: "metallic-gold",
          headingUnderlineStyle: "brush-stroke",
        },
        isVisible: true,
        order: 4,
      },
      {
        id: "sec_story",
        type: "brand_story",
        title: "Acte 5 — Manifeste & Histoire",
        settings: {
          heading: `L'Esprit de *${config.shopName}* — Savoir-Faire {Algérien}`,
          bodyText:
            config.brandStory ||
            "Depuis notre création, nous façonnons et sélectionnons nos pièces avec une exigence absolue afin de célébrer l'excellence du savoir-faire algérien.",
          imageUrl: cleanBanner,
          signature: config.shopName,
          yearsOfExperience: 5,
          dropCap: true,
        },
        styles: {
          containerWidth: "contained",
          paddingY: "lg",
          borderRadius: "lg",
          headingAccentStyle: "metallic-gold",
          headingUnderlineStyle: "brush-stroke",
        },
        isVisible: true,
        order: 5,
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
        styles: { containerWidth: "contained", paddingY: "md", borderRadius: "md" },
        isVisible: true,
        order: 6,
      },
      {
        id: "sec_contact",
        type: "contact_footer",
        title: "Coordonnées",
        settings: {
          ...(config.contacts?.phone ? { shopPhone: config.contacts.phone } : {}),
          ...(config.contacts?.email ? { shopEmail: config.contacts.email } : {}),
          wilaya: config.wilaya,
          workingHours: "Samedi - Jeudi : 09h00 - 18h00",
        },
        styles: { containerWidth: "full", paddingY: "md", borderRadius: "none" },
        isVisible: true,
        order: 7,
      },
    ];
  }

  static buildInitialLayoutVersion(config: StoreConfig, activeProductIds: string[] = []): StoreLayoutVersion {
    return {
      versionNumber: 1,
      sections: this.buildDefaultSections(config, activeProductIds),
      status: "draft",
      updatedAt: new Date().toISOString(),
      changeSummary: "Génération automatique en 5 Actes depuis le profil marchand",
    };
  }
}
