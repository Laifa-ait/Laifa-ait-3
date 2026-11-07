import React from "react";
import { useTranslation } from "react-i18next";
import { Upload, Check, Sparkles, Link2 } from "lucide-react";

export interface BannerMediaUploadFieldsProps {
  bannerDesktopImage: string;
  setBannerDesktopImage: (v: string) => void;
  bannerMobileImage: string;
  setBannerMobileImage: (v: string) => void;
  isUploadingDesktop: boolean;
  uploadProgressDesktop: number;
  isUploadingMobile: boolean;
  uploadProgressMobile: number;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => Promise<void>;
}

const BANNER_STOCK_PRESETS = [
  {
    label: "Mode & Haute Couture",
    desktop: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
    mobile: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900",
  },
  {
    label: "Salon & Déco Prestige",
    desktop: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1600",
    mobile: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=900",
  },
  {
    label: "Électroménager & Cuisine",
    desktop: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1600",
    mobile: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=900",
  },
  {
    label: "High-Tech & Smartphones",
    desktop: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1600",
    mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=900",
  },
  {
    label: "Artisanat & Poterie DZ",
    desktop: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&q=80&w=1600",
    mobile: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&q=80&w=900",
  },
  {
    label: "Beauté & Parfumerie",
    desktop: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1600",
    mobile: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=900",
  },
];

export const BannerMediaUploadFields: React.FC<BannerMediaUploadFieldsProps> = ({
  bannerDesktopImage,
  setBannerDesktopImage,
  bannerMobileImage,
  setBannerMobileImage,
  isUploadingDesktop,
  uploadProgressDesktop,
  isUploadingMobile,
  uploadProgressMobile,
  handleImageUpload,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Desktop Image Upload & Direct URL */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2.5">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
            {t("1. Visuel Grand Écran Bureau * (1920x800 px)")}
          </label>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
            {t("Obligatoire")}
          </span>
        </div>

        {bannerDesktopImage && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold">
            <img
              src={bannerDesktopImage}
              alt=""
              className="w-12 h-7 object-cover rounded border border-emerald-300 shrink-0"
              referrerPolicy="no-referrer"
            />
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate flex-1">{t("Image bureau active")}</span>
            <button
              type="button"
              onClick={() => setBannerDesktopImage("")}
              className="text-xs text-red-600 hover:text-red-800 bg-white px-2.5 py-1 rounded-lg border border-red-200 cursor-pointer shrink-0"
            >
              {t("Retirer")}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            className={`h-10 px-3.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all select-none ${
              bannerDesktopImage
                ? "border-zinc-300 bg-white hover:border-orange-400"
                : "border-orange-500 bg-orange-50/40 hover:bg-orange-50"
            }`}
          >
            <Upload className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="text-xs font-bold text-zinc-800 truncate">
              {bannerDesktopImage ? t("Importer un autre fichier") : t("Importer depuis l'appareil")}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "desktop")}
              disabled={isUploadingDesktop}
            />
          </label>

          <div className="relative">
            <Link2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={bannerDesktopImage.startsWith("data:") ? "" : bannerDesktopImage}
              onChange={(e) => setBannerDesktopImage(e.target.value)}
              placeholder={t("Ou coller une URL https://...")}
              className="w-full h-10 pl-8 pr-3 rounded-xl border border-zinc-200 bg-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {isUploadingDesktop && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-orange-600 uppercase">
              <span>{t("Optimisation & Compression HD...")}</span>
              <span>{uploadProgressDesktop}%</span>
            </div>
            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full transition-all" style={{ width: `${uploadProgressDesktop}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* 2. Mobile Image Upload & Direct URL */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2.5">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
            {t("2. Visuel Smartphone Vertical (1080x1080 px)")}
          </label>
          <span className="text-[10px] font-bold text-zinc-500 uppercase">
            {t("Optionnel (Fallback auto sur Bureau)")}
          </span>
        </div>

        {bannerMobileImage && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold">
            <img
              src={bannerMobileImage}
              alt=""
              className="w-8 h-8 object-cover rounded border border-emerald-300 shrink-0"
              referrerPolicy="no-referrer"
            />
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate flex-1">{t("Image mobile dédiée active")}</span>
            <button
              type="button"
              onClick={() => setBannerMobileImage("")}
              className="text-xs text-red-600 hover:text-red-800 bg-white px-2.5 py-1 rounded-lg border border-red-200 cursor-pointer shrink-0"
            >
              {t("Retirer")}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="h-10 px-3.5 rounded-xl border-2 border-dashed border-zinc-300 bg-white hover:border-zinc-500 flex items-center justify-center gap-2 cursor-pointer transition-all select-none">
            <Upload className="w-4 h-4 text-zinc-600 shrink-0" />
            <span className="text-xs font-bold text-zinc-700 truncate">
              {bannerMobileImage ? t("Remplacer photo mobile") : t("Importer photo mobile")}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "mobile")}
              disabled={isUploadingMobile}
            />
          </label>

          <div className="relative">
            <Link2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={bannerMobileImage?.startsWith("data:") ? "" : bannerMobileImage || ""}
              onChange={(e) => setBannerMobileImage(e.target.value)}
              placeholder={t("URL image mobile https://...")}
              className="w-full h-10 pl-8 pr-3 rounded-xl border border-zinc-200 bg-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {isUploadingMobile && (
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-zinc-700 h-full transition-all" style={{ width: `${uploadProgressMobile}%` }} />
          </div>
        )}
      </div>

      {/* 3. Curated Instant Gallery */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2.5">
        <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>{t("Galerie de Visuels HD Prêts à l'Emploi (1-Clic)")}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BANNER_STOCK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setBannerDesktopImage(preset.desktop);
                if (!bannerMobileImage) setBannerMobileImage(preset.mobile);
              }}
              className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                bannerDesktopImage === preset.desktop
                  ? "border-orange-600 ring-2 ring-orange-500/30"
                  : "border-zinc-200 hover:border-orange-400"
              }`}
            >
              <img
                src={preset.desktop}
                alt={preset.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-2">
                <span className="text-[10px] font-bold text-white leading-tight truncate">
                  {preset.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
