import React from "react";
import { RotateCcw } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../../../../domains/seller/customPage.types";
import {
  buildSectionColorGroups,
  ColorSlotItem,
  PRICE_SECTIONS,
} from "./sectionColorSlotsConfig";

interface SectionElementColorMatrixProps {
  sectionType?: string;
  styles: CustomPageSectionStyles;
  theme?: CustomPageTheme;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
  onSettingsChange?: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
}

export const SectionElementColorMatrix: React.FC<SectionElementColorMatrixProps> = ({
  sectionType,
  styles,
  theme,
  onStylesChange,
  onSettingsChange,
}) => {
  const groups = buildSectionColorGroups(sectionType, theme);

  const applyColorChange = (item: ColorSlotItem, nextValue: string | undefined) => {
    onStylesChange({ colorScheme: "custom", [item.key]: nextValue });
    if (onSettingsChange && item.heroSyncKey) {
      if (sectionType === "hero_banner") {
        onSettingsChange(item.heroSyncKey, nextValue);
      } else if (
        (item.key === "headingColor" || item.key === "subtitleColor") &&
        sectionType === "featured_categories"
      ) {
        onSettingsChange(item.heroSyncKey, nextValue);
      } else if (item.key === "iconColor" && PRICE_SECTIONS.has(sectionType || "")) {
        onSettingsChange("cardAccentColor", nextValue);
      }
    }
  };

  return (
    <div
      className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-200 select-none overflow-hidden"
      data-testid="section-element-color-matrix"
    >
      <div className="px-3 py-2 bg-slate-50/70 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-900">
          Couleurs par élément
        </span>
        <span className="text-[10px] text-slate-500">Contrôle individuel</span>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="p-2.5 space-y-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {group.title}
          </span>
          <div className="space-y-1">
            {group.items.map((item) => {
              const rawVal = styles[item.key] || "";
              const validHex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawVal)
                ? rawVal
                : item.fallback;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 py-0.5 px-1 rounded-md hover:bg-slate-50"
                >
                  <label
                    htmlFor={`color-${item.key}`}
                    className="text-[11px] font-medium text-slate-700 truncate flex-1 cursor-pointer"
                  >
                    {item.label}
                  </label>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      id={`color-${item.key}`}
                      type="color"
                      data-testid={`section-color-${item.key}`}
                      value={validHex}
                      onChange={(e) => applyColorChange(item, e.target.value)}
                      className="w-6 h-6 rounded border border-slate-200 bg-white p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      data-testid={`section-hex-${item.key}`}
                      value={rawVal}
                      placeholder={item.fallback.toUpperCase()}
                      onChange={(e) => applyColorChange(item, e.target.value || undefined)}
                      className="w-20 h-6 px-1.5 rounded border border-slate-200 font-mono text-[10px] text-slate-800 bg-white focus:border-slate-900 focus:outline-none"
                    />
                    {rawVal && (
                      <button
                        type="button"
                        title="Réinitialiser cet élément"
                        data-testid={`section-reset-${item.key}`}
                        onClick={() => applyColorChange(item, undefined)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
