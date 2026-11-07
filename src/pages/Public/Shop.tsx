import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useShop } from "../../context/ShopContext";
import { ProductCard } from "../../components/Product/ProductCard";
import { ProductListCard } from "../../components/Product/ProductListCard";
import { getCategoryTranslation } from "../../utils/translations";
import { analyticsEngine } from "../../utils/analyticsEngine";
import { useFacetedFilters } from "../../hooks/useFacetedFilters";
import { DynamicFilterPanel } from "../../components/Shop/DynamicFilterPanel";
import { ShopSponsoredBar } from "../../components/Shop/ShopSponsoredBar";
import { ShopStepNavigator } from "../../components/Shop/ShopStepNavigator";
import { ShopResultsToolbar } from "../../components/Shop/ShopResultsToolbar";
import { ShopQueryErrorState, ShopEmptyState } from "../../components/Shop/ShopEmptyAndErrorStates";
import { useShopCatalog } from "./hooks/useShopCatalog";
import { deduplicateCategoryOrder } from "../../utils/categoryCanonical";

export const Shop: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    activeWilaya,
    setActiveWilaya,
    sortOption,
    setSortOption,
    categoryHierarchy,
  } = useShop();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    products,
    finalProductsList,
    isLoadingProducts,
    loadingMore,
    hasMore,
    queryError,
    PAGE_SIZE,
    currentPageParam,
    urlCategory,
    urlSubcategory,
    urlSubsubcategory,
    urlTag,
    loaderRef,
    loadMoreProducts,
  } = useShopCatalog({
    activeCategory,
    setActiveCategory,
    searchQuery,
    activeWilaya,
    sortOption,
    searchParams,
    setSearchParams,
  });

  const categories = useMemo(() => {
    const keys = Object.keys(categoryHierarchy);
    return ["Tous", ...deduplicateCategoryOrder(keys, keys)];
  }, [categoryHierarchy]);

  const currentSubcategories = useMemo(() => {
    if (activeCategory === "Tous" || !categoryHierarchy[activeCategory]) return [];
    return Object.keys(categoryHierarchy[activeCategory]);
  }, [activeCategory, categoryHierarchy]);

  const currentSubSubcategories = useMemo(() => {
    if (!urlSubcategory || activeCategory === "Tous" || !categoryHierarchy[activeCategory]?.[urlSubcategory]) {
      return [];
    }
    return categoryHierarchy[activeCategory][urlSubcategory] || [];
  }, [activeCategory, urlSubcategory, categoryHierarchy]);

  const {
    selectedFacets,
    availableFacets,
    filteredProducts,
    toggleFacet,
    setPriceRange,
    resetFilters,
    totalCount,
    isFiltered,
  } = useFacetedFilters(finalProductsList, activeCategory);

  const [sponsoredProductIds, setSponsoredProductIds] = useState<string[]>([]);
  const displayOrganicProducts = useMemo(
    () => filteredProducts.filter((p) => !sponsoredProductIds.includes(p.id)),
    [filteredProducts, sponsoredProductIds]
  );

  useEffect(() => {
    if (!searchQuery) return;
    const delayDebounceFn = setTimeout(() => {
      analyticsEngine.track("search_query", {
        query: searchQuery,
        resultsCount: filteredProducts.length,
      });
    }, 1200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filteredProducts.length]);

  const currentCat = urlCategory || activeCategory;
  const pageTitle = useMemo(() => {
    let title = "OLMART | Catalogue";
    if (currentCat && currentCat !== "Tous") {
      title = `OLMART | ${currentCat}${urlSubcategory ? ` - ${urlSubcategory}` : ""}`;
    }
    if (searchQuery) title += ` : Recherche "${searchQuery}"`;
    return title;
  }, [currentCat, urlSubcategory, searchQuery]);

  const pageDescription = useMemo(() => {
    if (searchQuery) return `Découvrez les résultats de recherche pour "${searchQuery}" sur OLMART Algérie.`;
    if (currentCat && currentCat !== "Tous") {
      return `Achetez des articles de la catégorie ${currentCat} sur OLMART avec livraison dans les 69 Wilayas.`;
    }
    return "Explorez les produits des vendeurs certifiés sur OLMART, la marketplace multi-vendeurs d'Algérie.";
  }, [currentCat, searchQuery]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: t("shop_breadcrumb", "Boutique"), link: "/shop" }];
    if (currentCat && currentCat !== "Tous") {
      items.push({
        label: getCategoryTranslation(currentCat, t),
        link: `/shop?category=${encodeURIComponent(currentCat)}`,
      });
    }
    if (urlSubcategory && currentCat) {
      items.push({
        label: getCategoryTranslation(urlSubcategory, t),
        link: `/shop?category=${encodeURIComponent(currentCat)}&subcategory=${encodeURIComponent(urlSubcategory)}`,
      });
    }
    if (urlSubsubcategory) {
      items.push({ label: getCategoryTranslation(urlSubsubcategory, t), link: "#" });
    }
    return items;
  }, [currentCat, urlSubcategory, urlSubsubcategory, t]);

  const handleResetAll = () => {
    setActiveCategory("Tous");
    setActiveWilaya("Tous");
    setSortOption("recent");
    setSearchQuery("");
    resetFilters();
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3] pb-32 font-sans text-[#26212a]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      {/* Step-by-Step Guided Category Navigator (PC, Tablet & Phone) */}
      <ShopStepNavigator
        categories={categories}
        activeCategory={activeCategory}
        currentSubcategories={currentSubcategories}
        currentSubSubcategories={currentSubSubcategories}
        urlSubcategory={urlSubcategory}
        urlSubsubcategory={urlSubsubcategory}
        categoryHierarchy={categoryHierarchy}
        breadcrumbItems={breadcrumbItems}
        showFilters={showFilters}
        isFiltered={isFiltered}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchParams(cat === "Tous" ? {} : { category: cat });
        }}
        onSelectSubcategory={(subcat) => {
          if (!subcat) {
            setSearchParams({ category: activeCategory });
          } else {
            setSearchParams({ category: activeCategory, subcategory: subcat });
          }
        }}
        onSelectSubSubcategory={(subsubcat) => {
          if (!subsubcat && urlSubcategory) {
            setSearchParams({ category: activeCategory, subcategory: urlSubcategory });
          } else if (subsubcat && urlSubcategory) {
            setSearchParams({
              category: activeCategory,
              subcategory: urlSubcategory,
              subsubcategory: subsubcat,
            });
          }
        }}
        onResetAll={handleResetAll}
      />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-stone-900/60 z-[110] lg:hidden backdrop-blur-xs"
            />
          )}
        </AnimatePresence>

        <main className="flex-1">
          <ShopResultsToolbar
            totalFound={filteredProducts.length}
            activeWilaya={activeWilaya}
            searchQuery={searchQuery}
            urlTag={urlTag}
            sortOption={sortOption}
            viewMode={viewMode}
            onClearWilaya={() => setActiveWilaya("Tous")}
            onClearSearch={() => setSearchQuery("")}
            onClearTag={() => setSearchParams({})}
            onSortChange={setSortOption}
            onViewModeChange={setViewMode}
          />

          {searchQuery ? (
            <ShopSponsoredBar
              placement="search"
              searchQuery={searchQuery}
              onSponsoredProductIdsLoaded={setSponsoredProductIds}
            />
          ) : activeCategory && activeCategory !== "Tous" ? (
            <ShopSponsoredBar
              placement="category"
              category={activeCategory}
              onSponsoredProductIdsLoaded={setSponsoredProductIds}
            />
          ) : null}

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4 animate-pulse flex flex-col h-full"
                >
                  <div className="aspect-[4/5] rounded-xl bg-slate-100 w-full" />
                  <div className="space-y-2 mt-auto">
                    <div className="h-4 bg-slate-100 rounded-full w-4/5" />
                    <div className="h-4 bg-slate-100 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : queryError ? (
            <ShopQueryErrorState queryError={queryError} onResetAll={handleResetAll} />
          ) : displayOrganicProducts.length > 0 ? (
            <div className="flex flex-col gap-10">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                  {displayOrganicProducts.map((product, i) => (
                    <div key={product.id}>
                      <ProductCard product={product} index={i} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-0 border-t border-slate-100 pt-4">
                  {displayOrganicProducts.map((product, i) => (
                    <ProductListCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}

              {hasMore && !searchQuery && (
                <div className="w-full flex flex-col items-center pt-8 border-t border-slate-100 gap-6">
                  <div
                    ref={products.length < PAGE_SIZE ? loaderRef : undefined}
                    className="flex justify-center min-h-[50px] items-center"
                  >
                    {!loadingMore && products.length >= PAGE_SIZE && (
                      <button
                        type="button"
                        onClick={loadMoreProducts}
                        className="border border-slate-200 bg-white text-slate-700 rounded-xl px-6 py-3 hover:bg-zinc-50 transition-colors font-sans font-semibold text-xs cursor-pointer"
                      >
                        {t("discover_more_articles", "Découvrir plus d'articles")} (Page {currentPageParam + 1})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ShopEmptyState
              products={products}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onResetFiltersOnly={() => {
                resetFilters();
                setActiveWilaya("Tous");
                setSearchQuery("");
              }}
              onExploreAllCatalog={handleResetAll}
            />
          )}
        </main>
      </div>

      <DynamicFilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        activeCategory={activeCategory || "Tous"}
        selectedFacets={selectedFacets}
        availableFacets={availableFacets}
        toggleFacet={toggleFacet}
        setPriceRange={setPriceRange}
        resetFilters={resetFilters}
        totalCount={totalCount}
        onApply={() => setShowFilters(false)}
      />
    </div>
  );
};
