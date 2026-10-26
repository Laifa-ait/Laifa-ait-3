import React, { useState } from "react";
import {
  Plus,
  Sparkles,
  Store,
  Megaphone,
  Layers,
  Phone,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  CustomPageSection,
  CustomPageSectionType,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { AddSectionModal } from "../AddSectionModal";
import { SectionCard } from "./SectionCard";
import { DeleteSectionModal } from "./DeleteSectionModal";
import { StudioSidebar } from "./StudioSidebar";
import { StudioNavMode } from "./studio.types";

interface SectionTreePanelProps {
  sections: CustomPageSection[];
  selectedSectionId: string | null;
  products?: Product[];
  navMode?: StudioNavMode | "identity";
  onSelectNavMode?: (mode: StudioNavMode | "identity") => void;
  onSelectSection: (id: string) => void;
  onUpdateSection?: (id: string, updatedData: Partial<CustomPageSection>) => void;
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
  products = [],
  navMode = "sections",
  onSelectNavMode,
  onSelectSection,
  onUpdateSection,
  onReorder,
  onToggleVisibility,
  onDeleteSection,
  onDuplicateSection,
  onAddSection,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingSection, setDeletingSection] = useState<CustomPageSection | null>(null);

  const footerSections = sections
    .map((sec, idx) => ({ sec, idx }))
    .filter(({ sec }) => sec.type === "contact_footer" || sec.type === "return_policy");

  const bodySections = sections
    .map((sec, idx) => ({ sec, idx }))
    .filter(({ sec }) => sec.type !== "contact_footer" && sec.type !== "return_policy");

  const hasContactFooter = sections.some((s) => s.type === "contact_footer");

  return (
    <div className="w-full h-full bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col shrink-0 overflow-hidden min-h-0 select-none">
      {onSelectNavMode && (
        <div className="hidden sm:block border-b border-[#E5E7EB]">
          <StudioSidebar navMode={navMode} onSelectNavMode={onSelectNavMode} />
        </div>
      )}

      {/* Scrollable 3-Zone Shopify OS 2.0 Architecture Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        {/* ZONE 1 : EN-TÊTE DE BOUTIQUE */}
        <section className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1 text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
            <Store className="w-3.5 h-3.5 text-[#F97316]" />
            <span>1. En-tête de Boutique</span>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1.5 space-y-1">
            <button
              type="button"
              onClick={() => onSelectNavMode?.("identity")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                navMode === "identity"
                  ? "bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]"
                  : "bg-white text-[#17191C] hover:bg-orange-50/50 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Store className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                <span className="truncate">Header, Logo & Identité</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onSelectNavMode?.("settings")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                navMode === "settings"
                  ? "bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]"
                  : "bg-white text-[#17191C] hover:bg-orange-50/50 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Megaphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Barre d'annonce & Réglages</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
            </button>
          </div>
        </section>

        {/* ZONE 2 : CORPS DE LA VITRINE */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
              <Layers className="w-3.5 h-3.5 text-[#F97316]" />
              <span>2. Corps de la Vitrine ({bodySections.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F97316] hover:text-[#EA580C] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>

          {bodySections.length === 0 ? (
            <div className="p-4 text-center bg-[#F7F8FA] rounded-xl border border-dashed border-[#D0D5DD] space-y-2">
              <Sparkles className="w-5 h-5 text-[#F97316] mx-auto" />
              <p className="text-xs font-bold text-[#17191C]">Corps de vitrine vide</p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full h-8 bg-white border border-[#E5E7EB] text-[#F97316] hover:bg-[#FFF1E7] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                + Ajouter une section
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {bodySections.map(({ sec, idx }) => (
                <SectionCard
                  key={sec.id}
                  sec={sec}
                  idx={idx}
                  totalSections={sections.length}
                  isSelected={sec.id === selectedSectionId}
                  products={products}
                  onSelectSection={onSelectSection}
                  onUpdateSection={onUpdateSection}
                  onReorder={onReorder}
                  onToggleVisibility={onToggleVisibility}
                  onRequestDelete={(targetSec) => setDeletingSection(targetSec)}
                  onDuplicateSection={onDuplicateSection}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full h-9 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/40 hover:bg-orange-50 text-[#EA580C] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter une section</span>
          </button>
        </section>

        {/* ZONE 3 : PIED DE BOUTIQUE */}
        <section className="space-y-2 pt-2 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-1.5 px-1 text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>3. Pied de Boutique & Politiques</span>
          </div>

          {footerSections.map(({ sec, idx }) => (
            <SectionCard
              key={sec.id}
              sec={sec}
              idx={idx}
              totalSections={sections.length}
              isSelected={sec.id === selectedSectionId}
              products={products}
              onSelectSection={onSelectSection}
              onUpdateSection={onUpdateSection}
              onReorder={onReorder}
              onToggleVisibility={onToggleVisibility}
              onRequestDelete={(targetSec) => setDeletingSection(targetSec)}
              onDuplicateSection={onDuplicateSection}
            />
          ))}

          {!hasContactFooter && (
            <button
              type="button"
              onClick={() =>
                onAddSection(
                  "contact_footer",
                  {
                    shopPhone: "",
                    shopEmail: "",
                    address: "Alger, Algérie",
                    workingHours: "Sam - Jeu : 09h00 - 18h00",
                  },
                  "Pied de boutique & Contact"
                )
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#F97316]" />
                <span>+ Activer le Pied de Boutique (Contact)</span>
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectNavMode?.("pages")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-orange-50/50 text-xs font-semibold text-[#475467] cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Pages & Politiques de retour</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
          </button>
        </section>
      </div>

      <DeleteSectionModal
        section={deletingSection}
        onClose={() => setDeletingSection(null)}
        onConfirm={onDeleteSection}
      />

      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={onAddSection}
      />
    </div>
  );
};
