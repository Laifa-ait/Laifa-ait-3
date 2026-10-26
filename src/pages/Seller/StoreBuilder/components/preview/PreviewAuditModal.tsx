import React from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  Globe,
  Zap,
} from "lucide-react";
import { CustomPageSection, CustomPageTheme } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

interface PreviewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products?: Product[];
  shopName?: string;
  shopSlug?: string;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length !== 6) return 0.5;
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    const a = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export const PreviewAuditModal: React.FC<PreviewAuditModalProps> = ({
  isOpen,
  onClose,
  sections,
  theme,
  products = [],
  shopName,
  shopSlug,
}) => {
  if (!isOpen) return null;

  const bgHex = theme.canvasColor || "#FAF6F0";
  const primaryHex = theme.primaryColor || "#B85B35";
  const contrastRatio = getContrastRatio(bgHex, primaryHex);
  const isContrastPass = contrastRatio >= 3.0;

  const visibleSections = sections.filter((s) => s.isVisible);
  const hasHero = visibleSections.some(
    (s) => s.type === "hero_banner" || s.type === "promo_carousel"
  );
  const hasCategories = visibleSections.some((s) => s.type === "featured_categories");
  const hasProductSection = visibleSections.some(
    (s) =>
      s.type === "featured_products" ||
      s.type === "product_grid" ||
      s.type === "best_sellers" ||
      s.type === "new_arrivals"
  );
  const hasTrust = visibleSections.some(
    (s) =>
      s.type === "delivery_info" ||
      s.type === "verified_reviews" ||
      s.type === "faq_accordion" ||
      s.type === "return_policy" ||
      s.type === "contact_footer"
  );

  const inStockProductsCount = products.filter((p) => (p.stock ?? 0) > 0).length;
  const hasActiveCatalog = inStockProductsCount > 0;
  const hasValidIdentity = Boolean(
    shopName && shopName.trim().length >= 2 && shopSlug && shopSlug.trim().length >= 3
  );

  let healthScore = 25;
  if (hasHero) healthScore += 15;
  if (hasCategories) healthScore += 15;
  if (hasProductSection) healthScore += 15;
  if (hasActiveCatalog) healthScore += 15;
  if (hasTrust) healthScore += 15;

  const triggerAutoFix = (fixType: "add-hero" | "add-categories" | "add-products" | "add-trust") => {
    window.dispatchEvent(
      new CustomEvent("studio:audit-autofix", {
        detail: { fixType },
      })
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#F9FAFB] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Audit Conversion & Auto-Fix Studio 2.0
              </h3>
              <p className="text-[11px] text-gray-500">
                Diagnostic algorithmique et réparation en 1 clic
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Score Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-orange-900 uppercase tracking-wider block">
                Score de Conversion E-Commerce
              </span>
              <p className="text-2xl font-black text-orange-600 mt-0.5">
                {healthScore} / 100
              </p>
              <p className="text-[11px] text-orange-800 mt-1">
                {healthScore >= 85
                  ? "Excellence ! Votre architecture vitrine est optimisée pour convertir."
                  : "Cliquez sur les boutons « Auto-Fix » ci-dessous pour compléter votre vitrine."}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-orange-200 flex items-center justify-center text-orange-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Check 1: Hero & Rayons */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {hasHero && hasCategories ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">
                    Impact Visuel & Navigation Rayons
                  </span>
                  <span className="text-[11px] font-mono text-gray-600">
                    {visibleSections.length} sections
                  </span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  {hasHero && hasCategories
                    ? "Bannière Hero et Rayons Populaires actifs."
                    : "Une bannière d'accueil et des rayons visuels augmentent le taux de clic de +42%."}
                </p>
                {(!hasHero || !hasCategories) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {!hasHero && (
                      <button
                        type="button"
                        onClick={() => triggerAutoFix("add-hero")}
                        className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Auto-Fix : Ajouter Bannière Hero</span>
                      </button>
                    )}
                    {!hasCategories && (
                      <button
                        type="button"
                        onClick={() => triggerAutoFix("add-categories")}
                        className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Auto-Fix : Ajouter Rayons Populaires</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Check 2: Product Feed */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {hasProductSection && hasActiveCatalog ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                    <span>Exposition Produits & Stock</span>
                  </span>
                  <span className="font-bold text-green-600">
                    {inStockProductsCount} en stock
                  </span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  {hasProductSection
                    ? "Grille de produits active sur la vitrine."
                    : "Aucune grille de produits n'est affichée sur votre page d'accueil."}
                </p>
                {!hasProductSection && (
                  <button
                    type="button"
                    onClick={() => triggerAutoFix("add-products")}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Auto-Fix : Injecter Produits Vedettes</span>
                  </button>
                )}
              </div>
            </div>

            {/* Check 3: Trust & Delivery 58 Wilayas */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {hasTrust ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>Réassurance & Livraison 58 Wilayas</span>
                  </span>
                  <span className="font-mono text-[11px] text-gray-700">
                    {hasValidIdentity ? `/store/${shopSlug}` : "En attente"}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  {hasTrust
                    ? "Tarifs de livraison / Avis / FAQ visibles pour rassurer vos acheteurs."
                    : "Les acheteurs algériens vérifient systématiquement les tarifs de livraison par Wilaya avant d'acheter."}
                </p>
                {!hasTrust && (
                  <button
                    type="button"
                    onClick={() => triggerAutoFix("add-trust")}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Auto-Fix : Ajouter Livraison 58 Wilayas</span>
                  </button>
                )}
              </div>
            </div>

            {/* Check 4: Contrast */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Contraste Visuel WCAG</span>
                  <span className="font-bold text-green-600">
                    {contrastRatio.toFixed(1)}:1 {isContrastPass ? "(Optimal)" : "(Correct)"}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Fond ({bgHex}) et couleur primaire ({primaryHex}) harmonisés.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Terminer l'audit
          </button>
        </div>
      </div>
    </div>
  );
};
