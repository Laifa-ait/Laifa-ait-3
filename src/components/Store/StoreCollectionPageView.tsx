import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Sparkles,
  Grid,
  Package,
} from "lucide-react";
import {
  CategoryItem,
  CollectionPageDesignConfig,
  CustomPageTheme,
} from "../../domains/seller/customPage.types";
import { Product } from "../../domains/product/product.types";
import { SectionProductItemCard } from "./sections/SectionProductItemCard";

interface StoreCollectionPageViewProps {
  activeCategory?: CategoryItem | null;
  allCategories: CategoryItem[];
  products: Product[];
  theme: CustomPageTheme;
  config?: CollectionPageDesignConfig;
  pageTitle?: string;
  pageSubtitle?: string;
  pageBannerUrl?: string;
  isStudioPreview?: boolean;
  previewViewport?: "mobile" | "tablet" | "desktop";
  onSelectCategory: (cat: CategoryItem | null) => void;
  onBackToHome: () => void;
  onOpenPageCustomizer?: () => void;
}

export const StoreCollectionPageView: React.FC<StoreCollectionPageViewProps> = ({
  activeCategory,
  allCategories,
  products,
  theme,
  config,
  pageTitle,
  pageSubtitle,
  pageBannerUrl,
  isStudioPreview = false,
  previewViewport = "desktop",
  onSelectCategory,
  onBackToHome,
  onOpenPageCustomizer,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  const headerStyle = config?.headerStyle || "hero-image";
  const headerHeight = config?.headerHeight || "md";
  const overlayOpacity =
    typeof config?.headerOverlayOpacity === "number" ? config.headerOverlayOpacity / 100 : 0.45;
  const showSearch = config?.showSearch !== false;
  const showSort = config?.showSortDropdown !== false;
  const showPills = config?.showCategoryPills !== false;
  const colsDesktop = config?.columnsDesktop || 4;
  const cardStyle = config?.cardStyle || "modern";
  const aspectRatio = config?.cardAspectRatio || "4/5";
  const showStockBadge = config?.showStockBadge !== false;
  const accentColor = theme.primaryColor || "#023859";

  const resolvedTitle = activeCategory
    ? activeCategory.name
    : pageTitle || "Catalogue & Collections";
  const resolvedSubtitle = activeCategory
    ? activeCategory.subtitle || activeCategory.description || `Découvrez notre sélection ${activeCategory.name}`
    : pageSubtitle || "Parcourez l'ensemble de nos articles disponibles par rayon";
  const resolvedBanner =
    activeCategory?.imageUrl ||
    pageBannerUrl ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";

  const displayedProducts = useMemo(() => {
    let list = [...products];
    if (activeCategory) {
      const assignedIds = Array.isArray(activeCategory.productIds)
        ? activeCategory.productIds
        : [];
      if (assignedIds.length > 0) {
        const idSet = new Set(assignedIds);
        list = list.filter((p) => idSet.has(p.id));
      } else if (activeCategory.categoryFilter) {
        const filterLower = activeCategory.categoryFilter.toLowerCase();
        list = list.filter((p) => (p.category || "").toLowerCase() === filterLower);
      } else {
        const nameLower = activeCategory.name.toLowerCase();
        const matched = list.filter(
          (p) =>
            (p.category || "").toLowerCase().includes(nameLower) ||
            p.name.toLowerCase().includes(nameLower)
        );
        if (matched.length > 0) list = matched;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    return list;
  }, [products, activeCategory, searchQuery, sortBy]);

  const heightClass =
    headerHeight === "sm"
      ? "min-h-[150px] py-6"
      : headerHeight === "lg"
      ? "min-h-[260px] py-10"
      : "min-h-[200px] py-8";

  const gridColsClass =
    previewViewport === "mobile"
      ? "grid-cols-2 gap-3"
      : previewViewport === "tablet"
      ? "grid-cols-2 sm:grid-cols-3 gap-4"
      : colsDesktop === 2
      ? "grid-cols-2 gap-5"
      : colsDesktop === 3
      ? "grid-cols-2 sm:grid-cols-3 gap-5"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4";

  return (
    <div className="space-y-5 p-3 sm:p-5 select-none">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#023859]" />
          <span>Retour à l'accueil vitrine</span>
        </button>

        {isStudioPreview && onOpenPageCustomizer && (
          <button
            type="button"
            onClick={onOpenPageCustomizer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#54ACBF]" />
            <span>Customiser cette page</span>
          </button>
        )}
      </div>

      {/* Category / Collection Header */}
      {headerStyle === "minimal" ? (
        <div
          onClick={isStudioPreview ? onOpenPageCustomizer : undefined}
          className={`p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isStudioPreview ? "cursor-pointer hover:ring-2 hover:ring-[#26658C]" : ""
          }`}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#26658C] block mb-1">
              {activeCategory ? "Rayon Spécialisé" : "Catalogue Complet"}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#011C40]">{resolvedTitle}</h1>
            {resolvedSubtitle && <p className="text-xs text-slate-600 mt-1">{resolvedSubtitle}</p>}
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#011C40] shrink-0">
            {displayedProducts.length} article{displayedProducts.length > 1 ? "s" : ""}
          </div>
        </div>
      ) : (
        <div
          onClick={isStudioPreview ? onOpenPageCustomizer : undefined}
          className={`relative rounded-2xl overflow-hidden flex flex-col justify-end px-6 ${heightClass} ${
            isStudioPreview ? "cursor-pointer hover:ring-2 hover:ring-[#26658C]" : ""
          }`}
        >
          <img
            src={resolvedBanner}
            alt={resolvedTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(1, 28, 64, ${overlayOpacity})` }}
          />
          <div className="relative z-10 text-white max-w-2xl">
            <span
              className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ backgroundColor: accentColor }}
            >
              {activeCategory?.badge || `${displayedProducts.length} articles disponibles`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-xs">
              {resolvedTitle}
            </h1>
            {resolvedSubtitle && (
              <p className="text-xs sm:text-sm text-white/90 mt-1">{resolvedSubtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Category Switcher & Search/Sort */}
      {(showPills || showSearch || showSort) && (
        <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          {showPills && allCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  !activeCategory
                    ? "text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={!activeCategory ? { backgroundColor: accentColor } : undefined}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Tous les rayons ({products.length})</span>
              </button>
              {allCategories.map((cat) => {
                const isAct = activeCategory?.id === cat.id || activeCategory?.slug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isAct
                        ? "text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    style={isAct ? { backgroundColor: accentColor } : undefined}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {(showSearch || showSort) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              {showSearch && (
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Rechercher dans ${resolvedTitle}...`}
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#023859] focus:outline-none"
                  />
                </div>
              )}
              {showSort && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "default" | "price-asc" | "price-desc")
                    }
                    className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="default">Tri : Recommandés</option>
                    <option value="price-asc">Prix : Croissant</option>
                    <option value="price-desc">Prix : Décroissant</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Products Grid */}
      {displayedProducts.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
          <Package className="w-8 h-8 text-[#023859] mx-auto" />
          <p className="text-sm font-bold text-[#011C40]">
            Aucun produit associé à « {resolvedTitle} »
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isStudioPreview
              ? "Ouvrez l'onglet « Rayons » ou « Catalogue » dans l'inspecteur à droite pour sélectionner les produits de ce rayon."
              : "Ce rayon sera bientôt réapprovisionné par le vendeur."}
          </p>
        </div>
      ) : (
        <div className={`grid ${gridColsClass}`}>
          {displayedProducts.map((product) => (
            <SectionProductItemCard
              key={product.id}
              product={product}
              cardStyle={cardStyle}
              aspectRatio={aspectRatio}
              imagePosition="center"
              imageFit="cover"
              accentColor={accentColor}
              showCategory
              showStockBadge={showStockBadge}
              showQuickWishlist
              showCompareAtPrice
              showStarRating
              theme={theme}
              isEditable={isStudioPreview}
              triggerDesignFocus={() => onOpenPageCustomizer?.()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
