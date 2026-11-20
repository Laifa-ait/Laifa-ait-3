import React, { useState, useEffect } from "react";
import { Product } from "../../domains/product/product.types";
import { ProductCard } from "../Product/ProductCard";
import { useTranslation } from "react-i18next";
import { fetchWithClientCache, getCachedClientData } from "../../utils/clientReadCache";

const ENDLESS_PAGE1_CACHE_KEY = "home:endless:page1:v1";
const ENDLESS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes anti-F5 shield

export const HomeEndlessGrid: React.FC = () => {
  const { t } = useTranslation();
  const cachedPage1 = getCachedClientData<Product[]>(ENDLESS_PAGE1_CACHE_KEY);
  const [products, setProducts] = useState<Product[]>(cachedPage1 || []);
  const [loading, setLoading] = useState(!cachedPage1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState((cachedPage1?.length || 0) >= 24);

  const INITIAL_FETCH_LIMIT = 24;
  const LOAD_MORE_LIMIT = 12;

  useEffect(() => {
    let cancelled = false;
    const fetchInitial = async () => {
      try {
        const docs = await fetchWithClientCache<Product[]>(
          ENDLESS_PAGE1_CACHE_KEY,
          async () => {
            try {
              const res = await fetch(`/api/v1/public/home-endless-grid?limit=${INITIAL_FETCH_LIMIT}`);
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.products) && data.products.length > 0) {
                  return data.products as Product[];
                }
              }
            } catch {
              // Proceed to cached home-data fallback
            }

            try {
              const homeData = getCachedClientData<{ featuredProducts?: Product[] }>("home:data:v1");
              if (homeData?.featuredProducts && homeData.featuredProducts.length > 0) {
                return homeData.featuredProducts;
              }
            } catch {
              // Ignore
            }

            return [];
          },
          ENDLESS_CACHE_TTL_MS,
          (items) => Array.isArray(items) && items.length > 0
        );

        if (!cancelled) {
          const validDocs = docs.filter((d) => d && (d.stock === undefined || d.stock > 0));
          setProducts(validDocs);
          setHasMore(docs.length >= INITIAL_FETCH_LIMIT);
        }
      } catch {
        // Silently handle error and set empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMoreProducts = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      let newDocs: Product[] = [];
      try {
        const res = await fetch(
          `/api/v1/public/home-endless-grid?limit=${LOAD_MORE_LIMIT}&offset=${products.length}`
        );
        if (res.ok) {
          const data = await res.json();
          newDocs = data.products || [];
        }
      } catch {
        // Fetch failed
      }

      const validNewDocs = newDocs.filter((d) => d && (d.stock === undefined || d.stock > 0));

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = validNewDocs.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setHasMore(newDocs.length >= LOAD_MORE_LIMIT);
    } catch {
      // Handle load more error silently
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 mb-14 sm:mb-20">
        <div className="h-7 w-52 bg-[#EFF3F1] animate-pulse rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-[#EFF3F1] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 mb-14 sm:mb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-4 border-b border-[#E3E9E5]">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1B1D] text-balance">
            {t("home.endless_grid.title")}
          </h2>
          <p className="text-xs sm:text-sm text-[#5F7073] font-medium">
            {t("home.endless_grid.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10 sm:mt-12">
          <button
            type="button"
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#0D5C4B] hover:bg-[#084236] active:bg-[#0F1B1D] text-white text-xs sm:text-sm font-bold tracking-wide rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer border-none whitespace-nowrap"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#E59A42] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-[#E59A42] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-[#E59A42] rounded-full animate-bounce" />
              </div>
            ) : (
              <span>{t("home.endless_grid.load_more")}</span>
            )}
          </button>
        </div>
      )}
    </section>
  );
};
