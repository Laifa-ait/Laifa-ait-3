import React from "react";
import { CustomPageSection, HeroSubElement } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { SmartLinkPicker } from "../controls/SmartLinkPicker";

interface HeroButtonsSubEditorProps {
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

const BUTTON_STYLES = [
  { id: "pill", label: "Capsule Arrondie" },
  { id: "solid", label: "Plein Moderne" },
  { id: "outline", label: "Contour Élégant" },
  { id: "glass", label: "Verre Translucide" },
  { id: "sharp", label: "Couture Carré" },
];

const BUTTON_SHADOWS = [
  { id: "none", label: "Plat" },
  { id: "sm", label: "Douce" },
  { id: "md", label: "Standard" },
  { id: "lg", label: "Flottante" },
  { id: "glow", label: "Lueur Or" },
  { id: "brutal", label: "Brutale 3D" },
];

export const HeroButtonsSubEditor: React.FC<HeroButtonsSubEditorProps> = ({
  activeSubPanel,
  settings,
  sections = [],
  products = [],
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  if (activeSubPanel === "ctaSecondary") {
    const secStyle = (settings.secondaryCtaStyle as string) || "outline";
    const secShadow = (settings.secondaryCtaShadow as string) || "none";
    const secBg =
      typeof settings.secondaryCtaBgColor === "string" && settings.secondaryCtaBgColor
        ? settings.secondaryCtaBgColor
        : "#18181B";
    const secText =
      typeof settings.secondaryCtaTextColor === "string" && settings.secondaryCtaTextColor
        ? settings.secondaryCtaTextColor
        : "#FFFFFF";
    const secLabelText =
      typeof settings.secondaryCtaText === "string" ? settings.secondaryCtaText : "";

    return (
      <div className="space-y-3 bg-[#F9FAFB] p-3 rounded-xl border border-[#E4E7EC]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#011C40]">Afficher le bouton secondaire</span>
          <input
            type="checkbox"
            checked={settings.showSecondaryCta !== false && Boolean(secLabelText)}
            onChange={(e) => {
              const checked = e.target.checked;
              onSettingsChange({
                showSecondaryCta: checked,
                ...(checked && !secLabelText ? { secondaryCtaText: "Voir le Lookbook" } : {}),
              });
            }}
            className="rounded accent-amber-600 cursor-pointer"
          />
        </div>

        <label className={labelClass}>
          <span>Texte du Bouton Secondaire</span>
          <input
            type="text"
            value={secLabelText}
            onChange={(e) =>
              onSettingsChange({
                secondaryCtaText: e.target.value,
                showSecondaryCta: Boolean(e.target.value.trim()),
              })
            }
            placeholder="Ex: Voir le Lookbook"
            className={inputClass}
          />
        </label>

        <SmartLinkPicker
          label="Destination du Bouton Secondaire"
          value={typeof settings.secondaryCtaLink === "string" ? settings.secondaryCtaLink : "#catalog"}
          onChange={(link) => onSettingsChange("secondaryCtaLink", link)}
          sections={sections}
          products={products}
        />

        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-700">Forme & Style du Bouton 2</span>
          <div className="grid grid-cols-2 gap-1.5">
            {BUTTON_STYLES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onSettingsChange("secondaryCtaStyle", st.id)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  secStyle === st.id
                    ? "bg-[#023859] text-white border-[#023859]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-700">Ombre & Profondeur du Bouton 2</span>
          <div className="grid grid-cols-3 gap-1.5">
            {BUTTON_SHADOWS.map((sh) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => onSettingsChange("secondaryCtaShadow", sh.id)}
                className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  secShadow === sh.id
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {sh.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Couleur principale du Bouton 2</span>
            <div className="flex items-center gap-2">
              {(Boolean(settings.secondaryCtaBgColor) || Boolean(settings.secondaryCtaTextColor)) && (
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange({ secondaryCtaBgColor: "", secondaryCtaTextColor: "" })
                  }
                  className="text-[10px] text-slate-500 underline cursor-pointer"
                >
                  Thème
                </button>
              )}
              <input
                type="color"
                value={secBg}
                onChange={(e) => onSettingsChange("secondaryCtaBgColor", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Couleur du texte du Bouton 2</span>
            <input
              type="color"
              value={secText}
              onChange={(e) => onSettingsChange("secondaryCtaTextColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-slate-200"
            />
          </div>
        </div>
      </div>
    );
  }

  const ctaStyle = (settings.ctaStyle as string) || "pill";
  const ctaShadow = (settings.ctaShadow as string) || "md";
  const ctaBg = typeof settings.ctaBgColor === "string" && settings.ctaBgColor ? settings.ctaBgColor : "#B45309";
  const ctaText = typeof settings.ctaTextColor === "string" && settings.ctaTextColor ? settings.ctaTextColor : "#FFFFFF";

  return (
    <div className="space-y-3 bg-[#F9FAFB] p-3 rounded-xl border border-[#E4E7EC]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#011C40]">Afficher le bouton principal</span>
        <input
          type="checkbox"
          checked={settings.showCta !== false}
          onChange={(e) => onSettingsChange("showCta", e.target.checked)}
          className="rounded accent-amber-600 cursor-pointer"
        />
      </div>

      <label className={labelClass}>
        <span>Texte du Bouton Principal</span>
        <input
          type="text"
          value={typeof settings.ctaText === "string" ? settings.ctaText : ""}
          onChange={(e) => onSettingsChange("ctaText", e.target.value)}
          placeholder="Explorer nos créations"
          className={inputClass}
        />
      </label>

      <SmartLinkPicker
        label="Destination du Bouton Principal"
        value={typeof settings.ctaLink === "string" ? settings.ctaLink : "#catalog"}
        onChange={(link) => onSettingsChange("ctaLink", link)}
        sections={sections}
        products={products}
      />

      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-bold text-slate-700">Forme & Style du Bouton</span>
        <div className="grid grid-cols-2 gap-1.5">
          {BUTTON_STYLES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSettingsChange("ctaStyle", st.id)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                ctaStyle === st.id
                  ? "bg-[#023859] text-white border-[#023859]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-bold text-slate-700">Ombre & Profondeur du Bouton</span>
        <div className="grid grid-cols-3 gap-1.5">
          {BUTTON_SHADOWS.map((sh) => (
            <button
              key={sh.id}
              type="button"
              onClick={() => onSettingsChange("ctaShadow", sh.id)}
              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                ctaShadow === sh.id
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {sh.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Couleur de fond du Bouton</span>
          <div className="flex items-center gap-2">
            {(Boolean(settings.ctaBgColor) || Boolean(settings.ctaTextColor)) && (
              <button
                type="button"
                onClick={() => onSettingsChange({ ctaBgColor: "", ctaTextColor: "" })}
                className="text-[10px] text-slate-500 underline cursor-pointer"
              >
                Thème
              </button>
            )}
            <input
              type="color"
              value={ctaBg}
              onChange={(e) => onSettingsChange("ctaBgColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Couleur du texte du Bouton</span>
          <input
            type="color"
            value={ctaText}
            onChange={(e) => onSettingsChange("ctaTextColor", e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
