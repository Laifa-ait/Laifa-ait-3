import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, ShieldCheck, MapPin, Clock, Briefcase, Heart } from "lucide-react";
import { ArtisanProfile } from "../../types/artisan";
import { isArtisanFavorite, toggleFavoriteArtisan } from "../../services/artisanHistory";
import { QuoteRequestModal } from "./QuoteRequestModal";

interface ArtisanCardProps {
  artisan: ArtisanProfile;
  onRequestQuote?: (artisan: ArtisanProfile) => void;
  boostLabel?: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = (name || "A").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({
  artisan,
  onRequestQuote,
  boostLabel,
  className = "",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isArtisanFavorite(artisan.id));
  }, [artisan.id]);

  const handleToggleFav = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const result = toggleFavoriteArtisan(artisan);
    setIsFav(result);
  };

  const startingPrice =
    artisan.services && artisan.services.length > 0 && artisan.services[0].priceStartingFrom
      ? `${new Intl.NumberFormat("fr-FR").format(artisan.services[0].priceStartingFrom)} DZD`
      : t("artisan_card_on_quote", "Sur devis");

  const realPortfolioThumbs = (artisan.portfolio || [])
    .filter((item) => Boolean(item.imageUrl))
    .slice(0, 3);

  return (
    <>
      <article
        className={`group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 flex flex-col justify-between gap-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)] transition-all duration-150 ${className}`}
      >
        {/* Top Clickable Identity Block (Google Local Services style) */}
        <div
          onClick={() => navigate(`/artisans/profile/${artisan.id}`)}
          className="cursor-pointer space-y-3 flex-1"
        >
          <div className="flex items-start gap-3">
            {/* Human Portrait / Clean Initials */}
            <div className="relative shrink-0">
              {artisan.avatarUrl ? (
                <img
                  src={artisan.avatarUrl}
                  alt={artisan.fullName}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center">
                  {getInitials(artisan.fullName)}
                </div>
              )}
              {artisan.status === "approved" && (
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center ring-2 ring-white"
                  title={t("artisan_card_verified", "Artisan indépendant vérifié")}
                >
                  <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                </span>
              )}
            </div>

            {/* Name, Trade, Rating & Save */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-[15px] text-[#1E293B] leading-snug truncate group-hover:text-[#1E3A8A] transition-colors">
                    {artisan.fullName}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 truncate">
                    {artisan.tradeName}
                    {boostLabel && (
                      <span className="text-slate-400 font-normal"> · {boostLabel}</span>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFav}
                  aria-label={isFav ? "Retirer des favoris" : "Enregistrer l'artisan"}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    isFav
                      ? "bg-amber-50 text-amber-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-amber-500 text-amber-500" : ""}`} />
                </button>
              </div>

              {/* Google-Style Rating + Experience + Availability */}
              <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-1.5 text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-slate-800 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{artisan.rating ? artisan.rating.toFixed(1) : "5.0"}</span>
                  <span className="font-normal text-slate-400">
                    ({artisan.reviewCount || 0})
                  </span>
                </span>

                <span className="text-slate-300" aria-hidden="true">·</span>

                {artisan.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {t("artisan_card_available", "Disponible")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    {t("artisan_card_on_appointment", "Sur RDV")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Location & Experience */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 min-w-0 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {artisan.commune ? `${artisan.commune}, ` : ""}
                {artisan.wilaya}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500 shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              {artisan.yearsOfExperience || 1} {t("artisan_card_years_exp", "ans d'exp.")}
            </span>
          </div>

          {/* Short Bio Preview */}
          {artisan.bio && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {artisan.bio}
            </p>
          )}

          {/* Subtle Material 3 Tonal Specialties */}
          {artisan.specialties && artisan.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {artisan.specialties.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Real Uploaded Portfolio Mini-Strip (Only if real photos exist) */}
          {realPortfolioThumbs.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {realPortfolioThumbs.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.imageUrl}
                  alt={photo.title || artisan.tradeName}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-14 rounded-lg object-cover border border-slate-200/70 bg-slate-100"
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer: Indicative Price + Material 3 Actions */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {t("artisan_card_indicative_price", "Tarif indicatif")}
            </span>
            <span className="font-bold text-[#1E293B] tabular-nums">{startingPrice}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/artisans/profile/${artisan.id}`)}
              className="h-9 px-3.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Voir le profil
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onRequestQuote) {
                  onRequestQuote(artisan);
                } else {
                  setIsQuoteModalOpen(true);
                }
              }}
              className="flex-1 h-9 px-4 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              {t("artisan_card_quote_free", "Devis gratuit")}
            </button>
          </div>
        </div>
      </article>

      {!onRequestQuote && (
        <QuoteRequestModal
          artisan={artisan}
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
        />
      )}
    </>
  );
};
