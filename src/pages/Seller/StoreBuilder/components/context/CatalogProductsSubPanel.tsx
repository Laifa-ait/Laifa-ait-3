import React, { useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, Check, Loader2, Package, RefreshCw, Search, Sparkles } from "lucide-react";
import { Product } from "../../../../../domains/product/product.types";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";
import { classifyCatalogProductStatus } from "../../../../../domains/seller/studioCatalogResolver";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";

interface CatalogProductsSubPanelProps {
  products: Product[];
  catalogStatus?: CatalogLoadStatus;
  catalogError?: string | null;
  onReloadCatalog?: () => void | Promise<void>;
  productFeedSections: CustomPageSection[];
  activeFeedSection?: CustomPageSection;
  selectedFeedId: string;
  onSelectFeedId: (id: string) => void;
  featuredProductIds: string[];
  invalidFeaturedIds?: string[];
  onToggleFeaturedProduct: (productId: string) => void;
  onPurgeInvalidFeatured?: () => void;
}

const PAGE_STEP = 50;

export const CatalogProductsSubPanel: React.FC<CatalogProductsSubPanelProps> = ({
  products,
  catalogStatus = "loaded",
  catalogError = null,
  onReloadCatalog,
  productFeedSections,
  activeFeedSection,
  selectedFeedId,
  onSelectFeedId,
  featuredProductIds,
  invalidFeaturedIds = [],
  onToggleFeaturedProduct,
  onPurgeInvalidFeatured,
}) => {
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<"all" | "active" | "inactive">("all");
  const [visibleLimit, setVisibleLimit] = useState(PAGE_STEP);

  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const p of products) {
      if (classifyCatalogProductStatus(p).isPubliclyVisible) active += 1;
      else inactive += 1;
    }
    return { active, inactive };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const meta = classifyCatalogProductStatus(p);
      if (lifecycleFilter === "active" && !meta.isPubliclyVisible) return false;
      if (lifecycleFilter === "inactive" && meta.isPubliclyVisible) return false;
      if (!q) return true;
      return (p.name || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
    });
  }, [products, search, lifecycleFilter]);

  const visibleProducts = filteredProducts.slice(0, visibleLimit);

  return (
    <div className="p-4 space-y-3">
      {productFeedSections.length > 1 && (
        <div className="space-y-1">
          <label className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 block">
            Section cible
          </label>
          <select
            value={activeFeedSection?.id || selectedFeedId}
            onChange={(e) => onSelectFeedId(e.target.value)}
            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {productFeedSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.title || sec.type} ({sec.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {invalidFeaturedIds.length > 0 && onPurgeInvalidFeatured && (
        <div
          data-testid="catalog-panel-stale-ids-warning"
          className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{invalidFeaturedIds.length} produit(s) épinglé(s) supprimé(s) ou inactif(s).</span>
          </span>
          <button
            type="button"
            data-testid="catalog-panel-purge-stale-btn"
            onClick={onPurgeInvalidFeatured}
            className="px-2 py-1 rounded bg-amber-900 text-white text-[10.5px] font-bold shrink-0 cursor-pointer"
          >
            Nettoyer
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleLimit(PAGE_STEP);
          }}
          placeholder="Chercher un produit..."
          className="w-full h-8.5 pl-8 pr-3 rounded-lg bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
        />
      </div>

      {products.length > 0 && (
        <div className="flex items-center gap-1">
          {[
            { id: "all" as const, label: `Tous (${products.length})` },
            { id: "active" as const, label: `Actifs (${counts.active})` },
            { id: "inactive" as const, label: `Inactifs (${counts.inactive})` },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setLifecycleFilter(pill.id);
                setVisibleLimit(PAGE_STEP);
              }}
              className={`px-2 py-1 rounded-md text-[10.5px] font-medium cursor-pointer transition-colors ${
                lifecycleFilter === pill.id
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      )}

      {catalogStatus === "loading" && products.length === 0 ? (
        <div data-testid="catalog-loading-state" className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <Loader2 className="w-5 h-5 text-slate-600 animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-700">Chargement du catalogue...</p>
        </div>
      ) : catalogStatus === "error" ? (
        <div
          role="alert"
          data-testid="catalog-load-error"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2.5"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 mx-auto" />
          <p className="text-xs font-semibold text-rose-900">
            {catalogError || "Erreur de chargement du catalogue"}
          </p>
          {onReloadCatalog && (
            <button
              type="button"
              data-testid="catalog-load-retry-btn"
              onClick={() => void onReloadCatalog()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11.5px] font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réessayer</span>
            </button>
          )}
        </div>
      ) : products.length === 0 ? (
        <div data-testid="catalog-empty-state" className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
          <Package className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-xs font-medium text-slate-900">Aucun produit en catalogue</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-5 text-center bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Aucun produit ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {visibleProducts.map((p) => {
              const isFeatured = featuredProductIds.includes(p.id);
              const meta = classifyCatalogProductStatus(p);
              const thumb = p.images?.[0] || p.image || "";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onToggleFeaturedProduct(p.id)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${
                    isFeatured ? "bg-slate-50" : "bg-white hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {thumb ? (
                      <img src={thumb} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                          {Number(p.price || 0).toLocaleString("fr-DZ")} DA
                        </span>
                        {!meta.isPubliclyVisible ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">{meta.label}</span>
                        ) : !meta.isPurchasable ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">Rupture</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isFeatured ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>
          {filteredProducts.length > visibleLimit && (
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + PAGE_STEP)}
              className="w-full h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
            >
              Afficher +{Math.min(PAGE_STEP, filteredProducts.length - visibleLimit)} produits ({filteredProducts.length - visibleLimit} restants)
            </button>
          )}
        </div>
      )}
    </div>
  );
};
