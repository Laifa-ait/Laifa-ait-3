import React from "react";
import { Plus } from "lucide-react";

interface CanvasSectionInsertBarProps {
  afterIndex: number;
  insertAtIndex: number;
  sectionTitle?: string;
}

export const CanvasSectionInsertBar: React.FC<CanvasSectionInsertBarProps> = ({
  afterIndex,
  insertAtIndex,
  sectionTitle,
}) => {
  const handleInsertClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("studio:open-add-section-modal", {
        detail: { insertAtIndex },
      })
    );
  };

  return (
    <div
      data-testid={`canvas-insert-section-after-${afterIndex}`}
      data-insert-index={insertAtIndex}
      className="group/insert relative flex items-center justify-center py-0.5 select-none"
    >
      <div
        aria-hidden="true"
        className="w-full h-px bg-slate-200/80 group-hover/insert:bg-slate-900/40 transition-colors"
      />
      <button
        type="button"
        data-testid={`canvas-insert-section-btn-${afterIndex}`}
        onClick={handleInsertClick}
        title={
          sectionTitle
            ? `Insérer une nouvelle section après « ${sectionTitle} »`
            : "Insérer une nouvelle section ici"
        }
        className="relative z-10 -my-1.5 inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/95 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200/90 hover:border-slate-900 shadow-2xs text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
      >
        <Plus className="w-3.5 h-3.5 shrink-0" />
        <span>Insérer une section ici</span>
      </button>
      <div
        aria-hidden="true"
        className="w-full h-px bg-slate-200/80 group-hover/insert:bg-slate-900/40 transition-colors"
      />
    </div>
  );
};
