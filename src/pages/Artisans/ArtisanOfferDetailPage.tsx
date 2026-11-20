import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Clock, CheckCircle2, Wrench, Eye } from "lucide-react";
import { fetchPublicArtisanOfferById } from "../../services/artisanOffers.api";
import { fetchArtisanReviews } from "../../services/artisan.api";
import { ArtisanOffer } from "../../types/artisanOffers";
import { ArtisanReview } from "../../types/artisan";
import { OlmaArtisanShell } from "../../components/artisans/shell/OlmaArtisanShell";
import { OfferQuotePanel } from "../../components/artisans/offers/OfferQuotePanel";
import { OfferArtisanReviewsSection } from "../../components/artisans/offers/OfferArtisanReviewsSection";

export const ArtisanOfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<ArtisanOffer | null>(null);
  const [reviews, setReviews] = useState<ArtisanReview[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadOffer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchPublicArtisanOfferById(id);
      setOffer(data);
      if (data) {
        setActiveImage(data.coverImageUrl || data.images[0] || "");
        const revs = await fetchArtisanReviews(data.artisanId);
        setReviews(revs);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOffer();
  }, [loadOffer]);

  if (loading) {
    return (
      <OlmaArtisanShell activeTab="explorer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-[16/10] bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-white rounded-2xl border border-slate-200" />
          </div>
          <div className="h-96 bg-white rounded-2xl border border-slate-200" />
        </div>
      </OlmaArtisanShell>
    );
  }

  if (!offer) {
    return (
      <OlmaArtisanShell activeTab="explorer">
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-lg font-bold text-[#0F172A]">Offre introuvable ou indisponible</h1>
          <p className="text-xs text-slate-500">
            Cette offre de travaux a peut-être été mise en pause ou retirée par l&apos;artisan.
          </p>
          <button
            type="button"
            onClick={() => navigate("/artisans")}
            className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold cursor-pointer"
          >
            Retour au catalogue d&apos;offres
          </button>
        </div>
      </OlmaArtisanShell>
    );
  }

  const gallery = offer.images.length > 0 ? offer.images : offer.coverImageUrl ? [offer.coverImageUrl] : [];

  return (
    <OlmaArtisanShell activeTab="explorer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-5">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate("/artisans")}
            className="inline-flex items-center gap-1 hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Catalogue d&apos;offres</span>
          </button>
          <span>/</span>
          <span className="text-slate-700 font-medium">{offer.tradeName}</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate">{offer.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="aspect-[16/10] bg-slate-100 relative">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={offer.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Wrench className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-xs font-medium">{offer.tradeName}</span>
                  </div>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="p-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                        activeImage === imgUrl ? "border-[#1E3A8A]" : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt={`Vue ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                    {offer.tradeName}
                  </span>
                  {offer.isAvailable && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Disponible</span>
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                  {offer.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>
                      {offer.wilaya}
                      {offer.communes.length > 0 ? ` (${offer.communes.slice(0, 4).join(", ")})` : ""}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Délai : {offer.interventionDelay}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums text-slate-500">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>{offer.viewsCount || 0} vues</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h2 className="text-sm font-bold text-[#0F172A]">Description de la prestation</h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {offer.description}
                </p>
              </div>

              {offer.includedItems.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <h2 className="text-sm font-bold text-[#0F172A]">Ce qui est inclus</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {offer.includedItems.map((item, idx) => (
                      <li key={`${item}-${idx}`} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <OfferArtisanReviewsSection offer={offer} reviews={reviews} />
          </div>

          <OfferQuotePanel offer={offer} />
        </div>
      </div>
    </OlmaArtisanShell>
  );
};

export default ArtisanOfferDetailPage;
