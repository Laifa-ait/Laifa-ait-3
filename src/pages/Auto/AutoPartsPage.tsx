import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Wrench, PlusCircle, Search, MapPin, Loader2, PackageOpen, ArrowLeft } from "lucide-react";
import { autoClient } from "../../domains/auto/auto.client";
import { AutoPartDto, AutoPartCategory } from "../../domains/auto/autoParts.types";
import { AutoPartCard } from "../../components/Auto/Parts/AutoPartCard";
import { AutoPartCategoriesBar } from "../../components/Auto/Parts/AutoPartCategoriesBar";
import { PartCompatibilityFilter } from "../../components/Auto/Parts/PartCompatibilityFilter";
import { useEphemeralAutoStudio } from "../../hooks/useEphemeralAutoStudio";
import { ALGERIA_WILAYAS } from "../../constants/wilayas";

export const AutoPartsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<AutoPartDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { ephemeralParts } = useEphemeralAutoStudio();

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
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, brand, model, year, wilayaId, isJunkYard, query]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const displayedParts = useMemo(() => {
    return [...items, ...ephemeralParts];
  }, [ephemeralParts, items]);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/auto"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Retour aux véhicules</span>
          </Link>
        </div>

        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>Pièces Détachées & Casse Automobile · 69 Wilayas</span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Rechercher une pièce compatible
              </h1>
            </div>

            <Link
              to="/auto/deposer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter une annonce</span>
            </Link>
          </div>

          <PartCompatibilityFilter
            selectedBrand={brand}
            selectedModel={model}
            selectedYear={year}
            onChange={handleCompatibilityChange}
          />
        </section>

        <AutoPartCategoriesBar
          selectedCategory={category}
          isJunkYardOnly={isJunkYard}
          onSelectCategory={(c) => updateParam("category", c)}
          onToggleJunkYard={(enabled) => updateParam("casse", enabled ? "true" : undefined)}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder="Rechercher une pièce (ex: optique LED, kit distribution, boîte vitesse)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600"
            />
          </div>

          <div className="w-full sm:w-64 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600" />
            <select
              value={wilayaId || ""}
              onChange={(e) => updateParam("wilayaId", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            >
              <option value="">Toutes les Wilayas (69)</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code.padStart(2, "0")} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && displayedParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Recherche des pièces disponibles...</p>
          </div>
        ) : displayedParts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedParts.map((part) => (
              <AutoPartCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <PackageOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">Aucune pièce trouvée</h3>
          </div>
        )}
      </div>
    </div>
  );
};
