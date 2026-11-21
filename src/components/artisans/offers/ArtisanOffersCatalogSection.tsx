import React from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { ArtisanOffer } from "../../../types/artisanOffers";
import { ArtisanInFeedBannerAd } from "../../../types/artisanAds";
import { ArtisanOfferCard } from "./ArtisanOfferCard";
import { ArtisanNativeBannerAd } from "../ads/ArtisanNativeBannerAd";

interface ArtisanOffersCatalogSectionProps {
  loading: boolean;
  error?: string | null;
  offers: ArtisanOffer[];
  wilaya?: string;
  activeTradeName?: string;
  boostedArtisanIds: Record<string, unknown>;
  nativeBanner: ArtisanInFeedBannerAd | null;
  onResetFilters: () => void;
  onRetry?: () => void;
}

export const ArtisanOffersCatalogSection: React.FC<ArtisanOffersCatalogSectionProps> = ({
  loading,
  error,
  offers,
  wilaya,
  activeTradeName,
  boostedArtisanIds,
  nativeBanner,
  onResetFilters,
  onRetry,
}) => {
  const headingTitle = activeTradeName
    ? `Offres — ${activeTradeName}${wilaya ? ` à ${wilaya}` : ""}`
    : wilaya
    ? `Offres de travaux à ${wilaya}`
    : "Catalogue des offres de travaux";

  return (
    <section aria-label="Catalogue des offres de travaux" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
            {headingTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {loading
              ? "Recherche des offres disponibles..."
              : `${offers.length} offre${offers.length > 1 ? "s" : ""} publiée${offers.length > 1 ? "s" : ""} · Devis gratuit & messagerie intégrée`}
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-900">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réessayer</span>
            </button>
          )}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/10] bg-slate-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-8 w-full bg-slate-100 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#0F172A]">
              Aucune offre de travaux ne correspond à vos critères
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Essayez d&apos;élargir votre recherche à toute la wilaya ou de réinitialiser les filtres pour découvrir les prestations disponibles.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Réinitialiser les filtres</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.slice(0, 3).map((offer) => (
              <ArtisanOfferCard
                key={offer.id}
                offer={offer}
                isBoosted={Boolean(boostedArtisanIds[offer.artisanId])}
              />
            ))}
          </div>

          {nativeBanner && <ArtisanNativeBannerAd banner={nativeBanner} />}

          {offers.length > 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.slice(3).map((offer) => (
                <ArtisanOfferCard
                  key={offer.id}
                  offer={offer}
                  isBoosted={Boolean(boostedArtisanIds[offer.artisanId])}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
