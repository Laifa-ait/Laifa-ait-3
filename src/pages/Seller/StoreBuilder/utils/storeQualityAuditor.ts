import {
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";

export type AuditCheckStatus = "pass" | "warn" | "fail";
export type AuditAutoFixType =
  | "add-hero"
  | "add-categories"
  | "add-products"
  | "add-trust"
  | "fix-contrast"
  | "open-seo";

export interface StoreQualityCheckResult {
  id: string;
  title: string;
  status: AuditCheckStatus;
  badgeText: string;
  summary: string;
  autoFixActions?: Array<{ label: string; fixType: AuditAutoFixType }>;
}

export interface StoreQualityReport {
  overallScore: number;
  checks: StoreQualityCheckResult[];
}

export function getWcagContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string): number => {
    const clean = (hex || "").replace("#", "").trim();
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    if (full.length < 6) return 0.5;
    const r = parseInt(full.substring(0, 2), 16) / 255;
    const g = parseInt(full.substring(2, 4), 16) / 255;
    const b = parseInt(full.substring(4, 6), 16) / 255;
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return 0.5;
    const [lr, lg, lb] = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    return lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  };
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function buildStoreQualityReport(params: {
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products: Product[];
  storeConfig?: SellerStoreConfig | null;
  shopName?: string;
  shopSlug?: string;
}): StoreQualityReport {
  const { sections, theme, products, storeConfig, shopName, shopSlug } = params;
  const visibleSections = sections.filter((s) => s.isVisible);
  let score = 0;

  // 1. Contraste WCAG 2.1 (Texte Courant >= 4.5:1, UI/Primaire >= 3.0:1)
  const canvasHex = theme.canvasColor || "#FAF6F0";
  const textHex = theme.secondaryColor || "#18181B";
  const primaryHex = theme.primaryColor || "#023859";
  const textContrast = getWcagContrastRatio(canvasHex, textHex);
  const primaryContrast = getWcagContrastRatio(canvasHex, primaryHex);
  const minContrast = Math.min(textContrast, primaryContrast);

  let contrastStatus: AuditCheckStatus = "pass";
  let contrastBadge = `${textContrast.toFixed(1)}:1 (Conforme AA)`;
  if (textContrast < 4.5 || primaryContrast < 3.0) {
    if (textContrast < 3.0 || primaryContrast < 2.2) {
      contrastStatus = "fail";
      contrastBadge = `${minContrast.toFixed(1)}:1 (Échec WCAG)`;
    } else {
      contrastStatus = "warn";
      contrastBadge = `${minContrast.toFixed(1)}:1 (Insuffisant AA)`;
    }
  } else {
    score += 20;
  }
  if (contrastStatus === "warn") score += 10;

  // 2. Textes Alternatifs (Alt) & Intégrité des Médias
  let totalImages = 0;
  let missingAltCount = 0;
  let brokenMediaCount = 0;

  visibleSections.forEach((sec) => {
    const s = (sec.settings || {}) as Record<string, unknown>;
    if (sec.type === "hero_banner") {
      totalImages += 1;
      if (!String(s.imageUrl || s.backgroundImage || "").trim()) brokenMediaCount += 1;
      if (String(s.title || sec.title || "").trim().length < 3) missingAltCount += 1;
    } else if (sec.type === "promo_carousel" && Array.isArray(s.slides)) {
      (s.slides as Array<Record<string, unknown>>).forEach((slide) => {
        totalImages += 1;
        if (!String(slide.imageUrl || "").trim()) brokenMediaCount += 1;
        if (!String(slide.title || slide.badge || "").trim()) missingAltCount += 1;
      });
    } else if (sec.type === "featured_categories" && Array.isArray(s.categories)) {
      (s.categories as Array<Record<string, unknown>>).forEach((cat) => {
        totalImages += 1;
        if (!String(cat.name || "").trim()) missingAltCount += 1;
      });
    }
  });

  const altStatus: AuditCheckStatus =
    brokenMediaCount > 0 ? "fail" : missingAltCount > 0 ? "warn" : "pass";
  if (altStatus === "pass") score += 15;
  else if (altStatus === "warn") score += 8;

  // 3. Poids des Images & Médias Base64
  let inlineBase64Kb = 0;
  const serialized =
    JSON.stringify(visibleSections) +
    JSON.stringify(storeConfig?.logoUrl || "") +
    JSON.stringify(storeConfig?.bannerUrl || "");
  const base64Matches = serialized.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/g) || [];
  base64Matches.forEach((m) => {
    inlineBase64Kb += Math.round((m.length * 0.75) / 1024);
  });

  const weightStatus: AuditCheckStatus =
    inlineBase64Kb > 500 ? "fail" : inlineBase64Kb > 150 ? "warn" : "pass";
  if (weightStatus === "pass") score += 15;
  else if (weightStatus === "warn") score += 8;

  // 4. Adaptation Mobile & Lisibilité Tactile
  const hiddenCriticalOnMobile = visibleSections.filter(
    (sec) =>
      ["hero_banner", "featured_products", "product_grid"].includes(sec.type) &&
      Boolean((sec.settings as Record<string, unknown>)?.hideOnMobile)
  ).length;
  const bodySize = theme.bodyFontSizePx ?? 15;
  const mobileStatus: AuditCheckStatus =
    hiddenCriticalOnMobile > 0 ? "fail" : bodySize < 13 ? "warn" : "pass";
  if (mobileStatus === "pass") score += 15;
  else if (mobileStatus === "warn") score += 8;

  // 5. Référencement SEO & Métadonnées OpenGraph
  const metaTitle = (storeConfig?.seo?.metaTitle || "").trim();
  const metaDesc = (storeConfig?.seo?.metaDescription || storeConfig?.shopDescription || "").trim();
  const effectiveSlug = (storeConfig?.shopSlug || shopSlug || "").trim();
  const seoStatus: AuditCheckStatus =
    !effectiveSlug || (!metaTitle && metaDesc.length < 20)
      ? "fail"
      : metaTitle.length < 10 || metaDesc.length < 40
      ? "warn"
      : "pass";
  if (seoStatus === "pass") score += 15;
  else if (seoStatus === "warn") score += 8;

  // 6. Structure E-Commerce & Livraison 69 Wilayas
  const hasHero = visibleSections.some((s) => s.type === "hero_banner" || s.type === "promo_carousel");
  const hasCategories = visibleSections.some((s) => s.type === "featured_categories");
  const hasProducts = visibleSections.some((s) =>
    ["featured_products", "product_grid", "best_sellers", "new_arrivals"].includes(s.type)
  );
  const hasTrust = visibleSections.some((s) =>
    ["delivery_info", "verified_reviews", "faq_accordion", "return_policy", "contact_footer"].includes(s.type)
  );
  const inStockCount = products.filter((p) => (p.stock ?? 0) > 0).length;

  const missingArchFixes: Array<{ label: string; fixType: AuditAutoFixType }> = [];
  if (!hasHero) missingArchFixes.push({ label: "Ajouter Bannière Hero", fixType: "add-hero" });
  if (!hasCategories) missingArchFixes.push({ label: "Ajouter Rayons", fixType: "add-categories" });
  if (!hasProducts) missingArchFixes.push({ label: "Ajouter Grille Produits", fixType: "add-products" });
  if (!hasTrust) missingArchFixes.push({ label: "Ajouter Livraison 69 Wilayas", fixType: "add-trust" });

  const archStatus: AuditCheckStatus =
    !hasProducts || !hasHero ? "fail" : missingArchFixes.length > 0 ? "warn" : "pass";
  if (archStatus === "pass") score += 20;
  else if (archStatus === "warn") score += 12;
  else if (hasHero || hasProducts) score += 6;

  return {
    overallScore: Math.min(100, Math.max(0, score)),
    checks: [
      {
        id: "contrast",
        title: "Contraste Visuel WCAG 2.1 (Texte & Boutons)",
        status: contrastStatus,
        badgeText: contrastBadge,
        summary:
          contrastStatus === "pass"
            ? `Texte (${textHex}) sur fond (${canvasHex}) : ${textContrast.toFixed(1)}:1 • Primaire (${primaryHex}) : ${primaryContrast.toFixed(1)}:1.`
            : `Échec de lisibilité : ratio texte ${textContrast.toFixed(1)}:1 (seuil AA 4.5:1) / primaire ${primaryContrast.toFixed(1)}:1 (seuil 3.0:1).`,
        autoFixActions:
          contrastStatus !== "pass"
            ? [{ label: "Auto-Fix : Corriger le contraste WCAG", fixType: "fix-contrast" }]
            : undefined,
      },
      {
        id: "alt-media",
        title: "Accessibilité Images & Textes Alternatifs (Alt)",
        status: altStatus,
        badgeText:
          altStatus === "pass"
            ? `${totalImages} médias conformes`
            : altStatus === "fail"
            ? `Échec (${brokenMediaCount} média manquant)`
            : `${missingAltCount} alt manquant(s)`,
        summary:
          altStatus === "pass"
            ? "Toutes les bannières et cartes de rayons disposent d'un libellé descriptif accessible."
            : "Ajoutez un titre ou texte alternatif descriptif sur chaque bannière et diapositive.",
      },
      {
        id: "image-weight",
        title: "Poids des Images & Charge Réseau Mobile",
        status: weightStatus,
        badgeText:
          inlineBase64Kb === 0
            ? "URLs CDN optimisées"
            : weightStatus === "fail"
            ? `Échec (${inlineBase64Kb} Ko Base64)`
            : `${inlineBase64Kb} Ko intégrés`,
        summary:
          weightStatus === "pass"
            ? "Aucune image Base64 lourde détectée dans le document de mise en page."
            : "Des images Base64 lourdes ralentissent le chargement 4G. Privilégiez la médiathèque.",
      },
      {
        id: "mobile",
        title: "Adaptation Mobile & Lisibilité Tactile",
        status: mobileStatus,
        badgeText:
          mobileStatus === "pass"
            ? "Mobile-First (Conforme)"
            : mobileStatus === "fail"
            ? `Échec (${hiddenCriticalOnMobile} section masquée)`
            : `Texte ${bodySize}px (< 13px)`,
        summary:
          mobileStatus === "pass"
            ? `Sections clés visibles sur smartphone et taille de texte (${bodySize}px) lisible.`
            : "Une section principale est masquée sur mobile ou la taille de police du corps est inférieure à 13px.",
      },
      {
        id: "seo",
        title: "SEO, Balises Meta & Partage Social",
        status: seoStatus,
        badgeText:
          seoStatus === "pass" ? "Indexation prête" : seoStatus === "fail" ? "Échec SEO (Incomplet)" : "Meta à enrichir",
        summary:
          seoStatus === "pass"
            ? `Titre SEO (${metaTitle.length || (shopName || "").length} car.) et description configurés sur /store/${effectiveSlug}.`
            : "Renseignez un titre SEO (30-65 car.) et une méta-description (50-160 car.) pour Google.",
        autoFixActions: seoStatus !== "pass" ? [{ label: "Ouvrir Réglages SEO", fixType: "open-seo" }] : undefined,
      },
      {
        id: "architecture",
        title: "Architecture Conversion & Livraison 69 Wilayas",
        status: archStatus,
        badgeText:
          archStatus === "pass"
            ? `${visibleSections.length} sections • ${inStockCount} en stock`
            : archStatus === "fail"
            ? "Échec (Sections clés absentes)"
            : "À compléter",
        summary:
          archStatus === "pass"
            ? "Bannière Hero, Rayons, Produits et Réassurance Livraison 69 Wilayas actifs."
            : "Complétez votre vitrine avec les sections indispensables à la conversion e-commerce.",
        autoFixActions: missingArchFixes.length > 0 ? missingArchFixes : undefined,
      },
    ],
  };
}
