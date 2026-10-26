import React, { useState, useEffect } from "react";
import {
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  ShoppingBag,
  BookOpen,
  Award,
  Truck,
  HelpCircle,
  Layout,
  Grid,
  Layers,
  Sparkles,
  ShieldCheck,
  Phone,
  RotateCcw,
} from "lucide-react";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { useStudioStore } from "../../store/useStudioStore";
import { SectionSubBlocksTree, hasExpandableSubBlocks } from "./SectionSubBlocksTree";

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

const SECTION_TYPE_MAP: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  hero_banner: { icon: ImageIcon, label: "Bannière principale", color: "bg-orange-50 text-[#F97316]" },
  promo_carousel: { icon: Sparkles, label: "Carrousel promo", color: "bg-amber-50 text-amber-600" },
  featured_categories: { icon: Grid, label: "Catégories", color: "bg-blue-50 text-blue-600" },
  curated_collections: { icon: Layers, label: "Collections", color: "bg-indigo-50 text-indigo-600" },
  new_arrivals: { icon: Sparkles, label: "Nouveautés", color: "bg-emerald-50 text-emerald-600" },
  featured_products: { icon: ShoppingBag, label: "Produits vedettes", color: "bg-blue-50 text-blue-600" },
  best_sellers: { icon: Award, label: "Meilleures ventes", color: "bg-amber-50 text-amber-600" },
  product_grid: { icon: ShoppingBag, label: "Catalogue complet", color: "bg-blue-50 text-blue-600" },
  brand_story: { icon: BookOpen, label: "Notre Histoire", color: "bg-purple-50 text-purple-600" },
  showcase_video: { icon: ImageIcon, label: "Vidéo vitrine", color: "bg-violet-50 text-violet-600" },
  verified_reviews: { icon: ShieldCheck, label: "Avis vérifiés", color: "bg-rose-50 text-rose-600" },
  delivery_info: { icon: Truck, label: "Livraison", color: "bg-amber-50 text-amber-600" },
  return_policy: { icon: RotateCcw, label: "Retours & échanges", color: "bg-cyan-50 text-cyan-600" },
  faq_accordion: { icon: HelpCircle, label: "Questions FAQ", color: "bg-indigo-50 text-indigo-600" },
  contact_footer: { icon: Phone, label: "Contact boutique", color: "bg-slate-100 text-slate-700" },
};

export const SectionCard: React.FC<SectionCardProps> = ({
  sec,
  idx,
  totalSections,
  isSelected,
  products = [],
  onSelectSection,
  onUpdateSection,
  onReorder,
  onToggleVisibility,
  onRequestDelete,
  onDuplicateSection,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const canExpand = hasExpandableSubBlocks(sec.type);
  const [isExpanded, setIsExpanded] = useState<boolean>(isSelected && canExpand);

  const setIsDraggingSection = useStudioStore((s) => s.setIsDraggingSection);
  const hoverElement = useStudioStore((s) => s.hoverElement);
  const clearHover = useStudioStore((s) => s.clearHover);
  const selectSection = useStudioStore((s) => s.selectSection);

  useEffect(() => {
    if (isSelected && canExpand) {
      setIsExpanded(true);
    }
  }, [isSelected, canExpand]);

  const typeConfig = SECTION_TYPE_MAP[sec.type] || {
    icon: Layout,
    label: sec.type.replace(/_/g, " "),
    color: "bg-slate-100 text-slate-600",
  };
  const SectionIcon = typeConfig.icon;
  const settings = (sec.settings || {}) as Record<string, unknown>;
  const imageUrl = (settings.imageUrl || settings.bannerUrl) as string | undefined;

  const handleSelectMainSection = () => {
    selectSection(sec.id, null);
    onSelectSection(sec.id);
    const el = document.getElementById(`studio-section-${sec.id}`);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <article
      draggable
      onMouseEnter={() => hoverElement(sec.id)}
      onMouseLeave={() => clearHover()}
      onDragStart={(e) => {
        setIsDragging(true);
        setIsDraggingSection(true);
        e.dataTransfer.setData("text/plain", idx.toString());
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setIsDraggingSection(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingSection(false);
        const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (!isNaN(fromIdx) && fromIdx !== idx) {
          onReorder(fromIdx, idx);
        }
      }}
      className={[
        "rounded-xl border bg-white p-2.5 transition-all cursor-pointer select-none",
        isSelected
          ? "border-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/30 shadow-xs"
          : "border-[#E5E7EB] hover:border-[#D0D5DD] hover:shadow-2xs",
        !sec.isVisible ? "opacity-60 bg-[#F9FAFB]" : "",
        isDragging ? "opacity-30 border-dashed border-[#F97316]" : "",
      ].join(" ")}
      onClick={handleSelectMainSection}
    >
      {/* Top Row: Expand Chevron + Handle + Icon/Thumb + Title */}
      <div className="flex items-center gap-1.5 min-w-0">
        {canExpand ? (
          <button
            type="button"
            title={isExpanded ? "Replier les sous-blocs" : "Déplier les sous-blocs"}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="flex h-6 w-5 items-center justify-center rounded-md text-[#667085] hover:bg-orange-100 hover:text-[#F97316] cursor-pointer shrink-0 transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-2 shrink-0" />
        )}

        <span
          title="Glisser pour réorganiser"
          className="flex h-7 w-4 items-center justify-center text-[#9CA3AF] hover:text-[#17191C] cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </span>

        <div className="h-8 w-8 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] shrink-0 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${typeConfig.color}`}>
              <SectionIcon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-bold text-[#17191C] block">
              {sec.title || typeConfig.label}
            </span>
            {!sec.isVisible && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 shrink-0">
                Masquée
              </span>
            )}
          </div>
          <span className="block truncate text-[10px] text-[#667085] font-semibold uppercase tracking-wider">
            {idx + 1}. {typeConfig.label}
          </span>
        </div>
      </div>

      {/* Shopify OS 2.0 2-Level Sub-Blocks Accordion */}
      {canExpand && isExpanded && (
        <SectionSubBlocksTree
          sec={sec}
          products={products}
          onSelectSection={onSelectSection}
          onUpdateSection={onUpdateSection}
        />
      )}

      {/* Bottom Compact Action Bar */}
      <div
        className="mt-2 pt-2 border-t border-[#E5E7EB]/70 flex items-center justify-between gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Monter la section"
            disabled={idx === 0}
            onClick={(e) => {
              e.stopPropagation();
              if (idx > 0) onReorder(idx, idx - 1);
            }}
            className="h-7 px-2 flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white hover:bg-[#FFF1E7] hover:border-[#FDBA74] text-[#475467] hover:text-[#F97316] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-medium transition-colors cursor-pointer"
          >
            <MoveUp className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Descendre la section"
            disabled={idx === totalSections - 1}
            onClick={(e) => {
              e.stopPropagation();
              if (idx < totalSections - 1) onReorder(idx, idx + 1);
            }}
            className="h-7 px-2 flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white hover:bg-[#FFF1E7] hover:border-[#FDBA74] text-[#475467] hover:text-[#F97316] disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-medium transition-colors cursor-pointer"
          >
            <MoveDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title={sec.isVisible ? "Masquer la section" : "Afficher la section"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(sec.id);
            }}
            className="h-7 px-2 flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white hover:bg-[#F0FDF4] hover:border-[#86EFAC] text-[#475467] text-[11px] font-medium transition-colors cursor-pointer"
          >
            {sec.isVisible ? (
              <Eye className="h-3.5 w-3.5 text-[#16A34A]" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-[#9CA3AF]" />
            )}
          </button>

          {onDuplicateSection && (
            <button
              type="button"
              title="Dupliquer la section"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateSection(sec.id);
              }}
              className="h-7 px-2 flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white hover:bg-[#FFF1E7] hover:border-[#FDBA74] text-[#475467] hover:text-[#F97316] transition-colors cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            title="Supprimer la section"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(sec);
            }}
            className="h-7 px-2 flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[#DC2626] transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
