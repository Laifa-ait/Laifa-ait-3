import React from "react";
import { Trash2, Copy, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import {
  BannerContentPosition,
  CustomPageSection,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { StudioImagePicker } from "../content/StudioImagePicker";
import { AlignmentMatrix3x3 } from "../controls/AlignmentMatrix3x3";
import { SmartLinkPicker } from "../controls/SmartLinkPicker";
import { QUICK_SLIDE_BADGES } from "../../../constants/carouselPresets";

interface PromoActiveSlideFormProps {
  slide: Record<string, unknown>;
  slideIndex: number;
  totalSlides: number;
  globalContentPosition?: BannerContentPosition;
  sections: CustomPageSection[];
  products: Product[];
  inputClass: string;
  onUpdateField: (patch: Record<string, unknown>) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const PromoActiveSlideForm: React.FC<PromoActiveSlideFormProps> = ({
  slide,
  slideIndex,
  totalSlides,
  globalContentPosition,
  sections,
  products,
  inputClass,
  onUpdateField,
  onMove,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
      {/* Slide Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-extrabold text-[#023859]">
          Configuration • Slide #{slideIndex + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={slideIndex === 0}
            onClick={() => onMove(-1)}
            className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35 cursor-pointer"
            title="Avancer la slide"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={slideIndex >= totalSlides - 1}
            onClick={() => onMove(1)}
            className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35 cursor-pointer"
            title="Reculer la slide"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Dupliquer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <StudioImagePicker
        label={`Photo Slide #${slideIndex + 1}`}
        value={String(slide.imageUrl || "")}
        onChange={(newUrl) => onUpdateField({ imageUrl: newUrl })}
        products={products}
        compact
      />

      {/* Badge Kicker + Quick Chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <Tag className="w-3 h-3 text-[#023859]" />
          <span>Badge d&apos;accroche (Sur-titre)</span>
        </label>
        <input
          value={String(slide.badge || "")}
          onChange={(e) => onUpdateField({ badge: e.target.value })}
          placeholder="Ex: OFFRE FLASH -30% ou NOUVEAUTÉ"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-1">
          {QUICK_SLIDE_BADGES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onUpdateField({ badge: b })}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-[#F0F7FA] text-[9.5px] font-bold text-slate-700 hover:text-[#023859] cursor-pointer"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Title & Subtitle */}
      <label className="block space-y-1">
        <span className="text-[11px] font-bold text-slate-700">Titre principal de la slide</span>
        <input
          value={String(slide.title || "")}
          onChange={(e) => onUpdateField({ title: e.target.value })}
          placeholder="Ex: Offres Spéciales Semaine"
          className={inputClass}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[11px] font-bold text-slate-700">Sous-titre descriptif</span>
        <textarea
          rows={2}
          value={String(slide.subtitle || "")}
          onChange={(e) => onUpdateField({ subtitle: e.target.value })}
          placeholder="Ex: Profitez de nos remises avec paiement à la livraison 69 Wilayas."
          className="w-full rounded-lg border border-[#E4E7EC] bg-white p-2.5 text-xs text-[#17191C] focus:border-[#023859] focus:outline-none"
        />
      </label>

      {/* Price Tag & CTA Label */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-[11px] font-bold text-slate-700">Étiquette Prix / Offre</span>
          <input
            value={String(slide.highlightPrice || "")}
            onChange={(e) => onUpdateField({ highlightPrice: e.target.value })}
            placeholder="Ex: Dès 2 900 DA"
            className={inputClass}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-bold text-slate-700">Texte du bouton</span>
          <input
            value={String(slide.ctaText || "")}
            onChange={(e) => onUpdateField({ ctaText: e.target.value })}
            placeholder="Découvrir l'offre"
            className={inputClass}
          />
        </label>
      </div>

      {/* Per-slide 9-point alignment */}
      <AlignmentMatrix3x3
        value={
          (slide.contentPosition as BannerContentPosition | undefined) ||
          globalContentPosition ||
          "bottom-left"
        }
        label={`Position du texte (Slide #${slideIndex + 1})`}
        onChange={(pos) => onUpdateField({ contentPosition: pos })}
      />

      {/* Collapsible Link Destination Picker */}
      <SmartLinkPicker
        label={`Destination Slide #${slideIndex + 1}`}
        value={String(slide.link || "#catalog")}
        onChange={(newHref) => onUpdateField({ link: newHref })}
        products={products}
        sections={sections}
        collapsible
      />
    </div>
  );
};
