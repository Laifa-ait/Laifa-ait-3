import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ArtisanAdCampaign } from "../../../types/artisanAds";
import { trackArtisanAdEvent } from "../../../services/artisanAds.api";

interface ArtisanNativeBannerAdProps {
  banner: ArtisanAdCampaign | null;
}

export const ArtisanNativeBannerAd: React.FC<ArtisanNativeBannerAdProps> = ({ banner }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (banner) {
      trackArtisanAdEvent(banner.id, "impression");
    }
  }, [banner]);

  if (!banner) return null;

  const handleClick = () => {
    trackArtisanAdEvent(banner.id, "click");
    if (!banner.targetUrl) return;
    if (banner.targetUrl.startsWith("/")) {
      navigate(banner.targetUrl);
    } else if (/^https?:\/\//i.test(banner.targetUrl)) {
      window.location.assign(banner.targetUrl);
    }
  };

  return (
    <aside
      aria-label="Annonce sponsorisée"
      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {banner.imageUrl && (
          <img
            src={banner.imageUrl}
            alt={banner.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
        )}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold text-slate-900">Annonce</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="font-medium text-slate-500 truncate">{banner.advertiserName}</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#1E293B] leading-snug">
            {banner.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
            {banner.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="h-10 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
      >
        <span>{banner.ctaLabel || "Découvrir"}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
