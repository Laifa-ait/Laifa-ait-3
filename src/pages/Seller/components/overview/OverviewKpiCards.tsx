import React from "react";
import { motion } from "motion/react";
import { DollarSign, ShoppingBag, Package, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../../utils/format";
import { SellerOverviewStatsData } from "../../../../types/seller";

interface OverviewKpiCardsProps {
  stats: SellerOverviewStatsData;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({ stats }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      label: t("seller.overview.total_sales", "Chiffre d'Affaires"),
      value: formatPrice(stats.totalSales),
      icon: DollarSign,
      color: "text-emerald-700",
      bg: "bg-emerald-500/10",
      to: "/dashboard/seller/analytics",
      id: "seller-kpi-total-sales",
    },
    {
      label: t("seller.overview.orders", "Commandes"),
      value: stats.orderCount,
      icon: ShoppingBag,
      color: "text-[#A54055]",
      bg: "bg-[#A54055]/10",
      to: "/dashboard/seller/orders",
      id: "seller-kpi-orders",
    },
    {
      label: t("seller.overview.active_items", "Articles Actifs"),
      value: stats.productCount,
      icon: Package,
      color: "text-[#42164B]",
      bg: "bg-[#42164B]/10",
      to: "/dashboard/seller/catalog",
      id: "seller-kpi-active-items",
    },
    {
      label: t("seller.overview.pending_returns", "Retours en attente"),
      value: stats.pendingReturns,
      icon: RotateCcw,
      color: "text-[#E99856]",
      bg: "bg-[#E99856]/15",
      to: "/dashboard/seller/returns",
      id: "seller-kpi-pending-returns",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5" id="seller-overview-kpi-cards">
      {cards.map((s, i) => (
        <motion.div
          key={s.id}
          id={s.id}
          onClick={() => navigate(s.to)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white p-5 rounded-3xl border border-[#E0B4B2]/40 shadow-2xs flex flex-col justify-between gap-3 group hover:border-[#A54055]/40 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#622347] uppercase tracking-wider">
              {s.label}
            </span>
            <div
              className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center transition-transform group-hover:scale-105`}
            >
              <s.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1A1836] tabular-nums tracking-tight">
            {s.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
