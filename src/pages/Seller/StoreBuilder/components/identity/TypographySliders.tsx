import React from "react";
import { Type } from "lucide-react";

interface TypographySlidersProps {
  fontFamily: string;
  setFontFamily: (v: string) => void;
  borderRadiusPx: number;
  setBorderRadiusPx: (v: number) => void;
  spacingYPx: number;
  setSpacingYPx: (v: number) => void;
  titleFontSizePx: number;
  setTitleFontSizePx: (v: number) => void;
  bodyFontSizePx: number;
  setBodyFontSizePx: (v: number) => void;
}

export const TypographySliders: React.FC<TypographySlidersProps> = ({
  fontFamily,
  setFontFamily,
  borderRadiusPx,
  setBorderRadiusPx,
  spacingYPx,
  setSpacingYPx,
  titleFontSizePx,
  setTitleFontSizePx,
  bodyFontSizePx,
  setBodyFontSizePx,
}) => {
  return (
    <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-orange-500" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Typographie & Métriques Visuelles
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Google Fonts</span>
      </div>

      {/* Font Family Selector */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-700 text-[11px] block">Police Principale</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans — Moderne, Géométrique & Lisible</option>
          <option value="'Playfair Display', serif">Playfair Display — Luxe, Éditorial & Prestige</option>
          <option value="'Outfit', sans-serif">Outfit — Tendance & Design Contemporain</option>
          <option value="'DM Sans', sans-serif">DM Sans — Épuré, Minimal & Fonctionnel</option>
          <option value="'Cairo', sans-serif">Cairo — Équilibré & Optimisé Franco-Arabe</option>
        </select>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        {/* Border Radius */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 text-[11px]">Arrondi des coins (Radius)</span>
            <span className="font-mono text-orange-600 font-bold">{borderRadiusPx}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            step={2}
            value={borderRadiusPx}
            onChange={(e) => setBorderRadiusPx(parseInt(e.target.value, 10))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        {/* Spacing Y */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 text-[11px]">Espacement vertical des sections</span>
            <span className="font-mono text-orange-600 font-bold">{spacingYPx}px</span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            step={4}
            value={spacingYPx}
            onChange={(e) => setSpacingYPx(parseInt(e.target.value, 10))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        {/* Title Font Size */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 text-[11px]">Taille des grands titres</span>
            <span className="font-mono text-orange-600 font-bold">{titleFontSizePx}px</span>
          </div>
          <input
            type="range"
            min={20}
            max={48}
            step={2}
            value={titleFontSizePx}
            onChange={(e) => setTitleFontSizePx(parseInt(e.target.value, 10))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        {/* Body Font Size */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 text-[11px]">Taille du texte courant</span>
            <span className="font-mono text-orange-600 font-bold">{bodyFontSizePx}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={bodyFontSizePx}
            onChange={(e) => setBodyFontSizePx(parseInt(e.target.value, 10))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
