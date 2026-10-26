import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, Grid, List, ChevronDown, X, PackageOpen, ArrowRight, RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { ProductCard } from "../../components/Product/ProductCard";
import { ProductListCard } from "../../components/Product/ProductListCard";
import { CATEGORY_ICONS } from "../../constants";
import { CategoryIcons8Logo } from "../../components/common/CategoryIcons8Logo";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { normalizeTimestamp } from "../../utils/date";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useDebounce } from "../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { getCategoryTranslation } from "../../utils/translations";

// ... (keep necessary imports)
import { analyticsEngine } from "../../utils/analyticsEngine";
import { useFacetedFilters } from "../../hooks/useFacetedFilters";
import { DynamicFilterPanel } from "../../components/Shop/DynamicFilterPanel";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../../components/Layout/Breadcrumbs";
import { ShopSponsoredBar } from "../../components/Shop/ShopSponsoredBar";

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

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [queryError, setQueryError] = useState<{ message: string; indexLink?: string } | null>(null);
  const PAGE_SIZE = 24;
  const currentPageParam = useMemo(() => {
    return parseInt(searchParams.get("page") || "1", 10);
  }, [searchParams]);
  const INITIAL_LIMIT = PAGE_SIZE * currentPageParam;
  const LOAD_MORE_LIMIT = PAGE_SIZE;

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["Tous", ...Object.keys(categoryHierarchy)];

  const urlCategory = searchParams.get("category");
  const urlSubcategory = searchParams.get("subcategory");
  const urlSubsubcategory = searchParams.get("subsubcategory");
  const urlTag = searchParams.get("tag");

  const currentSubcategories = useMemo(() => {
    if (activeCategory === "Tous" || !categoryHierarchy[activeCategory]) return [];
    return Object.keys(categoryHierarchy[activeCategory]);
  }, [activeCategory, categoryHierarchy]);

  const currentSubSubcategories = useMemo(() => {
    if (!urlSubcategory || activeCategory === "Tous" || !categoryHierarchy[activeCategory]?.[urlSubcategory]) return [];
    return categoryHierarchy[activeCategory][urlSubcategory] || [];
  }, [activeCategory, urlSubcategory, categoryHierarchy]);

  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory, setActiveCategory]);

  const {
    data: queryData,
    error: queryErrorObj,
    isLoading: queryIsLoading,
  } = useQuery({
    queryKey: [
      "shop_list",
      urlCategory || activeCategory,
      urlSubcategory || "none",
      urlSubsubcategory || "none",
      activeWilaya,
      sortOption,
      urlTag || "none",
      INITIAL_LIMIT,
    ],
    queryFn: async () => {
      const catToFilter = urlCategory || activeCategory;
      const params = new URLSearchParams();
      if (catToFilter && catToFilter !== "Tous") {
        params.append("category", catToFilter);
      }
      if (urlSubcategory) {
        params.append("subcategory", urlSubcategory);
      }
      if (urlSubsubcategory) {
        params.append("subsubcategory", urlSubsubcategory);
      }
      if (activeWilaya && activeWilaya !== "Tous") {
        params.append("wilaya", activeWilaya);
      }
      if (urlTag) {
        params.append("tag", urlTag);
      }
      params.append("limit", String(INITIAL_LIMIT));
      params.append("offset", "0");

      const res = await fetch(`/api/v1/products/shop?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }
      const data = await res.json();
      return {
        products: (data.products || []) as Product[],
        hasMore: Boolean(data.hasMore),
      };
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (queryIsLoading) {
      setIsLoadingProducts(true);
      setQueryError(null);
    } else if (queryErrorObj) {
      console.error("Shop Query Error:", queryErrorObj);
      setQueryError({
        message: "Une erreur est survenue lors du chargement des produits. Veuillez réessayer.",
      });
      setProducts([]);
      setHasMore(false);
      setIsLoadingProducts(false);
    } else if (queryData) {
      setProducts(queryData.products);
      setHasMore(queryData.hasMore);
      setQueryError(null);
      setIsLoadingProducts(false);
    }
  }, [queryData, queryErrorObj, queryIsLoading]);

  const loadMoreProducts = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const catToFilter = urlCategory || activeCategory;
      const params = new URLSearchParams();
      if (catToFilter && catToFilter !== "Tous") {
        params.append("category", catToFilter);
      }
      if (urlSubcategory) {
        params.append("subcategory", urlSubcategory);
      }
      if (urlSubsubcategory) {
        params.append("subsubcategory", urlSubsubcategory);
      }
      if (activeWilaya && activeWilaya !== "Tous") {
        params.append("wilaya", activeWilaya);
      }
      if (urlTag) {
        params.append("tag", urlTag);
      }
      params.append("limit", String(LOAD_MORE_LIMIT));
      params.append("offset", String(products.length));

      const res = await fetch(`/api/v1/products/shop?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more products");
      const data = await res.json();
      const newProducts = (data.products || []) as Product[];

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = newProducts.filter((p: Product) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });
      setHasMore(data.hasMore);

      const loadedCount = products.length + newProducts.length;
      const nextPageIndex = Math.ceil(loadedCount / PAGE_SIZE);
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.set("page", nextPageIndex.toString());
          return nextParams;
        },
        { replace: true }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const { loaderRef } = useInfiniteScroll({
    onLoadMore: loadMoreProducts,
    hasMore: hasMore,
    isLoading: loadingMore,
    threshold: 300,
  });

  // --- RECHERCHE TEXTUELLE (Full-Text avec Fuse.js / Backend) ---
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const performSearch = async () => {
      if (!debouncedSearch || debouncedSearch.trim() === "") {
        setSearchResults(null);
        return;
      }
      setIsLoadingProducts(true);
      try {
        const response = await fetch(`/api/v1/search?q=${encodeURIComponent(debouncedSearch)}`, { signal });
        const data = await response.json();
        setSearchResults(data.products || []);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            console.error("Search fetch error", err);
            setSearchResults([]);
          }
        } else {
          console.error("Search fetch error", err);
          setSearchResults([]);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    };
    performSearch();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch]);

  const finalProductsList = useMemo(() => {
    let result = searchResults !== null ? [...searchResults] : [...products];

    if (urlSubcategory) {
      const targetSub = urlSubcategory.toLowerCase().trim();
      result = result.filter((p) => (p.subcategory || "").toLowerCase().trim() === targetSub);
    }

    if (urlSubsubcategory) {
      const targetSubSub = urlSubsubcategory.toLowerCase().trim();
      result = result.filter((p) => {
        const subSub = ((p.subSubCategory || p.subsubcategory || "") as string).toLowerCase().trim();
        return (
          subSub === targetSubSub ||
          p.name?.toLowerCase().includes(targetSubSub) ||
          p.description?.toLowerCase().includes(targetSubSub)
        );
      });
    }

    // Client-side sorting
    if (sortOption === "recent") {
      result.sort((a, b) => {
        const timeA = a.createdAt ? normalizeTimestamp(a.createdAt).seconds : 0;
        const timeB = b.createdAt ? normalizeTimestamp(b.createdAt).seconds : 0;
        return timeB - timeA;
      });
    } else if (sortOption === "quality") {
      result.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
    } else if (sortOption === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === "rating-desc") {
      result.sort((a, b) => (b.rating || b.sellerRating || 0) - (a.rating || a.sellerRating || 0));
    } else if (sortOption === "sales-desc") {
      result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    }

    // Always sort sponsored products to the top
    result.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return 0;
    });

    return result;
  }, [products, searchResults, urlSubcategory, urlSubsubcategory, sortOption]);

  const {
    selectedFacets,
    availableFacets,
    filteredProducts,
    toggleFacet,
    setBooleanFacet: _setBooleanFacet,
    setMinRating: _setMinRating,
    setPriceRange,
    resetFilters,
    totalCount,
    isFiltered,
  } = useFacetedFilters(finalProductsList, activeCategory);

  const finalFilteredProducts = filteredProducts;
  const [sponsoredProductIds, setSponsoredProductIds] = useState<string[]>([]);
  const displayOrganicProducts = useMemo(
    () => finalFilteredProducts.filter((p) => !sponsoredProductIds.includes(p.id)),
    [finalFilteredProducts, sponsoredProductIds]
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

  const pageTitle = useMemo(() => {
    let title = "OLMART | Catalogue";
    const currentCat = urlCategory || activeCategory;
    if (currentCat && currentCat !== "Tous") {
      title = `OLMART | ${currentCat}`;
      if (urlSubcategory) {
        title += ` - ${urlSubcategory}`;
      }
    }
    if (searchQuery) {
      title += ` : Recherche "${searchQuery}"`;
    }
    return title;
  }, [urlCategory, activeCategory, urlSubcategory, searchQuery]);

  const pageDescription = useMemo(() => {
    const currentCat = urlCategory || activeCategory;
    let desc = "Explorez les produits des vendeurs certifiés sur OLMART, la marketplace multi-vendeurs d'Algérie.";
    if (currentCat && currentCat !== "Tous") {
      desc = `Achetez des articles de la catégorie ${currentCat} sur OLMART.`;
      if (urlSubcategory) {
        desc += ` Découvrez la collection de ${urlSubcategory} avec livraison sécurisée dans les 69 Wilayas.`;
      }
    }
    if (searchQuery) {
      desc = `Découvrez les résultats de recherche pour "${searchQuery}" sur OLMART Algérie.`;
    }
    return desc;
  }, [urlCategory, activeCategory, urlSubcategory, searchQuery]);

  const pageKeywords = useMemo(() => {
    const currentCat = urlCategory || activeCategory;
    const baseKeywords = "olmart, catalogue, algérie, achat en ligne, 69 wilayas, livraison";
    if (currentCat && currentCat !== "Tous") {
      return `${currentCat.toLowerCase()}, ${urlSubcategory ? urlSubcategory.toLowerCase() + ", " : ""}${baseKeywords}`;
    }
    return baseKeywords;
  }, [urlCategory, activeCategory, urlSubcategory]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: t("shop_breadcrumb", "Boutique"), link: "/shop" }];
    const catToFilter = urlCategory || activeCategory;
    if (catToFilter && catToFilter !== "Tous") {
      items.push({
        label: getCategoryTranslation(catToFilter, t),
        link: `/shop?category=${encodeURIComponent(catToFilter)}`,
      });
    }
    if (urlSubcategory) {
      items.push({
        label: getCategoryTranslation(urlSubcategory, t),
        link: `/shop?category=${encodeURIComponent(catToFilter)}&subcategory=${encodeURIComponent(urlSubcategory)}`,
      });
    }
    if (urlSubsubcategory) {
      items.push({
        label: getCategoryTranslation(urlSubsubcategory, t),
        link: "#",
      });
    }
    return items;
  }, [urlCategory, activeCategory, urlSubcategory, urlSubsubcategory, t]);

  return (
    <div className="min-h-screen bg-[#f8f6f3] pb-32 font-sans text-[#26212a]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {pageKeywords && <meta name="keywords" content={pageKeywords} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>
      <div className="relative overflow-hidden border-b border-[#ece5de] bg-[radial-gradient(ellipse_at_top_right,_rgba(221,202,168,0.19),_transparent_42%),linear-gradient(180deg,#fbfaf8_0%,#f8f6f3_100%)] text-zinc-900">
        <div className="relative z-10 mx-auto max-w-[90rem] space-y-4 px-4 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {/* High-contrast Breadcrumbs */}
              <div className="[&_nav]:p-0 [&_nav]:max-w-none [&_ol]:text-zinc-400 [&_a]:text-zinc-500 [&_a:hover]:text-zinc-950 [&_span]:text-zinc-900 [&_li]:text-zinc-400 text-xs">
                <Breadcrumbs items={breadcrumbItems} />
              </div>
            </div>
            {/* Filtres restent accessibles sans répéter la recherche globale. */}
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-10 px-4 rounded-full text-[11px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 ${
                  showFilters
                    ? "bg-[#4d3b55] text-white shadow-[0_8px_18px_rgba(77,59,85,0.22)]"
                    : "bg-white/90 hover:bg-[#f7f3f7] text-[#5b4865] border border-[#e8e0e9] shadow-[0_3px_10px_rgba(41,31,43,0.05)]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>{t("filter_filters", "Filtres")}</span>
                {isFiltered && (
                  <span
                    className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${showFilters ? "bg-white/20 text-white" : "bg-[#f0e9f1] text-[#5b4865]"}`}
                  >
                    •
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Unified Control Box: Double-Decker categories & express tags */}
          <div className="w-full bg-transparent p-0 space-y-4">
            {/* Deck 1: Main Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-2 h-6">
                  <span>{t("nav_categories", "Catégories")}</span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-[#5b4865] bg-[#f7f3f7] px-3 py-0.5 rounded-full text-[11px] border border-[#e9e1eb] font-semibold">
                    {getCategoryTranslation(activeCategory, t)}
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-2 overflow-x-auto pb-1.5 desktop-scrollbar shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map((cat) => {
                  const IconComponent = CATEGORY_ICONS[cat] || CATEGORY_ICONS["Tous"];
                  const isSelected = activeCategory === cat;
                  const displayLabel = cat === "Tous" ? t("all_categories") || "Toutes" : t(cat) || cat;
                  return (
                    <button
                      key={cat}
                      title={displayLabel}
                      onClick={() => {
                        setActiveCategory(cat);
                        setSearchParams({});
                      }}
                      className={`group relative flex h-11 items-center gap-2 rounded-full px-3.5 transition-all duration-200 shrink-0 select-none cursor-pointer border active:scale-[0.98] ${
                        isSelected
                          ? "text-white border-[#4d3b55] bg-[#4d3b55] shadow-[0_6px_14px_rgba(77,59,85,0.18)]"
                          : "bg-[#fffdfa] text-[#667085] border-[#eee7df] hover:border-[#c9b9cd] hover:text-[#5b4865]"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeCategoryCircleShop"
                          className="absolute inset-0 bg-[#4d3b55] rounded-full -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <CategoryIcons8Logo
                        categoryName={cat}
                        isActive={isSelected}
                        className="h-4 w-4 object-contain transition-transform duration-300 group-hover:scale-110 select-none"
                        fallbackIcon={IconComponent}
                      />
                      <span className="max-w-[132px] truncate text-[11px] font-semibold">{displayLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deck 2: Subcategories (when a main category is selected) */}
            {activeCategory !== "Tous" && currentSubcategories.length > 0 && (
              <div className="pt-3 border-t border-[#f0ebe6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 h-5">
                    <span>{t("Sous-catégories", "Sous-catégories")}</span>
                    {urlSubcategory && (
                      <>
                        <span className="text-zinc-300">•</span>
                        <span className="text-[#806223] bg-[#fbf5e8] px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#eee0bd]">
                          {getCategoryTranslation(urlSubcategory, t)}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 desktop-scrollbar shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchParams({ category: activeCategory });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                      !urlSubcategory
                        ? "bg-[#5b4865] text-white border-[#5b4865] shadow-xs"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {t("Toutes", "Toutes")}
                  </button>
                  {currentSubcategories.map((subcat) => {
                    const isSubSelected = urlSubcategory === subcat;
                    return (
                      <button
                        key={subcat}
                        type="button"
                        onClick={() => {
                          setSearchParams({ category: activeCategory, subcategory: subcat });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                          isSubSelected
                            ? "bg-[#5b4865] text-white border-[#5b4865] shadow-xs"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                      >
                        {getCategoryTranslation(subcat, t)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deck 3: Sub-Subcategories (when a subcategory is selected) */}
            {activeCategory !== "Tous" && urlSubcategory && currentSubSubcategories.length > 0 && (
              <div className="pt-3 border-t border-[#f0ebe6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 h-5">
                    <span>{t("Sous-sous-catégories", "Sous-sous-catégories")}</span>
                    {urlSubsubcategory && (
                      <>
                        <span className="text-zinc-300">•</span>
                        <span className="text-slate-900 bg-zinc-100 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-zinc-300">
                          {getCategoryTranslation(urlSubsubcategory, t)}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 desktop-scrollbar shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchParams({ category: activeCategory, subcategory: urlSubcategory });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                      !urlSubsubcategory
                        ? "bg-[#5b4865] text-white border-[#5b4865] shadow-xs"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {t("Tous les rayons", "Tous les rayons")}
                  </button>
                  {currentSubSubcategories.map((subsubcat) => {
                    const isSubSubSelected = urlSubsubcategory === subsubcat;
                    return (
                      <button
                        key={subsubcat}
                        type="button"
                        onClick={() => {
                          setSearchParams({
                            category: activeCategory,
                            subcategory: urlSubcategory,
                            subsubcategory: subsubcat,
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                          isSubSubSelected
                            ? "bg-[#5b4865] text-white border-[#5b4865] shadow-xs font-semibold"
                            : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        {getCategoryTranslation(subsubcat, t)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Backdrop for Mobile/Tablet Filters */}
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

        {/* Products Grid */}
        <main className="flex-1">
          {/* Elegant Results & Sorter Toolbar */}
          <div className="mb-6 rounded-[1.75rem] border border-[#eae3dc] bg-white p-4 shadow-[0_12px_28px_rgba(62,46,32,0.045)] sm:p-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e9e1eb] bg-[#f8f4f8] px-4 py-2 text-[10px] font-bold tracking-[0.12em] text-[#57455f] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#b58c45]" />
                {filteredProducts.length} {t("articles_found", "ARTICLES TROUVÉS")}
              </span>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />

              {/* Dynamic Active Badges aligned neatly within summary */}
              <div className="flex flex-wrap gap-1.5">
                {activeCategory !== "Tous" ||
                activeWilaya !== "Tous" ||
                searchQuery ||
                urlSubcategory ||
                urlSubsubcategory ||
                urlTag ? (
                  <>
                    {activeCategory !== "Tous" && (
                      <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
                        <span className="text-zinc-500 font-semibold">{t("Catégorie", "Catégorie")}:</span>{" "}
                        {getCategoryTranslation(activeCategory, t)}
                        <button
                          onClick={() => {
                            setActiveCategory("Tous");
                            setSearchParams({});
                          }}
                          className="hover:text-red-500 ml-1 cursor-pointer"
                          aria-label="Supprimer la catégorie"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {urlSubcategory && (
                      <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
                        <span className="text-zinc-500 font-semibold">{t("Sous-catégorie", "Sous-catégorie")}:</span>{" "}
                        {getCategoryTranslation(urlSubcategory, t)}
                        <button
                          onClick={() => setSearchParams({ category: activeCategory })}
                          className="hover:text-red-500 ml-1 cursor-pointer"
                          aria-label="Supprimer la sous-catégorie"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {urlSubsubcategory && (
                      <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
                        <span className="text-zinc-500 font-semibold">{t("Rayon", "Rayon")}:</span>{" "}
                        {getCategoryTranslation(urlSubsubcategory, t)}
                        <button
                          onClick={() => setSearchParams({ category: activeCategory, subcategory: urlSubcategory! })}
                          className="hover:text-red-500 ml-1 cursor-pointer"
                          aria-label="Supprimer le rayon"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {urlTag && (
                      <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
                        #{urlTag}
                        <button onClick={() => setSearchParams({})} className="hover:text-red-500 ml-1 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {activeWilaya !== "Tous" && (
                      <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
                        {t("Wilaya:")}
                        {activeWilaya}
                        <button
                          onClick={() => setActiveWilaya("Tous")}
                          className="hover:text-red-500 ml-1 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
                        {t('Recherche: "')}
                        {searchQuery}"
                        <button onClick={() => setSearchQuery("")} className="hover:text-red-500 ml-1 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    {t("all_catalog", "Tout le catalogue")}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex w-full shrink-0 items-center justify-between gap-3 border-t border-[#f0ebe6] pt-4 md:mt-3 md:justify-end">
              {/* Sorting dropdown integrated cleanly */}
              <div className="relative font-sans min-w-[170px]">
                <select
                  aria-label={t("sort_products", "Trier les produits")}
                  className="w-full pl-4 pr-10 py-2.5 bg-[#fbfaf8] border border-[#eae3dc] hover:border-[#cbbdce] rounded-full outline-none font-semibold text-[10px] uppercase tracking-wide appearance-none cursor-pointer text-[#514459] shadow-sm transition-all"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="quality">{t("sort_relevance", "Score de Pertinence")}</option>
                  <option value="recent">{t("newest", "Nouveautés")}</option>
                  <option value="sales-desc">Meilleures ventes</option>
                  <option value="rating-desc">Mieux notés</option>
                  <option value="price-asc">{t("price_asc", "Prix Croissant")}</option>
                  <option value="price-desc">{t("price_desc", "Prix Décroissant")}</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75677a] pointer-events-none" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label={t("grid_view", "Affichage en grille")}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-[#4d3b55] text-white shadow-[0_6px_14px_rgba(77,59,85,0.2)]" : "bg-white text-slate-500 hover:text-[#5b4865] border border-[#eae3dc]"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label={t("list_view", "Affichage en liste")}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${viewMode === "list" ? "bg-[#4d3b55] text-white shadow-[0_6px_14px_rgba(77,59,85,0.2)]" : "bg-white text-slate-500 hover:text-[#5b4865] border border-[#eae3dc]"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sponsored Products Bar (Category & Search Placements) */}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-4 animate-pulse flex flex-col h-full"
                >
                  <div className="aspect-[4/5] rounded-2xl bg-slate-100 w-full" />
                  <div className="space-y-2 mt-auto">
                    <div className="h-4 bg-slate-100 rounded-full w-4/5" />
                    <div className="h-4 bg-slate-100 rounded-full w-2/3" />
                    <div className="h-5 bg-slate-100 rounded-full w-1/3 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : queryError ? (
            <div className="py-32 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-center text-red-500">
                <SlidersHorizontal className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-sans font-bold text-zinc-900">
                {t("filters_not_applicable", "Filtres non applicables")}
              </h3>
              <p className="text-zinc-500 max-w-md font-medium">
                {t(
                  "filters_not_applicable_desc",
                  "Nous rencontrons des difficultés à appliquer ces filtres précis (Index manquant). Le reste du catalogue est accessible."
                )}
              </p>
              {import.meta.env?.DEV && queryError.indexLink && (
                <div className="mt-4 p-5 bg-orange-50 border border-orange-200 rounded-xl text-left w-full max-w-lg">
                  <p className="text-xs font-bold text-orange-800 mb-2 uppercase tracking-wide">
                    {t("⚠️ Action Requise (Dev Only)")}
                  </p>
                  <p className="text-sm text-orange-900 mb-4">
                    {t("Un index composite Firestore est requis pour cette combinaison de filtres et de tris.")}
                  </p>
                  <a
                    href={queryError.indexLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl text-[11px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal transition-colors"
                  >
                    {t("Créer l'index Firestore")}
                  </a>
                </div>
              )}
              <button
                onClick={() => {
                  setActiveCategory("Tous");
                  setActiveWilaya("Tous");
                  setSortOption("recent");
                  setSearchQuery("");
                  setSearchParams({});
                }}
                className="px-8 py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-sans font-bold text-[11px] uppercase tracking-widest rtl:tracking-normal mt-4 transition-colors"
              >
                {t("clear_filters", "Effacer les filtres")}
              </button>
            </div>
          ) : displayOrganicProducts.length > 0 ? (
            <div className="flex flex-col gap-10">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
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

              {/* Infinite Scroll / Load More */}
              {hasMore && !searchQuery && (
                <div className="w-full flex flex-col items-center pt-8 border-t border-slate-100 gap-6">
                  {loadingMore && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8 w-full mt-4">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-4 animate-pulse"
                        >
                          <div className="aspect-[4/5] rounded-2xl bg-slate-100 w-full" />
                          <div className="h-4 bg-slate-100 rounded-full w-2/3 mx-auto" />
                          <div className="h-3 bg-slate-100 rounded-full w-1/2 mx-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    ref={products.length < PAGE_SIZE ? loaderRef : undefined}
                    className="flex justify-center min-h-[50px] items-center"
                  >
                    {!loadingMore &&
                      (products.length >= PAGE_SIZE ? (
                        <button
                          onClick={loadMoreProducts}
                          className="border border-slate-200 bg-white text-slate-700 rounded-full px-8 py-3 hover:bg-transparent transition-all font-sans font-bold uppercase tracking-widest text-[11px] shadow-sm cursor-pointer active:scale-95"
                        >
                          {t("discover_more_articles", "Découvrir plus d'articles")} (Page {currentPageParam + 1})
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest rtl:tracking-normal">
                          {t("scroll_to_see_more", "Faites défiler pour voir plus")}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 sm:py-6">
              {products.length > 0 ? (
                <div className="space-y-6 rounded-[1.75rem] border border-[#eae3dc] bg-white p-4 shadow-[0_12px_28px_rgba(62,46,32,0.04)] sm:p-6">
                  <div className="flex items-start gap-3 border-b border-[#f0ebe6] pb-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f7f3f7] text-[#5b4865]">
                      <PackageOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#302536]">Aucun résultat exact</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Voici quelques articles populaires de la boutique, à découvrir pendant que vous ajustez vos
                        critères.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
                    {products.slice(0, 12).map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative isolate overflow-hidden rounded-[2rem] border border-[#e9e1eb] bg-[radial-gradient(ellipse_at_top_right,_rgba(221,202,168,0.24),_transparent_40%),linear-gradient(135deg,#fffdfa_0%,#f8f4f8_100%)] px-6 py-12 text-center shadow-[0_18px_42px_rgba(55,42,58,0.06)] sm:py-16">
                  <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full border border-[#eadfce]" />
                  <div className="pointer-events-none absolute -bottom-28 -left-14 -z-10 h-64 w-64 rounded-full border border-[#e9e1eb]" />
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border border-[#eee4d5] bg-white text-[#a77f39] shadow-[0_12px_25px_rgba(91,72,101,0.1)]">
                    <PackageOpen className="h-7 w-7" strokeWidth={1.6} />
                  </div>
                  <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b7531]">
                    Olmart · Le shopping algérien
                  </p>
                  <h3 className="mx-auto mt-2 max-w-xl font-serif text-2xl font-semibold leading-tight text-[#302536] sm:text-3xl">
                    {t("no_products_listed", "Cette sélection se prépare")}
                  </h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#746b76]">
                    {searchQuery
                      ? "Aucun article ne correspond à cette recherche pour le moment."
                      : `Aucun article n’est encore disponible dans ${activeCategory === "Tous" ? "le catalogue" : getCategoryTranslation(activeCategory, t)}. Revenez bientôt ou explorez les autres univers.`}
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        resetFilters();
                        setActiveWilaya("Tous");
                        setSearchQuery("");
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#ded3e0] bg-white px-5 text-xs font-bold text-[#5b4865] transition hover:bg-[#f7f3f7]"
                    >
                      <RotateCcw className="h-4 w-4" /> Réinitialiser les filtres
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory("Tous");
                        setActiveWilaya("Tous");
                        setSearchQuery("");
                        resetFilters();
                        setSearchParams({});
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#4d3b55] px-5 text-xs font-bold text-white shadow-[0_8px_18px_rgba(77,59,85,0.2)] transition hover:bg-[#3c2d43]"
                    >
                      Explorer le catalogue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
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
