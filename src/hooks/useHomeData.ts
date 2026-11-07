import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../services/api/home.api";
import { queryKeys } from "../lib/queryKeys";
import { collection, query, orderBy, onSnapshot, getDocs, where, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Banner, HomepageSection, CustomCategory } from "../domains/home/homepage.types";
import { Product } from "../domains/product/product.types";

export const useHomeData = () => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.home.data(),
    queryFn: () => homeApi.getHomeData(),
    staleTime: 60 * 1000, // 1 minute fresh cache
  });

  const [realtimeBanners, setRealtimeBanners] = useState<Banner[]>([]);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);
  const [fallbackSections, setFallbackSections] = useState<HomepageSection[]>([]);
  const [fallbackCategories, setFallbackCategories] = useState<CustomCategory[]>([]);

  // Real-time synchronization with Firestore banners collection
  useEffect(() => {
    if (!db || typeof db !== "object") return;
    try {
      const qBanners = query(collection(db, "banners"), orderBy("sort_order", "asc"));
      const unsubscribe = onSnapshot(
        qBanners,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as Banner[];
            setRealtimeBanners(list);
          }
        },
        () => {
          // Gracefully fallback to REST API data on connection glitches
        }
      );
      return () => unsubscribe();
    } catch {
      // Ignore if Firestore is in fallback mode
    }
  }, []);

  // Client-side Firestore fallback when backend Admin SDK is in unauthenticated/degraded mode
  useEffect(() => {
    if (isLoading || !db || typeof db !== "object") return;
    const needsProducts = !data?.featuredProducts || data.featuredProducts.length === 0;
    const needsSections = !data?.sections || data.sections.length === 0;
    const needsCategories = !data?.categories || data.categories.length === 0;

    if (!needsProducts && !needsSections && !needsCategories) return;

    let cancelled = false;
    (async () => {
      try {
        if (needsProducts) {
          const qProd = query(collection(db, "products"), where("status", "==", "active"), limit(40));
          const snap = await getDocs(qProd);
          if (!cancelled && !snap.empty) {
            const prods = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
            setFallbackProducts(prods.filter((p) => (p.stock ?? 1) > 0));
          }
        }
        if (needsSections) {
          const qSec = query(collection(db, "homepage_sections"), orderBy("sort_order", "asc"));
          const snap = await getDocs(qSec);
          if (!cancelled && !snap.empty) {
            const secs = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }) as HomepageSection)
              .filter((s) => Boolean(s.is_active));
            setFallbackSections(secs);
          }
        }
        if (needsCategories) {
          const qCat = query(collection(db, "homepage_categories_v2"), orderBy("sort_order", "asc"));
          const snap = await getDocs(qCat);
          if (!cancelled && !snap.empty) {
            const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CustomCategory[];
            setFallbackCategories(cats);
          }
        }
      } catch {
        // Silently ignore client Firestore fallback errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, data]);

  const effectiveBanners = realtimeBanners.length > 0 ? realtimeBanners : (data?.banners || []);
  const effectiveProducts =
    data?.featuredProducts && data.featuredProducts.length > 0 ? data.featuredProducts : fallbackProducts;
  const effectiveSections =
    data?.sections && data.sections.length > 0 ? data.sections : fallbackSections;
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
