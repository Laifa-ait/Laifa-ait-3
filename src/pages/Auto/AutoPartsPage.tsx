import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Wrench, PlusCircle, Search, MapPin, Loader2, PackageOpen } from "lucide-react";
import { autoClient } from "../../domains/auto/auto.client";
import { AutoPartDto, AutoPartCategory } from "../../domains/auto/autoParts.types";
import { AutoPartCard } from "../../components/Auto/Parts/AutoPartCard";
import { AutoPartCategoriesBar } from "../../components/Auto/Parts/AutoPartCategoriesBar";
import { PartCompatibilityFilter } from "../../components/Auto/Parts/PartCompatibilityFilter";
import { ALGERIA_WILAYAS } from "../../constants/wilayas";

export const AutoPartsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<AutoPartDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const category = (searchParams.get("category") as AutoPartCategory) || undefined;
  const brand = searchParams.get("brand") || undefined;
  const model = searchParams.get("model") || undefined;
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const wilayaId = searchParams.get("wilayaId") ? Number(searchParams.get("wilayaId")) : undefined;
  const query = searchParams.get("q") || "";
  const isJunkYard = searchParams.get("casse") === "true";

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await autoClient.getParts({
        category,
        brand,
        model,
        year,
        wilayaId,
        isJunkYard: isJunkYard ? true : undefined,
        query: query || undefined,
        limit: 18,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, brand, model, year, wilayaId, isJunkYard, query]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleCompatibilityChange = (b?: string, m?: string, y?: number) => {
    const next = new URLSearchParams(searchParams);
    if (b) next.set("brand", b);
    else next.delete("brand");
    if (m) next.set("model", m);
    else next.delete("model");
    if (y) next.set("year", String(y));
    else next.delete("year");
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/90 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>Pièces Détachées & Casse Algérie</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Trouvez la pièce exacte pour votre véhicule
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Moteurs, carrosserie, boîtes, optiques et pièces d'occasion certifiées provenant de particuliers et casses automobiles agréées des 69 Wilayas.
              </p>
            </div>

            <Link
              to="/auto/deposer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/25 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Vendre une Pièce ou Casse</span>
            </Link>
          </div>

          {/* Filtre de compatibilité interactif */}
          <PartCompatibilityFilter
            selectedBrand={brand}
            selectedModel={model}
            selectedYear={year}
            onChange={handleCompatibilityChange}
          />
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Categories Bar & Quick Switches */}
        <AutoPartCategoriesBar
          selectedCategory={category}
          isJunkYardOnly={isJunkYard}
          onSelectCategory={(c) => updateParam("category", c)}
          onToggleJunkYard={(enabled) => updateParam("casse", enabled ? "true" : undefined)}
        />

        {/* Search Input & Wilaya Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder="Rechercher par référence, mot-clé (ex: injecteur 1.6 hdi, pare choc clio)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500"
            />
          </div>

          <div className="w-full sm:w-64 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={wilayaId || ""}
              onChange={(e) => updateParam("wilayaId", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-orange-500"
            >
              <option value="">Toutes les Wilayas (58)</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code.padStart(2, "0")} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{total} pièce{total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}</span>
          {(brand || model || category || isJunkYard) && (
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-orange-400 hover:underline cursor-pointer"
            >
              Réinitialiser tous les filtres
            </button>
          )}
        </div>

        {/* Parts Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Recherche des pièces disponibles...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((part) => (
              <AutoPartCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
            <PackageOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Aucune pièce ne correspond à vos critères</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Essayez d'élargir votre recherche, de sélectionner "Toutes les Wilayas" ou d'enlever le filtre de compatibilité.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
