import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";
import { fetchArtisanTrades } from "../../services/artisan.api";
import { fetchPublicArtisanOffers } from "../../services/artisanOffers.api";
import { fetchArtisanSponsoredFeed, trackArtisanAdEvent } from "../../services/artisanAds.api";
import { fetchWithClientCache } from "../../utils/clientReadCache";
import { saveSearchHistory } from "../../services/artisanHistory";
import { ArtisanProfile, ArtisanTrade } from "../../types/artisan";
import { ArtisanOffer, ArtisanOfferPricingType } from "../../types/artisanOffers";
import { ArtisanSponsoredFeedResponse } from "../../types/artisanAds";
import { OlmaArtisanShell } from "../../components/artisans/shell/OlmaArtisanShell";
import { OlmaArtisanHero } from "../../components/artisans/hero/OlmaArtisanHero";
import { ArtisanQuickTradeGrid } from "../../components/artisans/home/ArtisanQuickTradeGrid";
import { ArtisanActiveFilterPills } from "../../components/artisans/filters/ArtisanActiveFilterPills";
import { ArtisanFilterOptions } from "../../components/artisans/filters/OlmaArtisanFilterModal";
import { ArtisanSponsoredLsaBlock } from "../../components/artisans/ads/ArtisanSponsoredLsaBlock";
import { ArtisanContextualAdSlot } from "../../components/artisans/ads/ArtisanContextualAdSlot";
import { ArtisanOffersCatalogSection } from "../../components/artisans/offers/ArtisanOffersCatalogSection";
import {
  OfferCatalogFilterBar,
  OfferSortOption,
} from "../../components/artisans/offers/OfferCatalogFilterBar";
import { QuoteRequestModal } from "../../components/artisans/QuoteRequestModal";

const EMPTY_SPONSORED: ArtisanSponsoredFeedResponse = {
  lsaArtisans: [],
  contextualAds: [],
  inFeedBanners: [],
  boostedArtisanIds: {},
};

export const ArtisansHome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trades, setTrades] = useState<ArtisanTrade[]>([]);
  const tradesRef = useRef<ArtisanTrade[]>([]);
  const [offers, setOffers] = useState<ArtisanOffer[]>([]);
  const [sponsoredFeed, setSponsoredFeed] =
    useState<ArtisanSponsoredFeedResponse>(EMPTY_SPONSORED);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pricingFilter, setPricingFilter] = useState<ArtisanOfferPricingType | "">("");
  const [offerSort, setOfferSort] = useState<OfferSortOption>("relevance");

  const [filters, setFilters] = useState<ArtisanFilterOptions>({
    q: searchParams.get("q") || undefined,
    tradeId: searchParams.get("tradeId") || searchParams.get("trade") || undefined,
    wilaya: searchParams.get("wilaya") || undefined,
    commune: searchParams.get("commune") || undefined,
    availableOnly:
      searchParams.get("available") === "true" || searchParams.get("urgency") === "true",
    minRating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
    sort: "rating",
  });

  const [selectedArtisanForQuote, setSelectedArtisanForQuote] = useState<ArtisanProfile | null>(null);

  useEffect(() => {
    fetchWithClientCache("artisans:trades:v1", fetchArtisanTrades, 10 * 60 * 1000)
      .then((data) => {
        tradesRef.current = data;
        setTrades(data);
      })
      .catch(() => {});
  }, []);

  const loadOffersAndAds = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const cacheKey = `artisans:offers:${filters.tradeId || ""}:${filters.wilaya || ""}:${filters.commune || ""}:${filters.q || ""}:${pricingFilter}:${offerSort}:${filters.availableOnly ? "1" : "0"}`;
      const [offersData, adsData] = await Promise.all([
        fetchWithClientCache(
          cacheKey,
          () =>
            fetchPublicArtisanOffers({
              q: filters.q,
              tradeId: filters.tradeId,
              wilaya: filters.wilaya,
              commune: filters.commune,
              pricingType: pricingFilter || undefined,
              availableOnly: filters.availableOnly,
              sort: offerSort,
              limit: 40,
            }),
          3 * 60 * 1000
        ),
        fetchArtisanSponsoredFeed({
          tradeId: filters.tradeId,
          wilaya: filters.wilaya,
          urgencyOnly: filters.availableOnly,
        }),
      ]);

      const filteredByRating = filters.minRating
        ? offersData.filter((o) => (o.artisanRating || 5) >= filters.minRating!)
        : offersData;

      setOffers(filteredByRating);
      setSponsoredFeed(adsData);

      if (filters.q || filters.tradeId || filters.wilaya) {
        const tradeObj = tradesRef.current.find((t) => t.id === filters.tradeId);
        saveSearchHistory({
          term: filters.q,
          tradeId: filters.tradeId,
          tradeName: tradeObj?.name,
          wilaya: filters.wilaya,
          commune: filters.commune,
        });
      }
    } catch {
      setLoadError("Impossible de charger le catalogue des offres pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [filters, pricingFilter, offerSort]);

  useEffect(() => {
    loadOffersAndAds();
  }, [loadOffersAndAds]);

  const handleTradeFilter = (tradeKey: string) => {
    const matched = trades.find(
      (t) =>
        t.id === tradeKey ||
        t.slug === tradeKey ||
        t.name.toLowerCase().includes(tradeKey.toLowerCase())
    );
    const resolvedId = tradeKey ? matched?.id || tradeKey : undefined;
    setFilters((prev) => ({ ...prev, tradeId: resolvedId }));
    if (resolvedId) searchParams.set("tradeId", resolvedId);
    else searchParams.delete("tradeId");
    setSearchParams(searchParams);
  };

  const handleRemoveFilter = (key: keyof ArtisanFilterOptions) => {
    setFilters((prev) => ({ ...prev, [key]: undefined }));
    searchParams.delete(key as string);
    setSearchParams(searchParams);
  };

  const handleResetAllFilters = () => {
    setFilters({ sort: "rating" });
    setPricingFilter("");
    setOfferSort("relevance");
    setSearchParams({});
  };

  const activeTradeLabel = trades.find((t) => t.id === filters.tradeId)?.name;

  return (
    <OlmaArtisanShell fullWidth activeTab="explorer" showBottomNav={!selectedArtisanForQuote}>
      <OlmaArtisanHero
        trades={trades}
        filters={filters}
        onFilterChange={setFilters}
        onSearchSubmit={loadOffersAndAds}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 pb-16 space-y-5">
        <ArtisanQuickTradeGrid
          activeTradeId={filters.tradeId}
          onSelectTradeFilter={handleTradeFilter}
        />

        <OfferCatalogFilterBar
          availableOnly={filters.availableOnly}
          minRating={filters.minRating}
          pricingFilter={pricingFilter}
          offerSort={offerSort}
          onToggleAvailable={() =>
            setFilters((prev) => ({ ...prev, availableOnly: !prev.availableOnly }))
          }
          onToggleTopRated={() =>
            setFilters((prev) => ({
              ...prev,
              minRating: prev.minRating && prev.minRating >= 4.5 ? undefined : 4.5,
            }))
          }
          onPricingChange={setPricingFilter}
          onSortChange={setOfferSort}
        />

        <ArtisanActiveFilterPills
          filters={filters}
          trades={trades}
          onRemoveFilter={handleRemoveFilter}
          onResetAll={handleResetAllFilters}
        />

        <ArtisanSponsoredLsaBlock
          items={sponsoredFeed.lsaArtisans}
          onRequestQuote={(artisan, campaignId) => {
            trackArtisanAdEvent(campaignId, "lead");
            setSelectedArtisanForQuote(artisan);
          }}
        />

        <ArtisanOffersCatalogSection
          loading={loading}
          error={loadError}
          offers={offers}
          wilaya={filters.wilaya}
          activeTradeName={activeTradeLabel}
          boostedArtisanIds={sponsoredFeed.boostedArtisanIds}
          nativeBanner={sponsoredFeed.inFeedBanners[0] || null}
          onResetFilters={handleResetAllFilters}
          onRetry={loadOffersAndAds}
        />

        <ArtisanContextualAdSlot
          ads={sponsoredFeed.contextualAds}
          activeTradeLabel={activeTradeLabel}
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1E3A8A] flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Vous êtes artisan indépendant ?</p>
              <p className="text-xs text-slate-500">
                Publiez vos offres de travaux depuis votre espace dédié — inscription gratuite pour particuliers, sans entreprise requise.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artisans/dashboard")}
            className="h-9 px-4 rounded-xl border border-slate-300 hover:border-[#1E3A8A] text-slate-800 hover:text-[#1E3A8A] text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <span>Accéder à l&apos;Espace Artisan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <QuoteRequestModal
        artisan={selectedArtisanForQuote}
        isOpen={Boolean(selectedArtisanForQuote)}
        onClose={() => setSelectedArtisanForQuote(null)}
      />
    </OlmaArtisanShell>
  );
};

export default ArtisansHome;
