import React from "react";
import { motion } from "motion/react";
import { ShoppingCart, ArrowUp, CreditCard, Store, ShieldAlert } from "lucide-react";
import { formatPrice } from "../../../utils/format";
import { OverviewStats } from "../../../types/adminOverview";

interface OverviewKpiCardsProps {
  stats: OverviewStats;
  disputeCount: number;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({ stats, disputeCount }) => {
  const activeVendorsCount = stats.activeVendors || 0;
  const pendingVendorsCount = stats.pendingVendors || 0;
  const pendingSubsCount = stats.pendingSubRequests || 0;
  const totalVolumeDZD = stats.totalSales || 0;
  const netRevenueDZD = stats.netRevenue || 0;
  const pendingProductsCount = stats.pendingProducts || 0;

  const cards = [
    {
      label: "Volume Brut Global (GMV)",
      value: formatPrice(totalVolumeDZD),
      icon: CreditCard,
      inc: `Revenu Net / MRR : ${formatPrice(netRevenueDZD)}`,
      color: "bg-[#A54055]/10 text-[#A54055]",
      positive: true,
    },
    {
      label: "Boutiques Certifiées & KYC",
      value: `${activeVendorsCount} actives`,
      icon: Store,
      inc: `${pendingVendorsCount} KYC en attente • ${pendingSubsCount} abonnements`,
      color: "bg-[#42164B]/10 text-[#42164B]",
      positive: pendingVendorsCount === 0,
    },
    {
      label: "Total Commandes & Catalogue",
      value: `${stats.totalOrders} commandes`,
      icon: ShoppingCart,
      inc: `${stats.totalProducts ?? 0} produits (${pendingProductsCount} à modérer)`,
      color: "bg-emerald-50 text-emerald-700",
      positive: true,
    },
    {
      label: "Litiges Séquestre & Incidents",
      value: `${disputeCount} litige(s)`,
      icon: ShieldAlert,
      inc: `${stats.unresolvedSiteErrors ?? 0} erreur(s) système ouverte(s)`,
      color: disputeCount > 0 ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-700",
      positive: disputeCount === 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((k, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white p-6 md:p-7 rounded-3xl border border-zinc-200/80 shadow-sm relative overflow-hidden"
        >
          <div className={`w-11 h-11 rounded-2xl ${k.color} flex items-center justify-center mb-5`}>
            <k.icon className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-sans font-bold text-zinc-500 uppercase tracking-wider mb-1">
            {k.label}
          </p>
          <h4 className="text-2xl font-sans font-extrabold text-[#1A1836] tracking-tight tabular-nums mb-3">
            {k.value}
          </h4>
          <div
            className={`flex items-center gap-1.5 font-sans font-bold text-[11px] tabular-nums ${
              k.positive ? "text-emerald-600" : "text-[#A54055]"
            }`}
          >
            <ArrowUp className={`w-3.5 h-3.5 ${k.positive ? "" : "rotate-45"}`} />
            <span>{k.inc}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
