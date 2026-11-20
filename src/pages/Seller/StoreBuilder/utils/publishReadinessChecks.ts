import { CustomPageSection, SellerStoreConfig } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { isCatalogProductPubliclyActive } from "../../../../domains/seller/studioCatalogResolver";
import { StudioNavMode } from "../components/studio/studio.types";
import { CatalogLoadStatus } from "../hooks/studioCatalogLoader";

export interface PublishCheckIssue {
  id: string;
  message: string;
  targetNav?: StudioNavMode;
  targetSectionId?: string;
  actionLabel?: string;
}

export interface PublishReadinessSummary {
  visibleSectionCount: number;
  hiddenSectionCount: number;
  activeProductCount: number;
  catalogVerified: boolean;
  catalogStatus: CatalogLoadStatus;
  draftRevision?: number;
  nextVersionNumber: number;
  hasUnsavedChanges: boolean;
}

export interface PublishReadinessReport {
  blockers: PublishCheckIssue[];
  warnings: PublishCheckIssue[];
  canPublish: boolean;
  summary: PublishReadinessSummary;
}

export function evaluatePublishReadiness(params: {
  storeConfig?: SellerStoreConfig | null;
  sections: CustomPageSection[];
  products: Product[];
  catalogStatus?: CatalogLoadStatus;
  draftRevision?: number;
  currentVersionNumber?: number;
  hasUnsavedChanges?: boolean;
}): PublishReadinessReport {
  const {
    storeConfig,
    sections,
    products,
    catalogStatus = "loaded",
    draftRevision,
    currentVersionNumber = 1,
    hasUnsavedChanges = false,
  } = params;
  const blockers: PublishCheckIssue[] = [];
  const warnings: PublishCheckIssue[] = [];

  const visibleSections = sections.filter((s) => s.isVisible !== false);
  const hiddenSections = sections.filter((s) => s.isVisible === false);
  const activeProducts = products.filter(isCatalogProductPubliclyActive);

  // 1. Blocage : Aucune section visible
  if (visibleSections.length === 0) {
    blockers.push({
      id: "no-visible-sections",
      message: "Aucune section visible sur votre page d'accueil. Ajoutez ou affichez au moins une section avant de publier.",
      targetNav: "sections",
      actionLabel: "Gérer les sections",
    });
  }

  // 2. Blocage : Identité incomplète
  if (storeConfig !== undefined && storeConfig !== null) {
    const shopName = (storeConfig.shopName || "").trim();
    const shopSlug = (storeConfig.shopSlug || "").trim();
    if (!shopName || !shopSlug) {
      blockers.push({
        id: "missing-identity",
        message: "Nom commercial ou lien URL (slug) manquant dans l'identité de la boutique.",
        targetNav: "identity",
        actionLabel: "Compléter l'identité",
      });
    }
  }

  // 3. Blocage : Lien dangereux (javascript: / vbscript:) ou Page personnalisée publiée vide
  for (const sec of visibleSections) {
    const s = (sec.settings || {}) as Record<string, unknown>;
    const ctaLink = String(s.ctaLink || "").trim();
    if (/^(javascript|vbscript):/i.test(ctaLink)) {
      blockers.push({
        id: `unsafe-cta-${sec.id}`,
        message: `La section « ${sec.title || sec.type} » contient un lien de bouton non sécurisé.`,
        targetNav: "sections",
        targetSectionId: sec.id,
        actionLabel: "Corriger le lien",
      });
    }
  }

  const emptyPublishedPages = (storeConfig?.customPages || []).filter(
    (cp) => (cp.isPublished ?? true) && cp.templateId !== "collection" && (!Array.isArray(cp.sectionIds) || cp.sectionIds.length === 0)
  );
  if (emptyPublishedPages.length > 0) {
    warnings.push({
      id: "empty-custom-pages",
      message: `${emptyPublishedPages.length} page(s) personnalisée(s) publiée(s) ne contient aucune section.`,
      targetNav: "pages",
      actionLabel: "Vérifier les pages",
    });
  }

  // 4. Avertissements Catalogue (erreur réseau distincte d'un catalogue vide)
  if (catalogStatus === "error") {
    warnings.push({
      id: "catalog-load-error",
      message: "Votre catalogue n'a pas pu être vérifié (erreur de chargement serveur). Les sections produits n'ont pas pu être contrôlées.",
      targetNav: "catalog",
      actionLabel: "Vérifier le catalogue",
    });
  } else if (catalogStatus === "loaded" && activeProducts.length === 0) {
    warnings.push({
      id: "empty-catalog",
      message: "Aucun produit actif n'est encore enregistré dans votre boutique.",
      targetNav: "catalog",
      actionLabel: "Ouvrir le catalogue",
    });
  }

  // 5. Avertissements de sections visibles incomplètes (Hero sans image, section vide)
  for (const sec of visibleSections) {
    const s = (sec.settings || {}) as Record<string, unknown>;
    if (sec.type === "hero_banner") {
      const cinematicImg = (s.cinematicConfig as { image?: { src?: string } } | undefined)?.image?.src;
      const heroImg = String(s.imageUrl || s.backgroundImage || cinematicImg || "").trim();
      if (!heroImg) {
        warnings.push({
          id: `hero-missing-image-${sec.id}`,
          message: `La bannière « ${sec.title || "Hero"} » n'a pas encore de photographie principale configurée.`,
          targetNav: "sections",
          targetSectionId: sec.id,
          actionLabel: "Choisir une image",
        });
      }
    } else if (sec.type === "featured_categories" && (!Array.isArray(s.categories) || s.categories.length === 0)) {
      warnings.push({
        id: `empty-categories-${sec.id}`,
        message: `La section « ${sec.title || "Catégories"} » est visible mais ne contient aucun rayon.`,
        targetNav: "sections",
        targetSectionId: sec.id,
        actionLabel: "Configurer les rayons",
      });
    } else if (sec.type === "faq_accordion" && (!Array.isArray(s.items) || s.items.length === 0)) {
      warnings.push({
        id: `empty-faq-${sec.id}`,
        message: `La section « ${sec.title || "FAQ"} » est visible mais ne contient aucune question.`,
        targetNav: "sections",
        targetSectionId: sec.id,
        actionLabel: "Ajouter des questions",
      });
    }
  }

  // 6. Avertissement SEO si non renseigné
  if (storeConfig) {
    const metaTitle = (storeConfig.seo?.metaTitle || "").trim();
    const metaDesc = (storeConfig.seo?.metaDescription || storeConfig.shopDescription || "").trim();
    if (!metaTitle && metaDesc.length < 20) {
      warnings.push({
        id: "missing-seo-meta",
        message: "Titre SEO ou description de recherche non renseignés pour l'indexation de la boutique.",
        targetNav: "settings",
        actionLabel: "Compléter le SEO",
      });
    }
  }

  return {
    blockers,
    warnings,
    canPublish: blockers.length === 0,
    summary: {
      visibleSectionCount: visibleSections.length,
      hiddenSectionCount: hiddenSections.length,
      activeProductCount: activeProducts.length,
      catalogVerified: catalogStatus === "loaded",
      catalogStatus,
      draftRevision,
      nextVersionNumber: Math.max(1, currentVersionNumber + 1),
      hasUnsavedChanges,
    },
  };
}
