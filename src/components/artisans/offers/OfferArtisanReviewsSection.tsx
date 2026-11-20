import React from "react";
import { BadgeCheck, Star } from "lucide-react";
import { ArtisanOffer } from "../../../types/artisanOffers";
import { ArtisanReview } from "../../../types/artisan";

interface OfferArtisanReviewsSectionProps {
  offer: ArtisanOffer;
  reviews: ArtisanReview[];
}

export const OfferArtisanReviewsSection: React.FC<OfferArtisanReviewsSectionProps> = ({
  offer,
  reviews,
}) => (
  <>
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-base font-bold text-slate-700 overflow-hidden shrink-0">
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
        <div>
          <p className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <span>{offer.artisanName}</span>
            {offer.artisanVerified && <BadgeCheck className="w-4 h-4 text-[#1E3A8A]" />}
          </p>
          <p className="text-xs text-slate-500">
            Artisan indépendant · {offer.artisanYearsExp} an{offer.artisanYearsExp > 1 ? "s" : ""} d&apos;expérience · {offer.wilaya}
          </p>
          <div className="flex items-center gap-1.5 text-xs mt-1 tabular-nums">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-bold text-slate-900">{(offer.artisanRating || 5).toFixed(1)}</span>
            <span className="text-slate-500">
              ({offer.artisanReviewCount || reviews.length} avis vérifiés)
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <h2 className="text-sm font-bold text-[#0F172A]">Avis clients ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="text-xs text-slate-500">
          Aucun avis publié pour le moment. Les avis sont déposés uniquement après une demande de devis.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.slice(0, 6).map((rev) => (
            <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{rev.clientName}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {rev.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
);
