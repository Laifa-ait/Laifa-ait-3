import React from "react";
import { useTranslation } from "react-i18next";
import { Tag, Clock, Layers, Sparkles } from "lucide-react";
import { DbBanner, TagType } from "../../../hooks/useBannerAdmin";
import { getBannerFallbackImage } from "../../../utils/imageUtils";

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewBannerData: DbBanner | null;
  tags: TagType[];
  previewDeviceMode: "desktop" | "tablet" | "mobile";
  setPreviewDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void;
}

const SHADOW_MAP: Record<string, string> = {
  none: "shadow-none",
  soft: "shadow-md",
  medium: "shadow-xl",
  strong: "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.65)]",
  glow: "shadow-[0_0_40px_rgba(233,152,86,0.5)] ring-2 ring-[#E99856]/40",
};

export const BannerPreviewModal: React.FC<BannerPreviewModalProps> = ({
  isOpen,
  onClose,
  previewBannerData,
  tags,
  previewDeviceMode,
  setPreviewDeviceMode,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !previewBannerData) return null;

  const b = previewBannerData;
  const marginPx = b.image_margin ?? 0;
  const shadowClass = SHADOW_MAP[b.shadow_intensity || "medium"] || SHADOW_MAP.medium;
  const overlayOpacity = b.overlay_opacity ?? 65;
  const overlayColor = b.overlay_color || "#1A1836";
  const associatedTag = tags.find((tg) => tg.id === b.tag_id);
  const fallbackSrc = getBannerFallbackImage(b);

  const frameClass =
    previewDeviceMode === "desktop"
      ? "w-full max-w-3xl aspect-[2.4/1]"
      : previewDeviceMode === "tablet"
      ? "w-[500px] aspect-[1.6/1]"
      : "w-64 aspect-[4/5]";

  const imgSrc =
    (previewDeviceMode === "mobile" && b.mobile_image ? b.mobile_image : b.desktop_image) || fallbackSrc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden text-start">
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">
              {t("Simulateur Responsive OLMART")}
            </h3>
            <p className="text-xs font-semibold text-zinc-400">
              {b.title} • Marge {marginPx}px • Ombre {b.shadow_intensity || "medium"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
          <div className="lg:col-span-3 p-6 bg-zinc-100 flex flex-col items-center justify-center overflow-y-auto space-y-6">
            <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-xs gap-1">
              {(["desktop", "tablet", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewDeviceMode(mode)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                    previewDeviceMode === mode ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  {mode === "desktop" ? t("Ordinateur") : mode === "tablet" ? t("Tablette") : t("Mobile")}
                </button>
              ))}
            </div>

            <div className="w-full flex justify-center items-center flex-1">
              <div
                style={{
                  backgroundColor: b.bg_color || "#1A1836",
                  padding: `${marginPx}px`,
                }}
                className={`${frameClass} rounded-3xl overflow-hidden border border-zinc-300 relative transition-all ${shadowClass}`}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={b.title}
                    onError={(e) => {
                      e.currentTarget.src = fallbackSrc;
                    }}
                    style={{
                      objectFit: b.image_fit || "cover",
                      objectPosition: b.image_position || "center",
                    }}
                    className="w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(to top, ${overlayColor} 0%, transparent 100%)`,
                      opacity: overlayOpacity / 100,
                    }}
                  />

                  {b.discount_label && (
                    <div className="absolute top-3 end-3 px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {b.discount_label}
                    </div>
                  )}

                  {b.show_countdown && (
                    <div className="absolute top-3 start-3 px-2.5 py-1 rounded-xl bg-black/75 text-white text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>02j : 14h : 38m</span>
                    </div>
                  )}

                  <div className="absolute inset-0 p-6 flex flex-col justify-end items-start text-white">
                    {(b.badge || associatedTag) && (
                      <span
                        style={{ color: b.badge_color || "#E99856" }}
                        className="text-[11px] font-black uppercase tracking-widest mb-1"
                      >
                        {b.badge || associatedTag?.name}
                      </span>
                    )}
                    <h3
                      className="text-xl font-bold leading-tight mb-1"
                      style={{ color: b.title_color || "#FFFFFF" }}
                    >
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p
                        className="text-xs font-medium mb-3 max-w-md opacity-90"
                        style={{ color: b.subtitle_color || "#E0B4B2" }}
                      >
                        {b.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        style={{
                          backgroundColor: b.btn_bg_color || "#E99856",
                          color: b.btn_text_color || "#1A1836",
                        }}
                        className="rounded-xl py-2 px-4 text-xs uppercase font-black shadow-md"
                      >
                        {b.button_text}
                      </button>
                      {b.secondary_button_text && (
                        <button
                          type="button"
                          className="rounded-xl py-2 px-3 text-xs uppercase font-bold bg-white/15 backdrop-blur-md text-white border border-white/30"
                        >
                          {b.secondary_button_text}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-t lg:border-t-0 lg:border-l border-zinc-200 space-y-4 overflow-y-auto text-xs">
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1">
                <Layers className="w-3 h-3" /> {t("Configuration Design")}
              </span>
              <div className="flex justify-between font-bold">
                <span>{t("Marge Photo :")}</span>
                <span>{marginPx}px</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{t("Ombre :")}</span>
                <span className="uppercase">{b.shadow_intensity || "medium"}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{t("Voile :")}</span>
                <span>{overlayOpacity}%</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {t("Redirection")}
              </span>
              <p className="font-extrabold text-zinc-900">
                {associatedTag ? associatedTag.name : b.redirect_type || "Boutique"}
              </p>
              <p className="font-mono text-[11px] text-zinc-500 truncate">
                {b.target_category || b.cta_link || "/shop"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
