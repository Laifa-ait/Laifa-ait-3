import React from "react";
import { BannerContentPosition, CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";
import { resolveBannerPosition } from "./controls/AlignmentMatrix3x3";

interface SectionLayoutTabProps {
  sectionType?: string;
  styles: CustomPageSectionStyles;
  settings: Record<string, unknown>;
  onStylesChange: (field: keyof CustomPageSectionStyles, value: unknown) => void;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

const SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64];
const GRID_CAPABLE_SECTIONS = new Set<string>([
  "featured_products", "new_arrivals", "best_sellers", "product_grid",
  "featured_categories", "curated_collections", "verified_reviews",
]);

function buildContentPosition(h: "left" | "center" | "right", v: "top" | "center" | "bottom"): BannerContentPosition {
  return v === "center" && h === "center" ? "center" : (`${v}-${h}` as BannerContentPosition);
}

export const SectionLayoutTab: React.FC<SectionLayoutTabProps> = ({
  sectionType, styles, settings, onStylesChange, onSettingsChange,
}) => {
  const paddingValue =
    typeof styles.paddingY === "number" ? styles.paddingY : { sm: 16, md: 32, lg: 48, xl: 64 }[styles.paddingY || "md"] ?? 32;
  const paddingXValue = typeof styles.paddingX === "number" ? styles.paddingX : 20;
  const columnsDesktop = typeof settings.columnsDesktop === "number" ? settings.columnsDesktop : 4;
  const showColumnsControl = !sectionType || GRID_CAPABLE_SECTIONS.has(sectionType);

  const resolvedPos = resolveBannerPosition(
    (settings.textPosition9 as BannerContentPosition | undefined) || (settings.contentPosition as BannerContentPosition | undefined),
    (settings.textAlignment as "left" | "center" | "right") || "left",
    (settings.verticalAlignment as "top" | "center" | "bottom") || "center"
  );

  const isHero = sectionType === "hero_banner";
  const heroIsFloating = isHero && Boolean(settings.bannerFloating || styles.floatingCard);
  const heroIsFull =
    isHero && !heroIsFloating &&
    (settings.containerMode === "full" || styles.containerWidth === "full" ||
      (settings.heroLayout === "cinema-full" && settings.containerMode !== "contained" && styles.containerWidth !== "contained"));

  const handleContainerWidthChange = (widthId: "contained" | "full" | "narrow" | "floating") => {
    if (widthId === "floating") {
      onStylesChange("floatingCard", true);
      onStylesChange("containerWidth", "contained");
      onSettingsChange({
        bannerFloating: true, containerMode: "contained", fullTopWidth: false,
        bannerShadow: (settings.bannerShadow as string) && settings.bannerShadow !== "none" ? settings.bannerShadow : "floating",
        bannerShadowEnabled: true,
      });
      return;
    }
    onStylesChange("containerWidth", widthId);
    if (widthId === "full") {
      onStylesChange("paddingX", 0);
      onStylesChange("floatingCard", false);
    } else if (isHero) {
      onStylesChange("floatingCard", false);
    }
    if (isHero) {
      onSettingsChange({ containerMode: widthId === "full" ? "full" : "contained", fullTopWidth: widthId === "full", bannerFloating: false });
    }
  };

  const widthOptions = isHero
    ? ([
        { id: "full", label: "Plein bord", desc: "Sans limite" },
        { id: "contained", label: "Centré", desc: "Largeur site" },
        { id: "floating", label: "Flottante", desc: "Carte détachée" },
      ] as const)
    : ([
        { id: "contained", label: "Centré", desc: "Largeur site" },
        { id: "full", label: "Plein bord", desc: "Toute la page" },
        { id: "narrow", label: "Étroit", desc: "Plus serré" },
      ] as const);

  return (
    <div className="space-y-4 select-none" data-testid="section-layout-tab">
      <div className="space-y-1.5">
        <span className="text-[11.5px] font-semibold text-slate-900 block">Largeur sur la page</span>
        <div className="grid grid-cols-3 gap-1.5">
          {widthOptions.map((item) => {
            const active = isHero
              ? item.id === "floating" ? heroIsFloating : item.id === "full" ? heroIsFull : !heroIsFloating && !heroIsFull
              : (styles.containerWidth || "contained") === item.id;
            return (
              <button
                key={item.id} type="button" data-testid={`layout-width-${item.id}-btn`}
                onClick={() => handleContainerWidthChange(item.id)}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                  active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="text-[11px] font-medium">{item.label}</div>
                <div className={`text-[9.5px] ${active ? "text-white/75" : "text-slate-400"}`}>{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-200">
        <div className="flex justify-between items-center text-[11.5px] tabular-nums">
          <span className="font-semibold text-slate-900">Espace haut et bas</span>
          <span className="font-mono text-slate-900 font-semibold text-xs">{paddingValue}px</span>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {SPACING_SCALE.map((val) => (
            <button
              key={val} type="button" onClick={() => onStylesChange("paddingY", val)}
              className={`h-6 rounded border text-[10px] font-mono font-medium cursor-pointer ${
                paddingValue === val ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <input type="range" min={0} max={120} step={4} value={paddingValue} onChange={(e) => onStylesChange("paddingY", parseInt(e.target.value, 10))} className="w-full accent-slate-900 cursor-pointer" />

        {!heroIsFull && (
          <>
            <div className="flex justify-between items-center text-[11.5px] pt-1 tabular-nums">
              <span className="font-semibold text-slate-900">Espace gauche et droite</span>
              <span className="font-mono text-slate-900 font-semibold text-xs">{paddingXValue}px</span>
            </div>
            <input type="range" min={0} max={64} step={4} value={paddingXValue} onChange={(e) => onStylesChange("paddingX", parseInt(e.target.value, 10))} className="w-full accent-slate-900 cursor-pointer" />
          </>
        )}
      </div>

      {showColumnsControl && (
        <div className="space-y-1.5 pt-3 border-t border-slate-200" data-testid="layout-columns-control">
          <label className="text-[11.5px] font-semibold text-slate-900 block">Nombre de colonnes (Ordinateur)</label>
          <div className="grid grid-cols-3 gap-1.5">
            {([2, 3, 4] as const).map((cols) => (
              <button
                key={cols} type="button" onClick={() => onSettingsChange("columnsDesktop", cols)}
                className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer ${
                  columnsDesktop === cols ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cols} colonnes
              </button>
            ))}
          </div>
        </div>
      )}

      {sectionType !== "kinetic_marquee" && (
        <div className="space-y-2 pt-3 border-t border-slate-200" data-testid="layout-alignment-control">
          <label className="text-[11.5px] font-semibold text-slate-900 block">Alignement du texte</label>
          <div className="grid grid-cols-3 gap-1.5">
            {([{ id: "left", label: "Gauche" }, { id: "center", label: "Centre" }, { id: "right", label: "Droite" }] as const).map((align) => (
              <button
                key={align.id} type="button"
                onClick={() => {
                  const nextPos = buildContentPosition(align.id, resolvedPos.vertical);
                  const deskCfg = (settings.heroDesktopConfig as Record<string, unknown> | undefined) || {};
                  onSettingsChange({
                    textAlignment: align.id, contentPosition: nextPos,
                    ...(isHero ? { textPosition9: nextPos, heroDesktopConfig: { ...deskCfg, textPosition9: nextPos, textAlign: align.id } } : {}),
                  });
                }}
                className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer ${
                  resolvedPos.horizontal === align.id ? "border-slate-900 bg-slate-900 text-white font-semibold" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>

          {(!sectionType || isHero || sectionType === "promo_carousel") && (
            <div className="grid grid-cols-3 gap-1.5" data-testid="layout-vertical-alignment-control">
              {([{ id: "top", label: "Haut" }, { id: "center", label: "Milieu" }, { id: "bottom", label: "Bas" }] as const).map((vAlign) => (
                <button
                  key={vAlign.id} type="button"
                  onClick={() => {
                    const nextPos = buildContentPosition(resolvedPos.horizontal, vAlign.id);
                    const deskCfg = (settings.heroDesktopConfig as Record<string, unknown> | undefined) || {};
                    onSettingsChange({
                      verticalAlignment: vAlign.id, contentPosition: nextPos,
                      ...(isHero ? { textPosition9: nextPos, heroDesktopConfig: { ...deskCfg, textPosition9: nextPos } } : {}),
                    });
                  }}
                  className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer ${
                    resolvedPos.vertical === vAlign.id ? "border-slate-900 bg-slate-900 text-white font-semibold" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {vAlign.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5 pt-3 border-t border-slate-200">
        <label className="text-[11.5px] font-semibold text-slate-900 block">Bordure du bas de section</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[{ id: "none", label: "Droite" }, { id: "wave", label: "Vague" }, { id: "slant", label: "En biais" }, { id: "curve", label: "Courbe" }].map((div) => (
            <button
              key={div.id} type="button" onClick={() => onStylesChange("divider", div.id)}
              className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer ${
                (styles.divider || "none") === div.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
