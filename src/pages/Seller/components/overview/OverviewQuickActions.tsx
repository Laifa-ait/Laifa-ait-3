import React from "react";
import { Plus, ShoppingBag, Truck, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const OverviewQuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      label: t("seller.overview.new_product", "Ajouter un Produit"),
      sub: t("Catalogue & Variantes"),
      icon: Plus,
      color: "text-[#A54055]",
      bg: "bg-[#A54055]/10",
      onClick: () => navigate("/dashboard/seller/catalog?action=new"),
      id: "seller-quick-action-new-product",
    },
    {
      label: t("seller.overview.manage_orders", "Traiter les Commandes"),
      sub: t("Bordereaux & Suivi"),
      icon: ShoppingBag,
      color: "text-[#42164B]",
      bg: "bg-[#42164B]/10",
      onClick: () => navigate("/dashboard/seller/orders"),
      id: "seller-quick-action-orders",
    },
    {
      label: t("Expéditions 69 Wilayas"),
      sub: t("Tarifs Domicile & Stop-Desk"),
      icon: Truck,
      color: "text-[#E99856]",
      bg: "bg-[#E99856]/15",
      onClick: () => navigate("/dashboard/seller/shipping"),
      id: "seller-quick-action-analytics",
    },
    {
      label: t("seller.overview.studio_boutique", "Studio Boutique"),
      sub: t("Personnaliser ma vitrine"),
      icon: Palette,
      color: "text-[#622347]",
      bg: "bg-[#622347]/10",
      onClick: () => navigate("/dashboard/seller/studio"),
      id: "seller-quick-action-studio",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4" id="seller-overview-quick-actions">
      {actions.map((action) => (
        <button
          key={action.id}
          id={action.id}
          type="button"
          onClick={action.onClick}
          className="flex items-center gap-3.5 p-4 bg-white border border-[#E0B4B2]/40 rounded-2xl shadow-2xs hover:shadow-md hover:border-[#A54055]/40 transition-all group cursor-pointer text-left"
        >
          <div
            className={`w-11 h-11 rounded-xl ${action.bg} ${action.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
          >
            <action.icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs sm:text-sm font-extrabold text-[#1A1836] truncate">
              {action.label}
            </span>
            <span className="block text-[11px] text-zinc-500 truncate">{action.sub}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
