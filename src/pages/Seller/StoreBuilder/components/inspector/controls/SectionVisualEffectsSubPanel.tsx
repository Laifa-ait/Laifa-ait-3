import React from "react";
import { Box, Layers } from "lucide-react";
import {
  CustomPageSectionStyles,
  HeroShadowToken,
} from "../../../../../../domains/seller/customPage.types";
import { SectionMediaAndButtonSubPanel } from "./SectionMediaAndButtonSubPanel";
import { SectionCornerColorsSubBox } from "./SectionCornerColorsSubBox";

interface SectionVisualEffectsSubPanelProps {
  sectionType?: string;
  activeStep: 1 | 2 | 3 | 4;
  styles: CustomPageSectionStyles;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
  onSettingsChange?: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
}

const IMAGE_SECTIONS = new Set<string>([
  "hero_banner", "promo_carousel", "featured_categories", "curated_collections",
  "new_arrivals", "featured_products", "best_sellers", "product_grid",
  "brand_story", "showcase_video",
]);

const CARD_SECTIONS = new Set<string>([
  "featured_categories", "curated_collections", "new_arrivals", "featured_products",
  "best_sellers", "product_grid", "verified_reviews", "delivery_info",
  "return_policy", "faq_accordion",
]);

const BUTTON_SECTIONS = new Set<string>([
  "hero_banner", "promo_carousel", "curated_collections", "new_arrivals",
  "featured_products", "best_sellers", "product_grid", "brand_story", "showcase_video",
]);

const RADIUS_TO_PX: Record<"none" | "sm" | "md" | "lg", number> = {
  none: 0,
  sm: 12,
  md: 20,
  lg: 32,
};

export const SectionVisualEffectsSubPanel: React.FC<SectionVisualEffectsSubPanelProps> = ({
  sectionType,
  activeStep,
  styles,
  onStylesChange,
  onSettingsChange,
}) => {
  const hasImages = !sectionType || IMAGE_SECTIONS.has(sectionType);
  const hasCards = !sectionType || CARD_SECTIONS.has(sectionType);
  const hasButtons = !sectionType || BUTTON_SECTIONS.has(sectionType);
  const currentRadius = styles.borderRadius || "md";

  const syncHeroAndStyles = (
    stylePatch: Partial<CustomPageSectionStyles>,
    heroPatch?: Record<string, unknown>
  ) => {
    onStylesChange(stylePatch);
    if (sectionType === "hero_banner" && onSettingsChange && heroPatch) {
      onSettingsChange(heroPatch);
    }
  };

  return (
    <div className="space-y-3.5">
      {activeStep === 1 && (
        <SectionCornerColorsSubBox styles={styles} onSync={syncHeroAndStyles} />
      )}

      {activeStep === 2 && (
        <div
          className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5"
          data-testid="section-corners-shadows-box"
        >
          <div className="flex items-center justify-between">
            <label className="text-[11.5px] font-semibold text-slate-900 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-slate-500" />
              <span>Rayon des coins (Bordures)</span>
            </label>
            <button
              type="button"
              data-testid="section-toggle-per-corner-radius"
              onClick={() => {
                const next = !styles.usePerCornerRadius;
                syncHeroAndStyles({ usePerCornerRadius: next }, { usePerCornerRadius: next });
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border cursor-pointer ${
                styles.usePerCornerRadius
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {styles.usePerCornerRadius ? "Par coin (4)" : "Uniforme"}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { id: "none", label: "Carré" },
                { id: "sm", label: "Léger" },
                { id: "md", label: "Standard" },
                { id: "lg", label: "Arrondi" },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() =>
                  syncHeroAndStyles(
                    { borderRadius: r.id, usePerCornerRadius: false },
                    { borderRadiusPx: RADIUS_TO_PX[r.id], usePerCornerRadius: false }
                  )
                }
                className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${
                  !styles.usePerCornerRadius && currentRadius === r.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {styles.usePerCornerRadius && (
            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-medium text-slate-700 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 tabular-nums">
              {(
                [
                  { key: "borderRadiusTlPx" as const, label: "↖ Haut-Gauche" },
                  { key: "borderRadiusTrPx" as const, label: "↗ Haut-Droit" },
                  { key: "borderRadiusBlPx" as const, label: "↙ Bas-Gauche" },
                  { key: "borderRadiusBrPx" as const, label: "↘ Bas-Droit" },
                ]
              ).map((corner) => {
                const val = styles[corner.key] ?? 16;
                return (
                  <label key={corner.key}>
                    {corner.label} ({val}px)
                    <input
                      type="range"
                      data-testid={`section-${corner.key}`}
                      min={0}
                      max={80}
                      step={4}
                      value={val}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        syncHeroAndStyles({ [corner.key]: v }, { [corner.key]: v });
                      }}
                      className="w-full accent-slate-900"
                    />
                  </label>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <label className="space-y-1 text-[10.5px] font-medium text-slate-700">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-500" /> Ombre Section
              </span>
              <select
                data-testid="section-shadow-select"
                value={styles.shadow || "none"}
                onChange={(e) => {
                  const v = e.target.value as HeroShadowToken;
                  syncHeroAndStyles({ shadow: v }, { bannerShadow: v });
                }}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
              >
                <option value="none">Aucune</option>
                <option value="sm">Douce</option>
                <option value="md">Moyenne</option>
                <option value="lg">Profonde</option>
                <option value="floating">Flottante</option>
                <option value="glow">Halo Couleur</option>
                <option value="brutal">Brutale</option>
              </select>
            </label>

            {hasCards && (
              <label className="space-y-1 text-[10.5px] font-medium text-slate-700">
                <span>Ombre des Cartes</span>
                <select
                  data-testid="section-card-shadow-select"
                  value={styles.cardShadow || "none"}
                  onChange={(e) => onStylesChange("cardShadow", e.target.value as HeroShadowToken)}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
                >
                  <option value="none">Standard</option>
                  <option value="sm">Douce</option>
                  <option value="md">Moyenne</option>
                  <option value="lg">Profonde</option>
                  <option value="floating">Flottante Luxe</option>
                  <option value="brutal">Brutale</option>
                </select>
              </label>
            )}
          </div>
        </div>
      )}

      <SectionMediaAndButtonSubPanel
        activeStep={activeStep}
        hasImages={hasImages}
        hasButtons={hasButtons}
        styles={styles}
        syncHeroAndStyles={syncHeroAndStyles}
      />
    </div>
  );
};
