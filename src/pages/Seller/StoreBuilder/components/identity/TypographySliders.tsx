import React from "react";

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
    <div className="space-y-3 pt-3 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
          Typographie &amp; Métriques
        </h3>
      </div>

      <div className="space-y-1">
        <label className="font-medium text-slate-700 text-[11px] block">Police principale</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-slate-900"
        >
          <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans — Moderne</option>
          <option value="'Playfair Display', serif">Playfair Display — Éditorial</option>
          <option value="'Outfit', sans-serif">Outfit — Contemporain</option>
          <option value="'DM Sans', sans-serif">DM Sans — Minimaliste</option>
          <option value="'Cairo', sans-serif">Cairo — Franco-Arabe</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] tabular-nums">
            <span className="text-slate-600">Arrondi</span>
            <span className="font-mono text-slate-900 font-semibold">{borderRadiusPx}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            step={2}
            value={borderRadiusPx}
            onChange={(e) => setBorderRadiusPx(parseInt(e.target.value, 10))}
            className="w-full accent-slate-900 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] tabular-nums">
            <span className="text-slate-600">Espacement</span>
            <span className="font-mono text-slate-900 font-semibold">{spacingYPx}px</span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            step={4}
            value={spacingYPx}
            onChange={(e) => setSpacingYPx(parseInt(e.target.value, 10))}
            className="w-full accent-slate-900 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] tabular-nums">
            <span className="text-slate-600">Taille titres</span>
            <span className="font-mono text-slate-900 font-semibold">{titleFontSizePx}px</span>
          </div>
          <input
            type="range"
            min={20}
            max={48}
            step={2}
            value={titleFontSizePx}
            onChange={(e) => setTitleFontSizePx(parseInt(e.target.value, 10))}
            className="w-full accent-slate-900 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] tabular-nums">
            <span className="text-slate-600">Texte courant</span>
            <span className="font-mono text-slate-900 font-semibold">{bodyFontSizePx}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={bodyFontSizePx}
            onChange={(e) => setBodyFontSizePx(parseInt(e.target.value, 10))}
            className="w-full accent-slate-900 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
