import React from "react";
import { Layout, SlidersHorizontal, ShoppingBag, Eye } from "lucide-react";
import {
  CollectionPageDesignConfig,
  ProductCardAspectRatio,
  ProductCardStyleVariant,
} from "../../../../../domains/seller/customPage.types";

interface CollectionPageCustomizerProps {
  config?: CollectionPageDesignConfig;
  onChange: (nextConfig: CollectionPageDesignConfig) => void;
  onPreviewCollectionPage: () => void;
}

export const CollectionPageCustomizer: React.FC<CollectionPageCustomizerProps> = ({
  config,
  onChange,
  onPreviewCollectionPage,
}) => {
  const current: CollectionPageDesignConfig = {
    headerStyle: config?.headerStyle || "hero-image",
    headerHeight: config?.headerHeight || "md",
    headerOverlayOpacity: config?.headerOverlayOpacity ?? 45,
    showSearch: config?.showSearch !== false,
    showSortDropdown: config?.showSortDropdown !== false,
    showCategoryPills: config?.showCategoryPills !== false,
    columnsDesktop: config?.columnsDesktop || 4,
    cardStyle: config?.cardStyle || "modern",
    cardAspectRatio: config?.cardAspectRatio || "4/5",
    showStockBadge: config?.showStockBadge !== false,
    showCtaButton: false,
  };

  const updateField = <K extends keyof CollectionPageDesignConfig>(
    key: K,
    value: CollectionPageDesignConfig[K]
  ) => {
    onChange({
      ...current,
      [key]: value,
    });
  };

  return (
    <div className="space-y-3.5 pt-2 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[12px] font-bold text-[#011C40] uppercase tracking-wider">
            Design Page Rayon & Collection
          </h3>
          <p className="text-[11px] text-slate-500">
            Page affichée au clic sur un rayon ou le catalogue
          </p>
        </div>
        <button
          type="button"
          onClick={onPreviewCollectionPage}
          className="h-7 px-2.5 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Eye className="w-3 h-3" />
          <span>Simuler</span>
        </button>
      </div>

      {/* 1. Header Style */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#011C40]">
          <Layout className="w-3.5 h-3.5 text-[#023859]" />
          <span>1. En-tête du Rayon (Bannière)</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "hero-image" as const, label: "Bannière Photo" },
            { id: "minimal" as const, label: "Minimaliste" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => updateField("headerStyle", st.id)}
              className={`h-8 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                current.headerStyle === st.id
                  ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] font-bold"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {current.headerStyle === "hero-image" && (
          <>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "sm" as const, label: "Compacte" },
                { id: "md" as const, label: "Standard" },
                { id: "lg" as const, label: "Grande" },
              ].map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => updateField("headerHeight", h.id)}
                  className={`h-7 rounded-md border text-[10px] font-semibold cursor-pointer ${
                    current.headerHeight === h.id
                      ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] font-bold"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            <label className="block space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Voile sombre sur l'image</span>
                <span className="font-mono font-bold text-[#023859]">
                  {current.headerOverlayOpacity}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={85}
                step={5}
                value={current.headerOverlayOpacity}
                onChange={(e) => updateField("headerOverlayOpacity", Number(e.target.value))}
                className="w-full accent-[#023859] cursor-pointer"
              />
            </label>
          </>
        )}
      </div>

      {/* 2. Filters & Navigation Bar */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#011C40]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#023859]" />
          <span>2. Barre de Filtres & Navigation</span>
        </div>

        <label className="flex items-center justify-between text-[12px] text-[#011C40] cursor-pointer">
          <span>Boutons de navigation entre rayons</span>
          <input
            type="checkbox"
            checked={current.showCategoryPills}
            onChange={(e) => updateField("showCategoryPills", e.target.checked)}
            className="accent-[#023859]"
          />
        </label>
        <label className="flex items-center justify-between text-[12px] text-[#011C40] cursor-pointer">
          <span>Barre de recherche rapide</span>
          <input
            type="checkbox"
            checked={current.showSearch}
            onChange={(e) => updateField("showSearch", e.target.checked)}
            className="accent-[#023859]"
          />
        </label>
        <label className="flex items-center justify-between text-[12px] text-[#011C40] cursor-pointer">
          <span>Tri par prix (Croissant / Décroissant)</span>
          <input
            type="checkbox"
            checked={current.showSortDropdown}
            onChange={(e) => updateField("showSortDropdown", e.target.checked)}
            className="accent-[#023859]"
          />
        </label>
      </div>

      {/* 3. Product Grid & Card Design */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#011C40]">
          <ShoppingBag className="w-3.5 h-3.5 text-[#023859]" />
          <span>3. Grille & Cartes Produits du Rayon</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-600 block mb-1">
            Colonnes sur PC
          </span>
          <div className="grid grid-cols-3 gap-1">
            {([2, 3, 4] as const).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => updateField("columnsDesktop", col)}
                className={`h-7 rounded-md border text-[11px] font-semibold cursor-pointer ${
                  current.columnsDesktop === col
                    ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] font-bold"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {col} Colonnes
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-600 block mb-1">
            Style des cartes produits
          </span>
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: "modern" as ProductCardStyleVariant, label: "Moderne" },
              { id: "elevated" as ProductCardStyleVariant, label: "Surélevé" },
              { id: "bordered" as ProductCardStyleVariant, label: "Encadré" },
              { id: "minimal" as ProductCardStyleVariant, label: "Minimal" },
            ].map((cs) => (
              <button
                key={cs.id}
                type="button"
                onClick={() => updateField("cardStyle", cs.id)}
                className={`h-7 rounded-md border text-[11px] font-semibold cursor-pointer ${
                  current.cardStyle === cs.id
                    ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] font-bold"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {cs.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-600 block mb-1">
            Format des photos produits
          </span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "1/1" as ProductCardAspectRatio, label: "Carré 1:1" },
              { id: "4/5" as ProductCardAspectRatio, label: "Portrait 4:5" },
              { id: "4/3" as ProductCardAspectRatio, label: "Paysage 4:3" },
            ].map((ar) => (
              <button
                key={ar.id}
                type="button"
                onClick={() => updateField("cardAspectRatio", ar.id)}
                className={`h-7 rounded-md border text-[11px] font-semibold cursor-pointer ${
                  current.cardAspectRatio === ar.id
                    ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] font-bold"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
