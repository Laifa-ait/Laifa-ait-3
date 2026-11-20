import React from "react";
import {
  ArrowUp,
  ArrowDown,
  Palette,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  SlidersHorizontal,
  Lock,
  Unlock,
} from "lucide-react";
import {
  StudioSectionActionType,
  StudioInspectorTab,
} from "../../../pages/Seller/StoreBuilder/store/useStudioStore";

export interface CanvasSectionFloatingDockProps {
  sectionId: string;
  sectionLabel: string;
  isVisible: boolean;
  isLocked?: boolean;
  isFirstSection?: boolean;
  isLastSection?: boolean;
  colorScheme?: string;
  onAction: (action: StudioSectionActionType, e: React.MouseEvent) => void;
  onSelectInspectorTab?: (tab: StudioInspectorTab, e: React.MouseEvent) => void;
}

const SCHEME_SHORT_LABELS: Record<string, string> = {
  scheme_1: "Clair",
  scheme_2: "Doux",
  scheme_3: "Marque",
  scheme_4: "Sombre",
  custom: "Perso",
};

export const CanvasSectionFloatingDock: React.FC<CanvasSectionFloatingDockProps> = ({
  sectionLabel,
  isVisible,
  isLocked = false,
  isFirstSection = false,
  isLastSection = false,
  colorScheme,
  onAction,
  onSelectInspectorTab,
}) => {
  const schemeLabel = colorScheme ? SCHEME_SHORT_LABELS[colorScheme] || "Clair" : "Clair";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      data-testid="canvas-section-floating-dock"
      className="w-full flex items-center justify-between gap-2 bg-white/98 backdrop-blur-md text-slate-900 px-2.5 py-1 border-b border-[#005BD3]/25 shadow-2xs select-none overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-tight truncate ${
            isLocked ? "bg-amber-600 text-white" : "bg-[#005BD3] text-white"
          }`}
        >
          {sectionLabel}
        </span>
        {isLocked && (
          <span className="text-[10.5px] font-medium text-amber-800 shrink-0">
            · Verrouillée
          </span>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {onSelectInspectorTab && (
          <>
            <button
              type="button"
              onClick={(e) => onSelectInspectorTab("content", e)}
              className="h-7 px-2 rounded-md bg-[#111827] hover:bg-[#1F2937] text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              title="Modifier le contenu (Médias, Textes, Produits, Liens)"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Contenu</span>
            </button>
            <button
              type="button"
              onClick={(e) => onSelectInspectorTab("style", e)}
              className="h-7 px-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              title="Ouvrir l'onglet 2. Design (Couleurs, Coins & Ombres, Espacement)"
            >
              <Palette className="w-3 h-3" />
              <span className="hidden sm:inline">Design</span>
            </button>
            <span className="h-4 w-px bg-slate-200 mx-1" aria-hidden="true" />
          </>
        )}

        <button
          type="button"
          disabled={isFirstSection || isLocked}
          onClick={(e) => onAction("move-up", e)}
          className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Monter cette section"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={isLastSection || isLocked}
          onClick={(e) => onAction("move-down", e)}
          className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Descendre cette section"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => onAction("cycle-color-scheme", e)}
          className="h-7 px-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          title="Changer l'ambiance de couleur de la section"
        >
          <Palette className="w-3 h-3 text-[#005BD3]" />
          <span>{schemeLabel}</span>
        </button>

        <button
          type="button"
          onClick={(e) => onAction("duplicate", e)}
          className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          title="Dupliquer cette section"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => onAction("toggle-visibility", e)}
          className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          title={isVisible ? "Masquer cette section" : "Afficher cette section"}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
        </button>

        <button
          type="button"
          onClick={(e) => onAction("toggle-lock", e)}
          data-testid="dock-toggle-lock"
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
            isLocked ? "bg-amber-50 text-amber-800 hover:bg-amber-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title={isLocked ? "Déverrouiller la section" : "Verrouiller la section"}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          disabled={isLocked}
          onClick={(e) => onAction("delete", e)}
          data-testid="dock-delete-section"
          className="w-7 h-7 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title={isLocked ? "Section verrouillée — déverrouillez pour supprimer" : "Supprimer cette section"}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

