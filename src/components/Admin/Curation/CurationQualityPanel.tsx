import React from "react";
import { Sparkles, Info, Layers, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";

interface CurationQualityPanelProps {
  calculatedScore: number;
  activeProduct: Omit<Partial<Product>, "promoPrice"> & { promoPrice?: string | number };
  relatedProductsCount: number;
  duplicates: Product[];
  selectedProductId: string;
}

export const CurationQualityPanel: React.FC<CurationQualityPanelProps> = ({
  calculatedScore,
  activeProduct,
  relatedProductsCount,
  duplicates,
  selectedProductId,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E99856]" />
            <h3 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-widest">
              {t("Score de Qualité Olmart AI")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-sans font-black tabular-nums ${
                calculatedScore >= 80
                  ? "text-emerald-600"
                  : calculatedScore >= 50
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {calculatedScore}%
            </span>
            <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
              {calculatedScore >= 80
                ? t("Excellent")
                : calculatedScore >= 50
                ? t("Moyen")
                : t("Insuffisant")}
            </span>
          </div>
        </div>

        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              calculatedScore >= 80
                ? "bg-emerald-500"
                : calculatedScore >= 50
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${calculatedScore}%` }}
          />
        </div>

        <div className="bg-zinc-50 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 uppercase tracking-wide">
            <Info className="w-4 h-4 text-[#E99856]" />
            {t("Suggestions d'optimisation")}
          </div>
          <ul className="text-xs font-medium text-zinc-600 space-y-1 pl-4 list-disc">
            {(activeProduct.name || "").length < 15 && (
              <li>
                {t(
                  "Rallonger le titre pour un meilleur référencement (idéalement entre 15 et 85 caractères)"
                )}
              </li>
            )}
            {(activeProduct.description || "").length < 150 && (
              <li>
                {t(
                  "Enrichir la description pour atteindre 150 caractères et expliquer la touche créative"
                )}
              </li>
            )}
            {(activeProduct.images?.length || 0) < 3 && (
              <li>{t("Ajouter au moins 3 photos pour valoriser le rendu mobile (galerie carousel)")}</li>
            )}
            {!activeProduct.subcategory && (
              <li className="text-amber-600">
                {t("Indiquer une sous-catégorie pour faciliter le filtrage client")}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-zinc-700" />
            <h3 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-widest">
              {t("Comparaison de doublons")}
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold tabular-nums">
            {relatedProductsCount} {t("produits dans la catégorie")}
          </span>
        </div>

        {duplicates.length === 0 ? (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900">
                {t("Aucune similarité suspecte détectée")}
              </h4>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                {t(
                  "Aucun autre produit actif dans cette catégorie ne possède un nom similaire."
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-900">
                  {t("Doublons potentiels détectés !")}
                </h4>
                <p className="text-[10px] text-red-700 font-medium mt-0.5">
                  {t(
                    "Attention, des produits très similaires existent déjà. Évitez les fiches en doublon."
                  )}
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 max-h-48 overflow-y-auto pr-1">
              {duplicates.map((dup) => (
                <div key={dup.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={dup.image}
                        alt={dup.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-zinc-800 truncate">{dup.name}</h5>
                      <p className="text-[9px] text-zinc-400 font-bold">
                        {t("Boutique :")} {dup.sellerName || t("Inconnu")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="text-xs font-bold text-zinc-900">{dup.price} DA</span>
                    <p className="text-[9px] text-[#A54055] font-bold">
                      {dup.id === selectedProductId ? t("Même fiche") : t("Actif")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
