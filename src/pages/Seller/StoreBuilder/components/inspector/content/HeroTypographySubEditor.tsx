import React from "react";
import { CustomPageSection, HeroSubElement } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { HeroButtonsSubEditor } from "./HeroButtonsSubEditor";

interface HeroTypographySubEditorProps {
  activeSubPanel: HeroSubElement;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products?: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

const TEXT_SHADOW_OPTIONS = [
  { id: "none", label: "Aucune" },
  { id: "sm", label: "Subtile" },
  { id: "md", label: "Élégante" },
  { id: "lg", label: "Cinéma Forte" },
];

export const HeroTypographySubEditor: React.FC<HeroTypographySubEditorProps> = ({
  activeSubPanel, settings, sections = [], products = [], onSettingsChange, inputClass, labelClass,
}) => {
  if (activeSubPanel === "cta" || activeSubPanel === "ctaPrimary" || activeSubPanel === "ctaSecondary") {
    return (
      <HeroButtonsSubEditor
        activeSubPanel={activeSubPanel}
        settings={settings}
        sections={sections}
        products={products}
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
        labelClass={labelClass}
      />
    );
  }

  if (activeSubPanel === "badge") {
    const badgeStyle = (settings.badgeStyle as string) || (settings.badgeBgColor ? "solid" : "soft");
    const badgeBg = typeof settings.badgeBgColor === "string" && settings.badgeBgColor ? settings.badgeBgColor : "#EA580C";
    const badgeText = typeof settings.badgeTextColor === "string" && settings.badgeTextColor ? settings.badgeTextColor : "#FFFFFF";

    return (
      <div className="space-y-3 bg-[#F9FAFB] p-3 rounded-xl border border-[#E4E7EC]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#011C40]">Afficher le badge supérieur</span>
          <input
            type="checkbox"
            checked={settings.showBadge !== false}
            onChange={(e) => onSettingsChange("showBadge", e.target.checked)}
            className="rounded accent-amber-600 cursor-pointer"
          />
        </div>

        <label className={labelClass}>
          <span>Texte du Badge</span>
          <input
            type="text"
            value={typeof settings.badgeText === "string" ? settings.badgeText : ""}
            onChange={(e) => onSettingsChange("badgeText", e.target.value)}
            placeholder="SAVOIR-FAIRE AUTHENTIQUE"
            className={inputClass}
          />
        </label>

        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-700">Style du Badge</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "solid", label: "Plein Vif" },
              { id: "soft", label: "Pastel Doux" },
              { id: "outline", label: "Contour Fin" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onSettingsChange("badgeStyle", st.id)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  badgeStyle === st.id ? "bg-[#023859] text-white border-[#023859]" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Couleur du Badge</span>
            <div className="flex items-center gap-2">
              {Boolean(settings.badgeBgColor) && (
                <button type="button" onClick={() => onSettingsChange({ badgeBgColor: "", badgeTextColor: "" })} className="text-[10px] text-slate-500 underline cursor-pointer">
                  Thème
                </button>
              )}
              <input
                type="color"
                value={badgeBg}
                onChange={(e) => onSettingsChange({ badgeBgColor: e.target.value, badgeStyle: settings.badgeStyle || "solid" })}
                className="w-8 h-8 rounded cursor-pointer border border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Couleur du Texte du Badge</span>
            <input
              type="color"
              value={badgeText}
              onChange={(e) => onSettingsChange("badgeTextColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-slate-200"
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSubPanel === "title") {
    const titleVal = typeof settings.title === "string" ? settings.title : "";
    const textShadow = (settings.textShadow as string) || "none";
    const titleColor = typeof settings.titleColor === "string" && settings.titleColor ? settings.titleColor : "#18181B";

    return (
      <div className="space-y-3 bg-[#F9FAFB] p-3 rounded-xl border border-[#E4E7EC]">
        <label className={labelClass}>
          <div className="flex items-center justify-between">
            <span>Titre Principal</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => onSettingsChange("title", `${titleVal} *Atelier*`.trim())} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9.5px] font-bold cursor-pointer hover:bg-amber-200">
                + *Italique*
              </button>
              <button type="button" onClick={() => onSettingsChange("title", `${titleVal} {Art}`.trim())} className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9.5px] font-bold cursor-pointer hover:bg-sky-200">
                + &#123;Souligné&#125;
              </button>
            </div>
          </div>
          <input
            type="text"
            value={titleVal}
            onChange={(e) => onSettingsChange("title", e.target.value)}
            placeholder="Créations *Authentiques* & {Art de Vivre}"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className={labelClass}>
            <span className="text-[11px]">Taille Desktop</span>
            <select value={typeof settings.titleSizeDesktop === "string" ? settings.titleSizeDesktop : "lg"} onChange={(e) => onSettingsChange("titleSizeDesktop", e.target.value)} className={`${inputClass} text-xs py-1.5`}>
              <option value="sm">Compacte (SM)</option>
              <option value="md">Moyenne (MD)</option>
              <option value="lg">Grande (LG)</option>
              <option value="xl">Très Grande (XL)</option>
            </select>
          </label>

          <label className={labelClass}>
            <span className="text-[11px]">Taille Mobile</span>
            <select value={typeof settings.titleSizeMobile === "string" ? settings.titleSizeMobile : "md"} onChange={(e) => onSettingsChange("titleSizeMobile", e.target.value)} className={`${inputClass} text-xs py-1.5`}>
              <option value="sm">Compacte (SM)</option>
              <option value="md">Moyenne (MD)</option>
              <option value="lg">Grande (LG)</option>
              <option value="xl">Très Grande (XL)</option>
            </select>
          </label>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-700">Ombre Portée du Titre</span>
          <div className="grid grid-cols-2 gap-1.5">
            {TEXT_SHADOW_OPTIONS.map((ts) => (
              <button
                key={ts.id}
                type="button"
                onClick={() => onSettingsChange("textShadow", ts.id)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  textShadow === ts.id ? "bg-[#023859] text-white border-[#023859]" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {ts.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-xs font-medium text-slate-600">Couleur du Titre</span>
          <div className="flex items-center gap-2">
            {Boolean(settings.titleColor) && (
              <button type="button" onClick={() => onSettingsChange("titleColor", "")} className="text-[10px] text-slate-500 underline cursor-pointer">
                Thème
              </button>
            )}
            <input type="color" value={titleColor} onChange={(e) => onSettingsChange("titleColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const subColor = typeof settings.subtitleColor === "string" && settings.subtitleColor ? settings.subtitleColor : "#475467";
  return (
    <div className="space-y-3 bg-[#F9FAFB] p-3 rounded-xl border border-[#E4E7EC]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#011C40]">Afficher le sous-titre</span>
        <input type="checkbox" checked={settings.showSubtitle !== false} onChange={(e) => onSettingsChange("showSubtitle", e.target.checked)} className="rounded accent-amber-600 cursor-pointer" />
      </div>
      <label className={labelClass}>
        <span>Sous-titre</span>
        <textarea rows={3} value={typeof settings.subtitle === "string" ? settings.subtitle : ""} onChange={(e) => onSettingsChange("subtitle", e.target.value)} placeholder="Livraison rapide 69 Wilayas..." className={inputClass} />
      </label>
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <span className="text-xs font-medium text-slate-600">Couleur du Sous-titre</span>
        <div className="flex items-center gap-2">
          {Boolean(settings.subtitleColor) && (
            <button type="button" onClick={() => onSettingsChange("subtitleColor", "")} className="text-[10px] text-slate-500 underline cursor-pointer">
              Thème
            </button>
          )}
          <input type="color" value={subColor} onChange={(e) => onSettingsChange("subtitleColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-200" />
        </div>
      </div>
    </div>
  );
};
