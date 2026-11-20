import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PublicSponsoredProductDTO } from "../../types/sponsoredCampaign";
import { SponsoredProductCard } from "../Sponsorship/SponsoredProductCard";
import { fetchWithClientCache, getCachedClientData } from "../../utils/clientReadCache";

const SPONSORED_HOME_CACHE_KEY = "home:sponsored:v1";
const SPONSORED_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes anti-F5 shield

export const SponsoredSection: React.FC = () => {
  const { t } = useTranslation();
  const cachedSponsored = getCachedClientData<PublicSponsoredProductDTO[]>(SPONSORED_HOME_CACHE_KEY);
  const [sponsoredItems, setSponsoredItems] = useState<PublicSponsoredProductDTO[]>(cachedSponsored || []);
  const [loading, setLoading] = useState(cachedSponsored === null);

  useEffect(() => {
    let isMounted = true;

    async function loadSponsoredProducts() {
      try {
        const items = await fetchWithClientCache<PublicSponsoredProductDTO[]>(
          SPONSORED_HOME_CACHE_KEY,
          async () => {
            const res = await fetch("/api/v1/public/sponsored/products?placement=home&limit=8");
            if (!res.ok) return [];
            const json = await res.json();
            if (json?.success && Array.isArray(json.data)) {
              return json.data as PublicSponsoredProductDTO[];
            }
            return [];
          },
          SPONSORED_CACHE_TTL_MS
        );
        if (isMounted) {
          setSponsoredItems(items);
        }
      } catch {
        // Silently fail - zero disruptive UI on network errors
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSponsoredProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleImpression = (item: PublicSponsoredProductDTO) => {
    fetch("/api/v1/public/sponsored/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: item.campaignId,
        eventType: "impression",
        placement: item.placement,
        productId: item.product.id,
      }),
    }).catch(() => {
      // ignore tracking failure
    });
  };

  const handleClick = (item: PublicSponsoredProductDTO) => {
    fetch("/api/v1/public/sponsored/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: item.campaignId,
        eventType: "click",
        placement: item.placement,
        productId: item.product.id,
      }),
    }).catch(() => {
      // ignore
    });
  };

  // If loading or zero items, render strictly null
  if (loading || sponsoredItems.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-[#EFF3F1]/75 border-y border-[#E3E9E5] my-8">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-3.5 border-b border-[#D4DFD9]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0D5C4B]">
              <span>{t("home.sponsored.badge")}</span>
              <span aria-hidden="true" className="text-[#839497]">·</span>
              <span className="text-[#5F7073] font-medium">{t("home.sponsored.subtitle")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0F1B1D] tracking-tight">
              {t("home.sponsored.title")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {sponsoredItems.map((item) => (
            <SponsoredProductCard
              key={item.campaignId}
              item={item}
              onImpression={handleImpression}
              onClick={handleClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
