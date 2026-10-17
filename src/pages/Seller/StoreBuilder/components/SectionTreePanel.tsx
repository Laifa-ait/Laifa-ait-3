import React, { useState } from "react";
import { CustomPageSection, CustomPageSectionType } from "../../../../domains/seller/customPage.types";
import { AddSectionModal } from "./AddSectionModal";

interface SectionTreePanelProps {
  sections: CustomPageSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onAddSection: (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string) => void;
}

export const SectionTreePanel: React.FC<SectionTreePanelProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorder,
  onToggleVisibility,
  onDeleteSection,
  onAddSection,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-full lg:w-80 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100">Sections ({sections.length})</h2>
          <p className="text-[11px] text-gray-500">Arborescence du layout</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-transform active:scale-95"
        >
          + Ajouter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
            Aucune section. Cliquez sur "+ Ajouter" pour composer votre page.
          </div>
        ) : (
          sections.map((sec, idx) => {
            const isSelected = sec.id === selectedSectionId;
            return (
              <div
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-sm text-purple-900 dark:text-purple-200 font-bold"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 text-gray-800 dark:text-gray-200"
                } ${!sec.isVisible ? "opacity-60" : ""}`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-gray-400 text-[10px] font-mono">#{idx + 1}</span>
                  <span className="truncate">{sec.title || sec.type}</span>
                </div>

                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    disabled={idx === 0}
                    onClick={() => onReorder(idx, idx - 1)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-20 text-gray-600"
                    title="Monter"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === sections.length - 1}
                    onClick={() => onReorder(idx, idx + 1)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-20 text-gray-600"
                    title="Descendre"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => onToggleVisibility(sec.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600"
                    title={sec.isVisible ? "Masquer" : "Afficher"}
                  >
                    {sec.isVisible ? "👁️" : "🙈"}
                  </button>
                  <button
                    onClick={() => onDeleteSection(sec.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-950/50 rounded text-red-500"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={onAddSection}
      />
    </div>
  );
};
