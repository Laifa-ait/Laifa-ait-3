import React, { useState } from "react";
import { Heart, Star } from "lucide-react";
import { LiveCountdownBanner, CountdownBannerStyle } from "./LiveCountdownBanner";

export { LiveCountdownBanner };
export type { CountdownBannerStyle };

const FRENCH_COLOR_HEX_MAP: Record<string, string> = {
  noir: "#0F172A",
  black: "#0F172A",
  blanc: "#FFFFFF",
  white: "#FFFFFF",
  gris: "#64748B",
  argent: "#CBD5E1",
  or: "#D4AF37",
  doré: "#D4AF37",
  dore: "#D4AF37",
  rouge: "#DC2626",
  red: "#DC2626",
  bordeaux: "#7F1D1D",
  bleu: "#2563EB",
  blue: "#2563EB",
  marine: "#1E3A8A",
  azur: "#023859",
  vert: "#059669",
  green: "#059669",
  kaki: "#4D7C0F",
  jaune: "#EAB308",
  orange: "#EA580C",
  rose: "#EC4899",
  violet: "#7C3AED",
  marron: "#78350F",
  camel: "#B45309",
  beige: "#E7E5E4",
  creme: "#FAF7F2",
  crème: "#FAF7F2",
};

export function resolveColorToValidCss(rawColor: string): string | null {
  const cleaned = rawColor.trim();
  if (!cleaned) return null;
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleaned)) {
    return cleaned;
  }
  if (/^(rgb|hsl)a?\(/i.test(cleaned)) {
    return cleaned;
  }
  const lower = cleaned.toLowerCase();
  return FRENCH_COLOR_HEX_MAP[lower] || null;
}

interface WishlistHeartButtonProps {
  isFav?: boolean;
  onToggle?: () => void;
}

export const WishlistHeartButton: React.FC<WishlistHeartButtonProps> = ({ isFav, onToggle }) => {
  const [active, setActive] = useState(Boolean(isFav));
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setActive((prev) => !prev);
        onToggle?.();
      }}
      className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/70 transition-all hover:scale-105 hover:bg-white cursor-pointer"
      title="Ajouter aux favoris"
    >
      <Heart
        className={`h-3.5 w-3.5 transition-colors ${
          active ? "fill-rose-500 text-rose-500" : "text-slate-600 hover:text-rose-500"
        }`}
      />
    </button>
  );
};

interface ProductColorSwatchesProps {
  swatches?: string[];
  activeSwatch?: string;
  onSelect?: (color: string) => void;
}

export const ProductColorSwatches: React.FC<ProductColorSwatchesProps> = ({
  swatches = [],
  activeSwatch,
  onSelect,
}) => {
  const validSwatches = swatches
    .map((c) => ({ raw: c, css: resolveColorToValidCss(c) }))
    .filter((item): item is { raw: string; css: string } => Boolean(item.css));

  const [selected, setSelected] = useState(activeSwatch || validSwatches[0]?.raw || "");

  if (validSwatches.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 my-1">
      {validSwatches.slice(0, 5).map((item, idx) => (
        <button
          key={`${item.raw}-${idx}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(item.raw);
            onSelect?.(item.raw);
          }}
          style={{ backgroundColor: item.css }}
          className={`h-3.5 w-3.5 rounded-full border transition-all cursor-pointer ${
            selected === item.raw
              ? "scale-110 ring-2 ring-offset-1 ring-[#023859]"
              : "border-slate-300 opacity-85 hover:opacity-100"
          }`}
          title={item.raw}
        />
      ))}
    </div>
  );
};

interface ProductSizeChipsProps {
  sizes?: string[];
}

export const ProductSizeChips: React.FC<ProductSizeChipsProps> = ({ sizes = [] }) => {
  const validSizes = sizes.map((s) => s.trim()).filter(Boolean);
  const [selected, setSelected] = useState(validSizes[0] || "");

  if (validSizes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 my-1">
      {validSizes.slice(0, 5).map((size) => (
        <button
          key={size}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(size);
          }}
          className={`h-5 px-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
            selected === size
              ? "bg-[#011C40] text-white border-[#011C40]"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

interface ProductStockProgressBarProps {
  sold?: number;
  total?: number;
  stock?: number;
  accentColor?: string;
}

export const ProductStockProgressBar: React.FC<ProductStockProgressBarProps> = ({
  sold = 0,
  total,
  stock,
  accentColor = "#023859",
}) => {
  const remainingStock = typeof stock === "number" ? Math.max(0, stock) : 0;
  const computedTotal =
    typeof total === "number" && total > 0 ? total : Math.max(1, sold + remainingStock);
  const pct = Math.min(100, Math.round((sold / computedTotal) * 100));

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="text-slate-500 uppercase tracking-wider">
          Vendu : <strong className="text-slate-900">{sold}</strong>
        </span>
        <span className="text-slate-500 uppercase tracking-wider">
          Stock : <strong className="text-slate-900">{remainingStock}</strong>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
};

interface ProductStarRatingProps {
  rating?: number;
  reviewsCount?: number;
}

export const ProductStarRating: React.FC<ProductStarRatingProps> = ({
  rating = 0,
  reviewsCount,
}) => {
  if (!rating || rating <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
      <span className="text-slate-700">{Number(rating).toFixed(1)}</span>
      {typeof reviewsCount === "number" && reviewsCount > 0 && (
        <span className="text-[10px] text-slate-400 font-normal">({reviewsCount})</span>
      )}
    </div>
  );
};
