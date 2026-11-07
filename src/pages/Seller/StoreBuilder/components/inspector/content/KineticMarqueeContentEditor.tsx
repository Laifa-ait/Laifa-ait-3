import React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import type {
  KineticMarqueeSeparator,
  KineticMarqueeSpeed,
  KineticMarqueeTextStyle,
} from "../../../../../../types/studio.types";

interface KineticMarqueeContentEditorProps {
  settings: Record<string, unknown>;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

const MARQUEE_PRESETS = [
  {
    id: "artisanat_algerie",
    label: "Haute Couture & Artisanat",
    textFr: "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE • SAVOIR-FAIRE AUTHENTIQUE",
    textAr: "صنع بحب في الجزائر • إصدار محدود • حرفية أصيلة",
    textStyle: "alternating" as KineticMarqueeTextStyle,
    separator: "star" as KineticMarqueeSeparator,
  },
  {
    id: "livraison_cod",
    label: "Livraison 69 Wilayas COD",
    textFr: "LIVRAISON EXPRESS 69 WILAYAS • PAIEMENT À LA RÉCEPTION • RETOURS GARANTIS",
    textAr: "توصيل سريع 69 ولاية • الدفع عند الاستلام • ضمان الجودة",
    textStyle: "solid" as KineticMarqueeTextStyle,
    separator: "diamond" as KineticMarqueeSeparator,
  },
  {
    id: "lookbook_drop",
    label: "Drop Avant-Garde Hollow",
    textFr: "NOUVELLE COLLECTION • SÉRIE NUMÉROTÉE • ATELIER EXCLUSIF",
    textAr: "مجموعة جديدة • تصميم حصري • أتيليه الفخامة",
    textStyle: "hollow-stroke" as KineticMarqueeTextStyle,
    separator: "crescent" as KineticMarqueeSeparator,
  },
];

export const KineticMarqueeContentEditor: React.FC<
  KineticMarqueeContentEditorProps
> = ({ settings, onSettingsChange, inputClass, labelClass }) => {
  const textFr =
    typeof settings.textFr === "string"
      ? settings.textFr
      : "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE • LIVRAISON 69 WILAYAS";
  const textAr =
    typeof settings.textAr === "string"
      ? settings.textAr
      : "صنع بحب في الجزائر • إصدار محدود • توصيل لجميع الولايات";
  const showBilingual = settings.showBilingual !== false;
  const speed = (settings.speed as KineticMarqueeSpeed) || "normal";
  const textStyle = (settings.textStyle as KineticMarqueeTextStyle) || "alternating";
  const separator = (settings.separator as KineticMarqueeSeparator) || "star";
  const direction = (settings.direction as "ltr" | "rtl") || "ltr";
  const tiltDeg = (settings.tiltDeg as -2 | 0 | 2) ?? 0;

  return (
    <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#011C40]">
        <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
        <span>Bandeau Cinétique Infini (FR / AR)</span>
      </div>

      {/* 1-Click Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
          <Wand2 className="w-3 h-3 text-[#023859]" />
          <span>Modèles Cinétiques (1 Clic)</span>
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {MARQUEE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onSettingsChange({
                  textFr: preset.textFr,
                  textAr: preset.textAr,
                  textStyle: preset.textStyle,
                  separator: preset.separator,
                  showBilingual: true,
                })
              }
              className="p-2 rounded-lg border border-slate-200 bg-white hover:border-[#023859] text-left transition-all cursor-pointer"
            >
              <span className="block text-[11px] font-extrabold text-[#011C40]">
                {preset.label}
              </span>
              <span className="block text-[9.5px] text-slate-500 truncate mt-0.5">
                {preset.textFr}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Texte Français */}
      <label className={labelClass}>
        <span>Texte défilant principal (FR)</span>
        <input
          type="text"
          value={textFr}
          onChange={(e) => onSettingsChange("textFr", e.target.value)}
          placeholder="FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE"
          className={inputClass}
        />
      </label>

      {/* Bilingue Arabe */}
      <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
        <span className="text-[11px] font-bold text-[#011C40]">
          Alterner avec un texte Calligraphique Arabe (RTL)
        </span>
        <input
          type="checkbox"
          checked={showBilingual}
          onChange={(e) => onSettingsChange("showBilingual", e.target.checked)}
          className="accent-[#023859] w-4 h-4 cursor-pointer"
        />
      </label>

      {showBilingual && (
        <label className={labelClass}>
          <span>النص العربي المتحرك (AR)</span>
          <input
            type="text"
            dir="rtl"
            value={textAr}
            onChange={(e) => onSettingsChange("textAr", e.target.value)}
            placeholder="صنع بحب في الجزائر • إصدار محدود"
            className={inputClass}
          />
        </label>
      )}

      {/* Style de Texte : Plein / Hollow Stroke / Alterné */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[#475467] block">
          Style Typographique (Plein vs Contour Hollow)
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "solid", label: "Plein" },
            { id: "hollow-stroke", label: "Contour Hollow" },
            { id: "alternating", label: "Alterné Luxe" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSettingsChange("textStyle", item.id)}
              className={`h-8 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-colors ${
                textStyle === item.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859]"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Séparateur Ornemental */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[#475467] block">
          Ornement Séparateur
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "star", label: "✦ Étoile" },
            { id: "diamond", label: "◆ Losange" },
            { id: "crescent", label: "☾ Croissant" },
            { id: "dot", label: "• Point" },
          ].map((sep) => (
            <button
              key={sep.id}
              type="button"
              onClick={() => onSettingsChange("separator", sep.id)}
              className={`h-8 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-colors ${
                separator === sep.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#023859]"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {sep.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vitesse & Direction & Inclinaison */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[#475467] block">Vitesse</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "slow", label: "Douce" },
              { id: "normal", label: "Fluide" },
              { id: "fast", label: "Vive" },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => onSettingsChange("speed", sp.id)}
                className={`h-7 rounded border text-[10px] font-bold cursor-pointer ${
                  speed === sp.id
                    ? "border-[#023859] bg-[#F0F7FA] text-[#023859]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[#475467] block">Inclinaison</span>
          <div className="grid grid-cols-3 gap-1">
            {([-2, 0, 2] as const).map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => onSettingsChange("tiltDeg", deg)}
                className={`h-7 rounded border text-[10px] font-bold cursor-pointer ${
                  tiltDeg === deg
                    ? "border-[#023859] bg-[#F0F7FA] text-[#023859]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {deg === 0 ? "Droit 0°" : `${deg > 0 ? "+" : ""}${deg}°`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {(["ltr", "rtl"] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => onSettingsChange("direction", dir)}
            className={`h-7 rounded-lg border text-[10.5px] font-bold cursor-pointer ${
              direction === dir
                ? "border-[#023859] bg-[#F0F7FA] text-[#023859]"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {dir === "ltr" ? "← Défilement Gauche" : "Défilement Droite →"}
          </button>
        ))}
      </div>
    </div>
  );
};
