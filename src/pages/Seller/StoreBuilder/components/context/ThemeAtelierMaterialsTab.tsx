import React, { useState } from "react";
import { AlertTriangle, Globe, LayoutTemplate } from "lucide-react";
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
  ArtisticStudioPreset,
  buildFiveActsHomeLayout,
} from "../../constants/fiveActsLayoutPreset";
import { FrameShapeSelectorGrid } from "./FrameShapeSelectorGrid";
import { EditorialTypographyControlBox } from "../inspector/controls/EditorialTypographyControlBox";
import { ArtisticPresetsList } from "./ArtisticPresetsList";
import { DEFAULT_MODERN_SECTOR } from "../../constants/studioThemeDefaults";

interface ThemeAtelierMaterialsTabProps {
  theme: CustomPageTheme;
  storeConfig?: SellerStoreConfig | null;
  sections?: CustomPageSection[];
  onUpdateTheme: (patch: Partial<CustomPageTheme>) => void;
  onApplyThemeOnly?: (newTheme: CustomPageTheme) => void;
  onApplyPresetWithFiveActs?: (newSections: CustomPageSection[], newTheme: CustomPageTheme) => void;
}

export const ThemeAtelierMaterialsTab: React.FC<ThemeAtelierMaterialsTabProps> = ({
  theme, storeConfig, sections = [], onUpdateTheme, onApplyThemeOnly, onApplyPresetWithFiveActs,
}) => {
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const isAr = lang === "ar";

  const activeTexture = theme.surfaceTexture || "none";
  const activeLighting = theme.ambientLighting || "natural";
  const activeMaterial = theme.cardMaterial || "solid-matte";
  const activeFrameShape = theme.frameShape || "soft-modern";

  const handlePreviewPreset = (preset: ArtisticStudioPreset) => {
    onUpdateTheme({ ...preset.theme, presetId: preset.id });
  };

  const handleApplyArtisticPreset = (preset: ArtisticStudioPreset) => {
    const nextTheme: CustomPageTheme = { ...theme, ...preset.theme, presetId: preset.id };
    onUpdateTheme(nextTheme);
    if (onApplyThemeOnly) onApplyThemeOnly(nextTheme);
  };

  const executeRegenerateFiveActs = () => {
    if (!onApplyPresetWithFiveActs) return;
    const existingHero = sections.find((s) => s.type === "hero_banner");
    const existingHeroImage = String((existingHero?.settings as Record<string, unknown> | undefined)?.imageUrl || "");
    const existingProductIds = Array.from(
      new Set(
        sections.flatMap((s) =>
          Array.isArray((s.settings as Record<string, unknown> | undefined)?.productIds)
            ? ((s.settings as Record<string, unknown>).productIds as string[])
            : []
        )
      )
    );
    const generated = buildFiveActsHomeLayout(
      storeConfig?.shopName || "Notre Studio",
      storeConfig?.shopDescription,
      existingHeroImage || storeConfig?.bannerUrl,
      existingProductIds,
      "editorial-split",
      theme.sector || DEFAULT_MODERN_SECTOR
    );
    setConfirmRegenerate(false);
    onApplyPresetWithFiveActs(generated, theme);
  };

  const handleRequestRegenerateFiveActs = () => {
    if (sections.length > 0) {
      setConfirmRegenerate(true);
      return;
    }
    executeRegenerateFiveActs();
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4 select-none" data-testid="theme-atelier-materials-tab">
      <div className="pb-3 border-b border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-slate-900">
            {isAr ? "الهويات البصرية (14)" : "Directions artistiques (14)"}
          </span>
          <button
            type="button"
            onClick={() => setLang((prev) => (prev === "fr" ? "ar" : "fr"))}
            className="h-6 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] font-medium text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <Globe className="w-3 h-3 text-slate-500" />
            <span>{isAr ? "FR" : "عربي"}</span>
          </button>
        </div>

        <p className="text-[10.5px] text-slate-500 leading-snug">
          Choisir un thème met à jour la palette, les polices et les matières <strong>sans écraser vos textes ni vos produits</strong>.
        </p>

        {confirmRegenerate ? (
          <div data-testid="confirm-regenerate-five-acts-banner" className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 space-y-2">
            <div className="flex items-start gap-2 text-[11px] font-semibold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Remplacer la structure actuelle par les 5 sections d&apos;accueil ? Vos produits liés seront conservés.</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button" data-testid="cancel-regenerate-five-acts-btn" onClick={() => setConfirmRegenerate(false)}
                className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white text-[10.5px] font-semibold text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button" data-testid="confirm-regenerate-five-acts-btn" onClick={executeRegenerateFiveActs}
                className="h-7 px-2.5 rounded-lg bg-slate-900 text-white text-[10.5px] font-semibold cursor-pointer"
              >
                Confirmer la structure
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button" data-testid="regenerate-five-acts-btn" onClick={handleRequestRegenerateFiveActs}
            className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>{isAr ? "إعادة توليد واجهة المتجر (5 فصول)" : "Générer la structure d'accueil (5 sections)"}</span>
          </button>
        )}
      </div>

      <ArtisticPresetsList
        theme={theme}
        isAr={isAr}
        onSelectPreset={handleApplyArtisticPreset}
        onPreviewPreset={handlePreviewPreset}
      />

      <div className="space-y-1.5 pt-3 border-t border-slate-200">
        <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
          {isAr ? "خامة الخلفية (60%)" : "Texture de fond (60%)"}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {SURFACE_TEXTURE_OPTIONS.map((opt) => (
            <button
              key={opt.id} type="button" onClick={() => onUpdateTheme({ surfaceTexture: opt.id })}
              className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                activeTexture === opt.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="block text-[11px] font-semibold text-slate-900 leading-tight">{isAr ? opt.labelAr : opt.labelFr}</span>
              <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">{isAr ? opt.sublabelAr : opt.sublabelFr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 pt-3 border-t border-slate-200">
        <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
          {isAr ? "الإضاءة" : "Éclairage scénographique"}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {AMBIENT_LIGHTING_OPTIONS.map((opt) => (
            <button
              key={opt.id} type="button" onClick={() => onUpdateTheme({ ambientLighting: opt.id })}
              className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                activeLighting === opt.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="block text-[11px] font-medium text-slate-900 leading-tight">{isAr ? opt.labelAr : opt.labelFr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 pt-3 border-t border-slate-200">
        <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
          {isAr ? "مادة البطاقات (30%)" : "Matière des cartes (30%)"}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {CARD_MATERIAL_OPTIONS.map((opt) => (
            <button
              key={opt.id} type="button" onClick={() => onUpdateTheme({ cardMaterial: opt.id })}
              className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                activeMaterial === opt.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="block text-[10.5px] font-medium text-slate-900 truncate">{isAr ? opt.labelAr : opt.labelFr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <FrameShapeSelectorGrid activeShape={activeFrameShape} onSelectShape={(shape) => onUpdateTheme({ frameShape: shape })} isAr={isAr} compact />
      </div>

      <div className="pt-3 border-t border-slate-200">
        <EditorialTypographyControlBox
          letterSpacing={theme.letterSpacing ?? 0}
          lineHeight={theme.lineHeight ?? 1.12}
          headingAccentStyle={theme.headingAccentStyle || "accent-color"}
          headingUnderlineStyle={theme.headingUnderlineStyle || "hairline"}
          accentColor={theme.accentColor || theme.primaryColor}
          isAr={isAr}
          onChange={(patch) => onUpdateTheme(patch)}
        />
      </div>
    </div>
  );
};
