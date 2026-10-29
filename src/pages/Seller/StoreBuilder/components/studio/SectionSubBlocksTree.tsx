import React from "react";
import { Type, AlignLeft, MousePointerClick, Image as ImageIcon, Plus, Copy, Trash2, Sparkles, Grid, HelpCircle } from "lucide-react";
import { CustomPageSection, PromoSlide, CategoryItem, CuratedCollectionItem, FaqItem } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { useStudioStore } from "../../store/useStudioStore";

interface SectionSubBlocksTreeProps {
  sec: CustomPageSection;
  products?: Product[];
  onSelectSection: (id: string) => void;
  onUpdateSection?: (id: string, updatedData: Partial<CustomPageSection>) => void;
}

const HERO_SUB_BLOCKS = [
  { key: "title", label: "En-tête & Titre", icon: Type },
  { key: "subtitle", label: "Sous-titre", icon: AlignLeft },
  { key: "ctaPrimary", label: "Bouton Principal", icon: MousePointerClick },
  { key: "ctaSecondary", label: "Bouton Secondaire", icon: MousePointerClick },
  { key: "background", label: "Fond & Image", icon: ImageIcon },
];

export function hasExpandableSubBlocks(sectionType: string): boolean {
  return ["hero_banner", "promo_carousel", "featured_categories", "curated_collections", "faq_accordion"].includes(sectionType);
}

export const SectionSubBlocksTree: React.FC<SectionSubBlocksTreeProps> = ({
  sec,
  products = [],
  onSelectSection,
  onUpdateSection,
}) => {
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);
  const hoverElement = useStudioStore((s) => s.hoverElement);
  const settings = (sec.settings || {}) as Record<string, unknown>;

  const focusSubBlock = (subKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode: "home" } }));
    onSelectSection(sec.id);
    setActiveInspectorTab("content");
    selectSection(sec.id, subKey);
    setTimeout(() => {
      document.getElementById(`studio-section-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 30);
  };

  const patchSettings = (patch: Record<string, unknown>) => {
    onUpdateSection?.(sec.id, { settings: { ...settings, ...patch } });
  };

  if (sec.type === "hero_banner") {
    return (
      <div className="mt-2 pl-4 pr-1 py-1 border-l-2 border-[#54ACBF]/50 space-y-1">
        {HERO_SUB_BLOCKS.map((item) => {
          const Icon = item.icon;
          const isAct = selectedSectionId === sec.id && (selectedSubElement === item.key || (item.key === "ctaPrimary" && selectedSubElement === "cta"));
          return (
            <button
              key={item.key}
              type="button"
              onMouseEnter={() => hoverElement(sec.id, item.key)}
              onMouseLeave={() => hoverElement(sec.id, null)}
              onClick={(e) => focusSubBlock(item.key, e)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[11px] cursor-pointer transition-colors ${
                isAct ? "bg-[#023859] text-white font-bold shadow-2xs" : "text-[#475467] hover:bg-[#F0F7FA] font-medium"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (sec.type === "promo_carousel") {
    const slides = Array.isArray(settings.slides) ? (settings.slides as PromoSlide[]) : [];
    return (
      <div className="mt-2 pl-4 pr-1 py-1 border-l-2 border-[#54ACBF]/50 space-y-1" onClick={(e) => e.stopPropagation()}>
        {slides.map((slide, idx) => {
          const isAct = selectedSectionId === sec.id && selectedSubElement === `slide-${idx}`;
          return (
            <div
              key={slide.id || idx}
              onClick={(e) => focusSubBlock(`slide-${idx}`, e)}
              className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                isAct ? "bg-[#023859] text-white font-bold" : "text-[#475467] hover:bg-[#F0F7FA]"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="truncate">Slide {idx + 1} {slide.title ? `• ${slide.title}` : ""}</span>
              </span>
              {onUpdateSection && (
                <span className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    title="Dupliquer"
                    onClick={() => {
                      const next = [...slides];
                      next.splice(idx + 1, 0, { ...slide, id: `slide_${Date.now()}` });
                      patchSettings({ slides: next });
                    }}
                    className="p-1 rounded hover:bg-black/10 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() => patchSettings({ slides: slides.filter((_, i) => i !== idx) })}
                    className="p-1 rounded hover:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          );
        })}
        {onUpdateSection && slides.length < 12 && (
          <button
            type="button"
            onClick={(e) => {
              const newIdx = slides.length;
              patchSettings({ slides: [...slides, { id: `slide_${Date.now()}`, imageUrl: products[0]?.images?.[0] || "", title: `Slide ${newIdx + 1}`, link: "#catalog" }] });
              focusSubBlock(`slide-${newIdx}`, e);
            }}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold text-[#023859] hover:bg-[#F0F7FA] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ajouter une slide</span>
          </button>
        )}
      </div>
    );
  }

  if (sec.type === "featured_categories" || sec.type === "curated_collections") {
    const isCat = sec.type === "featured_categories";
    const items = isCat
      ? (Array.isArray(settings.categories) ? (settings.categories as CategoryItem[]) : [])
      : (Array.isArray(settings.collections) ? (settings.collections as CuratedCollectionItem[]) : []);
    return (
      <div className="mt-2 pl-4 pr-1 py-1 border-l-2 border-[#54ACBF]/50 space-y-1" onClick={(e) => e.stopPropagation()}>
        {items.map((item, idx) => {
          const isAct = selectedSectionId === sec.id && (selectedSubElement === `cat-${idx}` || selectedSubElement === `category-items:${idx}`);
          return (
            <div
              key={item.id || idx}
              onClick={(e) => focusSubBlock(`cat-${idx}`, e)}
              className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                isAct ? "bg-[#023859] text-white font-bold" : "text-[#475467] hover:bg-[#F0F7FA]"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Grid className="w-3 h-3 shrink-0" />
                <span className="truncate">{"name" in item ? item.name : item.title || `Catégorie #${idx + 1}`}</span>
              </span>
              {onUpdateSection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    patchSettings({ [isCat ? "categories" : "collections"]: items.filter((_, i) => i !== idx) });
                  }}
                  className="p-1 rounded hover:bg-red-500/20 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {onUpdateSection && items.length < 24 && (
          <button
            type="button"
            onClick={(e) => {
              const newIdx = items.length;
              patchSettings(
                isCat
                  ? { categories: [...(items as CategoryItem[]), { id: `cat_${Date.now()}`, name: `Rayon #${newIdx + 1}`, slug: `rayon-${newIdx + 1}`, imageUrl: products[0]?.images?.[0] || "" }] }
                  : { collections: [...(items as CuratedCollectionItem[]), { id: `col_${Date.now()}`, title: `Collection #${newIdx + 1}`, imageUrl: products[0]?.images?.[0] || "", productIds: [] }] }
              );
              focusSubBlock(`cat-${newIdx}`, e);
            }}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold text-[#023859] hover:bg-[#F0F7FA] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ajouter une catégorie</span>
          </button>
        )}
      </div>
    );
  }

  if (sec.type === "faq_accordion") {
    const items = Array.isArray(settings.items) ? (settings.items as FaqItem[]) : [];
    return (
      <div className="mt-2 pl-4 pr-1 py-1 border-l-2 border-[#54ACBF]/50 space-y-1" onClick={(e) => e.stopPropagation()}>
        {items.map((faq, idx) => {
          const isAct = selectedSectionId === sec.id && selectedSubElement === `faq-${idx}`;
          return (
            <div
              key={idx}
              onClick={(e) => focusSubBlock(`faq-${idx}`, e)}
              className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                isAct ? "bg-[#023859] text-white font-bold" : "text-[#475467] hover:bg-[#F0F7FA]"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <HelpCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{faq.question || `Question #${idx + 1}`}</span>
              </span>
              {onUpdateSection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    patchSettings({ items: items.filter((_, i) => i !== idx) });
                  }}
                  className="p-1 rounded hover:bg-red-500/20 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {onUpdateSection && items.length < 24 && (
          <button
            type="button"
            onClick={(e) => {
              const newIdx = items.length;
              patchSettings({ items: [...items, { question: `Question #${newIdx + 1} ?`, answer: "Votre réponse détaillée ici." }] });
              focusSubBlock(`faq-${newIdx}`, e);
            }}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold text-[#023859] hover:bg-[#F0F7FA] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ajouter une question</span>
          </button>
        )}
      </div>
    );
  }

  return null;
};
