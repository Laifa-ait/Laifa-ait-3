import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Image as ImageIcon, Monitor, Tablet, Smartphone, Clock, ArrowUpRight } from "lucide-react";
import {
  BannerContentPosition,
  BannerImageFit,
  BannerImagePosition,
  BannerShadowIntensity,
  BannerTextAlign,
  TagType,
} from "../../../hooks/useBannerAdmin";
import { BannerTranslationFields } from "../../../domains/home/homepage.types";
import { getBannerFallbackImage } from "../../../utils/imageUtils";

export interface BannerMediaPreviewProps {
  bannerDesktopImage: string;
  bannerMobileImage: string;
  bannerTitle: string;
  bannerTitleColor: string;
  bannerSubtitle: string;
  bannerSubtitleColor: string;
  badge: string;
  badgeColor: string;
  discountLabel: string;
  bannerButtonText: string;
  bannerBtnBgColor: string;
  bannerBtnTextColor: string;
  secondaryButtonText: string;
  bannerTagId: string;
  tags: TagType[];
  textAlign: BannerTextAlign;
  contentPosition: BannerContentPosition;
  overlayOpacity: number;
  overlayColor: string;
  shadowIntensity: BannerShadowIntensity;
  imageMargin: number;
  imageFit: BannerImageFit;
  imagePosition: BannerImagePosition;
  bgColor: string;
  showCountdown: boolean;
  endDate?: string;
  bannerEndDate?: string;
  translations: Record<string, BannerTranslationFields>;
}

const SHADOW_MAP: Record<BannerShadowIntensity, string> = {
  none: "shadow-none",
  soft: "shadow-md",
  medium: "shadow-xl",
  strong: "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)]",
  glow: "shadow-[0_16px_40px_-8px_rgba(233,152,86,0.5)] ring-2 ring-[#E99856]/40",
};

export const BannerMediaPreview: React.FC<BannerMediaPreviewProps> = (props) => {
  const { t } = useTranslation();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewLang, setPreviewLang] = useState<"fr" | "ar" | "en">("fr");

  const activeTag = props.tags.find((tg) => tg.id === props.bannerTagId);
  const getLoc = (key: keyof BannerTranslationFields, fallback: string) =>
    (previewLang !== "fr" && props.translations[previewLang]?.[key]) || fallback;

  const displayTitle = getLoc("title", props.bannerTitle) || t("Titre de la Bannière");
  const displaySubtitle = getLoc("subtitle", props.bannerSubtitle);
  const displayBadge = getLoc("badge", props.badge) || activeTag?.name || "";
  const displayButton = getLoc("button_text", props.bannerButtonText) || t("Découvrir");

  const alignClasses =
    props.textAlign === "center"
      ? "items-center text-center"
      : props.textAlign === "right"
      ? "items-end text-right"
      : "items-start text-left";

  const posClasses =
    props.contentPosition === "top" ? "justify-start" : props.contentPosition === "center" ? "justify-center" : "justify-end";

  const aspectClass =
    device === "mobile"
      ? "w-64 aspect-[4/5] mx-auto"
      : device === "tablet"
      ? "w-full max-w-md aspect-[16/10] mx-auto"
      : "w-full aspect-[2.2/1]";

  const activeImg = device === "mobile" ? props.bannerMobileImage || props.bannerDesktopImage : props.bannerDesktopImage;
  const fallbackSrc = getBannerFallbackImage(displayTitle);

  return (
    <div className="sticky top-0 space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-800">{t("Simulateur Temps Réel")}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex bg-white p-0.5 rounded-xl border border-zinc-200">
            {(
              [
                { id: "desktop", icon: Monitor },
                { id: "tablet", icon: Tablet },
                { id: "mobile", icon: Smartphone },
              ] as const
            ).map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    device === d.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          <div className="flex bg-white p-0.5 rounded-xl border border-zinc-200">
            {(["fr", "ar", "en"] as const).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => setPreviewLang(lng)}
                className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer ${
                  previewLang === lng ? "bg-orange-600 text-white" : "text-zinc-500"
                }`}
              >
                {lng}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        dir={previewLang === "ar" ? "rtl" : "ltr"}
        style={{ backgroundColor: props.bgColor, padding: `${props.imageMargin}px` }}
        className={`${aspectClass} rounded-3xl overflow-hidden border border-zinc-200/80 relative transition-all duration-300 ${SHADOW_MAP[props.shadowIntensity]}`}
      >
        <div className="w-full h-full relative rounded-2xl overflow-hidden">
          {activeImg ? (
            <img
              loading="lazy"
              src={activeImg}
              alt={displayTitle}
              onError={(e) => {
                e.currentTarget.src = fallbackSrc;
              }}
              style={{ objectFit: props.imageFit, objectPosition: props.imagePosition }}
              className="w-full h-full transition-all duration-300"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-400 text-center uppercase gap-1.5 text-xs font-mono bg-zinc-900/50">
              <ImageIcon className="w-8 h-8 opacity-40" />
              <span>{t("Sélectionnez une image ou un modèle HD")}</span>
            </div>
          )}

          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `linear-gradient(to top, ${props.overlayColor} 0%, ${props.overlayColor}99 45%, transparent 100%)`,
              opacity: props.overlayOpacity / 100,
            }}
          />

          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
            {props.discountLabel ? (
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                {props.discountLabel}
              </span>
            ) : (
              <span />
            )}
            {props.showCountdown && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-400 border border-amber-400/30 text-[10px] font-mono font-bold">
                <Clock className="w-3 h-3" />
                {props.endDate || props.bannerEndDate ? "02j : 14h : 38m" : "23h : 59m : 42s"}
              </span>
            )}
          </div>

          <div className={`absolute inset-0 p-5 flex flex-col ${posClasses} ${alignClasses} z-10`}>
            {displayBadge && (
              <span style={{ color: props.badgeColor }} className="text-[10px] font-extrabold uppercase tracking-widest mb-1 drop-shadow-xs">
                Olmart Prestige · {displayBadge}
              </span>
            )}
            <h3
              style={{ color: props.bannerTitleColor }}
              className={`font-display font-bold tracking-tight leading-tight mb-1.5 ${
                device === "mobile" ? "text-base" : "text-xl sm:text-2xl"
              } ${props.shadowIntensity !== "none" ? "drop-shadow-md" : ""}`}
            >
              {displayTitle}
            </h3>
            {displaySubtitle && (
              <p style={{ color: props.bannerSubtitleColor }} className="text-xs font-medium leading-relaxed mb-3 max-w-md opacity-95 drop-shadow-xs line-clamp-2">
                {displaySubtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                style={{ backgroundColor: props.bannerBtnBgColor, color: props.bannerBtnTextColor }}
                className="inline-flex items-center gap-1.5 rounded-xl py-2 px-4 text-xs font-extrabold tracking-tight shadow-md pointer-events-none"
              >
                <span>{displayButton}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              {props.secondaryButtonText && (
                <button type="button" className="rounded-xl py-2 px-3.5 text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/30 pointer-events-none">
                  {props.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
          <span className="block text-[9px] font-bold uppercase text-zinc-400">{t("Marge")}</span>
          <span className="text-xs font-mono font-bold text-zinc-800">{props.imageMargin}px ({props.imageFit})</span>
        </div>
        <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
          <span className="block text-[9px] font-bold uppercase text-zinc-400">{t("Ombre & Voile")}</span>
          <span className="text-xs font-mono font-bold text-zinc-800">{props.shadowIntensity} / {props.overlayOpacity}%</span>
        </div>
        <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
          <span className="block text-[9px] font-bold uppercase text-zinc-400">{t("Alignement")}</span>
          <span className="text-xs font-mono font-bold text-zinc-800 uppercase">{props.textAlign} · {props.contentPosition}</span>
        </div>
      </div>
    </div>
  );
};
