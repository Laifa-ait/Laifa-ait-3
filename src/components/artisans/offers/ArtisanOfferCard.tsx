import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  BadgeCheck,
  Clock,
  ArrowRight,
  Wrench,
} from "lucide-react";
import { ArtisanOffer, formatOfferPriceLabel } from "../../../types/artisanOffers";

interface ArtisanOfferCardProps {
  offer: ArtisanOffer;
  isBoosted?: boolean;
}

export const ArtisanOfferCard: React.FC<ArtisanOfferCardProps> = ({
  offer,
  isBoosted = false,
}) => {
  const navigate = useNavigate();
  const priceLabel = formatOfferPriceLabel(offer);
  const coverSrc = offer.coverImageUrl || offer.images[0] || "";
  const showSponsored = Boolean(offer.isSponsored || isBoosted);

  return (
    <article
      onClick={() => navigate(`/artisans/offres/${offer.id}`)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Clean 16:10 Cover Media */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {coverSrc ? (
          <img
            loading="lazy"
            decoding="async"
            src={coverSrc}
            alt={offer.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-2">
            <Wrench className="w-8 h-8 stroke-[1.6]" />
            <span className="text-[11px] font-medium text-slate-500">
              {offer.tradeName}
            </span>
          </div>
        )}

        {/* Top Badges — Minimal & Functional */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-slate-800 border border-slate-200/80 shadow-2xs truncate max-w-[65%]">
            {offer.tradeName}
          </span>

          {showSponsored && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50/95 text-amber-800 border border-amber-200 text-[10px] font-semibold shrink-0">
              Sponsorisé
            </span>
          )}
        </div>

        {/* Availability Dot */}
        {offer.isAvailable && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 text-emerald-700 text-[10px] font-semibold inline-flex items-center gap-1.5 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Disponible</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-[15px] font-bold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
            {offer.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{offer.wilaya}</span>
            </span>
            {offer.interventionDelay && (
              <span className="inline-flex items-center gap-1 truncate">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{offer.interventionDelay}</span>
              </span>
            )}
          </div>
        </div>

        {/* Artisan Identity Row */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden shrink-0">
              {offer.artisanAvatarUrl ? (
                <img
                  src={offer.artisanAvatarUrl}
                  alt={offer.artisanName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                offer.artisanName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                <span className="truncate">{offer.artisanName}</span>
                {offer.artisanVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                )}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 tabular-nums">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="font-semibold text-slate-800">
                  {(offer.artisanRating || 5).toFixed(1)}
                </span>
                <span>({offer.artisanReviewCount || 0})</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums">
              {priceLabel}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E3A8A] group-hover:translate-x-0.5 transition-transform">
              <span>Voir l&apos;offre</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
