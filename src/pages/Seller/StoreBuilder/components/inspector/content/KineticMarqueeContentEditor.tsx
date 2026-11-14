import React from "react";
import type {
  KineticMarqueeSeparator,
  KineticMarqueeSpeed,
  KineticMarqueeTextStyle,
} from "../../../../../../types/studio.types";
import { KINETIC_MARQUEE_PRESETS } from "./marqueePresetsData";

interface KineticMarqueeContentEditorProps {
  settings: Record<string, unknown>;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

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
    <div className="space-y-3.5 select-none">
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-900 block">
          Modèles rapides (1 clic)
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {KINETIC_MARQUEE_PRESETS.map((preset) => (
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
              className="p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-400 text-left transition-colors cursor-pointer"
            >
              <span className="block text-[11px] font-semibold text-slate-900">
                {preset.label}
              </span>
              <span className="block text-[10px] text-slate-500 truncate mt-0.5">
                {preset.textFr}
              </span>
            </button>
          ))}
        </div>
      </div>

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

      <label className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 cursor-pointer">
        <span className="text-[11px] font-medium text-slate-800">
          Alterner avec le texte Arabe (RTL)
        </span>
        <input
          type="checkbox"
          checked={showBilingual}
          onChange={(e) => onSettingsChange("showBilingual", e.target.checked)}
          className="accent-slate-900 w-4 h-4 cursor-pointer"
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

      <div className="space-y-1 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-medium text-slate-700 block">
          Style typographique
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
              className={`h-8 rounded-lg border text-[10.5px] font-medium cursor-pointer transition-colors ${
                textStyle === item.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-medium text-slate-700 block">
          Ornement séparateur
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
              className={`h-8 rounded-lg border text-[10.5px] font-medium cursor-pointer transition-colors ${
                separator === sep.id
                  ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {sep.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-700 block">Vitesse</span>
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
                className={`h-7 rounded border text-[10px] font-medium cursor-pointer ${
                  speed === sp.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-700 block">Inclinaison</span>
          <div className="grid grid-cols-3 gap-1">
            {([-2, 0, 2] as const).map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => onSettingsChange("tiltDeg", deg)}
                className={`h-7 rounded border text-[10px] font-medium cursor-pointer tabular-nums ${
                  tiltDeg === deg
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {deg === 0 ? "0°" : `${deg > 0 ? "+" : ""}${deg}°`}
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
            className={`h-7.5 rounded-lg border text-[10.5px] font-medium cursor-pointer ${
              direction === dir
                ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {dir === "ltr" ? "← Défilement gauche" : "Défilement droite →"}
          </button>
        ))}
      </div>
    </div>
  );
};
