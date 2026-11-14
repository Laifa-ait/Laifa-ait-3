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
  const isSecondary = activeSubPanel === "ctaSecondary";
  const styleKey = isSecondary ? "secondaryCtaStyle" : "ctaStyle";
  const shadowKey = isSecondary ? "secondaryCtaShadow" : "ctaShadow";
  const bgKey = isSecondary ? "secondaryCtaBgColor" : "ctaBgColor";
  const textKey = isSecondary ? "secondaryCtaTextColor" : "ctaTextColor";
  const labelKey = isSecondary ? "secondaryCtaText" : "ctaText";
  const linkKey = isSecondary ? "secondaryCtaLink" : "ctaLink";
  const showKey = isSecondary ? "showSecondaryCta" : "showCta";

  const btnStyle = (settings[styleKey] as string) || (isSecondary ? "outline" : "pill");
  const btnShadow = (settings[shadowKey] as string) || (isSecondary ? "none" : "md");
  const btnBg =
    typeof settings[bgKey] === "string" && settings[bgKey]
      ? (settings[bgKey] as string)
      : isSecondary
      ? "#18181B"
      : "#B45309";
  const btnText =
    typeof settings[textKey] === "string" && settings[textKey]
      ? (settings[textKey] as string)
      : "#FFFFFF";
  const labelText = typeof settings[labelKey] === "string" ? (settings[labelKey] as string) : "";
  const isShown = isSecondary
    ? settings.showSecondaryCta !== false && Boolean(labelText)
    : settings.showCta !== false;

  return (
    <div className="space-y-3 bg-[#F9FAFB] p-3 rounded-xl border border-[#E4E7EC]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#011C40]">
          {isSecondary ? "Afficher le bouton secondaire" : "Afficher le bouton principal"}
        </span>
        <input
          type="checkbox"
          checked={isShown}
          onChange={(e) => {
            const checked = e.target.checked;
            if (isSecondary) {
              onSettingsChange({
                showSecondaryCta: checked,
                ...(checked && !labelText ? { secondaryCtaText: "Voir le Lookbook" } : {}),
              });
            } else {
              onSettingsChange(showKey, checked);
            }
          }}
          className="rounded accent-amber-600 cursor-pointer"
        />
      </div>

      <label className={labelClass}>
        <span>{isSecondary ? "Texte du Bouton Secondaire" : "Texte du Bouton Principal"}</span>
        <input
          type="text"
          value={labelText}
          onChange={(e) =>
            isSecondary
              ? onSettingsChange({
                  secondaryCtaText: e.target.value,
                  showSecondaryCta: Boolean(e.target.value.trim()),
                })
              : onSettingsChange(labelKey, e.target.value)
          }
          placeholder={isSecondary ? "Ex: Voir le Lookbook" : "Explorer nos créations"}
          className={inputClass}
        />
      </label>

      <SmartLinkPicker
        label={isSecondary ? "Destination du Bouton Secondaire" : "Destination du Bouton Principal"}
        value={typeof settings[linkKey] === "string" ? (settings[linkKey] as string) : "#catalog"}
        onChange={(link) => onSettingsChange(linkKey, link)}
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
              onClick={() => onSettingsChange(styleKey, st.id)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                btnStyle === st.id
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
              onClick={() => onSettingsChange(shadowKey, sh.id)}
              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                btnShadow === sh.id
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
          <span className="text-xs font-medium text-slate-600">Couleur principale du Bouton</span>
          <div className="flex items-center gap-2">
            {(Boolean(settings[bgKey]) || Boolean(settings[textKey])) && (
              <button
                type="button"
                onClick={() => onSettingsChange({ [bgKey]: "", [textKey]: "" })}
                className="text-[10px] text-slate-500 underline cursor-pointer"
              >
                Thème
              </button>
            )}
            <input
              type="color"
              value={btnBg}
              onChange={(e) => onSettingsChange(bgKey, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Couleur du texte du Bouton</span>
          <input
            type="color"
            value={btnText}
            onChange={(e) => onSettingsChange(textKey, e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
