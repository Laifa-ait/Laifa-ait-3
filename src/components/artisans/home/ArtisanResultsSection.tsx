import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Users, Send, Megaphone } from "lucide-react";
import { ArtisanProfile } from "../../../types/artisan";
import { ArtisanAdCampaign, ArtisanSponsoredFeedResponse } from "../../../types/artisanAds";
import { ArtisanCard } from "../ArtisanCard";
import { ArtisanNativeBannerAd } from "../ads/ArtisanNativeBannerAd";

interface ArtisanResultsSectionProps {
  loading: boolean;
  artisans: ArtisanProfile[];
  wilaya?: string;
  boostedArtisanIds: ArtisanSponsoredFeedResponse["boostedArtisanIds"];
  nativeBanner: ArtisanAdCampaign | null;
  onRequestQuote: (artisan: ArtisanProfile) => void;
  onResetFilters: () => void;
}

export const ArtisanResultsSection: React.FC<ArtisanResultsSectionProps> = ({
  loading,
  artisans,
  wilaya,
  boostedArtisanIds,
  nativeBanner,
  onRequestQuote,
  onResetFilters,
}) => {
  return (
    <section className="space-y-4">
      {/* Organic Results Header */}
      <div className="flex items-center justify-between gap-3 pt-1 border-b border-slate-200/80 pb-2.5">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-[#1E293B] tracking-tight">
            {loading
              ? "Recherche d'artisans..."
              : `${artisans.length} artisan${artisans.length > 1 ? "s" : ""} indépendant${
                  artisans.length > 1 ? "s" : ""
                }${wilaya ? ` à ${wilaya}` : ""}`}
          </h1>
          <p className="text-[11px] text-slate-500">
            Particuliers vérifiés par métier et commune · Contact direct sans intermédiaire
          </p>
        </div>

        <Link
          to="/artisans/annonces"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <Send className="w-3.5 h-3.5 text-amber-600" />
          <span>Fil des besoins clients</span>
        </Link>
      </div>

      {/* Organic Individual Artisans Feed + In-Feed Native Ad */}
      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-7 h-7 mx-auto text-[#1E3A8A] animate-spin" />
          <p className="text-xs font-medium text-slate-500 mt-3">
            Chargement des artisans disponibles...
          </p>
        </div>
      ) : artisans.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artisans.slice(0, 6).map((artisan) => (
              <ArtisanCard
                key={artisan.id}
                artisan={artisan}
                boostLabel={boostedArtisanIds[artisan.id]?.label}
                onRequestQuote={onRequestQuote}
              />
            ))}
          </div>

          {nativeBanner && <ArtisanNativeBannerAd banner={nativeBanner} />}

          {artisans.length > 6 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artisans.slice(6).map((artisan) => (
                <ArtisanCard
                  key={artisan.id}
                  artisan={artisan}
                  boostLabel={boostedArtisanIds[artisan.id]?.label}
                  onRequestQuote={onRequestQuote}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200/90 max-w-lg mx-auto my-4 p-6 space-y-3">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Aucun artisan inscrit sur ce filtre pour le moment
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Élargissez à toute la wilaya ou publiez gratuitement votre besoin pour être contacté.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onResetFilters}
              className="h-9 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Tout afficher
            </button>
            <Link
              to="/artisans/devenir-artisan"
              className="h-9 px-4 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Devenir artisan ici</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};
