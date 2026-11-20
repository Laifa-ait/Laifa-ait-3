import React from "react";
import { Frame, Sparkles, Layers } from "lucide-react";
import {
  ArtisticCardMaterial,
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../../../../domains/seller/customPage.types";

interface SectionMaterialSubPanelProps {
  sectionType?: string;
  styles: CustomPageSectionStyles;
  theme?: CustomPageTheme;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
}

const BORDER_WIDTH_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: "Aucune" },
  { value: 1, label: "Fine (1px)" },
  { value: 2, label: "Moyenne" },
  { value: 3, label: "Épaisse" },
];

const ANIMATION_OPTIONS: Array<{
  id: NonNullable<CustomPageSectionStyles["animation"]>;
  label: string;
  hint: string;
}> = [
  { id: "none", label: "Aucune", hint: "Affichage direct" },
  { id: "fade", label: "Fondu doux", hint: "Progressif" },
  { id: "slide-up", label: "Glissé haut", hint: "Au défilement" },
  { id: "zoom", label: "Zoom léger", hint: "Mise en avant" },
];

const CARD_STYLE_OPTIONS: Array<{ id: ArtisticCardMaterial; label: string }> = [
  { id: "solid-matte", label: "Fond uni" },
  { id: "frosted-crystal", label: "Effet verre" },
  { id: "velvet-shadow", label: "Relief doux" },
];

function safeHex(val: string | undefined, fallback: string): string {
  return val && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim()) ? val.trim() : fallback;
}

export const SectionMaterialSubPanel: React.FC<SectionMaterialSubPanelProps> = ({
  sectionType,
  styles,
  theme,
  onStylesChange,
}) => {
  const activeBorderWidth =
    typeof styles.sectionBorderWidthPx === "number"
      ? styles.sectionBorderWidthPx
      : styles.sectionBorderColor
        ? 1
        : 0;
  const activeBorderColor = safeHex(styles.sectionBorderColor, safeHex(theme?.borderColor, "#E2E8F0"));
  const activeAnimation = styles.animation || "fade";
  const activeMaterial = styles.cardMaterial || theme?.cardMaterial || "solid-matte";
  const showCardStyle = sectionType !== "kinetic_marquee" && sectionType !== "hero_banner";

  const handleBorderWidthPick = (widthPx: number): void => {
    if (widthPx === 0) {
      onStylesChange({ sectionBorderWidthPx: 0, sectionBorderColor: undefined });
      return;
    }
    onStylesChange({
      sectionBorderWidthPx: widthPx,
      sectionBorderColor: styles.sectionBorderColor || activeBorderColor,
    });
  };

  return (
    <div className="space-y-3.5 pt-2 border-t border-slate-200" data-testid="section-aspect-useful-panel">
      {/* 1. Bordure du bloc */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5">
            <Frame className="w-3.5 h-3.5 text-slate-500" />
            <span>Bordure du bloc</span>
          </span>
          {activeBorderWidth > 0 && (
            <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-700 cursor-pointer">
              <span>Couleur</span>
              <input
                type="color"
                data-testid="section-aspect-border-color"
                value={activeBorderColor}
                onChange={(e) =>
                  onStylesChange({
                    sectionBorderColor: e.target.value,
                    sectionBorderWidthPx: activeBorderWidth || 1,
                  })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {BORDER_WIDTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`section-border-width-${opt.value}`}
              onClick={() => handleBorderWidthPick(opt.value)}
              className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${
                activeBorderWidth === opt.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Animation à l'apparition */}
      <div className="space-y-2 pt-3 border-t border-slate-200">
        <span className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-slate-500" />
          <span>Animation à l&apos;apparition</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {ANIMATION_OPTIONS.map((anim) => (
            <button
              key={anim.id}
              type="button"
              data-testid={`section-animation-${anim.id}`}
              onClick={() => onStylesChange("animation", anim.id)}
              className={`px-2.5 py-2 rounded-lg border text-left cursor-pointer transition-colors ${
                activeAnimation === anim.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="block text-[11.5px] font-semibold leading-tight">{anim.label}</span>
              <span
                className={`block text-[10px] mt-0.5 ${
                  activeAnimation === anim.id ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {anim.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Style des cartes (uniquement pour les sections contenant des cartes) */}
      {showCardStyle && (
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <span className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Aspect des cartes</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {CARD_STYLE_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                data-testid={`section-card-material-${m.id}`}
                onClick={() => onStylesChange("cardMaterial", m.id)}
                className={`h-8 px-2 rounded-lg border text-center text-[11px] font-medium cursor-pointer transition-colors ${
                  activeMaterial === m.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
