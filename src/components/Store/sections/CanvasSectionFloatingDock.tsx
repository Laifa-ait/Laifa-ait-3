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
  scheme_1: "S1",
  scheme_2: "S2",
  scheme_3: "S3",
  scheme_4: "S4",
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
  const schemeBadge = colorScheme ? SCHEME_SHORT_LABELS[colorScheme] || "S1" : "S1";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      data-testid="canvas-section-floating-dock"
      className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md text-[#011C40] px-3 py-1.5 border-b border-slate-200/90 shadow-xs select-none rounded-t-xl"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${isLocked ? "bg-amber-500" : "bg-[#023859]"}`} />
        <span className="text-[11px] font-extrabold tracking-tight text-[#011C40] truncate">
          {sectionLabel}
        </span>
        {isLocked && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
            Verrouillée
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onSelectInspectorTab && (
          <>
            <button
              type="button"
              onClick={(e) => onSelectInspectorTab("content", e)}
              className="h-7 px-2.5 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Modifier le contenu de cette section"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Éditer</span>
            </button>
            <button
              type="button"
              onClick={(e) => onSelectInspectorTab("style", e)}
              className="h-7 px-2 rounded-lg bg-[#F0F7FA] hover:bg-[#023859] text-[#023859] hover:text-white border border-[#54ACBF]/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Ouvrir l'onglet Couleurs & Style"
            >
              <Palette className="w-3 h-3" />
              <span className="hidden sm:inline">Couleurs</span>
            </button>
          </>
        )}

        <button
          type="button"
          disabled={isFirstSection || isLocked}
          onClick={(e) => onAction("move-up", e)}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Monter cette section"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={isLastSection || isLocked}
          onClick={(e) => onAction("move-down", e)}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Descendre cette section"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => onAction("cycle-color-scheme", e)}
          className="h-7 px-2 rounded-lg bg-slate-100 hover:bg-[#023859] hover:text-white text-[#023859] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          title="Changer le thème de couleur de la section"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{schemeBadge}</span>
        </button>

        <button
          type="button"
          onClick={(e) => onAction("duplicate", e)}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          title="Dupliquer cette section"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => onAction("toggle-visibility", e)}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          title={isVisible ? "Masquer cette section" : "Afficher cette section"}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
        </button>

        <button
          type="button"
          onClick={(e) => onAction("toggle-lock", e)}
          data-testid="dock-toggle-lock"
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isLocked ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
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
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title={isLocked ? "Section verrouillée — déverrouillez pour supprimer" : "Supprimer cette section"}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
