import { CustomPageSection, SellerStoreConfig } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";
import { StudioNavMode } from "../components/studio/studio.types";
import { CatalogLoadStatus } from "../hooks/studioCatalogLoader";

export interface PublishCheckIssue {
  id: string;
  message: string;
  targetNav?: StudioNavMode;
}

export interface PublishReadinessReport {
  blockers: PublishCheckIssue[];
  warnings: PublishCheckIssue[];
  canPublish: boolean;
}

export function evaluatePublishReadiness(params: {
  storeConfig?: SellerStoreConfig | null;
  sections: CustomPageSection[];
  products: Product[];
  catalogStatus?: CatalogLoadStatus;
}): PublishReadinessReport {
  const { storeConfig, sections, products, catalogStatus = "loaded" } = params;
  const blockers: PublishCheckIssue[] = [];
  const warnings: PublishCheckIssue[] = [];

  const visibleSections = sections.filter((s) => s.isVisible !== false);
  if (visibleSections.length === 0) {
    blockers.push({
      id: "no-visible-sections",
      message: "Aucune section visible sur votre page d'accueil. Ajoutez au moins un bloc avant de publier.",
      targetNav: "sections",
    });
  }

  if (storeConfig !== undefined && storeConfig !== null) {
    const shopName = (storeConfig.shopName || "").trim();
    const shopSlug = (storeConfig.shopSlug || "").trim();
    if (!shopName || !shopSlug) {
      blockers.push({
        id: "missing-identity",
        message: "Nom commercial ou lien URL (slug) manquant dans l'identité de la boutique.",
        targetNav: "identity",
      });
    }
  }

  // Conformité Olmart : toutes les interactions passent par les notifications internes (aucun contact externe requis).

  if (catalogStatus === "error") {
    warnings.push({
      id: "catalog-load-error",
      message: "Votre catalogue n'a pas pu être vérifié (erreur de chargement serveur).",
      targetNav: "catalog",
    });
  } else if (catalogStatus === "loaded" && products.length === 0) {
    warnings.push({
      id: "empty-catalog",
      message: "Aucun produit actif n'est encore enregistré dans votre boutique.",
      targetNav: "catalog",
    });
  }

  return {
    blockers,
    warnings,
    canPublish: blockers.length === 0,
  };
}
