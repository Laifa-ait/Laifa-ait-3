import React, { useState } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import {
  CategoryItem,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";

interface SectorPresetCategoriesBarProps {
  activeSector: StoreThemeSector;
  existingCount: number;
  onReplacePresets: () => void;
  onMergePresets: () => void;
}

export const SectorPresetCategoriesBar: React.FC<SectorPresetCategoriesBarProps> = ({
  activeSector,
  existingCount,
  onReplacePresets,
  onMergePresets,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleTrigger = () => {
    if (existingCount > 0) {
      setConfirmOpen(true);
      return;
    }
    onReplacePresets();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--studio-highlight-soft)] border border-[var(--studio-border-strong)]">
        <div className="min-w-0">
          <span className="text-[11px] font-extrabold text-[var(--studio-black)] block">
            Rayons cohérents ({activeSector})
          </span>
          <span className="text-[10px] text-[var(--studio-muted)] block truncate">
            Pré-remplir avec les visuels du secteur
          </span>
        </div>
        <button
          type="button"
          data-testid="inject-sector-categories-btn"
          onClick={handleTrigger}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--studio-primary)] text-[var(--studio-white)] text-[10.5px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Générer ({activeSector})</span>
        </button>
      </div>

      {confirmOpen && (
        <div
          data-testid="preset-categories-confirm-bar"
          className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2"
        >
          <p className="text-[11px] font-medium text-amber-950 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Vous avez déjà {existingCount} rayon(s). Voulez-vous fusionner en conservant vos personnalisations ou tout remplacer ?
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="preset-categories-merge-btn"
              onClick={() => {
                onMergePresets();
                setConfirmOpen(false);
              }}
              className="flex-1 h-7 px-2 rounded-lg bg-[var(--studio-primary)] text-[var(--studio-white)] text-[11px] font-bold cursor-pointer"
            >
              Fusionner
            </button>
            <button
              type="button"
              data-testid="preset-categories-replace-btn"
              onClick={() => {
                onReplacePresets();
                setConfirmOpen(false);
              }}
              className="h-7 px-2.5 rounded-lg bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
            >
              Remplacer tout
            </button>
            <button
              type="button"
              data-testid="preset-categories-cancel-btn"
              onClick={() => setConfirmOpen(false)}
              className="h-7 px-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export function mergeSectorPresetCategories(
  existing: CategoryItem[],
  presets: CategoryItem[]
): CategoryItem[] {
  const existingKeys = new Set(
    existing.flatMap((c) => [c.slug.toLowerCase(), c.name.trim().toLowerCase()])
  );
  const additions = presets.filter(
    (p) => !existingKeys.has(p.slug.toLowerCase()) && !existingKeys.has(p.name.trim().toLowerCase())
  );
  return [...existing, ...additions];
}
