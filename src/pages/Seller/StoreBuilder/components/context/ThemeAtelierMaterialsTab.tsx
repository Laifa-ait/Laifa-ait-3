import React, { useState } from "react";
import { Sparkles, Sun, Layers, Gem, Wand2, Globe, LayoutTemplate } from "lucide-react";
import {
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import {
  AMBIENT_LIGHTING_OPTIONS,
  CARD_MATERIAL_OPTIONS,
  SURFACE_TEXTURE_OPTIONS,
} from "../../constants/artisticAtmosphereOptions";
import {
  ARTISTIC_STUDIO_PRESETS,
  ArtisticStudioPreset,
  buildFiveActsHomeLayout,
} from "../../constants/fiveActsLayoutPreset";
import { FrameShapeSelectorGrid } from "./FrameShapeSelectorGrid";
import { EditorialTypographyControlBox } from "../inspector/controls/EditorialTypographyControlBox";

interface ThemeAtelierMaterialsTabProps {
  theme: CustomPageTheme;
  storeConfig?: SellerStoreConfig | null;
  sections?: CustomPageSection[];
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
  onApplyPresetWithFiveActs?: (newSections: CustomPageSection[], newTheme: CustomPageTheme) => void;
}

export const ThemeAtelierMaterialsTab: React.FC<ThemeAtelierMaterialsTabProps> = ({
  theme,
  storeConfig,
  sections = [],
  onUpdateTheme,
  onApplyPresetWithFiveActs,
}) => {
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const isAr = lang === "ar";

  const activeTexture = theme.surfaceTexture || "none";
  const activeLighting = theme.ambientLighting || "natural";
  const activeMaterial = theme.cardMaterial || "solid-matte";
  const activeFrameShape = theme.frameShape || "soft-modern";

  const handleApplyArtisticPreset = (preset: ArtisticStudioPreset) => {
    const nextTheme: CustomPageTheme = { ...theme, ...preset.theme };
    onUpdateTheme(nextTheme);

    if (onApplyPresetWithFiveActs) {
      const hasFiveActs =
        sections.some((s) => s.type === "hero_banner") &&
        sections.some((s) => s.type === "kinetic_marquee") &&
        sections.some((s) => s.type === "featured_categories");

      if (!hasFiveActs || sections.length === 0) {
        const generated = buildFiveActsHomeLayout(
          storeConfig?.shopName || "Notre Maison",
          storeConfig?.shopDescription,
          storeConfig?.bannerUrl,
          [],
          preset.heroLayout
        );
        onApplyPresetWithFiveActs(generated, nextTheme);
      } else {
        const updatedSections = sections.map((sec) => {
          if (sec.type === "hero_banner") {
            return {
              ...sec,
              settings: { ...sec.settings, heroLayout: preset.heroLayout },
            };
          }
          return sec;
        });
        onApplyPresetWithFiveActs(updatedSections as CustomPageSection[], nextTheme);
      }
    }
  };

  const handleRegenerateFiveActs = () => {
    if (!onApplyPresetWithFiveActs) return;
    const generated = buildFiveActsHomeLayout(
      storeConfig?.shopName || "Notre Maison",
      storeConfig?.shopDescription,
      storeConfig?.bannerUrl,
      [],
      "editorial-split"
    );
    onApplyPresetWithFiveActs(generated, theme);
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4 select-none">
      {/* Header + Bilingual FR/AR Switch + 5-Act Home Regenerator */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-[#18181B] to-[#27272A] text-white space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isAr ? "أتيليه الفن والسينوغرافيا" : "Atelier d'Art & Scénographie"}</span>
          </span>
          <button
            type="button"
            onClick={() => setLang((prev) => (prev === "fr" ? "ar" : "fr"))}
            className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-white/20"
          >
            <Globe className="w-3 h-3" />
            <span>{isAr ? "FR" : "عربي"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRegenerateFiveActs}
          className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>
            {isAr
              ? "🪄 إعادة توليد واجهة المتجر (5 فصول فنية)"
              : "🪄 Régénérer la Mise en Scène d'Accueil (5 Actes)"}
          </span>
        </button>
      </div>

      {/* 0. The 5 Official Artistic Studio Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-amber-600" />
          <span>{isAr ? "5 هويات فنية متكاملة (60-30-10)" : "5 Directions Artistiques (60-30-10)"}</span>
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {ARTISTIC_STUDIO_PRESETS.map((preset) => {
            const isMatched =
              activeTexture === preset.theme.surfaceTexture &&
              activeFrameShape === preset.theme.frameShape &&
              theme.accentColor === preset.theme.accentColor;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyArtisticPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isMatched
                    ? "border-amber-600 bg-amber-50/50 ring-1 ring-amber-600/30"
                    : "border-slate-200 bg-white hover:border-amber-500/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center -space-x-1 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-black/15"
                      style={{ backgroundColor: preset.theme.canvasColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/15"
                      style={{ backgroundColor: preset.theme.surfaceColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/15"
                      style={{ backgroundColor: preset.theme.accentColor }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-extrabold text-zinc-900 truncate">
                      {isAr ? preset.nameAr : preset.nameFr}
                    </span>
                    <span className="block text-[9.5px] text-zinc-500 truncate">
                      {isAr ? preset.subtitleAr : preset.subtitleFr}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-zinc-900 text-white text-[9.5px] font-bold shrink-0">
                  {isMatched ? "✓ Actif" : isAr ? "تطبيق" : "Appliquer"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Surface Textures */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>{isAr ? "1. خامة الخلفية (60%)" : "1. Textures de Surface (Fond 60%)"}</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {SURFACE_TEXTURE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onUpdateTheme({ surfaceTexture: opt.id })}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                activeTexture === opt.id
                  ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="block text-[10.5px] font-extrabold text-slate-900 leading-tight">
                {isAr ? opt.labelAr : opt.labelFr}
              </span>
              <span className="block text-[9px] text-slate-500 leading-tight mt-0.5">
                {isAr ? opt.sublabelAr : opt.sublabelFr}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Ambient Scenographic Lighting */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>{isAr ? "2. الإضاءة المسرحية" : "2. Éclairage Scénographique"}</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {AMBIENT_LIGHTING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onUpdateTheme({ ambientLighting: opt.id })}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                activeLighting === opt.id
                  ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="block text-[10.5px] font-extrabold text-slate-900 leading-tight">
                {isAr ? opt.labelAr : opt.labelFr}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Card Refraction & Material */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Gem className="w-3.5 h-3.5 text-amber-600" />
          <span>{isAr ? "3. مادة البطاقات (30%)" : "3. Matière des Cartes (30%)"}</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {CARD_MATERIAL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onUpdateTheme({ cardMaterial: opt.id })}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                activeMaterial === opt.id
                  ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="block text-[10px] font-extrabold text-slate-900 truncate">
                {isAr ? opt.labelAr : opt.labelFr}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Pilier 2: Architectural Silhouettes */}
      <div className="pt-2 border-t border-slate-200">
        <FrameShapeSelectorGrid
          activeShape={activeFrameShape}
          onSelectShape={(shape) => onUpdateTheme({ frameShape: shape })}
          isAr={isAr}
          compact
        />
      </div>

      {/* 5. Pilier 3: Editorial Typography */}
      <div className="pt-2 border-t border-slate-200">
        <EditorialTypographyControlBox
          letterSpacing={theme.letterSpacing ?? 0}
          lineHeight={theme.lineHeight ?? 1.12}
          headingAccentStyle={theme.headingAccentStyle || "metallic-gold"}
          headingUnderlineStyle={theme.headingUnderlineStyle || "brush-stroke"}
          accentColor={theme.accentColor || theme.primaryColor}
          isAr={isAr}
          onChange={(patch) => onUpdateTheme(patch)}
        />
      </div>
    </div>
  );
};
