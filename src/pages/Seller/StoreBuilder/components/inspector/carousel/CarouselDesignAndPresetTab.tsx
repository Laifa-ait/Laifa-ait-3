import React from "react";
import { Check, Sparkles, Sliders, Play } from "lucide-react";
import {
  BannerContentPosition,
  PromoCarouselStyleVariant,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { CAROUSEL_STYLE_OPTIONS } from "../../../constants/carouselPresets";
import { AlignmentMatrix3x3 } from "../controls/AlignmentMatrix3x3";
import { CarouselCampaignPresetsView } from "./CarouselCampaignPresetsView";

interface CarouselDesignAndPresetTabProps {
  mode: "design" | "presets";
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSwitchToSlides: () => void;
}

const renderCarouselStyleSvg = (id: PromoCarouselStyleVariant, isSelected: boolean) => {
  const stroke = isSelected ? "#023859" : "#64748B";
  const fillPrimary = isSelected ? "#023859" : "#94A3B8";
  const fillSoft = isSelected ? "#D8EBF5" : "#E2E8F0";

  if (id === "floating_glass") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="52" height="32" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <rect x="9" y="9" width="38" height="18" rx="3.5" fill="#FFFFFF" stroke={fillPrimary} strokeWidth="1.4" />
        <rect x="14" y="13" width="18" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="14" y="18" width="26" height="2" rx="1" fill={stroke} />
      </svg>
    );
  }
  if (id === "split_magazine") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="23" height="32" rx="3.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.4" />
        <rect x="6" y="8" width="15" height="3" rx="1" fill={fillPrimary} />
        <rect x="6" y="14" width="13" height="2" rx="1" fill={stroke} />
        <rect x="6" y="24" width="12" height="4" rx="1.5" fill={fillPrimary} />
        <rect x="28" y="2" width="26" height="32" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
      </svg>
    );
  }
  if (id === "offer_spotlight") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="52" height="32" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <circle cx="44" cy="11" r="6" fill={fillPrimary} />
        <rect x="6" y="21" width="32" height="9" rx="2.5" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "lookbook_peek") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="3" width="39" height="30" rx="4" fill={fillPrimary} />
        <rect x="44" y="6" width="10" height="24" rx="3" fill={fillSoft} stroke={stroke} strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
      <rect x="2" y="2" width="52" height="32" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
      <rect x="6" y="17" width="24" height="3" rx="1" fill={fillPrimary} />
      <rect x="6" y="22" width="16" height="2" rx="1" fill={stroke} />
      <rect x="6" y="26" width="14" height="4" rx="1.5" fill={fillPrimary} />
    </svg>
  );
};

export const CarouselDesignAndPresetTab: React.FC<CarouselDesignAndPresetTabProps> = ({
  mode,
  settings,
  products,
  onSettingsChange,
  onSwitchToSlides,
}) => {
  if (mode === "presets") {
    return (
      <CarouselCampaignPresetsView
        settings={settings}
        products={products}
        onSettingsChange={onSettingsChange}
        onSwitchToSlides={onSwitchToSlides}
      />
    );
  }

  const activeStyle = (settings.carouselStyle as PromoCarouselStyleVariant) || "editorial_luxury";
  const bannerHeight = (settings.bannerHeight as "sm" | "md" | "lg" | "xl") || "md";
  const overlayOpacity = typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : 45;
  const contentPosition = (settings.contentPosition as BannerContentPosition) || "bottom-left";
  const textAlignment = (settings.textAlignment as "left" | "center" | "right") || "left";
  const verticalAlignment = (settings.verticalAlignment as "top" | "center" | "bottom") || "bottom";

  return (
    <div className="space-y-4 select-none">
      <div className="space-y-2">
        <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
          <span>Style visuel du Carrousel (5 designs)</span>
        </span>
        <div className="grid grid-cols-2 gap-2">
          {CAROUSEL_STYLE_OPTIONS.map((opt) => {
            const isSel = activeStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSettingsChange("carouselStyle", opt.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSel
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] ring-1 ring-[#023859]/30 shadow-2xs"
                    : "border-slate-200 bg-white hover:border-[#54ACBF] text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  {renderCarouselStyleSvg(opt.id, isSel)}
                  {isSel ? (
                    <span className="w-4 h-4 rounded-full bg-[#023859] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-900 leading-tight">{opt.label}</span>
                  <span className="block text-[9.5px] text-slate-500 leading-tight mt-0.5">{opt.sublabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#023859]" />
            <span>Hauteur du Carrousel</span>
          </span>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: "sm", label: "Compact" },
              { id: "md", label: "Standard" },
              { id: "lg", label: "Grand" },
              { id: "xl", label: "Cinéma" },
            ].map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => onSettingsChange("bannerHeight", h.id)}
                className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                  bannerHeight === h.id
                    ? "bg-[#023859] border-[#023859] text-white"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
            <span>Contraste du voile sombre (Lisibilité)</span>
            <span className="font-mono font-bold text-[#023859]">{overlayOpacity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={85}
            step={5}
            value={overlayOpacity}
            onChange={(e) => onSettingsChange("overlayOpacity", Number(e.target.value))}
            className="w-full accent-[#023859] cursor-pointer"
          />
        </label>
      </div>

      <AlignmentMatrix3x3
        value={contentPosition}
        horizontalFallback={textAlignment}
        verticalFallback={verticalAlignment}
        label="Position globale du texte & bouton"
        onChange={(pos, h, v) =>
          onSettingsChange({
            contentPosition: pos,
            textAlignment: h,
            verticalAlignment: v,
          })
        }
      />

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-[#023859]" />
          <span>Navigation & Défilement</span>
        </span>
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
          <span>Défilement automatique</span>
          <input
            type="checkbox"
            checked={settings.autoplay !== false}
            onChange={(e) => onSettingsChange("autoplay", e.target.checked)}
            className="accent-[#023859]"
          />
        </label>
        {settings.autoplay !== false && (
          <label className="block space-y-1">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Durée par diapositive</span>
              <span className="font-mono font-bold text-[#023859]">{Number(settings.intervalSec || 5)}s</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={Number(settings.intervalSec || 5)}
              onChange={(e) => onSettingsChange("intervalSec", Number(e.target.value))}
              className="w-full accent-[#023859] cursor-pointer"
            />
          </label>
        )}
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
          <span>Afficher les flèches de navigation</span>
          <input
            type="checkbox"
            checked={settings.showArrows !== false}
            onChange={(e) => onSettingsChange("showArrows", e.target.checked)}
            className="accent-[#023859]"
          />
        </label>
      </div>
    </div>
  );
};
