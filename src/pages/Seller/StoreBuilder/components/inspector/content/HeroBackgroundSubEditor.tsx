import React from "react";
import { Monitor, Tablet, Smartphone, LayoutTemplate } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { StudioImagePicker } from "./StudioImagePicker";
import { HeroFramingShadowControls } from "./HeroFramingShadowControls";
import { useStudioStore } from "../../../store/useStudioStore";

interface HeroBackgroundSubEditorProps {
  settings: Record<string, unknown>;
  products?: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
  posDevice: "desktop" | "tablet" | "mobile";
  setPosDevice: (device: "desktop" | "tablet" | "mobile") => void;
}

const HERO_LAYOUT_OPTIONS: Array<{
  id: "editorial-split" | "cinema-full" | "atelier-collage";
  label: string;
  desc: string;
}> = [
  { id: "editorial-split", label: "Éditorial Arche", desc: "Texte 7 col + Arche 5 col" },
  { id: "cinema-full", label: "Cinéma Plein Écran", desc: "Photo immersive 100%" },
  { id: "atelier-collage", label: "Collage d'Atelier", desc: "Triptyque artistique" },
];

const FOCAL_PRESETS = [
  { label: "Haut Gauche", value: "15% 15%" },
  { label: "Haut Centre", value: "50% 15%" },
  { label: "Haut Droite", value: "85% 15%" },
  { label: "Milieu Gauche", value: "15% 50%" },
  { label: "Centre Exact", value: "50% 50%" },
  { label: "Milieu Droite", value: "85% 50%" },
  { label: "Bas Gauche", value: "15% 85%" },
  { label: "Bas Centre", value: "50% 85%" },
  { label: "Bas Droite", value: "85% 85%" },
];

function resolveHeroDesktopImage(settings: Record<string, unknown>): string {
  const bgImg = typeof settings.backgroundImage === "string" ? settings.backgroundImage : "";
  const imgUrl = typeof settings.imageUrl === "string" ? settings.imageUrl : "";
  if (bgImg && (!imgUrl || imgUrl.startsWith("data:image/svg+xml"))) {
    return bgImg;
  }
  return imgUrl || bgImg;
}

function resolveHeroMobileImage(settings: Record<string, unknown>): string {
  const mobUrl = typeof settings.mobileImageUrl === "string" ? settings.mobileImageUrl : "";
  const bgMob = typeof settings.backgroundImageMobile === "string" ? settings.backgroundImageMobile : "";
  return mobUrl || bgMob;
}

function parseFocalCoords(pos: string): { x: number; y: number } {
  const parts = pos.trim().split(/\s+/);
  const rawX = parseInt(parts[0] || "50", 10);
  const rawY = parseInt(parts[1] || "50", 10);
  return {
    x: Number.isFinite(rawX) ? Math.min(100, Math.max(0, rawX)) : 50,
    y: Number.isFinite(rawY) ? Math.min(100, Math.max(0, rawY)) : 50,
  };
}

export const HeroBackgroundSubEditor: React.FC<HeroBackgroundSubEditorProps> = ({
  settings,
  products = [],
  onSettingsChange,
  inputClass,
  labelClass,
  posDevice,
  setPosDevice,
}) => {
  const setViewport = useStudioStore((s) => s.setViewport);
  const desktopImage = resolveHeroDesktopImage(settings);
  const mobileImage = resolveHeroMobileImage(settings);
  const heroLayout = (settings.heroLayout as string) || "editorial-split";

  const currentPos =
    posDevice === "mobile"
      ? (settings.imagePositionMobile as string) ||
        (settings.backgroundPositionMobile as string) ||
        (settings.imagePositionDesktop as string) ||
        (settings.backgroundPosition as string) ||
        "50% 50%"
      : posDevice === "tablet"
      ? (settings.imagePositionTablet as string) ||
        (settings.backgroundPositionTablet as string) ||
        (settings.imagePositionDesktop as string) ||
        (settings.backgroundPosition as string) ||
        "50% 50%"
      : (settings.imagePositionDesktop as string) ||
        (settings.backgroundPosition as string) ||
        "50% 50%";

  const focalCoords = parseFocalCoords(currentPos);

  const handleSetFocalPoint = (val: string) => {
    if (posDevice === "mobile") {
      onSettingsChange({ imagePositionMobile: val, backgroundPositionMobile: val });
    } else if (posDevice === "tablet") {
      onSettingsChange({ imagePositionTablet: val, backgroundPositionTablet: val });
    } else {
      onSettingsChange({ imagePositionDesktop: val, backgroundPosition: val });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
          <LayoutTemplate className="w-3.5 h-3.5 text-amber-600" />
          <span>Mise en scène de la Bannière</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {HERO_LAYOUT_OPTIONS.map((opt) => {
            const isSel = heroLayout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSettingsChange("heroLayout", opt.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  isSel
                    ? "bg-[#023859] text-white border-[#023859] shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="block text-[10px] font-extrabold leading-tight">{opt.label}</span>
                <span className={`block text-[8.5px] mt-0.5 leading-tight ${isSel ? "text-white/80" : "text-slate-400"}`}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <StudioImagePicker
        label="Image principale du Hero (Desktop)"
        value={desktopImage}
        products={products}
        onChange={(url) => onSettingsChange({ imageUrl: url, backgroundImage: url })}
      />

      <StudioImagePicker
        label="Image Mobile dédiée (Optionnel)"
        value={mobileImage}
        products={products}
        onChange={(url) => onSettingsChange({ mobileImageUrl: url, backgroundImageMobile: url })}
      />

      <HeroFramingShadowControls
        settings={settings}
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Point Focal de Cadrage</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
            {(["desktop", "tablet", "mobile"] as const).map((dev) => (
              <button
                key={dev}
                type="button"
                onClick={() => {
                  setPosDevice(dev);
                  setViewport(dev);
                }}
                className={`p-1 rounded cursor-pointer ${
                  posDevice === dev ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
                title={dev}
              >
                {dev === "desktop" ? (
                  <Monitor className="w-3.5 h-3.5" />
                ) : dev === "tablet" ? (
                  <Tablet className="w-3.5 h-3.5" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {FOCAL_PRESETS.map((fp) => {
            const isSel = currentPos === fp.value;
            return (
              <button
                key={fp.value}
                type="button"
                onClick={() => handleSetFocalPoint(fp.value)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center ${
                  isSel
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {fp.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200/80">
          <label className="space-y-1 text-[10px] font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Horizontal (X)</span>
              <span className="font-mono font-bold text-slate-900">{focalCoords.x}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={focalCoords.x}
              onChange={(e) => handleSetFocalPoint(`${e.target.value}% ${focalCoords.y}%`)}
              className="w-full accent-[#023859] cursor-pointer"
            />
          </label>
          <label className="space-y-1 text-[10px] font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Vertical (Y)</span>
              <span className="font-mono font-bold text-slate-900">{focalCoords.y}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={focalCoords.y}
              onChange={(e) => handleSetFocalPoint(`${focalCoords.x}% ${e.target.value}%`)}
              className="w-full accent-[#023859] cursor-pointer"
            />
          </label>
        </div>
      </div>

      <label className={labelClass}>
        <div className="flex items-center justify-between">
          <span>Voile d&apos;assombrissement de la photo</span>
          <span className="font-bold text-slate-900">{String(settings.overlayOpacity ?? 0)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={85}
          step={5}
          value={Number(settings.overlayOpacity ?? 0)}
          onChange={(e) => onSettingsChange("overlayOpacity", Number(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer"
        />
      </label>
    </div>
  );
};
