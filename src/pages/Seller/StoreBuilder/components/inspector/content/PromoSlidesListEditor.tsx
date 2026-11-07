import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Sliders, Layers } from "lucide-react";
import {
  BannerContentPosition,
  CustomPageSection,
  PromoCarouselStyleVariant,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { CarouselDesignAndPresetTab } from "../carousel/CarouselDesignAndPresetTab";
import { PromoActiveSlideForm } from "../carousel/PromoActiveSlideForm";
import { CAROUSEL_STYLE_OPTIONS } from "../../../constants/carouselPresets";
import { useStudioStore } from "../../../store/useStudioStore";

interface PromoSlidesListEditorProps {
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  updateRecordList: <T extends Record<string, unknown>>(
    field: string,
    index: number,
    patch: Partial<T>
  ) => void;
  inputClass: string;
}

export const PromoSlidesListEditor: React.FC<PromoSlidesListEditorProps> = ({
  settings,
  sections = [],
  products,
  onSettingsChange,
  updateRecordList,
  inputClass,
}) => {
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const selectSection = useStudioStore((s) => s.selectSection);

  const [subTab, setSubTab] = useState<"slides" | "design" | "presets">("slides");
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);

  const slides = Array.isArray(settings.slides)
    ? (settings.slides as Array<Record<string, unknown>>)
    : [];

  useEffect(() => {
    if (selectedSubElement?.startsWith("slide-")) {
      const parsed = parseInt(selectedSubElement.replace("slide-", ""), 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed < slides.length) {
        setActiveSlideIdx(parsed);
        setSubTab("slides");
      }
    }
  }, [selectedSubElement, slides.length]);

  const safeIdx = activeSlideIdx < slides.length ? activeSlideIdx : Math.max(0, slides.length - 1);
  const currentSlide = slides[safeIdx];

  const focusSlide = (idx: number) => {
    setActiveSlideIdx(idx);
    if (selectedSectionId) {
      selectSection(selectedSectionId, `slide-${idx}`);
    }
  };

  const handleAddSlide = () => {
    if (slides.length >= 12) return;
    const nextNum = slides.length + 1;
    const prod = products[(nextNum - 1) % Math.max(1, products.length)];
    const newSlide = {
      id: `slide_${Date.now()}`,
      imageUrl:
        prod?.images?.[0] ||
        prod?.image ||
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
      badge: `OFFRE SPÉCIALE #${nextNum}`,
      title: prod?.name || `Offre Spéciale #${nextNum}`,
      subtitle: "Profitez de notre sélection exclusive avec livraison rapide 69 Wilayas.",
      highlightPrice: prod?.price ? `${Number(prod.price).toLocaleString("fr-DZ")} DA` : "Offre Limitée",
      ctaText: "Découvrir l'offre",
      link: prod?.id ? `/product/${prod.id}` : "#catalog",
    };
    const next = [...slides, newSlide];
    onSettingsChange("slides", next);
    focusSlide(next.length - 1);
  };

  const handleMoveSlide = (dir: -1 | 1) => {
    const target = safeIdx + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const tmp = next[safeIdx];
    next[safeIdx] = next[target];
    next[target] = tmp;
    onSettingsChange("slides", next);
    focusSlide(target);
  };

  const activeStyleId = (settings.carouselStyle as PromoCarouselStyleVariant) || "editorial_luxury";
  const activeStyleMeta =
    CAROUSEL_STYLE_OPTIONS.find((o) => o.id === activeStyleId) || CAROUSEL_STYLE_OPTIONS[0];

  return (
    <div className="space-y-3.5 select-none">
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setSubTab("slides")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
            subTab === "slides"
              ? "bg-[#023859] text-white shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Slides ({slides.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab("design")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
            subTab === "design"
              ? "bg-[#023859] text-white shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Design & Style</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab("presets")}
          className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
            subTab === "presets"
              ? "bg-[#023859] text-white shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Modèles</span>
        </button>
      </div>

      {subTab !== "slides" ? (
        <CarouselDesignAndPresetTab
          mode={subTab}
          settings={settings}
          products={products}
          onSettingsChange={onSettingsChange}
          onSwitchToSlides={() => setSubTab("slides")}
        />
      ) : (
        <div className="space-y-3">
          <div className="p-2.5 rounded-xl bg-[#F8FBFC] border border-slate-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#26658C] block">
                Design actif : {activeStyleMeta.label}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                {activeStyleMeta.sublabel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSubTab("design")}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#023859] text-[10px] font-bold text-[#023859] shrink-0 cursor-pointer"
            >
              Changer de design
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-[#011C40]">
                Choisir la slide à modifier ({slides.length}/12)
              </span>
              <button
                type="button"
                disabled={slides.length >= 12}
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[10px] font-bold cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
                <span>Ajouter une slide</span>
              </button>
            </div>

            {slides.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {slides.map((s, idx) => {
                  const isAct = idx === safeIdx;
                  return (
                    <button
                      key={String(s.id || idx)}
                      type="button"
                      onClick={() => focusSlide(idx)}
                      className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-lg border text-left shrink-0 cursor-pointer transition-all ${
                        isAct
                          ? "bg-[#023859] border-[#023859] text-white shadow-2xs font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {s.imageUrl ? (
                        <img
                          src={String(s.imageUrl)}
                          alt=""
                          className="w-6 h-6 rounded object-cover bg-slate-200 shrink-0"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded bg-slate-200 shrink-0" />
                      )}
                      <span className="text-[11px] whitespace-nowrap">Slide #{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!currentSlide ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 bg-white space-y-2">
              <p className="text-xs font-bold text-slate-800">Aucune diapositive dans ce carrousel</p>
              <button
                type="button"
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#023859] text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer la première slide</span>
              </button>
            </div>
          ) : (
            <PromoActiveSlideForm
              slide={currentSlide}
              slideIndex={safeIdx}
              totalSlides={slides.length}
              globalContentPosition={settings.contentPosition as BannerContentPosition | undefined}
              sections={sections}
              products={products}
              inputClass={inputClass}
              onUpdateField={(patch) => updateRecordList("slides", safeIdx, patch)}
              onMove={handleMoveSlide}
              onDuplicate={() => {
                const copy = { ...currentSlide, id: `slide_${Date.now()}` };
                const next = [...slides];
                next.splice(safeIdx + 1, 0, copy);
                onSettingsChange("slides", next);
                focusSlide(safeIdx + 1);
              }}
              onDelete={() => {
                const next = slides.filter((_, idx) => idx !== safeIdx);
                onSettingsChange("slides", next);
                focusSlide(Math.max(0, safeIdx - 1));
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
