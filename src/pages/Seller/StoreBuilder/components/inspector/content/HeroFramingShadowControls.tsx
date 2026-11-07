import React from "react";
import { Sparkles, Layers, Award } from "lucide-react";

interface HeroFramingShadowControlsProps {
  settings: Record<string, unknown>;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

const IMAGE_SHADOW_OPTIONS: Array<{ id: string; label: string; desc: string }> = [
  { id: "none", label: "Plat", desc: "Sans ombre" },
  { id: "sm", label: "Douce", desc: "Halo léger" },
  { id: "md", label: "Élégante", desc: "Galerie" },
  { id: "lg", label: "Flottante", desc: "Relief studio" },
  { id: "glow", label: "Lueur Or", desc: "Halo accent" },
  { id: "brutal", label: "Brutale 3D", desc: "Cadre franc" },
];

const ASPECT_RATIO_OPTIONS: Array<{ id: string; label: string }> = [
  { id: "4/5", label: "4:5 Portrait" },
  { id: "3/4", label: "3:4 Couture" },
  { id: "1/1", label: "1:1 Carré" },
  { id: "16/9", label: "16:9 Large" },
];

const MARGIN_PRESETS = [
  { val: 0, label: "0px Plein" },
  { val: 12, label: "12px Fine" },
  { val: 24, label: "24px Moyen" },
  { val: 40, label: "40px Large" },
];

export const HeroFramingShadowControls: React.FC<HeroFramingShadowControlsProps> = ({
  settings,
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  const heroLayout = (settings.heroLayout as string) || "editorial-split";
  const imageShadow = (settings.imageShadow as string) || "lg";
  const imageAspectRatio = (settings.imageAspectRatio as string) || "4/5";
  const imageSide = (settings.imageSide as string) || "right";
  const imageFit = (settings.imageFit as string) || "cover";
  const imageMargin = typeof settings.imageMargin === "number" ? settings.imageMargin : 0;
  const heightDesktop = (settings.bannerHeightDesktop as string) || "lg";
  const heightMobile = (settings.bannerHeightMobile as string) || "md";
  const showSeal = settings.showSocialProofBadge !== false;
  const sealText =
    typeof settings.socialProofBadge === "string"
      ? settings.socialProofBadge
      : "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •";

  return (
    <div className="space-y-3.5">
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ombre & Profondeur de l&apos;Image</span>
          </span>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Relief
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {IMAGE_SHADOW_OPTIONS.map((sh) => {
            const isSel = imageShadow === sh.id;
            return (
              <button
                key={sh.id}
                type="button"
                onClick={() => onSettingsChange("imageShadow", sh.id)}
                className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSel
                    ? "bg-[#023859] text-white border-[#023859] shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="block text-[10px] font-bold leading-tight">{sh.label}</span>
                <span className={`block text-[8.5px] leading-tight ${isSel ? "text-white/80" : "text-slate-400"}`}>
                  {sh.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-[#023859]" />
          <span>Dimensions, Marge & Disposition de la Photo</span>
        </div>

        <div className="space-y-1.5 pt-1 pb-2 border-b border-slate-200/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#011C40]">Marge autour de la photo</span>
            <span className="font-mono font-bold text-[#023859] bg-white px-2 py-0.5 rounded border border-slate-200">
              {imageMargin}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={64}
            step={4}
            value={imageMargin}
            onChange={(e) => onSettingsChange("imageMargin", parseInt(e.target.value, 10))}
            className="w-full accent-[#023859] cursor-pointer"
          />
          <div className="grid grid-cols-4 gap-1">
            {MARGIN_PRESETS.map((m) => (
              <button
                key={m.val}
                type="button"
                onClick={() => onSettingsChange("imageMargin", m.val)}
                className={`py-1 rounded text-[9.5px] font-bold border cursor-pointer transition-colors ${
                  imageMargin === m.val
                    ? "bg-[#023859] text-white border-[#023859]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {heroLayout === "editorial-split" && (
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-600">Position de la Photo (Desktop)</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "right", label: "Photo à Droite" },
                { id: "left", label: "Photo à Gauche" },
              ].map((side) => (
                <button
                  key={side.id}
                  type="button"
                  onClick={() => onSettingsChange("imageSide", side.id)}
                  className={`py-1.5 px-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                    imageSide === side.id
                      ? "bg-[#023859] text-white border-[#023859]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {side.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {heroLayout !== "cinema-full" ? (
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-600">Format / Ratio du Cadre Photo</span>
            <div className="grid grid-cols-2 gap-1.5">
              {ASPECT_RATIO_OPTIONS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => onSettingsChange("imageAspectRatio", ar.id)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    imageAspectRatio === ar.id
                      ? "bg-amber-500 text-white border-amber-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-600">Hauteur Desktop</span>
              <select
                value={heightDesktop}
                onChange={(e) => onSettingsChange("bannerHeightDesktop", e.target.value)}
                className={`${inputClass} h-8 text-xs py-1`}
              >
                <option value="sm">Compacte (340px)</option>
                <option value="md">Moyenne (480px)</option>
                <option value="lg">Grande (560px)</option>
                <option value="xl">Immense (660px)</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-600">Hauteur Mobile</span>
              <select
                value={heightMobile}
                onChange={(e) => onSettingsChange("bannerHeightMobile", e.target.value)}
                className={`${inputClass} h-8 text-xs py-1`}
              >
                <option value="sm">Compacte (260px)</option>
                <option value="md">Moyenne (360px)</option>
                <option value="lg">Grande (440px)</option>
              </select>
            </label>
          </div>
        )}

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-600">Ajustement de l&apos;image</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "cover", label: "Remplir le cadre (Cover)" },
              { id: "contain", label: "Afficher entier (Contain)" },
            ].map((fit) => (
              <button
                key={fit.id}
                type="button"
                onClick={() => onSettingsChange("imageFit", fit.id)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  imageFit === fit.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {fit.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sceau Rotatif d'Atelier disponible sur les 3 mises en scène */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Sceau Rotatif d&apos;Atelier</span>
          </span>
          <input
            type="checkbox"
            checked={showSeal}
            onChange={(e) => onSettingsChange("showSocialProofBadge", e.target.checked)}
            className="rounded accent-amber-600 cursor-pointer"
          />
        </div>
        {showSeal && (
          <label className={labelClass}>
            <span className="text-[10px] text-slate-500">Texte circulaire du sceau</span>
            <input
              type="text"
              value={sealText}
              onChange={(e) => onSettingsChange("socialProofBadge", e.target.value)}
              placeholder="FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •"
              className={`${inputClass} text-xs`}
            />
          </label>
        )}
      </div>
    </div>
  );
};
