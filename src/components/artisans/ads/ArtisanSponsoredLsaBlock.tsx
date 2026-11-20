import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShieldCheck, Info, MapPin, ArrowUpRight, Zap } from "lucide-react";
import { ArtisanProfile } from "../../../types/artisan";
import { ArtisanSponsoredLsaItem } from "../../../types/artisanAds";
import { trackArtisanAdEvent } from "../../../services/artisanAds.api";

interface ArtisanSponsoredLsaBlockProps {
  items: ArtisanSponsoredLsaItem[];
  onRequestQuote: (artisan: ArtisanProfile, campaignId: string) => void;
}

function getInitials(name: string): string {
  const parts = (name || "A").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export const ArtisanSponsoredLsaBlock: React.FC<ArtisanSponsoredLsaBlockProps> = ({
  items,
  onRequestQuote,
}) => {
  const navigate = useNavigate();
  const [showWhyAd, setShowWhyAd] = useState(false);

  useEffect(() => {
    items.forEach((item) => {
      trackArtisanAdEvent(item.campaign.id, "impression");
    });
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Artisans sponsorisés dans votre zone"
      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-3.5"
    >
      {/* Google Local Services Transparency Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold tracking-wide text-slate-900">
            Sponsorisé
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-slate-500">
            Artisans mis en avant dans votre secteur
          </span>
          <button
            type="button"
            onClick={() => setShowWhyAd((v) => !v)}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Pourquoi cette annonce ?"
            title="Pourquoi cette annonce ?"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showWhyAd && (
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 leading-relaxed">
          <strong className="text-slate-900">Transparence publicitaire :</strong> Ces artisans
          indépendants activent un boost local pour apparaître en tête de recherche. Leur position
          combine leur pack local et leur <strong>Score de Qualité</strong> (profil vérifié, avis
          clients et disponibilité réelle).
        </div>
      )}

      {/* Material Design 3 Local Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map(({ campaign, artisan }) => {
          const isUrgentBoost = campaign.format === "urgency_spotlight";
          return (
            <article
              key={campaign.id}
              className="group rounded-2xl border border-slate-200/90 hover:border-amber-400/80 bg-[#F8FAFC]/60 hover:bg-white p-3.5 flex flex-col justify-between gap-3 transition-all duration-150 hover:shadow-[0_4px_14px_rgba(15,23,42,0.06)]"
            >
              <div
                onClick={() => {
                  trackArtisanAdEvent(campaign.id, "click");
                  navigate(`/artisans/profile/${artisan.id}`);
                }}
                className="flex items-start gap-3 cursor-pointer"
              >
                {/* Human Portrait / Clean Initials */}
                <div className="relative shrink-0">
                  {artisan.avatarUrl ? (
                    <img
                      src={artisan.avatarUrl}
                      alt={artisan.fullName}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                      {getInitials(artisan.fullName)}
                    </div>
                  )}
                  {artisan.status === "approved" && (
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center ring-2 ring-white"
                      title="Artisan indépendant vérifié"
                    >
                      <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  )}
                </div>

                {/* Google-scannable Identity */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="font-bold text-sm text-[#1E293B] truncate group-hover:text-[#1E3A8A] transition-colors">
                      {artisan.fullName}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-800 tabular-nums shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {(artisan.rating || 5).toFixed(1)}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-600 truncate">
                    {artisan.tradeName}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {artisan.commune ? `${artisan.commune}, ` : ""}
                      {artisan.wilaya}
                    </span>
                    {isUrgentBoost && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold shrink-0">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Dispo 24h
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Clean Material 3 Action Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    trackArtisanAdEvent(campaign.id, "click");
                    navigate(`/artisans/profile/${artisan.id}`);
                  }}
                  className="h-9 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Profil</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackArtisanAdEvent(campaign.id, "lead");
                    onRequestQuote(artisan, campaign.id);
                  }}
                  className="flex-1 h-9 px-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Demander un devis
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
