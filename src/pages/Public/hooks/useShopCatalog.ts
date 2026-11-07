import { useMemo, useState, useEffect } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Product } from "../../../domains/product/product.types";
import { normalizeTimestamp } from "../../../utils/date";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { useDebounce } from "../../../hooks/useDebounce";
import { resolveCanonicalCategoryKey } from "../../../utils/categoryCanonical";

interface UseShopCatalogArgs {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  activeWilaya: string;
  sortOption: string;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

export function useShopCatalog({
  activeCategory,
  setActiveCategory,
  searchQuery,
  activeWilaya,
  sortOption,
  searchParams,
  setSearchParams,
}: UseShopCatalogArgs) {
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

  const rawUrlCategory = searchParams.get("category");
  const urlCategory = rawUrlCategory ? resolveCanonicalCategoryKey(rawUrlCategory) : null;
  const urlSubcategory = searchParams.get("subcategory");
  const urlSubsubcategory = searchParams.get("subsubcategory");
  const urlTag = searchParams.get("tag");

  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory, activeCategory, setActiveCategory]);

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
        params.append("category", resolveCanonicalCategoryKey(catToFilter));
      }
      if (urlSubcategory) params.append("subcategory", urlSubcategory);
      if (urlSubsubcategory) params.append("subsubcategory", urlSubsubcategory);
      if (activeWilaya && activeWilaya !== "Tous") params.append("wilaya", activeWilaya);
      if (urlTag) params.append("tag", urlTag);
      params.append("limit", String(INITIAL_LIMIT));
      params.append("offset", "0");

      const res = await fetch(`/api/v1/products/shop?${params.toString()}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
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
        params.append("category", resolveCanonicalCategoryKey(catToFilter));
      }
      if (urlSubcategory) params.append("subcategory", urlSubcategory);
      if (urlSubsubcategory) params.append("subsubcategory", urlSubsubcategory);
      if (activeWilaya && activeWilaya !== "Tous") params.append("wilaya", activeWilaya);
      if (urlTag) params.append("tag", urlTag);
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
      setHasMore(Boolean(data.hasMore));

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
    hasMore,
    isLoading: loadingMore,
    threshold: 300,
  });

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
        if (!(err instanceof Error && err.name === "AbortError")) {
          setSearchResults([]);
        }
      } finally {
        if (!signal.aborted) setIsLoadingProducts(false);
      }
    };
    performSearch();
    return () => controller.abort();
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

    result.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return 0;
    });

    return result;
  }, [products, searchResults, urlSubcategory, urlSubsubcategory, sortOption]);

  return {
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
  };
}
