import React, { useState, useMemo } from "react";
import {
  CategoryItem,
  CollectionPageDesignConfig,
  CustomPageTheme,
} from "../../domains/seller/customPage.types";
import { Product } from "../../domains/product/product.types";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  PackageOpen,
  Sparkles,
  Grid,
  LayoutList,
} from "lucide-react";
import { SectionProductItemCard } from "./sections/SectionProductItemCard";
import { EditorialHeading } from "./EditorialHeading";

interface StoreCollectionPageViewProps {
  activeCategory: CategoryItem | null;
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
}

export const StoreCollectionPageView: React.FC<StoreCollectionPageViewProps> = ({
  activeCategory,
  allCategories,
  products,
  theme,
  config,
  pageTitle,
  pageSubtitle,
  isStudioPreview = false,
  previewViewport = "desktop",
  onSelectCategory,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [colsOverride, setColsOverride] = useState<2 | 3 | 4 | null>(null);

  const showSearch = config?.showSearch !== false;
  const showSortDropdown = config?.showSortDropdown !== false;
  const showCategoryPills = config?.showCategoryPills !== false;
  const columnsDesktop = colsOverride || config?.columnsDesktop || 4;
  const cardStyle = config?.cardStyle || "modern";
  const cardAspectRatio = config?.cardAspectRatio || "4/5";
  const showStockBadge = config?.showStockBadge !== false;
  const showCtaButton = config?.showCtaButton !== false;
  const ctaLabel = config?.ctaLabel || "Voir le détail";

  const accentColor = theme.accentColor || theme.primaryColor || "#B45309";
  const textColor = theme.secondaryColor || "#18181B";

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeCategory) {
      const assignedIds = Array.isArray(activeCategory.productIds) ? activeCategory.productIds : [];
      if (assignedIds.length > 0) {
        const setIds = new Set(assignedIds);
        list = list.filter((p) => setIds.has(p.id));
      } else if (activeCategory.categoryFilter) {
        const filterStr = activeCategory.categoryFilter.toLowerCase();
        list = list.filter((p) => (p.category || "").toLowerCase().includes(filterStr));
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-asc") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sortBy === "price-desc") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return list;
  }, [products, activeCategory, searchQuery, sortBy]);

  const title = activeCategory?.name || pageTitle || "Catalogue & *Collections*";
  const subtitle =
    activeCategory?.description ||
    activeCategory?.subtitle ||
    pageSubtitle ||
    "Explorez nos pièces façonnées avec soin et commandez en paiement à la livraison sur les 69 wilayas.";

  const gridColsClass =
    previewViewport === "mobile"
      ? "grid-cols-2 gap-3.5"
      : previewViewport === "tablet"
      ? "grid-cols-2 @3xl:grid-cols-3 gap-4"
      : columnsDesktop === 2
      ? "grid-cols-2 gap-6"
      : columnsDesktop === 3
      ? "grid-cols-2 @3xl:grid-cols-3 gap-5"
      : "grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 gap-5";

  return (
    <div
      className="min-h-[560px] flex flex-col transition-all select-none"
      style={{ backgroundColor: theme.canvasColor || "#FAF6F0", color: textColor }}
    >
      <div className="px-4 sm:px-8 py-3 border-b border-black/[0.06] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-full bg-white/80 border border-black/10 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Accueil Vitrine</span>
          </button>
          <span className="text-zinc-300">/</span>
          <span className="font-semibold text-zinc-800 truncate">
            {activeCategory ? activeCategory.name : "Collections"}
          </span>
        </div>

        {isStudioPreview && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[10px] font-bold shrink-0">
            <Sparkles className="w-3 h-3" /> Aperçu Collection
          </span>
        )}
      </div>

      <header className="pt-8 sm:pt-12 pb-6 px-4 sm:px-8 max-w-7xl w-full mx-auto">
        <span
          className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] mb-2"
          style={{ color: accentColor }}
        >
          {activeCategory?.badge || "COLLECTION EXCLUSIVITÉ"}
        </span>
        <EditorialHeading
          as="h1"
          text={title}
          theme={theme}
          accentColorOverride={accentColor}
          className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
          style={{ color: textColor }}
        />
        {subtitle && (
          <p className="text-xs sm:text-sm opacity-65 max-w-xl mt-2 leading-relaxed">{subtitle}</p>
        )}
      </header>

      <div className="px-4 sm:px-8 pb-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
        {showCategoryPills && allCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              style={!activeCategory ? { backgroundColor: textColor, color: "#FFFFFF" } : undefined}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                !activeCategory ? "shadow-sm" : "bg-black/[0.04] text-zinc-600 hover:bg-black/[0.08]"
              }`}
            >
              Tous les rayons ({products.length})
            </button>
            {allCategories.map((cat) => {
              const isSelected = activeCategory?.id === cat.id || activeCategory?.slug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  style={isSelected ? { backgroundColor: textColor, color: "#FFFFFF" } : undefined}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected ? "shadow-sm" : "bg-black/[0.04] text-zinc-600 hover:bg-black/[0.08]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-7 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
            {showSearch && (
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une pièce dans ce rayon..."
                  className="w-full pl-9 pr-4 py-2.5 border border-black/10 bg-white/80 backdrop-blur-sm rounded-full text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-zinc-500">
              <strong className="text-zinc-900">{filteredProducts.length}</strong> pièce
              {filteredProducts.length > 1 ? "s" : ""}
            </span>

            {showSortDropdown && (
              <div className="flex items-center gap-1.5 border border-black/10 bg-white/80 backdrop-blur-sm rounded-full px-3.5 py-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs font-medium text-zinc-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="featured">Tri : Mis en avant</option>
                  <option value="price-asc">Prix : Croissant</option>
                  <option value="price-desc">Prix : Décroissant</option>
                  <option value="newest">Nouveautés</option>
                </select>
              </div>
            )}

            {previewViewport === "desktop" && (
              <div className="hidden sm:flex items-center bg-black/[0.04] p-0.5 rounded-full">
                {([3, 4] as const).map((colCount) => (
                  <button
                    key={colCount}
                    type="button"
                    onClick={() => setColsOverride(colCount)}
                    className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                      columnsDesktop === colCount ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-400"
                    }`}
                    title={`${colCount} colonnes`}
                  >
                    {colCount === 3 ? <LayoutList className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <PackageOpen className="w-10 h-10 text-zinc-300 mb-3" />
            <p className="text-sm font-bold text-zinc-800">Aucune pièce trouvée dans cette collection</p>
          </div>
        ) : (
          <div className={`grid ${gridColsClass}`}>
            {filteredProducts.map((prod) => (
              <SectionProductItemCard
                key={prod.id}
                product={prod}
                cardStyle={cardStyle}
                aspectRatio={cardAspectRatio}
                imagePosition="center"
                imageFit="cover"
                accentColor={accentColor}
                showCategory={true}
                showStockBadge={showStockBadge}
                showQuickWishlist={true}
                showStockProgressBar={false}
                showCompareAtPrice={true}
                showStarRating={true}
                ctaText={showCtaButton ? ctaLabel : undefined}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
