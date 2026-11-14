export const SECTION_TYPE_LABELS: Record<string, string> = {
  hero_banner: "Bannière Principale",
  promo_carousel: "Carrousel Promotionnel",
  kinetic_marquee: "Bandeau Cinétique",
  featured_categories: "Rayons & Catégories",
  curated_collections: "Collections Privées",
  new_arrivals: "Nouveautés",
  featured_products: "Sélection de Produits",
  best_sellers: "Meilleures Ventes",
  product_grid: "Catalogue Produits",
  brand_story: "Histoire de la Maison",
  showcase_video: "Vidéo de Présentation",
  verified_reviews: "Avis Clients Vérifiés",
  delivery_info: "Tarifs de Livraison",
  return_policy: "Politique de Retour",
  faq_accordion: "Questions Fréquentes",
  contact_footer: "Pied de Page & Contact",
};

const SUB_ELEMENT_LABELS: Record<string, string> = {
  background: "Fond & Image",
  badge: "Badge Sur-titre",
  title: "En-tête & Titre",
  subtitle: "Sous-titre",
  cta: "Bouton Principal",
  ctaPrimary: "Bouton Principal",
  ctaSecondary: "Bouton Secondaire",
  "category-style": "Style & Grille",
  "category-presets": "Modèles",
  "product-layout": "Disposition Grille",
  "product-card-design": "Design des Cartes",
  "countdown-card": "Chrono Offre",
  countdown: "Chrono Offre",
  selection: "Sélection Produits",
  cascade: "Disposition & Grille",
};

export function formatSubElementLabel(sub: string): string {
  if (SUB_ELEMENT_LABELS[sub]) return SUB_ELEMENT_LABELS[sub];
  if (sub.startsWith("slide-")) return `Slide ${parseInt(sub.replace("slide-", ""), 10) + 1}`;
  if (sub.startsWith("cat-") || sub.startsWith("category-items:")) {
    const raw = sub.includes(":") ? sub.split(":")[1] : sub.replace("cat-", "");
    return `Catégorie #${parseInt(raw, 10) + 1}`;
  }
  if (sub.startsWith("faq-")) return `Question FAQ #${parseInt(sub.replace("faq-", ""), 10) + 1}`;
  if (sub.startsWith("review-")) return `Avis Client #${parseInt(sub.replace("review-", ""), 10) + 1}`;
  return sub;
}

import type { CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";

export function syncHeroStylesFromSettingsPatch(
  currentStyles: CustomPageSectionStyles = {},
  patch: Record<string, unknown>
): CustomPageSectionStyles {
  const nextStyles: CustomPageSectionStyles = { ...currentStyles };
  if ("bannerBgColor" in patch) nextStyles.backgroundColor = patch.bannerBgColor as string;
  if ("bannerBorderColor" in patch) nextStyles.sectionBorderColor = patch.bannerBorderColor as string;
  if ("titleColor" in patch) nextStyles.headingColor = patch.titleColor as string;
  if ("subtitleColor" in patch) nextStyles.subtitleColor = patch.subtitleColor as string;
  if ("badgeBgColor" in patch) nextStyles.badgeBgColor = patch.badgeBgColor as string;
  if ("badgeTextColor" in patch) nextStyles.badgeTextColor = patch.badgeTextColor as string;
  if ("ctaBgColor" in patch) nextStyles.buttonBgColor = patch.ctaBgColor as string;
  if ("ctaTextColor" in patch) nextStyles.buttonTextColor = patch.ctaTextColor as string;
  if ("ctaBorderColor" in patch) nextStyles.buttonBorderColor = patch.ctaBorderColor as string;
  if ("ctaStyle" in patch) nextStyles.buttonStyle = patch.ctaStyle as CustomPageSectionStyles["buttonStyle"];
  if ("ctaShadow" in patch) nextStyles.buttonShadow = patch.ctaShadow as CustomPageSectionStyles["buttonShadow"];
  if ("ctaBorderRadiusPx" in patch) nextStyles.buttonBorderRadiusPx = patch.ctaBorderRadiusPx as number;
  if ("ctaBorderWidthPx" in patch) nextStyles.buttonBorderWidthPx = patch.ctaBorderWidthPx as number;
  if ("bannerShadow" in patch) nextStyles.shadow = patch.bannerShadow as CustomPageSectionStyles["shadow"];
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
  if ("imageBrightness" in patch) nextStyles.imageBrightness = patch.imageBrightness as number;
  if ("imageContrast" in patch) nextStyles.imageContrast = patch.imageContrast as number;
  if ("imageSaturation" in patch) nextStyles.imageSaturation = patch.imageSaturation as number;
  if ("imageSepia" in patch) nextStyles.imageSepia = patch.imageSepia as number;
  if ("imageBlurPx" in patch) nextStyles.imageBlurPx = patch.imageBlurPx as number;
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
  if ("headingColor" in patch) syncedSettings.titleColor = patch.headingColor;
  if ("subtitleColor" in patch) syncedSettings.subtitleColor = patch.subtitleColor;
  if ("badgeBgColor" in patch) syncedSettings.badgeBgColor = patch.badgeBgColor;
  if ("badgeTextColor" in patch) syncedSettings.badgeTextColor = patch.badgeTextColor;
  if ("buttonBgColor" in patch) syncedSettings.ctaBgColor = patch.buttonBgColor;
  if ("buttonTextColor" in patch) syncedSettings.ctaTextColor = patch.buttonTextColor;
  if ("buttonBorderColor" in patch) syncedSettings.ctaBorderColor = patch.buttonBorderColor;
  if ("buttonStyle" in patch) syncedSettings.ctaStyle = patch.buttonStyle;
  if ("buttonShadow" in patch) syncedSettings.ctaShadow = patch.buttonShadow;
  if ("buttonBorderRadiusPx" in patch) syncedSettings.ctaBorderRadiusPx = patch.buttonBorderRadiusPx;
  if ("buttonBorderWidthPx" in patch) syncedSettings.ctaBorderWidthPx = patch.buttonBorderWidthPx;
  if ("shadow" in patch) syncedSettings.bannerShadow = patch.shadow;
  if ("containerWidth" in patch) syncedSettings.containerMode = patch.containerWidth === "full" ? "full" : "contained";
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
