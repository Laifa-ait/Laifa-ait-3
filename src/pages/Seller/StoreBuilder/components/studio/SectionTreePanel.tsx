import React, { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import {
  CustomPageSection,
  CustomPageSectionType,
} from "../../../../../domains/seller/customPage.types";
import { AddSectionModal } from "../AddSectionModal";
import { SectionCard } from "./SectionCard";
import { DeleteSectionModal } from "./DeleteSectionModal";
import { StudioSidebar } from "./StudioSidebar";
import { StudioNavMode } from "./SectionTreePanel";

interface SectionTreePanelProps {
  sections: CustomPageSection[];
  selectedSectionId: string | null;
  navMode?: StudioNavMode | "identity";
  onSelectNavMode?: (mode: StudioNavMode | "identity") => void;
  onSelectSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection?: (id: string) => void;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
}

export const SectionTreePanel: React.FC<SectionTreePanelProps> = ({
  sections,
  selectedSectionId,
  navMode = "sections",
  onSelectNavMode,
  onSelectSection,
  onReorder,
  onToggleVisibility,
  onDeleteSection,
  onDuplicateSection,
  onAddSection,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingSection, setDeletingSection] = useState<CustomPageSection | null>(null);

  return (
    <div className="w-full h-full bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col shrink-0 overflow-hidden min-h-0 select-none">
      {/* 1. Sub-navigation globale CRÉATION / GESTION (Masquée sur mobile < sm pour libérer 100% de la hauteur) */}
      {onSelectNavMode && (
        <div className="hidden sm:block border-b border-[#E5E7EB]">
          <StudioSidebar navMode={navMode} onSelectNavMode={onSelectNavMode} />
        </div>
      )}

      {/* 2. En-tête de la structure avec le bouton + Ajouter une section */}
      <header className="p-3.5 sm:p-4 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[#FFFFFF]">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#17191C] tracking-tight">
            Structure de la page
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Organisez et personnalisez votre boutique ({sections.length} section{sections.length > 1 ? "s" : ""})
          </p>
        </div>

        {/* Bouton + Ajouter une section */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#F97316] px-3.5 text-xs font-semibold text-white hover:bg-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] transition-colors cursor-pointer shadow-xs active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une section</span>
        </button>
      </header>

      {/* 3. Liste des sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {sections.length === 0 ? (
          <div className="p-6 text-center bg-[#F7F8FA] rounded-[10px] border border-[#E5E7EB] space-y-3 my-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#FFF1E7] text-[#F97316] flex items-center justify-center mx-auto border border-[#FDBA74]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#17191C]">Vitrine vide</p>
              <p className="text-[12px] text-[#667085] mt-1">
                Aucune section n'est actuellement présente sur votre page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full h-10 bg-[#FFFFFF] border border-[#E5E7EB] text-[#F97316] hover:bg-[#FFF1E7] text-[13px] font-semibold rounded-[10px] transition-colors cursor-pointer"
            >
              + Ajouter la première section
            </button>
          </div>
        ) : (
          sections.map((sec, idx) => (
            <SectionCard
              key={sec.id}
              sec={sec}
              idx={idx}
              totalSections={sections.length}
              isSelected={sec.id === selectedSectionId}
              onSelectSection={onSelectSection}
              onReorder={onReorder}
              onToggleVisibility={onToggleVisibility}
              onRequestDelete={(targetSec) => setDeletingSection(targetSec)}
              onDuplicateSection={onDuplicateSection}
            />
          ))
        )}
      </div>

      {/* Modal Confirmation de Suppression */}
      <DeleteSectionModal
        section={deletingSection}
        onClose={() => setDeletingSection(null)}
        onConfirm={onDeleteSection}
      />

      {/* Modal Ajouter Une Section */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={onAddSection}
      />
    </div>
  );
};

