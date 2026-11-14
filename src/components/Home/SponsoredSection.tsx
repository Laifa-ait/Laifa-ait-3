import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
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
    <section className="py-8 bg-[#F4EDED]/65 border-y border-[#EFE6E6] my-6">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white text-[#622347] border border-[#EFE6E6] shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#E99856]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-display font-bold text-[#1A1836] tracking-tight">
                  {t("home.sponsored.title")}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#FDF4EC] text-[#622347] border border-[#E99856]/40">
                  {t("home.sponsored.badge")}
                </span>
              </div>
              <p className="text-xs text-[#6E5A6F] font-medium">
                {t("home.sponsored.subtitle")}
              </p>
            </div>
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
