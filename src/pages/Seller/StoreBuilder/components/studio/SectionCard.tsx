import React, { useState } from "react";
import {
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  Copy,
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
import {
  CustomPageSection,
} from "../../../../../domains/seller/customPage.types";

interface SectionCardProps {
  sec: CustomPageSection;
  idx: number;
  totalSections: number;
  isSelected: boolean;
  onSelectSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (id: string) => void;
  onRequestDelete: (sec: CustomPageSection) => void;
  onDuplicateSection?: (id: string) => void;
}

const SECTION_TYPE_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  hero_banner: { icon: ImageIcon, label: "Bannière principale", color: "bg-orange-50 text-[#F97316]" },
  promo_carousel: { icon: Sparkles, label: "Carrousel promotionnel", color: "bg-amber-50 text-amber-600" },
  featured_categories: { icon: Grid, label: "Catégories", color: "bg-blue-50 text-blue-600" },
  curated_collections: { icon: Layers, label: "Collections", color: "bg-indigo-50 text-indigo-600" },
  new_arrivals: { icon: Sparkles, label: "Nouveautés", color: "bg-emerald-50 text-emerald-600" },
  featured_products: { icon: ShoppingBag, label: "Produits en vedette", color: "bg-blue-50 text-blue-600" },
  best_sellers: { icon: Award, label: "Meilleures ventes", color: "bg-amber-50 text-amber-600" },
  product_grid: { icon: ShoppingBag, label: "Catalogue complet", color: "bg-blue-50 text-blue-600" },
  brand_story: { icon: BookOpen, label: "Histoire de la marque", color: "bg-purple-50 text-purple-600" },
  showcase_video: { icon: ImageIcon, label: "Vidéo de présentation", color: "bg-violet-50 text-violet-600" },
  verified_reviews: { icon: ShieldCheck, label: "Avis vérifiés", color: "bg-rose-50 text-rose-600" },
  delivery_info: { icon: Truck, label: "Livraison", color: "bg-amber-50 text-amber-600" },
  return_policy: { icon: RotateCcw, label: "Retours et échanges", color: "bg-cyan-50 text-cyan-600" },
  faq_accordion: { icon: HelpCircle, label: "Questions fréquentes", color: "bg-indigo-50 text-indigo-600" },
  contact_footer: { icon: Phone, label: "Contact boutique", color: "bg-slate-100 text-slate-700" },
};

export const SectionCard: React.FC<SectionCardProps> = ({
  sec,
  idx,
  totalSections,
  isSelected,
  onSelectSection,
  onReorder,
  onToggleVisibility,
  onRequestDelete,
  onDuplicateSection,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const typeConfig = SECTION_TYPE_MAP[sec.type] || {
    icon: Layout,
    label: sec.type.replace("_", " "),
    color: "bg-slate-100 text-slate-600",
  };
  const SectionIcon = typeConfig.icon;
  const settings = (sec.settings || {}) as Record<string, unknown>;
  const imageUrl = (settings.imageUrl || settings.bannerUrl) as string | undefined;

  return (
    <article
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData("text/plain", idx.toString());
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (!isNaN(fromIdx) && fromIdx !== idx) {
          onReorder(fromIdx, idx);
        }
      }}
      className={[
        "section-card rounded-[10px] border bg-white p-2.5 transition-all cursor-pointer select-none",
        isSelected
          ? "border-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/30 shadow-xs"
          : "border-[#E5E7EB] hover:border-[#D0D5DD] hover:shadow-2xs",
        !sec.isVisible ? "opacity-60 bg-[#F9FAFB]" : "",
        isDragging ? "opacity-30 border-dashed border-[#F97316]" : "",
      ].join(" ")}
      onClick={() => onSelectSection(sec.id)}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Drag handle, thumbnail, title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            aria-label="Poignée de réorganisation"
            title="Réorganiser par glisser-déposer"
            className="flex h-8 w-4 items-center justify-center text-[#9CA3AF] hover:text-[#17191C] cursor-grab active:cursor-grabbing shrink-0"
            onClick={(event) => event.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="h-9 w-9 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] shrink-0 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className={`flex h-full w-full items-center justify-center ${typeConfig.color}`}>
                <SectionIcon className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-[#17191C]">
              {sec.title || typeConfig.label}
            </span>
            <span className="block truncate text-[11px] text-[#667085] font-medium uppercase tracking-wider">
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Right Side: The 4 Action Buttons (↑ Move Up, ↓ Move Down, 👁 Visibility, 🗑 Delete) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" onClick={(event) => event.stopPropagation()}>
          {/* 1. Flèche Haut (Monter) */}
          <button
            type="button"
            aria-label="Monter la section"
            title="Monter la section"
            disabled={idx === 0}
            onClick={(e) => {
              e.stopPropagation();
              if (idx > 0) onReorder(idx, idx - 1);
            }}
            className="h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FFF1E7] hover:border-[#FDBA74] text-[#344054] hover:text-[#F97316] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <MoveUp className="h-[18px] w-[18px]" />
          </button>

          {/* 2. Flèche Bas (Descendre) */}
          <button
            type="button"
            aria-label="Descendre la section"
            title="Descendre la section"
            disabled={idx === totalSections - 1}
            onClick={(e) => {
              e.stopPropagation();
              if (idx < totalSections - 1) onReorder(idx, idx + 1);
            }}
            className="h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FFF1E7] hover:border-[#FDBA74] text-[#344054] hover:text-[#F97316] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <MoveDown className="h-[18px] w-[18px]" />
          </button>

          {/* 3. Œil (Visibilité) */}
          <button
            type="button"
            aria-label={sec.isVisible ? "Masquer la section" : "Afficher la section"}
            title={sec.isVisible ? "Masquer la section" : "Afficher la section"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(sec.id);
            }}
            className="h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F0FDF4] hover:border-[#86EFAC] text-[#344054] hover:text-[#16A34A] transition-colors cursor-pointer shrink-0"
          >
            {sec.isVisible ? (
              <Eye className="h-[18px] w-[18px] text-[#16A34A]" />
            ) : (
              <EyeOff className="h-[18px] w-[18px] text-[#9CA3AF]" />
            )}
          </button>

          {/* 4. Dupliquer */}
          {onDuplicateSection && (
            <button
              type="button"
              aria-label="Dupliquer la section"
              title="Dupliquer la section"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateSection(sec.id);
              }}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FFF1E7] hover:border-[#FDBA74] text-[#344054] hover:text-[#F97316] transition-colors cursor-pointer shrink-0"
            >
              <Copy className="h-[18px] w-[18px] text-[#667085]" />
            </button>
          )}

          {/* 5. Poubelle (Supprimer) */}
          <button
            type="button"
            aria-label="Supprimer la section"
            title="Supprimer la section"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(sec);
            }}
            className="h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[#DC2626] transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="h-[18px] w-[18px] text-[#DC2626]" />
          </button>
        </div>
      </div>
    </article>
  );
};

