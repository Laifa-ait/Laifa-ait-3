import React from "react";
import { useTranslation } from "react-i18next";
import { Palette, Layers, Maximize2, AlignLeft, AlignCenter, AlignRight, Sparkles } from "lucide-react";
import {
  BANNER_COLOR_THEMES,
  BannerColorThemePreset,
  BannerContentPosition,
  BannerImageFit,
  BannerImagePosition,
  BannerShadowIntensity,
  BannerTextAlign,
} from "../../../hooks/useBannerAdmin";

export interface BannerStyleControlsProps {
  titleColor: string;
  setTitleColor: (v: string) => void;
  subtitleColor: string;
  setSubtitleColor: (v: string) => void;
  btnBgColor: string;
  setBtnBgColor: (v: string) => void;
  btnTextColor: string;
  setBtnTextColor: (v: string) => void;
  badgeColor: string;
  setBadgeColor: (v: string) => void;
  bgColor: string;
  setBgColor: (v: string) => void;
  overlayOpacity: number;
  setOverlayOpacity: (v: number) => void;
  overlayColor: string;
  setOverlayColor: (v: string) => void;
  shadowIntensity: BannerShadowIntensity;
  setShadowIntensity: (v: BannerShadowIntensity) => void;
  imageMargin: number;
  setImageMargin: (v: number) => void;
  imageFit: BannerImageFit;
  setImageFit: (v: BannerImageFit) => void;
  imagePosition: BannerImagePosition;
  setImagePosition: (v: BannerImagePosition) => void;
  textAlign: BannerTextAlign;
  setTextAlign: (v: BannerTextAlign) => void;
  contentPosition: BannerContentPosition;
  setContentPosition: (v: BannerContentPosition) => void;
  applyColorTheme: (theme: BannerColorThemePreset) => void;
}

export const BannerStyleControls: React.FC<BannerStyleControlsProps> = (p) => {
  const { t } = useTranslation();

  const colorPickers = [
    { label: t("Couleur Titre"), val: p.titleColor, set: p.setTitleColor },
    { label: t("Sous-titre"), val: p.subtitleColor, set: p.setSubtitleColor },
    { label: t("Fond Bouton"), val: p.btnBgColor, set: p.setBtnBgColor },
    { label: t("Texte Bouton"), val: p.btnTextColor, set: p.setBtnTextColor },
    { label: t("Couleur Badge"), val: p.badgeColor, set: p.setBadgeColor },
    { label: t("Fond Cadre"), val: p.bgColor, set: p.setBgColor },
  ];

  return (
    <div className="space-y-4 font-sans">
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-orange-600" />
            <span>{t("Thèmes de Couleurs Harmonisées (1-Clic)")}</span>
          </label>
          <span className="text-[10px] font-bold text-zinc-500 uppercase">{t("6 Palettes Pro")}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BANNER_COLOR_THEMES.map((theme) => {
            const isSelected =
              p.btnBgColor.toLowerCase() === theme.btnBgColor.toLowerCase() &&
              p.bgColor.toLowerCase() === theme.bgColor.toLowerCase();
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => p.applyColorTheme(theme)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-50/90 border-orange-500 ring-2 ring-orange-500/20"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center -space-x-2 shrink-0">
                  <span className="w-6 h-6 rounded-full border-2 border-white shadow-xs ring-1 ring-zinc-300" style={{ backgroundColor: theme.primaryCircle }} />
                  <span className="w-6 h-6 rounded-full border-2 border-white shadow-xs ring-1 ring-zinc-300" style={{ backgroundColor: theme.secondaryCircle }} />
                </div>
                <span className="text-[11px] font-bold text-zinc-800 leading-tight truncate">{theme.name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-200/70">
          {colorPickers.map((c) => (
            <div key={c.label} className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block truncate">{c.label}</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200">
                <input type="color" value={c.val} onChange={(e) => c.set(e.target.value)} className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent shrink-0" />
                <input type="text" value={c.val} onChange={(e) => c.set(e.target.value)} className="w-full text-[11px] font-mono font-bold uppercase text-zinc-800 focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-orange-600" />
            <span>{t("Marge de la Photo & Cadrage")}</span>
          </label>
          <span className="text-xs font-mono font-bold text-orange-600">{p.imageMargin}px</span>
        </div>

        <input type="range" min={0} max={32} step={4} value={p.imageMargin} onChange={(e) => p.setImageMargin(Number(e.target.value))} className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
        <div className="flex gap-1.5">
          {[
            { label: "0px (Plein bord)", val: 0 },
            { label: "8px (Fin)", val: 8 },
            { label: "16px (Cadre)", val: 16 },
            { label: "24px (Galerie)", val: 24 },
          ].map((m) => (
            <button
              key={m.val}
              type="button"
              onClick={() => p.setImageMargin(m.val)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer border ${
                p.imageMargin === m.val ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/70">
          <select value={p.imageFit} onChange={(e) => p.setImageFit(e.target.value as BannerImageFit)} className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer">
            <option value="cover">{t("Remplir (Cover)")}</option>
            <option value="contain">{t("Ajuster entier (Contain)")}</option>
          </select>
          <select value={p.imagePosition} onChange={(e) => p.setImagePosition(e.target.value as BannerImagePosition)} className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer">
            <option value="center">{t("Point Focal : Centre")}</option>
            <option value="top">{t("Point Focal : Haut")}</option>
            <option value="bottom">{t("Point Focal : Bas")}</option>
            <option value="left">{t("Point Focal : Gauche")}</option>
            <option value="right">{t("Point Focal : Droite")}</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
        <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-orange-600" />
          <span>{t("Effet d'Ombre & Voile de Contraste")}</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(["none", "soft", "medium", "strong", "glow"] as const).map((sh) => (
            <button
              key={sh}
              type="button"
              onClick={() => p.setShadowIntensity(sh)}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase cursor-pointer border ${
                p.shadowIntensity === sh ? "bg-orange-600 text-white border-orange-600" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {sh}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-2 border-t border-zinc-200/70">
          <div className="sm:col-span-2 space-y-1">
            <span className="text-[10px] font-bold uppercase text-zinc-500 block">
              {t("Opacité du dégradé sur l'image")} ({p.overlayOpacity}%)
            </span>
            <input type="range" min={0} max={90} step={5} value={p.overlayOpacity} onChange={(e) => p.setOverlayOpacity(Number(e.target.value))} className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200">
            <input type="color" value={p.overlayColor} onChange={(e) => p.setOverlayColor(e.target.value)} className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent shrink-0" />
            <input type="text" value={p.overlayColor} onChange={(e) => p.setOverlayColor(e.target.value)} className="w-full text-[11px] font-mono font-bold uppercase text-zinc-800 focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-600" />
            {t("Alignement Horizontal")}
          </label>
          <div className="flex bg-white p-1 rounded-xl border border-zinc-200 gap-1">
            {([
              { id: "left", icon: AlignLeft, label: "G" },
              { id: "center", icon: AlignCenter, label: "C" },
              { id: "right", icon: AlignRight, label: "D" },
            ] as const).map((al) => {
              const Icon = al.icon;
              return (
                <button
                  key={al.id}
                  type="button"
                  onClick={() => p.setTextAlign(al.id)}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer ${
                    p.textAlign === al.id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{al.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5">{t("Position Verticale")}</label>
          <div className="flex bg-white p-1 rounded-xl border border-zinc-200 gap-1">
            {(["top", "center", "bottom"] as const).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => p.setContentPosition(pos)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                  p.contentPosition === pos ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
