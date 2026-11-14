import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { homeApi, HomeDataResponse } from "../services/api/home.api";
import { queryKeys } from "../lib/queryKeys";
import { collection, query, orderBy, getDocs, where, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { HomepageSection, CustomCategory } from "../domains/home/homepage.types";
import { Product } from "../domains/product/product.types";
import {
  fetchWithClientCache,
  getCachedClientData,
  setCachedClientData,
} from "../utils/clientReadCache";

const HOME_DATA_CACHE_KEY = "home:data:v1";
const HOME_FALLBACK_CACHE_KEY = "home:client_fallback:v1";
const HOME_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes anti-F5 shield

interface ClientHomeFallback {
  products: Product[];
  sections: HomepageSection[];
  categories: CustomCategory[];
}

export const useHomeData = () => {
  const cachedInitial = getCachedClientData<HomeDataResponse>(HOME_DATA_CACHE_KEY);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.home.data(),
    queryFn: () =>
      fetchWithClientCache<HomeDataResponse>(
        HOME_DATA_CACHE_KEY,
        () => homeApi.getHomeData(),
        HOME_CACHE_TTL_MS,
        (res) => Boolean(res && (res.banners?.length || res.featuredProducts?.length || res.categories?.length))
      ),
    initialData: cachedInitial ?? undefined,
    staleTime: HOME_CACHE_TTL_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const cachedFallback = getCachedClientData<ClientHomeFallback>(HOME_FALLBACK_CACHE_KEY);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>(cachedFallback?.products || []);
  const [fallbackSections, setFallbackSections] = useState<HomepageSection[]>(cachedFallback?.sections || []);
  const [fallbackCategories, setFallbackCategories] = useState<CustomCategory[]>(cachedFallback?.categories || []);

  // Client-side Firestore fallback ONLY when backend is completely empty AND not yet checked in this session
  useEffect(() => {
    if (isLoading || !db || typeof db !== "object") return;
    if (getCachedClientData<ClientHomeFallback>(HOME_FALLBACK_CACHE_KEY)) return;

    const hasBackendData =
      (data?.featuredProducts && data.featuredProducts.length > 0) ||
      (data?.banners && data.banners.length > 0) ||
      (data?.categories && data.categories.length > 0);

    // If the backend responded normally, do not trigger redundant client SDK reads
    if (hasBackendData) return;

    let cancelled = false;
    (async () => {
      try {
        let prods: Product[] = [];
        let secs: HomepageSection[] = [];
        let cats: CustomCategory[] = [];

        const qProd = query(collection(db, "products"), where("status", "==", "active"), limit(16));
        const snapProd = await getDocs(qProd);
        if (!cancelled && !snapProd.empty) {
          prods = (snapProd.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]).filter(
            (p) => (p.stock ?? 1) > 0
          );
          setFallbackProducts(prods);
        }

        const qSec = query(collection(db, "homepage_sections"), orderBy("sort_order", "asc"), limit(15));
        const snapSec = await getDocs(qSec);
        if (!cancelled && !snapSec.empty) {
          secs = snapSec.docs
            .map((d) => {
              const raw = d.data() as HomepageSection;
              const activeFlag = raw.isActive !== undefined ? raw.isActive : raw.is_active !== false;
              return { ...raw, id: d.id, isActive: Boolean(activeFlag), is_active: Boolean(activeFlag) };
            })
            .filter((s) => s.isActive);
          setFallbackSections(secs);
        }

        const qCat = query(collection(db, "homepage_categories_v2"), orderBy("sort_order", "asc"), limit(20));
        const snapCat = await getDocs(qCat);
        if (!cancelled && !snapCat.empty) {
          cats = snapCat.docs.map((d) => ({ id: d.id, ...d.data() })) as CustomCategory[];
          setFallbackCategories(cats);
        }

        if (!cancelled) {
          setCachedClientData<ClientHomeFallback>(
            HOME_FALLBACK_CACHE_KEY,
            { products: prods, sections: secs, categories: cats },
            HOME_CACHE_TTL_MS
          );
        }
      } catch {
        // Cache empty fallback for 2 minutes so F5 does not retry when quota is exhausted
        setCachedClientData<ClientHomeFallback>(
          HOME_FALLBACK_CACHE_KEY,
          { products: [], sections: [], categories: [] },
          120_000
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, data]);

  const effectiveBanners = data?.banners || [];
  const effectiveProducts =
    data?.featuredProducts && data.featuredProducts.length > 0 ? data.featuredProducts : fallbackProducts;
  const effectiveSections = (
    data?.sections && data.sections.length > 0 ? data.sections : fallbackSections
  ).map((s) => {
    const activeFlag = s.isActive !== undefined ? s.isActive : s.is_active !== false;
    return { ...s, isActive: Boolean(activeFlag), is_active: Boolean(activeFlag) };
  });
  const effectiveCategories =
    data?.categories && data.categories.length > 0 ? data.categories : fallbackCategories;

  return {
    dbBanners: effectiveBanners,
    dbTags: data?.tags || [],
    isBannersLoading: isLoading && effectiveBanners.length === 0,
    homepageSections: effectiveSections,
    featuredProducts: effectiveProducts,
    isLoadingProducts: isLoading && effectiveProducts.length === 0,
    customCategories: effectiveCategories,
    dbSellers: data?.sellers || [],
    isSellersLoading: isLoading,
  };
};
