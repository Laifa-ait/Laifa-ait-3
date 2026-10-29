import React from "react";
import { Plus, Trash2, Copy, Sparkles } from "lucide-react";
import {
  BannerContentPosition,
  CustomPageSection,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { StudioImagePicker } from "./StudioImagePicker";
import { AlignmentMatrix3x3 } from "../controls/AlignmentMatrix3x3";
import { SmartLinkPicker } from "../controls/SmartLinkPicker";
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
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const slides = Array.isArray(settings.slides)
    ? (settings.slides as Array<Record<string, unknown>>)
    : [];

  const contentPosition = settings.contentPosition as BannerContentPosition | undefined;
  const textAlignment = (settings.textAlignment as "left" | "center" | "right") || "left";
  const verticalAlignment = (settings.verticalAlignment as "top" | "center" | "bottom") || "bottom";

  return (
    <div className="space-y-4 select-none">
      {/* Global 3x3 Alignment Matrix for Promo Carousel */}
      <AlignmentMatrix3x3
        value={contentPosition}
        horizontalFallback={textAlignment}
        verticalFallback={verticalAlignment}
        label="Position du texte sur les slides"
        onChange={(pos, h, v) =>
          onSettingsChange({
            contentPosition: pos,
            textAlignment: h,
            verticalAlignment: v,
          })
        }
      />

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#011C40] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
            <span>Diapositives ({slides.length}/12)</span>
          </span>
          <div className="flex items-center gap-1.5">
            {slides.length > 0 && (
              <button
                type="button"
                onClick={() => onSettingsChange("slides", [])}
                className="px-2 py-1 rounded-lg border border-red-200 bg-white text-red-600 text-[10px] font-bold cursor-pointer hover:bg-red-50"
              >
                Vider tout
              </button>
            )}
            <button
              type="button"
              disabled={slides.length >= 12}
              onClick={() =>
                onSettingsChange("slides", [
                  ...slides,
                  {
                    id: `slide_${Date.now()}`,
                    imageUrl:
                      products[0]?.images?.[0] ||
                      products[0]?.image ||
                      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
                    title: `Offre #${slides.length + 1}`,
                    link: "#catalog",
                  },
                ])
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold cursor-pointer disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Ajouter une slide</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {slides.map((slide, index) => {
            const isHighlighted = selectedSubElement === `slide-${index}`;
            return (
              <div
                key={String(slide.id || index)}
                className={`space-y-2.5 rounded-xl border p-3 transition-all ${
                  isHighlighted
                    ? "border-[#023859] bg-[#F0F7FA]/60 ring-2 ring-[#54ACBF]/35 shadow-xs"
                    : "border-slate-200 bg-white shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#023859]">
                    Slide #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const copy = { ...slide, id: `slide_${Date.now()}` };
                        const next = [...slides];
                        next.splice(index + 1, 0, copy);
                        onSettingsChange("slides", next);
                      }}
                      className="p-1 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Dupliquer la diapositive"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSettingsChange(
                          "slides",
                          slides.filter((_, idx) => idx !== index)
                        )
                      }
                      className="p-1 rounded-md text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Supprimer la diapositive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <StudioImagePicker
                  label={`Photo Slide #${index + 1}`}
                  value={String(slide.imageUrl || "")}
                  onChange={(newUrl) => updateRecordList("slides", index, { imageUrl: newUrl })}
                  products={products}
                  compact
                />

                <input
                  value={String(slide.title || "")}
                  onChange={(e) => updateRecordList("slides", index, { title: e.target.value })}
                  placeholder="Titre de l'offre (ex: -30% ce week-end)"
                  className={inputClass}
                />

                <SmartLinkPicker
                  label={`Lien de la Slide #${index + 1}`}
                  value={String(slide.link || "#catalog")}
                  onChange={(newHref) => updateRecordList("slides", index, { link: newHref })}
                  products={products}
                  sections={sections}
                />
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-200 space-y-2">
          <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
            <span>Défilement automatique</span>
            <input
              type="checkbox"
              checked={settings.autoplay !== false}
              onChange={(e) => onSettingsChange("autoplay", e.target.checked)}
              className="accent-[#023859]"
            />
          </label>
          {settings.autoplay !== false && (
            <label className="block space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Durée par diapositive</span>
                <span className="font-mono font-bold text-[#023859]">
                  {Number(settings.intervalSec || 5)}s
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                step={1}
                value={Number(settings.intervalSec || 5)}
                onChange={(e) => onSettingsChange("intervalSec", Number(e.target.value))}
                className="w-full accent-[#023859] cursor-pointer"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
