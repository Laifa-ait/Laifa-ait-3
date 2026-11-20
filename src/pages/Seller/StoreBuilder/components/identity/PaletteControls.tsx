import React from "react";

interface PaletteControlsProps {
  canvasColor: string;
  setCanvasColor: (v: string) => void;
  surfaceColor: string;
  setSurfaceColor: (v: string) => void;
  accentColor: string;
  setAccentColor: (v: string) => void;
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  secondaryColor: string;
  setSecondaryColor: (v: string) => void;
}

const PRESET_PALETTES = [
  { name: "Obsidian Studio", canvas: "#F8FAFC", surface: "#FFFFFF", accent: "#0F172A", primary: "#1E293B", secondary: "#334155" },
  { name: "Nordic Paper", canvas: "#FAFAFA", surface: "#FFFFFF", accent: "#18181B", primary: "#27272A", secondary: "#3F3F46" },
  { name: "Cobalt Brutalist", canvas: "#F8FAFC", surface: "#FFFFFF", accent: "#2563EB", primary: "#1D4ED8", secondary: "#0F172A" },
  { name: "Emerald Lab", canvas: "#F6FBF7", surface: "#FFFFFF", accent: "#059669", primary: "#047857", secondary: "#064E3B" },
];

export const PaletteControls: React.FC<PaletteControlsProps> = ({
  canvasColor,
  setCanvasColor,
  surfaceColor,
  setSurfaceColor,
  accentColor,
  setAccentColor,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
}) => {
  const tokens = [
    { label: "60% Fond Canvas", value: canvasColor, setter: setCanvasColor },
    { label: "30% Surface Cartes", value: surfaceColor, setter: setSurfaceColor },
    { label: "10% Accent CTA", value: accentColor, setter: setAccentColor },
    { label: "Couleur Principale", value: primaryColor, setter: setPrimaryColor },
    { label: "Couleur Secondaire", value: secondaryColor, setter: setSecondaryColor },
  ];

  return (
    <div className="space-y-3 pt-3 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
          Palette 60-30-10
        </h3>
        <span className="text-[10.5px] text-slate-400">Harmonie de base</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {PRESET_PALETTES.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setCanvasColor(preset.canvas);
              setSurfaceColor(preset.surface);
              setAccentColor(preset.accent);
              setPrimaryColor(preset.primary);
              setSecondaryColor(preset.secondary);
            }}
            className="p-2 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-left transition-colors cursor-pointer flex flex-col gap-1.5"
          >
            <div className="flex h-2.5 w-full rounded overflow-hidden border border-slate-200">
              <div style={{ backgroundColor: preset.canvas }} className="w-1/2" />
              <div style={{ backgroundColor: preset.surface }} className="w-1/4" />
              <div style={{ backgroundColor: preset.accent }} className="w-1/4" />
            </div>
            <span className="text-[10.5px] font-medium text-slate-800 truncate">{preset.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {tokens.map((tok) => (
          <div key={tok.label} className="space-y-1">
            <label className="font-medium text-slate-600 text-[10.5px] block">{tok.label}</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={tok.value}
                onChange={(e) => tok.setter(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border border-slate-200 shrink-0"
              />
              <input
                type="text"
                value={tok.value}
                onChange={(e) => tok.setter(e.target.value)}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded-md font-mono text-[10.5px] text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
