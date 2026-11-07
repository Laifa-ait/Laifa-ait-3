import React from "react";
import { SlidersHorizontal, PackageOpen, RotateCcw, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { ProductCard } from "../Product/ProductCard";
import { getCategoryTranslation } from "../../utils/translations";

interface ShopQueryErrorStateProps {
  queryError: { message: string; indexLink?: string };
  onResetAll: () => void;
}

export const ShopQueryErrorState: React.FC<ShopQueryErrorStateProps> = ({
  queryError,
  onResetAll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="py-24 flex flex-col items-center text-center space-y-5">
      <div className="w-20 h-20 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center text-red-500">
        <SlidersHorizontal className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-sans font-bold text-zinc-900">
        {t("filters_not_applicable", "Filtres non applicables")}
      </h3>
      <p className="text-zinc-500 max-w-md text-sm font-medium">
        {t(
          "filters_not_applicable_desc",
          "Nous rencontrons des difficultés à appliquer ces filtres précis. Le reste du catalogue reste accessible."
        )}
      </p>
      {import.meta.env?.DEV && queryError.indexLink && (
        <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-left w-full max-w-lg">
          <p className="text-xs font-bold text-orange-800 mb-1.5">Action Requise (Dev Only)</p>
          <a
            href={queryError.indexLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            {t("Créer l'index Firestore")}
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={onResetAll}
        className="px-6 py-3 bg-[#1A1836] hover:bg-zinc-800 text-white rounded-xl font-sans font-semibold text-xs transition-colors cursor-pointer"
      >
        {t("clear_filters", "Effacer les filtres")}
      </button>
    </div>
  );
};

interface ShopEmptyStateProps {
  products: Product[];
  activeCategory: string;
  searchQuery: string;
  onResetFiltersOnly: () => void;
  onExploreAllCatalog: () => void;
}

export const ShopEmptyState: React.FC<ShopEmptyStateProps> = ({
  products,
  activeCategory,
  searchQuery,
  onResetFiltersOnly,
  onExploreAllCatalog,
}) => {
  const { t } = useTranslation();

  if (products.length > 0) {
    return (
      <div className="space-y-6 rounded-2xl border border-[#e5dfd6] bg-white p-4 sm:p-6">
        <div className="flex items-start gap-3 border-b border-[#f0ebe6] pb-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f7f5f0] text-[#1A1836]">
            <PackageOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-[#1A1836]">Aucun résultat exact</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
              Voici quelques articles disponibles dans ce rayon pendant que vous ajustez vos filtres.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {products.slice(0, 12).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e5dfd6] bg-white px-6 py-12 text-center sm:py-16">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#e5dfd6] bg-[#fbfaf8] text-[#E99856]">
        <PackageOpen className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <h3 className="mx-auto mt-4 max-w-xl font-sans text-xl font-bold text-[#1A1836] sm:text-2xl">
        {t("no_products_listed", "Cette sélection se prépare")}
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600">
        {searchQuery
          ? "Aucun article ne correspond à cette recherche pour le moment."
          : `Aucun article n’est encore disponible dans ${
              activeCategory === "Tous" ? "le catalogue" : getCategoryTranslation(activeCategory, t)
            }. Choisissez une autre étape ci-dessus ou explorez tout le catalogue.`}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onResetFiltersOnly}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-xs font-semibold text-[#1A1836] transition hover:bg-zinc-50 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" /> Réinitialiser les filtres
        </button>
        <button
          type="button"
          onClick={onExploreAllCatalog}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1A1836] px-5 text-xs font-semibold text-white transition hover:bg-zinc-800 cursor-pointer"
        >
          Explorer tout le catalogue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
