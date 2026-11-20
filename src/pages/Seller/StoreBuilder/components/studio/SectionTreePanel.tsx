import React, { Suspense, lazy, useState, useEffect, useRef } from "react";
import { Plus, Layers, Phone, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import {
  CustomPageSection, CustomPageSectionType, SellerStoreConfig, StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { SectionCard } from "./SectionCard";
import { DeleteSectionModal } from "./DeleteSectionModal";
import { StudioSidebar } from "./StudioSidebar";

const AddSectionModal = lazy(() => import("../AddSectionModal").then((m) => ({ default: m.AddSectionModal })));
import { StudioNavMode } from "./studio.types";
import { STUDIO_JOURNEY_STEPS } from "./studioSidebarSteps";
import { useStudioStore } from "../../store/useStudioStore";

interface SectionTreePanelProps {
  sections: CustomPageSection[];
  selectedSectionId: string | null;
  products?: Product[];
  activeSector?: StoreThemeSector;
  storeConfig?: SellerStoreConfig | null;
  navMode?: StudioNavMode | "identity";
  onSelectNavMode?: (mode: StudioNavMode | "identity") => void;
  onSelectSection: (id: string) => void;
  onUpdateSection?: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection?: (id: string) => void;
  onAddSection: (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string, insertAtIndex?: number) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
  lastSaveError?: string | null;
}

export const SectionTreePanel: React.FC<SectionTreePanelProps> = ({
  sections, selectedSectionId, products = [], activeSector, storeConfig,
  navMode = "sections", onSelectNavMode, onSelectSection, onUpdateSection,
  onReorder, onToggleVisibility, onDeleteSection, onDuplicateSection, onAddSection, onSaveDraft, lastSaveError,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingInsertIndex, setPendingInsertIndex] = useState<number | undefined>(undefined);
  const [deletingSection, setDeletingSection] = useState<CustomPageSection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const studioExperienceMode = useStudioStore((s) => s.studioExperienceMode);
  const activeStudioStep = useStudioStore((s) => s.activeStudioStep);
  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  useEffect(() => {
    const handleRequestDelete = (e: Event) => {
      const secId = (e as CustomEvent<{ sectionId?: string }>).detail?.sectionId;
      if (!secId) return;
      const found = sectionsRef.current.find((s) => s.id === secId);
      if (found) setDeletingSection(found);
    };
    const handleOpenAddModal = (e: Event) => {
      const idx = (e as CustomEvent<{ insertAtIndex?: number }>).detail?.insertAtIndex;
      setPendingInsertIndex(typeof idx === "number" ? idx : undefined);
      setIsAddModalOpen(true);
    };
    window.addEventListener("studio:request-delete-section", handleRequestDelete);
    window.addEventListener("studio:open-add-section-modal", handleOpenAddModal);
    return () => {
      window.removeEventListener("studio:request-delete-section", handleRequestDelete);
      window.removeEventListener("studio:open-add-section-modal", handleOpenAddModal);
    };
  }, []);

  const showSectionsTree = studioExperienceMode === "expert" || activeStudioStep === 3 || navMode === "sections";
  const bodySections = sections.map((sec, idx) => ({ sec, idx })).filter(({ sec }) => sec.type !== "contact_footer" && sec.type !== "return_policy");
  const filteredBodySections = searchQuery.trim()
    ? bodySections.filter(({ sec }) => (sec.title || sec.type).toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : bodySections;
  const footerSections = sections.map((sec, idx) => ({ sec, idx })).filter(({ sec }) => sec.type === "contact_footer" || sec.type === "return_policy");
  const resolvedSector: StoreThemeSector = activeSector || storeConfig?.theme?.sector || "mode";
  const currentStepMeta = STUDIO_JOURNEY_STEPS.find((s) => s.step === activeStudioStep) || STUDIO_JOURNEY_STEPS[0];

  const handleAddContactFooter = () => {
    const wilaya = (storeConfig?.wilaya || "").trim();
    const commune = storeConfig?.commune ? `${storeConfig.commune}, ` : "";
    const address = wilaya ? `${commune}${wilaya}, Algérie` : "";
    onAddSection("contact_footer", {
      shopPhone: "", shopEmail: "", socialInstagram: "", wilaya, address, workingHours: "Sam - Jeu : 09h00 - 18h00",
    }, "Pied de boutique & Contact");
  };

  return (
    <div className="w-full h-full bg-white border-e border-slate-200 flex flex-col shrink-0 overflow-hidden min-h-0 select-none">
      {onSelectNavMode && (
        <div className="hidden md:block border-b border-slate-200">
          <StudioSidebar navMode={navMode} onSelectNavMode={onSelectNavMode} onSaveDraft={onSaveDraft} lastSaveError={lastSaveError} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {!showSectionsTree ? (
          <div className="px-2 py-3 space-y-3 text-start rounded-lg border border-slate-200 bg-slate-50/60">
            <div className="space-y-1">
              <span className="text-[12px] font-semibold text-slate-900 block">
                Configuration de l&apos;étape {activeStudioStep} · {currentStepMeta.title}
              </span>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Complétez les réglages dans l&apos;inspecteur, puis enregistrez pour débloquer l&apos;étape{" "}
                {Math.min(4, activeStudioStep + 1)}.
              </p>
            </div>
            {onSelectNavMode && (
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  data-testid="tree-open-active-step-settings-btn"
                  onClick={() => onSelectNavMode(currentStepMeta.defaultNav)}
                  className="w-full h-8 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11.5px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Ouvrir les réglages ({currentStepMeta.title})</span>
                </button>
                <button
                  type="button"
                  data-testid="tree-show-sections-btn"
                  onClick={() => onSelectNavMode("sections")}
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11.5px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Afficher les sections ({bodySections.length})</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {onSelectNavMode && (
              <div className="pb-2 border-b border-slate-200 space-y-1">
                <span className="block text-[10.5px] font-medium text-slate-400 px-1">En-tête de boutique</span>
                <button
                  type="button"
                  data-testid="tree-header-quick-btn"
                  onClick={() => onSelectNavMode("header")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[11.5px] font-medium transition-colors cursor-pointer ${
                    navMode === "header" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">Barre d&apos;annonce &amp; Menu</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 tabular-nums">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Vitrine ({bodySections.length})</span>
              </div>
              <button
                type="button"
                data-testid="tree-add-section-btn"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 bg-white hover:bg-slate-900 text-[11.5px] font-medium text-slate-700 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {bodySections.length > 5 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrer les sections..."
                  className="w-full h-8 ps-8 pe-2.5 rounded-md border border-slate-200 bg-slate-50 text-[11.5px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>
            )}

            {filteredBodySections.length === 0 ? (
              <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 space-y-2">
                <p className="text-[12px] font-medium text-slate-600">
                  {bodySections.length === 0 ? "Aucune section sur l'accueil" : "Aucun résultat"}
                </p>
                {bodySections.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full h-8 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium rounded-md transition-colors cursor-pointer"
                  >
                    + Ajouter une section
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredBodySections.map(({ sec, idx }) => (
                  <SectionCard
                    key={sec.id} sec={sec} idx={idx} totalSections={sections.length}
                    isSelected={sec.id === selectedSectionId} products={products}
                    onSelectSection={onSelectSection} onUpdateSection={onUpdateSection}
                    onReorder={onReorder} onToggleVisibility={onToggleVisibility}
                    onRequestDelete={(targetSec) => setDeletingSection(targetSec)}
                    onDuplicateSection={onDuplicateSection}
                  />
                ))}
                <button
                  type="button"
                  data-testid="tree-bottom-add-section-btn"
                  onClick={() => { setPendingInsertIndex(undefined); setIsAddModalOpen(true); }}
                  className="w-full h-8 px-2.5 mt-1 rounded-lg text-[#005BD3] hover:bg-[#EEF4FF] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Ajouter une section</span>
                </button>
              </div>
            )}

            <div className="pt-2.5 border-t border-[#E3E5E8] space-y-1">
              <span className="block text-[10.5px] font-medium text-slate-400 px-1">Pied de page</span>
              {footerSections.map(({ sec, idx }) => (
                <SectionCard
                  key={sec.id} sec={sec} idx={idx} totalSections={sections.length} isSelected={sec.id === selectedSectionId}
                  products={products} onSelectSection={onSelectSection} onUpdateSection={onUpdateSection} onReorder={onReorder}
                  onToggleVisibility={onToggleVisibility} onRequestDelete={(targetSec) => setDeletingSection(targetSec)} onDuplicateSection={onDuplicateSection}
                />
              ))}
              {footerSections.length === 0 && (
                <button
                  type="button" onClick={handleAddContactFooter}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-md border border-dashed border-[#CDD2D9] hover:bg-[#F6F7F9] text-[11.5px] font-medium text-slate-700 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /><span>+ Activer le pied de page</span></span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <DeleteSectionModal section={deletingSection} onClose={() => setDeletingSection(null)} onConfirm={onDeleteSection} />
      {isAddModalOpen && (
        <Suspense fallback={null}>
          <AddSectionModal isOpen={isAddModalOpen} activeSector={resolvedSector} insertAtIndex={pendingInsertIndex} onClose={() => { setPendingInsertIndex(undefined); setIsAddModalOpen(false); }} onAddSection={onAddSection} />
        </Suspense>
      )}
    </div>
  );
};

