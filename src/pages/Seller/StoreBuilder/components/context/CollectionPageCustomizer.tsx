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
    onChange({ ...current, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-[12px] font-semibold text-slate-900">
            Mise en page Catalogue
          </h3>
          <p className="text-[11px] text-slate-500">
            Affichée au clic sur un rayon ou collection
          </p>
        </div>
        <button
          type="button"
          onClick={onPreviewCollectionPage}
          className="h-7 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Eye className="w-3 h-3" />
          <span>Simuler</span>
        </button>
      </div>

      <div className="space-y-2.5 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-900">
          <Layout className="w-3.5 h-3.5 text-slate-500" />
          <span>En-tête du rayon</span>
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
              className={`h-8 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                current.headerStyle === st.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                  className={`h-7 rounded-md border text-[10.5px] font-medium cursor-pointer ${
                    current.headerHeight === h.id
                      ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            <label className="block space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 tabular-nums">
                <span>Voile sombre sur l&apos;image</span>
                <span className="font-mono font-semibold text-slate-900">
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
                className="w-full accent-slate-900 cursor-pointer"
              />
            </label>
          </>
        )}
      </div>

      <div className="space-y-2 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-900">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Barre de filtres</span>
        </div>

        {[
          { key: "showCategoryPills" as const, label: "Boutons de navigation entre rayons", checked: current.showCategoryPills },
          { key: "showSearch" as const, label: "Barre de recherche rapide", checked: current.showSearch },
          { key: "showSortDropdown" as const, label: "Tri par prix (Croissant / Décroissant)", checked: current.showSortDropdown },
        ].map((item) => (
          <label key={item.key} className="flex items-center justify-between text-[12px] text-slate-700 cursor-pointer">
            <span>{item.label}</span>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => updateField(item.key, e.target.checked)}
              className="w-4 h-4 accent-slate-900 cursor-pointer"
            />
          </label>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-900">
          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
          <span>Grille &amp; cartes produits</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-600 block mb-1">Colonnes sur bureau</span>
          <div className="grid grid-cols-3 gap-1">
            {([2, 3, 4] as const).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => updateField("columnsDesktop", col)}
                className={`h-7 rounded-md border text-[11px] font-medium cursor-pointer ${
                  current.columnsDesktop === col
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {col} colonnes
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-600 block mb-1">Style des cartes</span>
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
                className={`h-7 rounded-md border text-[11px] font-medium cursor-pointer ${
                  current.cardStyle === cs.id
                    ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {cs.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-600 block mb-1">Format des photos</span>
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
                className={`h-7 rounded-md border text-[11px] font-medium cursor-pointer ${
                  current.cardAspectRatio === ar.id
                    ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold"
                    : "border-slate-200 bg-white text-slate-600"
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
