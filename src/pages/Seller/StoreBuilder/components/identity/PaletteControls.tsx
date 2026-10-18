import React from "react";
import { Palette, Sparkles } from "lucide-react";

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
  {
    name: "Olmart Warm & Ambre",
    canvas: "#f8fafc",
    surface: "#ffffff",
    accent: "#ea580c",
    primary: "#f97316",
    secondary: "#fbbf24",
  },
  {
    name: "Terracotta & Sahara",
    canvas: "#fdfbf7",
    surface: "#ffffff",
    accent: "#c2410c",
    primary: "#ea580c",
    secondary: "#fdba74",
  },
  {
    name: "Bleu Méditerranée",
    canvas: "#f8fafc",
    surface: "#ffffff",
    accent: "#0284c7",
    primary: "#0369a1",
    secondary: "#38bdf8",
  },
  {
    name: "Émeraude Royale",
    canvas: "#f6fbf7",
    surface: "#ffffff",
    accent: "#059669",
    primary: "#047857",
    secondary: "#10b981",
  },
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
  return (
    <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-orange-500" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Palette 60-30-10 & Identité
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Harmonie visuelle</span>
      </div>

      {/* Preset Pickers */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-500" />
          <span>Palettes d'harmonie prédéfinies</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              className="p-2.5 bg-white border border-slate-200 hover:border-orange-400 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1.5 shadow-xs hover:shadow-sm"
            >
              <div className="flex h-3 w-full rounded overflow-hidden border border-slate-200/80">
                <div style={{ backgroundColor: preset.canvas }} className="w-1/2" />
                <div style={{ backgroundColor: preset.surface }} className="w-1/4" />
                <div style={{ backgroundColor: preset.accent }} className="w-1/4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 truncate">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Color Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 text-[11px] block">60% Fond Canvas</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={canvasColor}
              onChange={(e) => setCanvasColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-200"
            />
            <input
              type="text"
              value={canvasColor}
              onChange={(e) => setCanvasColor(e.target.value)}
              className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 text-[11px] block">30% Cartes / Surface</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={surfaceColor}
              onChange={(e) => setSurfaceColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-200"
            />
            <input
              type="text"
              value={surfaceColor}
              onChange={(e) => setSurfaceColor(e.target.value)}
              className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 text-[11px] block">10% Accent CTA</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-200"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 text-[11px] block">Couleur de Marque Principale</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-200"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 text-[11px] block">Couleur Secondaire</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-200"
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
