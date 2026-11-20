import {
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import {
  isCatalogProductPubliclyActive,
  resolveProductFeedItems,
} from "../../../../domains/seller/studioCatalogResolver";
import { getContrastRatio } from "../../../../components/Store/sections/themeColorUtils";
import { StudioNavMode } from "../components/studio/studio.types";
import { CatalogLoadStatus } from "../hooks/studioCatalogLoader";
import { DEFAULT_MODERN_THEME } from "../constants/studioThemeDefaults";

export type AuditCheckStatus = "pass" | "warn" | "fail";
export type AuditAutoFixType = "add-hero" | "add-categories" | "add-products" | "add-trust" | "fix-contrast" | "open-seo";

export interface StoreQualityCheckResult {
  id: string;
  title: string;
  status: AuditCheckStatus;
  badgeText: string;
  summary: string;
  targetNav?: StudioNavMode;
  targetLabel?: string;
  targetSectionId?: string;
  autoFixActions?: Array<{ label: string; fixType: AuditAutoFixType }>;
}

export interface StoreQualityReport {
  overallScore: number;
  checks: StoreQualityCheckResult[];
}

export function getWcagContrastRatio(hex1: string, hex2: string): number {
  return getContrastRatio(hex1, hex2);
}

export function buildStoreQualityReport(params: {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products: Product[];
  catalogStatus?: CatalogLoadStatus;
  storeConfig?: SellerStoreConfig | null;
  shopName?: string;
  shopSlug?: string;
}): StoreQualityReport {
  const { sections, theme, products, catalogStatus = "loaded", storeConfig, shopName, shopSlug } = params;
  const visibleSections = sections.filter((s) => s.isVisible);
  let score = 0;

  // 1. Contraste WCAG 2.1 (Texte Courant >= 4.5:1, UI/Primaire >= 3.0:1)
  const canvasHex = theme.canvasColor || DEFAULT_MODERN_THEME.canvasColor;
  const textHex = theme.secondaryColor || DEFAULT_MODERN_THEME.secondaryColor;
  const primaryHex = theme.primaryColor || DEFAULT_MODERN_THEME.primaryColor;
  const textContrast = getWcagContrastRatio(canvasHex, textHex);
  const primaryContrast = getWcagContrastRatio(canvasHex, primaryHex);
  const minContrast = Math.min(textContrast, primaryContrast);

  let contrastStatus: AuditCheckStatus = "pass";
  let contrastBadge = `${textContrast.toFixed(1)}:1 (Conforme AA)`;
  if (textContrast < 4.5 || primaryContrast < 3.0) {
    contrastStatus = textContrast < 3.0 || primaryContrast < 2.2 ? "fail" : "warn";
    contrastBadge = contrastStatus === "fail" ? `${minContrast.toFixed(1)}:1 (Échec WCAG)` : `${minContrast.toFixed(1)}:1 (Insuffisant AA)`;
  } else score += 20;
  if (contrastStatus === "warn") score += 10;

  // 2. Textes Alternatifs (Alt), Liens Cassés & Médias
  let totalImages = 0;
  let missingAltCount = 0;
  let brokenMediaOrLinksCount = 0;
  let firstBrokenMediaSecId: string | undefined;

  visibleSections.forEach((sec) => {
    const s = (sec.settings || {}) as Record<string, unknown>;
    if (sec.type === "hero_banner") {
      totalImages += 1;
      const cinematicImg = (s.cinematicConfig as { image?: { src?: string } } | undefined)?.image?.src;
      const heroImg = String(s.imageUrl || s.backgroundImage || cinematicImg || "").trim();
      if (!heroImg) { brokenMediaOrLinksCount += 1; if (!firstBrokenMediaSecId) firstBrokenMediaSecId = sec.id; }
      if (String(s.imageAlt || s.title || sec.title || "").trim().length < 3) missingAltCount += 1;
      const ctaLink = String(s.ctaLink || "").trim();
      const targetType = String(s.ctaTargetType || (s.cinematicConfig as { button?: { targetType?: string } } | undefined)?.button?.targetType || "");
      const hasValidTarget = targetType === "catalog" || targetType === "category" || targetType === "product" || Boolean(ctaLink);
      if (s.showCta !== false && (!hasValidTarget || /^(javascript|vbscript):/i.test(ctaLink))) {
        brokenMediaOrLinksCount += 1;
        if (!firstBrokenMediaSecId) firstBrokenMediaSecId = sec.id;
      }
    } else if (sec.type === "promo_carousel" && Array.isArray(s.slides)) {
      (s.slides as Array<Record<string, unknown>>).forEach((slide) => {
        totalImages += 1;
        if (!String(slide.imageUrl || "").trim()) { brokenMediaOrLinksCount += 1; if (!firstBrokenMediaSecId) firstBrokenMediaSecId = sec.id; }
        if (!String(slide.title || slide.badge || "").trim()) missingAltCount += 1;
      });
    } else if (sec.type === "featured_categories" && Array.isArray(s.categories)) {
      (s.categories as Array<Record<string, unknown>>).forEach((cat) => {
        totalImages += 1;
        if (!String(cat.name || "").trim()) missingAltCount += 1;
      });
    }
  });

  const altStatus: AuditCheckStatus = brokenMediaOrLinksCount > 0 ? "fail" : missingAltCount > 0 ? "warn" : "pass";
  if (altStatus === "pass") score += 15;
  else if (altStatus === "warn") score += 8;

  // 3. Poids des Images & Médias Base64 (sans allocation JSON.stringify)
  let inlineBase64Kb = 0;
  const walkBase64 = (val: unknown): void => {
    if (typeof val === "string") {
      if (val.startsWith("data:image/") && !val.startsWith("data:image/svg+xml") && val.includes(";base64,")) {
        inlineBase64Kb += Math.round((val.length * 0.75) / 1024);
      }
      return;
    }
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) walkBase64(val[i]);
      return;
    }
    if (val && typeof val === "object") {
      const rec = val as Record<string, unknown>;
      for (const k of Object.keys(rec)) walkBase64(rec[k]);
    }
  };
  walkBase64(visibleSections);
  walkBase64(storeConfig?.logoUrl);
  walkBase64(storeConfig?.bannerUrl);
  const weightStatus: AuditCheckStatus = inlineBase64Kb > 500 ? "fail" : inlineBase64Kb > 150 ? "warn" : "pass";
  if (weightStatus === "pass") score += 15;
  else if (weightStatus === "warn") score += 8;

  // 4. Adaptation Mobile, Sections Vides & Pages Sans Contenu
  const hiddenCriticalOnMobile = visibleSections.filter(
    (sec) => ["hero_banner", "featured_products", "product_grid"].includes(sec.type) && Boolean((sec.settings as Record<string, unknown>)?.hideOnMobile)
  ).length;
  let firstEmptySectionId: string | undefined;
  const emptySectionsCount = visibleSections.filter((sec) => {
    const s = (sec.settings || {}) as Record<string, unknown>;
    let isEmpty = false;
    if (sec.type === "featured_categories") isEmpty = !Array.isArray(s.categories) || s.categories.length === 0;
    else if (sec.type === "faq_accordion") isEmpty = !Array.isArray(s.items) || s.items.length === 0;
    else if (sec.type === "brand_story") isEmpty = !String(s.bodyText || "").trim();
    else if (
      catalogStatus === "loaded" &&
      (sec.type === "featured_products" || sec.type === "new_arrivals" || sec.type === "best_sellers" || sec.type === "product_grid")
    ) {
      const res = resolveProductFeedItems(sec.type, {
        selectionMode: s.selectionMode === "manual" || s.selectionMode === "auto" ? s.selectionMode : undefined,
        productIds: Array.isArray(s.productIds) ? (s.productIds as string[]) : undefined,
        filterCategoryId: typeof s.filterCategoryId === "string" ? s.filterCategoryId : undefined,
        maxItems: typeof s.maxItems === "number" ? s.maxItems : undefined,
      }, products);
      isEmpty = res.items.length === 0 || res.obsoleteCategoryFilter;
    }
    if (isEmpty && !firstEmptySectionId) firstEmptySectionId = sec.id;
    return isEmpty;
  }).length;
  const emptyCustomPagesCount = (storeConfig?.customPages || []).filter(
    (cp) => (cp.isPublished ?? true) && Array.isArray(cp.sectionIds) && cp.sectionIds.length === 0
  ).length;
  const bodySize = theme.bodyFontSizePx ?? 15;
  const mobileStatus: AuditCheckStatus =
    hiddenCriticalOnMobile > 0 || emptyCustomPagesCount > 0 ? "fail" : bodySize < 13 || emptySectionsCount > 0 ? "warn" : "pass";
  if (mobileStatus === "pass") score += 15;
  else if (mobileStatus === "warn") score += 8;

  // 5. SEO & Identité
  const metaTitle = (storeConfig?.seo?.metaTitle || "").trim();
  const metaDesc = (storeConfig?.seo?.metaDescription || storeConfig?.shopDescription || "").trim();
  const effectiveSlug = (storeConfig?.shopSlug || shopSlug || "").trim();
  const pagesMissingSeo = (storeConfig?.customPages || []).filter((cp) => (cp.isPublished ?? true) && !String(cp.seoTitle || cp.title || "").trim()).length;
  const seoStatus: AuditCheckStatus =
    !effectiveSlug || (!metaTitle && metaDesc.length < 20) ? "fail" : metaTitle.length < 10 || metaDesc.length < 40 || pagesMissingSeo > 0 ? "warn" : "pass";
  if (seoStatus === "pass") score += 15;
  else if (seoStatus === "warn") score += 8;

  // 6. Structure E-Commerce, Catalogue, Stocks & Livraison 69 Wilayas
  const hasHero = visibleSections.some((s) => s.type === "hero_banner" || s.type === "promo_carousel");
  const hasCategories = visibleSections.some((s) => s.type === "featured_categories");
  const hasProducts = visibleSections.some((s) => ["featured_products", "product_grid", "best_sellers", "new_arrivals"].includes(s.type));
  const hasTrust = visibleSections.some((s) => ["delivery_info", "verified_reviews", "faq_accordion", "return_policy", "contact_footer"].includes(s.type));
  const activeCatalogProducts = products.filter(isCatalogProductPubliclyActive);
  const inStockCount = activeCatalogProducts.filter((p) => (p.stock ?? 0) > 0).length;
  const outOfStockCount = activeCatalogProducts.filter((p) => (p.stock ?? 0) <= 0).length;

  const missingArchFixes: Array<{ label: string; fixType: AuditAutoFixType }> = [];
  if (!hasHero) missingArchFixes.push({ label: "Ajouter Bannière Hero", fixType: "add-hero" });
  if (!hasCategories) missingArchFixes.push({ label: "Ajouter Rayons", fixType: "add-categories" });
  if (!hasProducts) missingArchFixes.push({ label: "Ajouter Grille Produits", fixType: "add-products" });
  if (!hasTrust) missingArchFixes.push({ label: "Ajouter Livraison 69 Wilayas", fixType: "add-trust" });

  const isCatalogUnverified = catalogStatus === "error";
  const archStatus: AuditCheckStatus =
    !hasProducts || !hasHero ? "fail" : isCatalogUnverified || missingArchFixes.length > 0 || (activeCatalogProducts.length > 0 && inStockCount === 0) ? "warn" : "pass";
  if (archStatus === "pass") score += 20;
  else if (archStatus === "warn") score += 12;
  else if (hasHero || hasProducts) score += 6;

  return {
    overallScore: Math.min(100, Math.max(0, score)),
    checks: [
      {
        id: "contrast", title: "Contraste Visuel WCAG 2.1 (Texte & Boutons)", status: contrastStatus, badgeText: contrastBadge,
        summary: contrastStatus === "pass" ? `Texte (${textHex}) sur fond (${canvasHex}) : ${textContrast.toFixed(1)}:1 • Primaire (${primaryHex}) : ${primaryContrast.toFixed(1)}:1.` : `Échec de lisibilité : ratio texte ${textContrast.toFixed(1)}:1 (seuil AA 4.5:1) / primaire ${primaryContrast.toFixed(1)}:1 (seuil 3.0:1).`,
        targetNav: "theme", targetLabel: "Ouvrir Thème & Couleurs",
        autoFixActions: contrastStatus !== "pass" ? [{ label: "Ouvrir Thème & Contraste WCAG", fixType: "fix-contrast" }] : undefined,
      },
      {
        id: "alt-media", title: "Accessibilité Images (Alt) & Intégrité des Liens", status: altStatus,
        badgeText: altStatus === "pass" ? `${totalImages} médias & liens conformes` : altStatus === "fail" ? `Échec (${brokenMediaOrLinksCount} média/lien cassé)` : `${missingAltCount} alt manquant(s)`,
        summary: altStatus === "pass" ? "Toutes les bannières, rayons et boutons disposent d'un texte alternatif et d'un lien valide." : "Renseignez un texte alternatif (imageAlt) et vérifiez les images ou liens de vos sections.",
        targetNav: "sections", targetLabel: "Inspecter la section", targetSectionId: firstBrokenMediaSecId,
      },
      {
        id: "image-weight", title: "Poids des Images & Charge Réseau Mobile", status: weightStatus,
        badgeText: inlineBase64Kb === 0 ? "URLs CDN optimisées" : weightStatus === "fail" ? `Échec (${inlineBase64Kb} Ko Base64)` : `${inlineBase64Kb} Ko intégrés`,
        summary: weightStatus === "pass" ? "Aucune image Base64 lourde détectée dans le document de mise en page." : "Des images Base64 lourdes ralentissent le chargement 4G. Remplacez-les depuis la médiathèque.",
        targetNav: "media", targetLabel: "Ouvrir la Médiathèque",
      },
      {
        id: "mobile", title: "Adaptation Mobile, Contenu des Sections & Pages", status: mobileStatus,
        badgeText: mobileStatus === "pass" ? "Mobile-First (Conforme)" : mobileStatus === "fail" ? `Échec (${hiddenCriticalOnMobile + emptyCustomPagesCount} blocage)` : `${emptySectionsCount} section vide / ${bodySize}px`,
        summary: mobileStatus === "pass" ? `Sections clés visibles sur smartphone, aucune page vide et texte (${bodySize}px) lisible.` : "Vérifiez qu'aucune section clé n'est masquée sur mobile et qu'aucune section ou page publiée n'est vide.",
        targetNav: emptyCustomPagesCount > 0 ? "pages" : "sections", targetLabel: emptyCustomPagesCount > 0 ? "Ouvrir les Pages" : "Vérifier les Sections", targetSectionId: firstEmptySectionId,
      },
      {
        id: "seo", title: "SEO, Balises Meta & Pages Personnalisées", status: seoStatus,
        badgeText: seoStatus === "pass" ? "Indexation prête" : seoStatus === "fail" ? "Échec SEO (Incomplet)" : "Meta à enrichir",
        summary: seoStatus === "pass" ? `Titre SEO (${metaTitle.length || (shopName || "").length} car.) et description configurés sur /store/${effectiveSlug}.` : "Renseignez un titre SEO (30-65 car.) et une méta-description (50-160 car.) pour la boutique et vos pages.",
        targetNav: !effectiveSlug ? "identity" : "settings", targetLabel: !effectiveSlug ? "Ouvrir Identité" : "Ouvrir Réglages SEO",
        autoFixActions: seoStatus !== "pass" ? [{ label: "Ouvrir Réglages SEO", fixType: "open-seo" }] : undefined,
      },
      {
        id: "architecture", title: "Architecture Conversion, Catalogue & 69 Wilayas", status: archStatus,
        badgeText: isCatalogUnverified ? "Catalogue non vérifié" : archStatus === "pass" ? `${visibleSections.length} sections • ${inStockCount} en stock` : archStatus === "fail" ? "Échec (Sections clés absentes)" : `${outOfStockCount} hors stock / À compléter`,
        summary: isCatalogUnverified ? "Le catalogue de produits n'a pas pu être vérifié (erreur de chargement serveur). Rechargez le catalogue avant de publier." : archStatus === "pass" ? "Bannière Hero, Rayons, Produits en stock et Réassurance Livraison 69 Wilayas actifs." : "Complétez votre vitrine avec les sections indispensables et vérifiez la disponibilité de vos produits.",
        targetNav: isCatalogUnverified ? "catalog" : "sections", targetLabel: isCatalogUnverified ? "Vérifier le Catalogue" : "Gérer les Sections",
        autoFixActions: missingArchFixes.length > 0 ? missingArchFixes : undefined,
      },
    ],
  };
}
