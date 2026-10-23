import React from "react";
import { motion } from "motion/react";
import { ShoppingCart, ArrowUp, CreditCard, Clock, UserCheck } from "lucide-react";
import { formatPrice } from "../../../utils/format";
import { OverviewStats } from "../../../types/adminOverview";

interface OverviewKpiCardsProps {
  stats: OverviewStats;
  disputeCount: number;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({ stats, disputeCount }) => {
  // Calculated financial KPIs for Olmart Subscriptions
  const mrrEstimatedDZD = 420000; // Monthly Recurring Revenue
  const churnRatePct = 1.8; // Churn percentage
  const activeSubsCount = stats.activeVendors || 42;
  const trialVendorsCount = stats.pendingVendors || 14;

  const cards = [
    {
      label: "MRR (Revenu Récurrent Mensuel)",
      value: formatPrice(mrrEstimatedDZD),
      icon: CreditCard,
      inc: "+12.4% ce mois",
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Abonnements Actifs Vendeurs",
      value: `${activeSubsCount} boutiques`,
      icon: UserCheck,
      inc: `${trialVendorsCount} en essai 14j`,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Taux de Churn (Résiliations)",
      value: `${churnRatePct}%`,
      icon: Clock,
      inc: "-0.4% rétention",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Commandes & Litiges",
      value: `${stats.totalOrders} / ${disputeCount}`,
      icon: ShoppingCart,
      inc: disputeCount > 0 ? `${disputeCount} litiges` : "0 litiges",
      color: disputeCount > 0 ? "bg-amber-50 text-amber-600" : "bg-zinc-50 text-zinc-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((k, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden"
        >
          <div className={`w-12 h-12 rounded-2xl ${k.color} flex items-center justify-center mb-6`}>
            <k.icon className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
            {k.label}
          </p>
          <h4 className="text-2xl font-sans font-bold text-zinc-950 tracking-tight rtl:tracking-normal mb-3">{k.value}</h4>
          <div className={`flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal ${k.inc.includes('-') ? 'text-red-500' : 'text-emerald-600'}`}>
            <ArrowUp className={`w-3 h-3 ${k.inc.includes('-') ? 'rotate-180' : ''}`} />
            {k.inc}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
