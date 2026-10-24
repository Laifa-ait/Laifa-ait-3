import React from "react";
import { X, CheckCircle, AlertTriangle, Sparkles, ShieldCheck, ShoppingBag, Globe } from "lucide-react";
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

// Luminance calculation for WCAG contrast ratio
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
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
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
  const isContrastPass = contrastRatio >= 3.5;

  const visibleSections = sections.filter((s) => s.isVisible);
  const hasHero = visibleSections.some((s) => s.type === "hero_banner" || s.type === "promo_carousel");
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
  const hasValidIdentity = Boolean(shopName && shopName.trim().length >= 2 && shopSlug && shopSlug.trim().length >= 3);

  let healthScore = 30;
  if (hasHero) healthScore += 15;
  if (hasProductSection) healthScore += 15;
  if (hasActiveCatalog) healthScore += 15;
  if (hasTrust) healthScore += 15;
  if (isContrastPass && hasValidIdentity) healthScore += 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#F9FAFB] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Audit Qualité & Prêt-à-Vendre</h3>
              <p className="text-[11px] text-gray-500">Vérification réelle des données de votre boutique</p>
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

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Global Score Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-orange-900 uppercase tracking-wider block">
                Indice de Préparation Vitrine
              </span>
              <p className="text-2xl font-black text-orange-600 mt-0.5">{healthScore} / 100</p>
              <p className="text-[11px] text-orange-800 mt-1">
                {healthScore >= 85
                  ? "Votre boutique est complète et prête à convertir vos visiteurs !"
                  : "Consultez les recommandations ci-dessous pour optimiser vos ventes."}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-orange-200 flex items-center justify-center text-orange-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Real Computed Checks */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Diagnostic en temps réel
            </h4>

            {/* Check 1: Active Catalog & Stock */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {hasActiveCatalog ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                    <span>Marchandises en stock</span>
                  </span>
                  <span className={`font-bold ${hasActiveCatalog ? "text-green-600" : "text-amber-600"}`}>
                    {inStockProductsCount} / {products.length} disponibles
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {hasActiveCatalog
                    ? "Vos produits actifs sont prêts à être commandés sans commission."
                    : "Ajoutez des produits avec du stock dans l'onglet Catalogue pour permettre les achats."}
                </p>
              </div>
            </div>

            {/* Check 2: Structure de Conversion */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {hasHero && hasProductSection ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Structure de Conversion</span>
                  <span className="text-gray-600 font-mono">{visibleSections.length} sections visibles</span>
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {!hasHero
                    ? "Ajoutez une Bannière Hero ou un Carrousel pour accueillir vos visiteurs."
                    : !hasProductSection
                    ? "Ajoutez une section Produits en vedette ou Catalogue complet."
                    : "Bannière d'accueil et grille de produits actives sur la vitrine."}
                </p>
              </div>
            </div>

            {/* Check 3: Contrast WCAG */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {isContrastPass ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Lisibilité & Contraste des couleurs</span>
                  <span className={`font-bold ${isContrastPass ? "text-green-600" : "text-amber-600"}`}>
                    {contrastRatio.toFixed(1)}:1 {isContrastPass ? "(Optimal)" : "(Faible)"}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Contraste calculé entre la couleur de fond ({bgHex}) et la couleur principale ({primaryHex}).
                </p>
              </div>
            </div>

            {/* Check 4: Identity & Slug */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {hasValidIdentity ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>Identité & Lien Public</span>
                  </span>
                  <span className="font-mono text-[11px] text-gray-700">
                    {shopSlug ? `/store/${shopSlug}` : "Non défini"}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {hasTrust
                    ? "Informations de livraison/contact et identité de marque bien renseignées."
                    : "Pensez à ajouter une section Livraison, FAQ ou Contact pour rassurer vos acheteurs."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Fermer le diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};
