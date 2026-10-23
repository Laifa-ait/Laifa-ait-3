import React from "react";
import { useTranslation } from "react-i18next";
import { Tag, Plus, Calendar, ShoppingBag, Trash2 } from "lucide-react";
import { SellerPromoCampaign } from "../../services/sellerMarketing.service";

interface MarketingPromosTabProps {
  promos: SellerPromoCampaign[];
  onOpenPromoModal: () => void;
  onDeletePromo: (id: string) => void;
}

export const MarketingPromosTab: React.FC<MarketingPromosTabProps> = ({
  promos,
  onOpenPromoModal,
  onDeletePromo,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-start">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-wide">
          {t("Vos Réductions et Promotions à Durée Limitée")}
        </h3>
        <button
          onClick={onOpenPromoModal}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("Créer une Promotion")}</span>
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 space-y-4">
          <Tag className="w-12 h-12 text-zinc-300 mx-auto" />
          <p className="text-sm font-bold text-zinc-600">{t("Aucune promotion active ou programmée.")}</p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {t("Créez des remises temporaires en % ou en DZD sur vos produits pour stimuler vos ventes.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4 relative">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : p.status === "scheduled"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {p.status === "active" ? "PROMO ACTIVE" : p.status === "scheduled" ? "PROGRAMMÉE" : "TERMINÉE"}
                  </span>
                  <h4 className="text-base font-bold text-zinc-950 mt-2">{p.title}</h4>
                  {p.description && <p className="text-xs text-zinc-500">{p.description}</p>}
                </div>

                <button
                  onClick={() => onDeletePromo(p.id)}
                  className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-950">{t("Réduction")}</span>
                <span className="text-lg font-black text-orange-600">
                  -{p.discountValue} {p.discountType === "percentage" ? "%" : "DZD"}
                </span>
              </div>

              <div className="text-xs text-zinc-500 font-medium space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Du {new Date(p.startDate).toLocaleDateString("fr-FR")} au {new Date(p.endDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{p.productIds.length} produit(s) concerné(s)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
