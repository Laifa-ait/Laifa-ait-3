import React from "react";
import { Check, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductFormData } from "../../../../types/seller";
import {
  SUPPORTED_ALGERIAN_CARRIERS,
  CARRIERS_WITHOUT_ONLINE_PRICING
} from "../../../../domains/shipping/services/algerianCarriersData";

interface CarrierCardsSelectorProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export const CarrierCardsSelector: React.FC<CarrierCardsSelectorProps> = ({
  formData,
  setFormData
}) => {
  const { t } = useTranslation();
  const selectedCarriers = formData.shippingCarriers || ["yalidine"];
  const defaultCarrier = formData.defaultShippingCarrier || "yalidine";

  const toggleCarrier = (carrierId: string) => {
    const exists = selectedCarriers.includes(carrierId);
    let next: string[];
    if (exists) {
      if (selectedCarriers.length === 1) return;
      next = selectedCarriers.filter((id) => id !== carrierId);
    } else {
      next = [...selectedCarriers, carrierId];
    }
    const nextDefault = next.includes(defaultCarrier) ? defaultCarrier : next[0];
    setFormData((prev) => ({
      ...prev,
      shippingCarriers: next,
      defaultShippingCarrier: nextDefault
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          {t("Compagnies de Livraison Disponibles (Tarifs en ligne)")}
        </label>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ✓ Calcul automatique garanti
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        {t("Sélectionnez les transporteurs algériens avec lesquels vous expédiez vos colis. Leurs grilles tarifaires officielles sont appliquées automatiquement.")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUPPORTED_ALGERIAN_CARRIERS.map((c) => {
          const isSelected = selectedCarriers.includes(c.id);
          const isDefault = defaultCarrier === c.id;

          return (
            <div
              key={c.id}
              onClick={() => toggleCarrier(c.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "border-[#C75C1A] bg-[#FFFBF5] ring-2 ring-[#C75C1A]/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-[#C75C1A] font-black text-xs flex items-center justify-center">
                    {c.name.substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{c.name}</h5>
                    <span className="text-[10px] text-slate-500">{c.nameAr}</span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "bg-[#C75C1A] border-[#C75C1A]" : "border-slate-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
              </div>

              <div className="text-[10px] text-slate-600 line-clamp-2 mt-1">
                {c.description}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-700">5 kg inclus</span>
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, defaultShippingCarrier: c.id }));
                    }}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                      isDefault
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 hover:text-[#C75C1A]"
                    }`}
                  >
                    {isDefault ? "★ Par défaut" : "Définir par défaut"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-900 leading-relaxed">
          <span className="font-bold">Information transporteurs :</span> Les compagnies{" "}
          {CARRIERS_WITHOUT_ONLINE_PRICING.map((c) => c.name).join(", ")} ne publient pas de grille tarifaire ouverte en ligne. Conformément à la politique d'affichage certifié Olmart, elles ne sont pas intégrées pour le calcul automatique.
        </div>
      </div>
    </div>
  );
};
