import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../services/api/home.api";
import { queryKeys } from "../lib/queryKeys";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Banner } from "../domains/home/homepage.types";

export const useHomeData = () => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.home.data(),
    queryFn: () => homeApi.getHomeData(),
    staleTime: 60 * 1000, // 1 minute fresh cache
  });

  const [realtimeBanners, setRealtimeBanners] = useState<Banner[]>([]);

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

  const effectiveBanners = realtimeBanners.length > 0 ? realtimeBanners : (data?.banners || []);

  return {
    dbBanners: effectiveBanners,
    dbTags: data?.tags || [],
    isBannersLoading: isLoading && effectiveBanners.length === 0,
    homepageSections: data?.sections || [],
    featuredProducts: data?.featuredProducts || [],
    isLoadingProducts: isLoading,
    customCategories: data?.categories || [],
    dbSellers: data?.sellers || [],
    isSellersLoading: isLoading,
  };
};
