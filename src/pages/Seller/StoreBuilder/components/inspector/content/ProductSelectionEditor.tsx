import React, { useState, useEffect } from "react";
import { ShoppingBag, Sliders, Sparkles, Clock } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { CountdownCardEditor } from "./CountdownCardEditor";
import { ProductPickerSubTab } from "./ProductPickerSubTab";
import { VisualLayoutPicker } from "../controls/VisualLayoutPicker";
import { ProductCardStyleController } from "../controls/ProductCardStyleController";
import { useStudioStore } from "../../../store/useStudioStore";

interface ProductSelectionEditorProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

export const ProductSelectionEditor: React.FC<ProductSelectionEditorProps> = ({
  sectionType,
  settings,
  products,
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const [subTab, setSubTab] = useState<"cascade" | "countdown" | "selection">("cascade");

  useEffect(() => {
    if (!selectedSubElement) return;
    if (
      selectedSubElement === "product-card-design" ||
      selectedSubElement === "product-layout" ||
      selectedSubElement === "title"
    ) {
      setSubTab("cascade");
    } else if (
      selectedSubElement === "countdown-card" ||
      selectedSubElement === "countdown"
    ) {
      setSubTab("countdown");
    } else if (selectedSubElement === "selection" || selectedSubElement.startsWith("card-")) {
      setSubTab("selection");
    }
  }, [selectedSubElement]);

  const isProductSection =
    sectionType === "featured_products" ||
    sectionType === "new_arrivals" ||
    sectionType === "best_sellers" ||
    sectionType === "product_grid" ||
    "productIds" in settings ||
    "maxItems" in settings;

  if (!isProductSection) {
    return null;
  }

  const activeLayout = (settings.layout as string) || "grid";
  const cardImageFit = (settings.cardImageFit as string) || "cover";

  return (
    <div className="space-y-4 select-none">
      {/* Sub-navigation: 1. Disposition | 2. Chrono Offre | 3. Produits */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setSubTab("cascade")}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "cascade"
              ? "bg-white text-[#011C40] shadow-2xs border border-slate-200/80"
              : "text-slate-500 hover:text-[#011C40]"
          }`}
        >
          <Sliders className="w-3 h-3 shrink-0 text-[#023859]" />
          <span className="truncate">Disposition</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("countdown")}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer relative ${
            subTab === "countdown"
              ? "bg-white text-[#011C40] shadow-2xs border border-slate-200/80"
              : "text-slate-500 hover:text-[#011C40]"
          }`}
        >
          <Clock className="w-3 h-3 shrink-0 text-[#023859]" />
          <span className="truncate">Chrono Offre</span>
          {Boolean(settings.showCountdown) && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#023859]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("selection")}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            subTab === "selection"
              ? "bg-white text-[#011C40] shadow-2xs border border-slate-200/80"
              : "text-slate-500 hover:text-[#011C40]"
          }`}
        >
          <ShoppingBag className="w-3 h-3 shrink-0 text-[#023859]" />
          <span className="truncate">Produits</span>
        </button>
      </div>

      {subTab === "cascade" && (
        <div className="space-y-3.5">
          <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <label className={labelClass}>
              <span>Titre de la section</span>
              <input
                type="text"
                value={typeof settings.title === "string" ? settings.title : ""}
                onChange={(e) => onSettingsChange("title", e.target.value)}
                placeholder="Nos Produits Vedettes"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              <span>Sous-titre descriptif (optionnel)</span>
              <input
                type="text"
                value={typeof settings.subtitle === "string" ? settings.subtitle : ""}
                onChange={(e) => onSettingsChange("subtitle", e.target.value)}
                placeholder="Découvrez notre sélection"
                className={inputClass}
              />
            </label>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#023859] text-white text-[10px] font-black flex items-center justify-center">
                1
              </span>
              Disposition & Grille Produits
            </span>

            <VisualLayoutPicker
              mode="product"
              activeLayout={activeLayout}
              aspectRatio={String(settings.cardAspectRatio || "4/5")}
              columnsDesktop={Number(settings.columnsDesktop || 4)}
              onSelectLayout={(nextLayout) => onSettingsChange("layout", nextLayout)}
              onChangeAspectRatio={(r) => onSettingsChange("cardAspectRatio", r)}
              onChangeColumnsDesktop={(cols) => onSettingsChange("columnsDesktop", cols)}
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5">
            <span className="text-[11px] font-bold text-[#011C40] block">
              Ajustement de la photo produit
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "cover", label: "Remplir le cadre" },
                { id: "contain", label: "Photo entière" },
              ].map((fit) => (
                <button
                  key={fit.id}
                  type="button"
                  onClick={() => onSettingsChange("cardImageFit", fit.id)}
                  className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                    cardImageFit === fit.id
                      ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] font-bold"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {fit.label}
                </button>
              ))}
            </div>

            {cardImageFit === "cover" && (
              <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-[#023859] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Zone prioritaire de la photo
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "top", label: "Haut" },
                    { id: "center", label: "Centre" },
                    { id: "bottom", label: "Bas" },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => onSettingsChange("cardImagePosition", pos.id)}
                      className={`h-7 rounded border text-[10px] font-bold cursor-pointer ${
                        (settings.cardImagePosition || "center") === pos.id
                          ? "border-[#023859] bg-[#023859] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ProductCardStyleController
            settings={settings}
            onSettingsChange={onSettingsChange}
            inputClass={inputClass}
          />
        </div>
      )}

      {subTab === "countdown" && (
        <CountdownCardEditor
          settings={settings}
          onSettingsChange={onSettingsChange}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}

      {subTab === "selection" && (
        <ProductPickerSubTab
          sectionType={sectionType}
          settings={settings}
          products={products}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}
    </div>
  );
};
