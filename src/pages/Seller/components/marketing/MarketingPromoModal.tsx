import React from "react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../../domains/product/product.types";

interface MarketingPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  promoForm: {
    title: string;
    description: string;
    discountType: "percentage" | "fixed_dzd";
    discountValue: number;
    selectedProductIds: string[];
    startDate: string;
    endDate: string;
  };
  setPromoForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      discountType: "percentage" | "fixed_dzd";
      discountValue: number;
      selectedProductIds: string[];
      startDate: string;
      endDate: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}

export const MarketingPromoModal: React.FC<MarketingPromoModalProps> = ({
  isOpen,
  onClose,
  products,
  promoForm,
  setPromoForm,
  onSubmit,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto text-start">
        <h3 className="text-xl font-bold text-zinc-950">{t("Créer une Campagne Promotionnelle")}</h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Titre de la promo")}</label>
            <input
              type="text"
              required
              placeholder="Ex: Soldes d'Été -15%"
              value={promoForm.title}
              onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Type de réduction")}</label>
            <select
              value={promoForm.discountType}
              onChange={(e) =>
                setPromoForm({ ...promoForm, discountType: e.target.value as "percentage" | "fixed_dzd" })
              }
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed_dzd">Montant Fixe en DZD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Valeur de la réduction")}</label>
            <input
              type="number"
              required
              min="1"
              value={promoForm.discountValue}
              onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {t("Sélectionner des produits de votre boutique")}
            </label>
            <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-xl p-2 space-y-1 bg-zinc-50">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoForm.selectedProductIds.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPromoForm({ ...promoForm, selectedProductIds: [...promoForm.selectedProductIds, p.id] });
                      } else {
                        setPromoForm({
                          ...promoForm,
                          selectedProductIds: promoForm.selectedProductIds.filter((id) => id !== p.id),
                        });
                      }
                    }}
                  />
                  <span className="font-bold truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Date de début")}</label>
              <input
                type="date"
                required
                value={promoForm.startDate}
                onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Date de fin")}</label>
              <input
                type="date"
                required
                value={promoForm.endDate}
                onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 cursor-pointer"
            >
              {t("Enregistrer la Promo")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
