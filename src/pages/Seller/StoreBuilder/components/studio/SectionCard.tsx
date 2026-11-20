import React, { useState } from "react";
import {
  MoveUp, MoveDown, Eye, EyeOff, GripVertical, Trash2, Copy,
  ChevronRight, ChevronDown, Image as ImageIcon, ShoppingBag,
  BookOpen, Award, Truck, HelpCircle, Layout, Grid, Layers,
  Sparkles, ShieldCheck, Phone, RotateCcw, Lock, Unlock,
} from "lucide-react";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { useStudioStore } from "../../store/useStudioStore";
import { SectionSubBlocksTree, hasExpandableSubBlocks } from "./SectionSubBlocksTree";
import { getSectionCompletenessStatus } from "../../hooks/studioSectionMutations";

interface SectionCardProps {
  sec: CustomPageSection;
  idx: number;
  totalSections: number;
  isSelected: boolean;
  products?: Product[];
  onSelectSection: (id: string) => void;
  onUpdateSection?: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (id: string) => void;
  onRequestDelete: (sec: CustomPageSection) => void;
  onDuplicateSection?: (id: string) => void;
}

const SECTION_TYPE_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  hero_banner: { icon: ImageIcon, label: "Bannière principale" },
  promo_carousel: { icon: Sparkles, label: "Carrousel promo" },
  featured_categories: { icon: Grid, label: "Catégories" },
  curated_collections: { icon: Layers, label: "Collections" },
  new_arrivals: { icon: Sparkles, label: "Nouveautés" },
  featured_products: { icon: ShoppingBag, label: "Produits vedettes" },
  best_sellers: { icon: Award, label: "Meilleures ventes" },
  product_grid: { icon: ShoppingBag, label: "Catalogue" },
  brand_story: { icon: BookOpen, label: "Notre Histoire" },
  showcase_video: { icon: ImageIcon, label: "Vidéo vitrine" },
  verified_reviews: { icon: ShieldCheck, label: "Avis vérifiés" },
  delivery_info: { icon: Truck, label: "Livraison" },
  return_policy: { icon: RotateCcw, label: "Retours & échanges" },
  faq_accordion: { icon: HelpCircle, label: "Questions FAQ" },
  contact_footer: { icon: Phone, label: "Contact" },
  kinetic_marquee: { icon: Sparkles, label: "Bandeau défilant" },
};

export const SectionCard: React.FC<SectionCardProps> = ({
  sec, idx, totalSections, isSelected, products = [],
  onSelectSection, onUpdateSection, onReorder, onToggleVisibility, onRequestDelete, onDuplicateSection,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const canExpand = hasExpandableSubBlocks(sec.type);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const setIsDraggingSection = useStudioStore((s) => s.setIsDraggingSection);
  const hoverElement = useStudioStore((s) => s.hoverElement);
  const clearHover = useStudioStore((s) => s.clearHover);
  const selectSection = useStudioStore((s) => s.selectSection);
  const triggerSectionAction = useStudioStore((s) => s.triggerSectionAction);

  const typeConfig = SECTION_TYPE_MAP[sec.type] || { icon: Layout, label: sec.type.replace(/_/g, " ") };
  const SectionIcon = typeConfig.icon;
  const settings = (sec.settings || {}) as Record<string, unknown>;
  const imageUrl = (settings.imageUrl || settings.bannerUrl) as string | undefined;
  const isLocked = Boolean(settings.isLocked);
  const completeness = getSectionCompletenessStatus(sec, products);

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateSection) {
      onUpdateSection(sec.id, {
        settings: { ...settings, isLocked: !isLocked } as unknown as CustomPageSection["settings"],
      });
    } else {
      triggerSectionAction(sec.id, "toggle-lock");
    }
  };

  const handleSelectMainSection = () => {
    window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode: "home" } }));
    selectSection(sec.id, null);
    onSelectSection(sec.id);
    setTimeout(() => {
      document.getElementById(`studio-section-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 30);
  };

  return (
    <article
      draggable={!isLocked}
      onMouseEnter={() => hoverElement(sec.id)}
      onMouseLeave={() => { clearHover(); setDropPosition(null); }}
      onDragStart={(e) => {
        if (isLocked) { e.preventDefault(); return; }
        setIsDragging(true);
        setIsDraggingSection(true);
        e.dataTransfer.setData("text/plain", idx.toString());
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => { setIsDragging(false); setDropPosition(null); setIsDraggingSection(false); }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const rect = e.currentTarget.getBoundingClientRect();
        setDropPosition(e.clientY < rect.top + rect.height / 2 ? "before" : "after");
      }}
      onDragLeave={() => setDropPosition(null)}
      onDrop={(e) => {
        e.preventDefault();
        setDropPosition(null);
        setIsDraggingSection(false);
        if (isLocked) return;
        const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (!isNaN(fromIdx) && fromIdx !== idx) onReorder(fromIdx, idx);
      }}
      className={[
        "group relative rounded-lg border px-2 py-1.5 transition-colors cursor-pointer select-none",
        isSelected
          ? "border-[#005BD3]/35 bg-[#EEF4FF] text-[#111827]"
          : "border-transparent hover:border-[#E3E5E8] hover:bg-[#F6F7F9]",
        !sec.isVisible ? "opacity-60" : "",
        isDragging ? "opacity-30 border-dashed border-[#005BD3]" : "",
      ].join(" ")}
      onClick={handleSelectMainSection}
    >
      {dropPosition === "before" && <div data-testid="drop-indicator-before" className="pointer-events-none absolute -top-1 left-2 right-2 h-0.5 rounded-full bg-[#005BD3] z-20" />}
      {dropPosition === "after" && <div data-testid="drop-indicator-after" className="pointer-events-none absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-[#005BD3] z-20" />}

      <div className="flex items-center gap-1.5 min-w-0">
        {canExpand ? (
          <button
            type="button" title={isExpanded ? "Replier les sous-blocs" : "Déplier les sous-blocs"}
            onClick={(e) => { e.stopPropagation(); setIsExpanded((prev) => !prev); }}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer shrink-0 transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : <span className="w-2 shrink-0" />}

        <span title={isLocked ? "Section verrouillée" : "Glisser pour réorganiser"} className="hidden md:flex h-5 w-3.5 items-center justify-center text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="h-3.5 w-3.5" />
        </span>

        <div className={`h-6 w-6 overflow-hidden rounded border shrink-0 flex items-center justify-center ${isSelected ? "border-[#005BD3]/30 bg-white text-[#005BD3]" : "border-[#E3E5E8] bg-[#F6F7F9] text-slate-600"}`}>
          {imageUrl ? <img src={imageUrl} alt={sec.title || typeConfig.label} className="h-full w-full object-cover" /> : <SectionIcon className="h-3.5 w-3.5" />}
        </div>

        <div className="min-w-0 flex-1">
          <span className={`truncate text-[12px] block leading-tight ${isSelected ? "font-semibold text-[#111827]" : "font-medium text-slate-800"}`}>{sec.title || typeConfig.label}</span>
          <span className="block truncate text-[10.5px] text-slate-500 tabular-nums">
            {idx + 1}. {typeConfig.label}
            {isLocked ? " · Verrouillé" : !sec.isVisible ? " · Masquée" : ""}
            {completeness.isEmpty && (
              <span data-testid={`section-empty-badge-${sec.id}`} className="ml-1 text-amber-700 font-semibold">· {completeness.reason}</span>
            )}
          </span>
        </div>

        <div
          className={`flex items-center gap-0.5 shrink-0 transition-opacity ${isSelected || !sec.isVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button" aria-label={sec.isVisible ? "Masquer la section" : "Afficher la section"}
            title={sec.isVisible ? "Masquer" : "Afficher"}
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(sec.id); }}
            className="h-6 w-6 flex items-center justify-center rounded text-slate-500 hover:bg-white hover:text-slate-900 cursor-pointer"
          >
            {sec.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-amber-600" />}
          </button>
          <button
            type="button" aria-label="Monter la section" title="Monter" disabled={idx === 0 || isLocked}
            onClick={(e) => { e.stopPropagation(); if (idx > 0 && !isLocked) onReorder(idx, idx - 1); }}
            className="h-6 w-6 flex items-center justify-center rounded text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <MoveUp className="h-3 w-3" />
          </button>
          <button
            type="button" aria-label="Descendre la section" title="Descendre" disabled={idx === totalSections - 1 || isLocked}
            onClick={(e) => { e.stopPropagation(); if (idx < totalSections - 1 && !isLocked) onReorder(idx, idx + 1); }}
            className="h-6 w-6 flex items-center justify-center rounded text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <MoveDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {canExpand && isExpanded && (
        <SectionSubBlocksTree sec={sec} products={products} onSelectSection={onSelectSection} onUpdateSection={onUpdateSection} />
      )}

      {isSelected && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button" data-testid={`lock-section-${sec.id}`} title={isLocked ? "Déverrouiller" : "Verrouiller"} onClick={handleToggleLock}
            className={`h-6 px-2 flex items-center gap-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${isLocked ? "bg-amber-50 text-amber-800" : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-900"}`}
          >
            {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
          <button
            type="button" title={sec.isVisible ? "Masquer" : "Afficher"} onClick={(e) => { e.stopPropagation(); onToggleVisibility(sec.id); }}
            className="h-6 px-2 flex items-center rounded text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer transition-colors"
          >
            {sec.isVisible ? <Eye className="h-3 w-3 text-emerald-600" /> : <EyeOff className="h-3 w-3 text-slate-400" />}
          </button>
          {onDuplicateSection && (
            <button
              type="button" title="Dupliquer" onClick={(e) => { e.stopPropagation(); onDuplicateSection(sec.id); }}
              className="h-6 px-2 flex items-center rounded text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer transition-colors"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
          <button
            type="button" disabled={isLocked} data-testid={`delete-section-${sec.id}`}
            aria-label={isLocked ? "Section verrouillée (suppression désactivée)" : "Supprimer la section"}
            title={isLocked ? "Section verrouillée" : "Supprimer"}
            onClick={(e) => { e.stopPropagation(); if (!isLocked) onRequestDelete(sec); }}
            className="h-6 px-2 flex items-center rounded text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </article>
  );
};
