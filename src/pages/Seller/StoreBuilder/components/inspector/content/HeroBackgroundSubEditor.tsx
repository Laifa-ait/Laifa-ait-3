import React from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { StudioImagePicker } from "./StudioImagePicker";

interface HeroBackgroundSubEditorProps {
  settings: Record<string, unknown>;
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
  labelClass: string;
  posDevice: "desktop" | "tablet" | "mobile";
  setPosDevice: (device: "desktop" | "tablet" | "mobile") => void;
}

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

export const HeroBackgroundSubEditor: React.FC<HeroBackgroundSubEditorProps> = ({
  settings,
  onSettingsChange,
  labelClass,
  posDevice,
  setPosDevice,
}) => {
  const currentPos =
    posDevice === "mobile"
      ? (settings.backgroundPositionMobile as string) || (settings.backgroundPosition as string) || "50% 50%"
      : posDevice === "tablet"
      ? (settings.backgroundPositionTablet as string) || (settings.backgroundPosition as string) || "50% 50%"
      : (settings.backgroundPosition as string) || "50% 50%";

  const handleSetFocalPoint = (val: string) => {
    if (posDevice === "mobile") {
      onSettingsChange("backgroundPositionMobile", val);
    } else if (posDevice === "tablet") {
      onSettingsChange("backgroundPositionTablet", val);
    } else {
      onSettingsChange("backgroundPosition", val);
    }
  };

  return (
    <div className="space-y-4">
      {/* Background Image Pickers */}
      <StudioImagePicker
        label="Image de fond (Desktop)"
        value={typeof settings.backgroundImage === "string" ? settings.backgroundImage : ""}
        onChange={(url) => onSettingsChange("backgroundImage", url)}
      />

      <StudioImagePicker
        label="Image de fond Mobile (Optionnel)"
        value={typeof settings.backgroundImageMobile === "string" ? settings.backgroundImageMobile : ""}
        onChange={(url) => onSettingsChange("backgroundImageMobile", url)}
      />

      {/* Device Focal Point Switcher */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Point Focal de Cadrage</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setPosDevice("desktop")}
              className={`p-1 rounded cursor-pointer ${posDevice === "desktop" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
              title="Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPosDevice("tablet")}
              className={`p-1 rounded cursor-pointer ${posDevice === "tablet" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
              title="Tablette"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPosDevice("mobile")}
              className={`p-1 rounded cursor-pointer ${posDevice === "mobile" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
              title="Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 9 Focal Presets */}
        <div className="grid grid-cols-3 gap-1.5">
          {FOCAL_PRESETS.map((fp) => {
            const isSel = currentPos === fp.value;
            return (
              <button
                key={fp.value}
                type="button"
                onClick={() => handleSetFocalPoint(fp.value)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center ${
                  isSel ? "bg-amber-500 text-white border-amber-600 shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {fp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlay Opacity */}
      <label className={labelClass}>
        <div className="flex items-center justify-between">
          <span>Opacité du voile sombre</span>
          <span className="font-bold text-slate-900">{String(settings.overlayOpacity ?? 40)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={Number(settings.overlayOpacity ?? 40)}
          onChange={(e) => onSettingsChange("overlayOpacity", Number(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer"
        />
      </label>
    </div>
  );
};
