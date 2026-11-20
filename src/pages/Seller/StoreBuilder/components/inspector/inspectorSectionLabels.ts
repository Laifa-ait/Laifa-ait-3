import type { CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";

export const SECTION_TYPE_LABELS: Record<string, string> = {
  hero_banner: "Bannière principale",
  promo_carousel: "Diaporama promo",
  kinetic_marquee: "Bandeau défilant",
  featured_categories: "Catégories",
  curated_collections: "Collections",
  new_arrivals: "Nouveautés",
  featured_products: "Sélection de produits",
  best_sellers: "Meilleures ventes",
  product_grid: "Catalogue produits",
  brand_story: "Notre histoire",
  showcase_video: "Vidéo de présentation",
  verified_reviews: "Avis clients",
  delivery_info: "Livraison",
  return_policy: "Retours",
  faq_accordion: "Questions fréquentes",
  contact_footer: "Pied de page & contact",
};

const SUB_ELEMENT_LABELS: Record<string, string> = {
  background: "Photo & fond",
  badge: "Badge",
  title: "Titre",
  subtitle: "Sous-titre",
  cta: "Bouton principal",
  ctaPrimary: "Bouton principal",
  ctaSecondary: "Bouton secondaire",
  "category-style": "Style & grille",
  "category-presets": "Modèles",
  "product-layout": "Disposition grille",
  "product-card-design": "Cartes produit",
  "countdown-card": "Compte à rebours",
  countdown: "Compte à rebours",
  selection: "Sélection produits",
  cascade: "Disposition & grille",
};

export function formatSubElementLabel(sub: string): string {
  if (SUB_ELEMENT_LABELS[sub]) return SUB_ELEMENT_LABELS[sub];
  if (sub.startsWith("slide-")) return `Image ${parseInt(sub.replace("slide-", ""), 10) + 1}`;
  if (sub.startsWith("cat-") || sub.startsWith("category-items:")) {
    const raw = sub.includes(":") ? sub.split(":")[1] : sub.replace("cat-", "");
    return `Catégorie #${parseInt(raw, 10) + 1}`;
  }
  if (sub.startsWith("faq-")) return `Question #${parseInt(sub.replace("faq-", ""), 10) + 1}`;
  if (sub.startsWith("review-")) return `Avis #${parseInt(sub.replace("review-", ""), 10) + 1}`;
  return sub;
}

function radiusTokenToPx(radius?: string): number | undefined {
  if (radius === "none") return 0;
  if (radius === "sm") return 12;
  if (radius === "md") return 24;
  if (radius === "lg" || radius === "full") return 40;
  return undefined;
}

function radiusPxToToken(px: unknown): CustomPageSectionStyles["borderRadius"] | undefined {
  if (typeof px !== "number" || Number.isNaN(px)) return undefined;
  if (px <= 0) return "none";
  if (px <= 14) return "sm";
  if (px <= 28) return "md";
  return "lg";
}

function mapFrameShapeToArchShape(frameShape?: string): string | undefined {
  if (!frameShape) return undefined;
  if (frameShape === "pill") return "capsule";
  if (frameShape === "cut-corners" || frameShape === "diamond" || frameShape === "chamfered-tech") {
    return "asymmetric-leaf";
  }
  if (frameShape === "sharp-couture" || frameShape === "architectural-sharp") {
    return "floating-frame";
  }
  return "roman-arch";
}

export function syncHeroStylesFromSettingsPatch(
  currentStyles: CustomPageSectionStyles = {},
  patch: Record<string, unknown>
): CustomPageSectionStyles {
  const nextStyles: CustomPageSectionStyles = { ...currentStyles };
  if ("containerMode" in patch) {
    if (patch.containerMode === "full") {
      nextStyles.containerWidth = "full";
      nextStyles.floatingCard = false;
      nextStyles.paddingX = 0;
    } else if (nextStyles.containerWidth === "full" || !nextStyles.containerWidth) {
      nextStyles.containerWidth = "contained";
    }
  }
  if ("bannerFloating" in patch) {
    nextStyles.floatingCard = Boolean(patch.bannerFloating);
    if (patch.bannerFloating) {
      nextStyles.containerWidth = "contained";
    }
  }
  if ("archShape" in patch && patch.archShape) {
    nextStyles.frameShape = undefined;
  }
  if ("bannerBgColor" in patch) nextStyles.backgroundColor = patch.bannerBgColor as string | undefined;
  if ("bannerBorderColor" in patch) nextStyles.sectionBorderColor = patch.bannerBorderColor as string | undefined;
  if ("bannerBorderWidthPx" in patch) nextStyles.sectionBorderWidthPx = patch.bannerBorderWidthPx as number | undefined;
  if ("titleColor" in patch) {
    nextStyles.headingColor = patch.titleColor as string | undefined;
    if (!patch.titleColor) nextStyles.textColor = undefined;
  }
  if ("subtitleColor" in patch) nextStyles.subtitleColor = patch.subtitleColor as string | undefined;
  if ("badgeBgColor" in patch) nextStyles.badgeBgColor = patch.badgeBgColor as string | undefined;
  if ("badgeTextColor" in patch) nextStyles.badgeTextColor = patch.badgeTextColor as string | undefined;
  if ("ctaBgColor" in patch) nextStyles.buttonBgColor = patch.ctaBgColor as string | undefined;
  if ("ctaTextColor" in patch) nextStyles.buttonTextColor = patch.ctaTextColor as string | undefined;
  if ("ctaBorderColor" in patch) nextStyles.buttonBorderColor = patch.ctaBorderColor as string | undefined;
  if ("ctaStyle" in patch) nextStyles.buttonStyle = patch.ctaStyle as CustomPageSectionStyles["buttonStyle"];
  if ("ctaShadow" in patch) nextStyles.buttonShadow = patch.ctaShadow as CustomPageSectionStyles["buttonShadow"];
  if ("ctaBorderRadiusPx" in patch) nextStyles.buttonBorderRadiusPx = patch.ctaBorderRadiusPx as number | undefined;
  if ("ctaBorderWidthPx" in patch) nextStyles.buttonBorderWidthPx = patch.ctaBorderWidthPx as number | undefined;
  if ("ctaShowArrow" in patch) nextStyles.buttonShowArrow = patch.ctaShowArrow as boolean | undefined;
  if ("bannerShadow" in patch) nextStyles.shadow = patch.bannerShadow as CustomPageSectionStyles["shadow"];
  if ("bannerShadowEnabled" in patch) nextStyles.shadowEnabled = patch.bannerShadowEnabled as boolean | undefined;
  if ("bannerShadowColor" in patch) nextStyles.shadowColor = patch.bannerShadowColor as string | undefined;
  if ("overlayColor" in patch) nextStyles.overlayColor = patch.overlayColor as string | undefined;
  if ("borderRadiusPx" in patch) {
    const mapped = radiusPxToToken(patch.borderRadiusPx);
    if (mapped) nextStyles.borderRadius = mapped;
  } else if ("heroDesktopConfig" in patch && patch.heroDesktopConfig && typeof patch.heroDesktopConfig === "object") {
    const deskRadius = (patch.heroDesktopConfig as Record<string, unknown>).borderRadiusPx;
    const mapped = radiusPxToToken(deskRadius);
    if (mapped) nextStyles.borderRadius = mapped;
  }
  if ("useCornerColors" in patch) nextStyles.useCornerColors = Boolean(patch.useCornerColors);
  if ("cornerColorTl" in patch) nextStyles.cornerColorTl = patch.cornerColorTl as string;
  if ("cornerColorTr" in patch) nextStyles.cornerColorTr = patch.cornerColorTr as string;
  if ("cornerColorBr" in patch) nextStyles.cornerColorBr = patch.cornerColorBr as string;
  if ("cornerColorBl" in patch) nextStyles.cornerColorBl = patch.cornerColorBl as string;
  if ("usePerCornerRadius" in patch) nextStyles.usePerCornerRadius = Boolean(patch.usePerCornerRadius);
  if ("borderRadiusTlPx" in patch) nextStyles.borderRadiusTlPx = patch.borderRadiusTlPx as number;
  if ("borderRadiusTrPx" in patch) nextStyles.borderRadiusTrPx = patch.borderRadiusTrPx as number;
  if ("borderRadiusBrPx" in patch) nextStyles.borderRadiusBrPx = patch.borderRadiusBrPx as number;
  if ("borderRadiusBlPx" in patch) nextStyles.borderRadiusBlPx = patch.borderRadiusBlPx as number;
  if ("imageFilterPreset" in patch) nextStyles.imageFilterPreset = patch.imageFilterPreset as CustomPageSectionStyles["imageFilterPreset"];
  if ("imageBrightness" in patch) nextStyles.imageBrightness = patch.imageBrightness as number | undefined;
  if ("imageContrast" in patch) nextStyles.imageContrast = patch.imageContrast as number | undefined;
  if ("imageSaturation" in patch) nextStyles.imageSaturation = patch.imageSaturation as number | undefined;
  if ("imageSepia" in patch) nextStyles.imageSepia = patch.imageSepia as number | undefined;
  if ("imageBlurPx" in patch) nextStyles.imageBlurPx = patch.imageBlurPx as number | undefined;
  return nextStyles;
}

export function syncHeroSettingsFromStylesPatch(
  currentSettings: Record<string, unknown>,
  patch: Partial<CustomPageSectionStyles>
): Record<string, unknown> {
  const isPresetSchemeSwitch = "colorScheme" in patch && patch.colorScheme !== "custom";
  const syncedSettings: Record<string, unknown> = { ...currentSettings };
  if (isPresetSchemeSwitch) {
    Object.assign(syncedSettings, {
      titleColor: "", subtitleColor: "", ctaBgColor: "", ctaTextColor: "",
      badgeBgColor: "", badgeTextColor: "", secondaryCtaBgColor: "", secondaryCtaTextColor: "",
    });
  }
  if ("backgroundColor" in patch) syncedSettings.bannerBgColor = patch.backgroundColor;
  if ("sectionBorderColor" in patch) syncedSettings.bannerBorderColor = patch.sectionBorderColor;
  if ("sectionBorderWidthPx" in patch) syncedSettings.bannerBorderWidthPx = patch.sectionBorderWidthPx;
  if ("headingColor" in patch) syncedSettings.titleColor = patch.headingColor;
  if ("subtitleColor" in patch) syncedSettings.subtitleColor = patch.subtitleColor;
  if ("badgeBgColor" in patch) syncedSettings.badgeBgColor = patch.badgeBgColor;
  if ("badgeTextColor" in patch) syncedSettings.badgeTextColor = patch.badgeTextColor;
  if ("buttonBgColor" in patch) syncedSettings.ctaBgColor = patch.buttonBgColor;
  if ("buttonTextColor" in patch) syncedSettings.ctaTextColor = patch.buttonTextColor;
  if ("buttonBorderColor" in patch) syncedSettings.ctaBorderColor = patch.buttonBorderColor;
  if ("buttonStyle" in patch) {
    syncedSettings.ctaStyle = patch.buttonStyle;
    if (!("buttonBorderRadiusPx" in patch)) {
      syncedSettings.ctaBorderRadiusPx =
        patch.buttonStyle === "pill" ? 999 : patch.buttonStyle === "sharp" ? 0 : 8;
    }
    if (!("buttonBorderWidthPx" in patch)) {
      syncedSettings.ctaBorderWidthPx = patch.buttonStyle === "outline" ? 2 : 0;
    }
  }
  if ("buttonShadow" in patch) syncedSettings.ctaShadow = patch.buttonShadow;
  if ("buttonBorderRadiusPx" in patch) syncedSettings.ctaBorderRadiusPx = patch.buttonBorderRadiusPx;
  if ("buttonBorderWidthPx" in patch) syncedSettings.ctaBorderWidthPx = patch.buttonBorderWidthPx;
  if ("buttonShowArrow" in patch) syncedSettings.ctaShowArrow = patch.buttonShowArrow;
  if ("shadow" in patch) {
    syncedSettings.bannerShadow = patch.shadow ?? "none";
    if (!("shadowEnabled" in patch)) {
      syncedSettings.bannerShadowEnabled = Boolean(patch.shadow && patch.shadow !== "none");
    }
  }
  if ("shadowEnabled" in patch) syncedSettings.bannerShadowEnabled = patch.shadowEnabled;
  if ("shadowColor" in patch) syncedSettings.bannerShadowColor = patch.shadowColor;
  if ("overlayColor" in patch) syncedSettings.overlayColor = patch.overlayColor;
  if ("floatingCard" in patch) {
    syncedSettings.bannerFloating = Boolean(patch.floatingCard);
    if (patch.floatingCard) {
      syncedSettings.containerMode = "contained";
      syncedSettings.fullTopWidth = false;
    }
  }
  if ("containerWidth" in patch) {
    const isFull = patch.containerWidth === "full";
    syncedSettings.containerMode = isFull ? "full" : "contained";
    syncedSettings.fullTopWidth = isFull;
    if (isFull) syncedSettings.bannerFloating = false;
  }
  if ("borderRadius" in patch) {
    const nextPx = radiusTokenToPx(patch.borderRadius);
    syncedSettings.borderRadiusPx = nextPx;
    if (nextPx !== undefined) syncedSettings.usePerCornerRadius = false;
    for (const devKey of ["heroDesktopConfig", "heroTabletConfig", "heroMobileConfig"] as const) {
      const existingDev = syncedSettings[devKey];
      if (existingDev && typeof existingDev === "object") {
        syncedSettings[devKey] = { ...(existingDev as Record<string, unknown>), borderRadiusPx: nextPx };
      }
    }
  }
  if ("frameShape" in patch) {
    const mappedArch = mapFrameShapeToArchShape(patch.frameShape);
    if (mappedArch) syncedSettings.archShape = mappedArch;
  }
  if ("useCornerColors" in patch) syncedSettings.useCornerColors = patch.useCornerColors;
  if ("cornerColorTl" in patch) syncedSettings.cornerColorTl = patch.cornerColorTl;
  if ("cornerColorTr" in patch) syncedSettings.cornerColorTr = patch.cornerColorTr;
  if ("cornerColorBr" in patch) syncedSettings.cornerColorBr = patch.cornerColorBr;
  if ("cornerColorBl" in patch) syncedSettings.cornerColorBl = patch.cornerColorBl;
  if ("usePerCornerRadius" in patch) syncedSettings.usePerCornerRadius = patch.usePerCornerRadius;
  if ("borderRadiusTlPx" in patch) syncedSettings.borderRadiusTlPx = patch.borderRadiusTlPx;
  if ("borderRadiusTrPx" in patch) syncedSettings.borderRadiusTrPx = patch.borderRadiusTrPx;
  if ("borderRadiusBrPx" in patch) syncedSettings.borderRadiusBrPx = patch.borderRadiusBrPx;
  if ("borderRadiusBlPx" in patch) syncedSettings.borderRadiusBlPx = patch.borderRadiusBlPx;
  if ("imageFilterPreset" in patch) syncedSettings.imageFilterPreset = patch.imageFilterPreset;
  if ("imageBrightness" in patch) syncedSettings.imageBrightness = patch.imageBrightness;
  if ("imageContrast" in patch) syncedSettings.imageContrast = patch.imageContrast;
  if ("imageSaturation" in patch) syncedSettings.imageSaturation = patch.imageSaturation;
  if ("imageSepia" in patch) syncedSettings.imageSepia = patch.imageSepia;
  if ("imageBlurPx" in patch) syncedSettings.imageBlurPx = patch.imageBlurPx;
  return syncedSettings;
}
