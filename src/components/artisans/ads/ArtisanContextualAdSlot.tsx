import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { ArtisanAdCampaign } from "../../../types/artisanAds";
import { trackArtisanAdEvent } from "../../../services/artisanAds.api";

interface ArtisanContextualAdSlotProps {
  ads: ArtisanAdCampaign[];
  activeTradeLabel?: string;
}

export const ArtisanContextualAdSlot: React.FC<ArtisanContextualAdSlotProps> = ({
  ads,
  activeTradeLabel,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    ads.forEach((ad) => trackArtisanAdEvent(ad.id, "impression"));
  }, [ads]);

  if (ads.length === 0) return null;

  const handleOpenAd = (ad: ArtisanAdCampaign) => {
    trackArtisanAdEvent(ad.id, "click");
    if (!ad.targetUrl) return;
    if (ad.targetUrl.startsWith("/")) {
      navigate(ad.targetUrl);
    } else if (/^https?:\/\//i.test(ad.targetUrl)) {
      window.location.assign(ad.targetUrl);
    }
  };

  return (
    <section
      aria-label="Matériel et fournitures sponsorisés"
      className="space-y-2.5 pt-2"
    >
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-900">Sponsorisé</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-slate-500">
            {activeTradeLabel
              ? `Matériel & fournitures — ${activeTradeLabel}`
              : "Matériel & fournitures pour vos travaux"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ads.map((ad) => (
          <button
            key={ad.id}
            type="button"
            onClick={() => handleOpenAd(ad)}
            className="text-left group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-3 flex items-center gap-3 transition-all hover:shadow-[0_4px_14px_rgba(15,23,42,0.06)] cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/60">
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <ShoppingBag className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-slate-500 truncate">
                  {ad.advertiserName}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </div>
              <p className="text-xs font-bold text-[#1E293B] line-clamp-1 group-hover:text-[#1E3A8A]">
                {ad.title}
              </p>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                {ad.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
