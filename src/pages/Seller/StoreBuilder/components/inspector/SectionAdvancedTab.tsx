import React from "react";
import { ShieldCheck, Wand2, Eye, Accessibility, Hash, Code2 } from "lucide-react";
import type { CustomPageSectionStyles } from "../../../../../domains/seller/customPage.types";
import {
  sanitizeAnchorId,
  sanitizeControlledCssClasses,
} from "../../../../../components/Store/sections/responsiveInheritanceHelper";

interface SectionAdvancedTabProps {
  sectionId: string;
  settings: Record<string, unknown>;
  styles?: CustomPageSectionStyles;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onStylesChange?: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
}

const CONTROLLED_CSS_PRESETS = [
  { id: "olmart-card-elevated", label: "Élévation douce" },
  { id: "olmart-border-subtle", label: "Bordure fine" },
  { id: "olmart-glass-panel", label: "Effet verre dépoli" },
  { id: "olmart-editorial-frame", label: "Cadre éditorial" },
];

export const SectionAdvancedTab: React.FC<SectionAdvancedTabProps> = ({
  sectionId,
  settings,
  styles = {},
  onSettingsChange,
  onStylesChange,
}) => {
  const anchorId = (settings.anchorId as string) || "";
  const customCssClasses = (settings.customCssClasses as string) || "";
  const visibilityRule = (settings.visibilityRule as string) || "always";
  const ariaLabel = (settings.ariaLabel as string) || "";
  const ariaRole = (settings.ariaRole as string) || "region";
  const currentAnimation = styles.animation || "none";

  const toggleCssPreset = (presetClass: string) => {
    const tokens = new Set(customCssClasses.split(/\s+/).filter(Boolean));
    if (tokens.has(presetClass)) {
      tokens.delete(presetClass);
    } else {
      tokens.add(presetClass);
    }
    onSettingsChange(
      "customCssClasses",
      sanitizeControlledCssClasses(Array.from(tokens).join(" "))
    );
  };

  return (
    <div className="space-y-4 select-none" data-testid="section-advanced-tab">
      {/* ID d'ancre de navigation (#id) */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-[#023859]" />
          <span>ID d&apos;ancre de navigation (#ancre)</span>
        </label>
        <input
          type="text"
          data-testid="advanced-anchor-id-input"
          value={anchorId}
          onChange={(e) => {
            const clean = sanitizeAnchorId(e.target.value);
            onSettingsChange("anchorId", clean || undefined);
          }}
          placeholder="ex: nouvelle-collection"
          className="w-full h-9 px-3 bg-white border border-[#E4E7EC] rounded-lg text-[#17191C] text-[12px] font-mono focus:outline-none focus:border-[#023859]"
        />
        <p className="text-[10.5px] text-slate-500">
          Permet un lien direct vers cette section via <code className="font-mono text-[#023859]">#{anchorId || "ancre"}</code>.
        </p>
      </div>

      {/* Animation d'apparition contrôlée */}
      <div className="space-y-1.5 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-[#023859]" />
          <span>Animation d&apos;apparition</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: "none", label: "Aucune" },
              { id: "fade", label: "Fondu" },
              { id: "slide-up", label: "Glissé" },
              { id: "zoom", label: "Zoom" },
            ] as const
          ).map((anim) => (
            <button
              key={anim.id}
              type="button"
              onClick={() => {
                if (onStylesChange) onStylesChange("animation", anim.id);
                onSettingsChange("animation", anim.id);
              }}
              className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                currentAnimation === anim.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold"
                  : "border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]"
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visibilité conditionnelle */}
      <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[#023859]" />
          <span>Visibilité conditionnelle</span>
        </label>
        <select
          data-testid="advanced-visibility-rule-select"
          value={visibilityRule}
          onChange={(e) => onSettingsChange("visibilityRule", e.target.value)}
          className="h-9 w-full rounded-lg border border-[#E4E7EC] bg-white px-2.5 text-[12px] text-[#17191C] focus:border-[#023859] focus:outline-none"
        >
          <option value="always">Toujours afficher (par défaut)</option>
          <option value="in_stock_only">Afficher uniquement si des produits sont en stock</option>
          <option value="scheduled">Affichage programmé (plage de dates)</option>
        </select>

        {visibilityRule === "scheduled" && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 block mb-1">Début</span>
              <input
                type="date"
                value={(settings.visibleFrom as string) || ""}
                onChange={(e) => onSettingsChange("visibleFrom", e.target.value)}
                className="h-8 w-full rounded border border-slate-200 px-2 text-[11px]"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 block mb-1">Fin</span>
              <input
                type="date"
                value={(settings.visibleUntil as string) || ""}
                onChange={(e) => onSettingsChange("visibleUntil", e.target.value)}
                className="h-8 w-full rounded border border-slate-200 px-2 text-[11px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Classes CSS contrôlées & isolées (Anti-XSS / Anti-JS) */}
      <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#023859]" />
            <span>Classes CSS contrôlées</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" /> Filtré
          </span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CONTROLLED_CSS_PRESETS.map((preset) => {
            const isAct = customCssClasses.split(/\s+/).includes(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => toggleCssPreset(preset.id)}
                className={`px-2 py-1 rounded-md border text-[10.5px] font-semibold cursor-pointer ${
                  isAct
                    ? "bg-[#023859] text-white border-[#023859]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          data-testid="advanced-css-classes-input"
          value={customCssClasses}
          onChange={(e) =>
            onSettingsChange(
              "customCssClasses",
              sanitizeControlledCssClasses(e.target.value)
            )
          }
          placeholder="ex: olmart-card-elevated shadow-sm"
          className="w-full h-9 px-3 bg-white border border-[#E4E7EC] rounded-lg text-[#17191C] text-[12px] font-mono focus:outline-none focus:border-[#023859]"
        />
      </div>

      {/* Paramètres d'Accessibilité (WCAG / ARIA) */}
      <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
        <label className="text-[12px] font-semibold text-[#011C40] flex items-center gap-1.5">
          <Accessibility className="w-3.5 h-3.5 text-[#023859]" />
          <span>Accessibilité (Lecteurs d&apos;écran ARIA)</span>
        </label>
        <input
          type="text"
          data-testid="advanced-aria-label-input"
          value={ariaLabel}
          onChange={(e) => onSettingsChange("ariaLabel", e.target.value)}
          placeholder="Description vocale de la section (aria-label)..."
          className="w-full h-9 px-3 bg-white border border-[#E4E7EC] rounded-lg text-[#17191C] text-[12px] focus:outline-none focus:border-[#023859]"
        />
        <select
          value={ariaRole}
          onChange={(e) => onSettingsChange("ariaRole", e.target.value)}
          className="h-9 w-full rounded-lg border border-[#E4E7EC] bg-white px-2.5 text-[12px] text-[#17191C] focus:border-[#023859] focus:outline-none"
        >
          <option value="region">Région de contenu standard (region)</option>
          <option value="banner">Bannière principale (banner)</option>
          <option value="complementary">Information complémentaire (complementary)</option>
          <option value="contentinfo">Pied de page & Contact (contentinfo)</option>
        </select>
      </div>

      {/* ID Technique en lecture seule */}
      <div className="pt-2 border-t border-[#E4E7EC] flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>ID Section :</span>
        <span className="select-all">{sectionId}</span>
      </div>
    </div>
  );
};
