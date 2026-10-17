import React from "react";
import { Car, Clock, CheckCircle2, AlertOctagon, Archive } from "lucide-react";
import { VehicleSellerPrivateDto } from "../../domains/auto/auto.types";

interface SellerGarageStatsProps {
  listings: VehicleSellerPrivateDto[];
}

export const SellerGarageStats: React.FC<SellerGarageStatsProps> = ({ listings }) => {
  const total = listings.length;
  const activeCount = listings.filter((l) => l.status === "active").length;
  const pendingCount = listings.filter((l) => l.status === "pending_review").length;
  const rejectedCount = listings.filter((l) => l.status === "rejected").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  const statItems = [
    {
      label: "Total Véhicules",
      value: total,
      icon: Car,
      color: "text-slate-800 bg-slate-100",
    },
    {
      label: "En Ligne (Actifs)",
      value: activeCount,
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "En Modération",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-700 bg-amber-50",
    },
    {
      label: "Refusés / À corriger",
      value: rejectedCount,
      icon: AlertOctagon,
      color: "text-red-700 bg-red-50",
    },
    {
      label: "Vendus",
      value: soldCount,
      icon: Archive,
      color: "text-blue-700 bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {statItems.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3"
          >
            <div className={`p-2.5 rounded-lg ${s.color}`}>
              <Icon className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 leading-tight">{s.value}</div>
              <div className="text-[11px] font-semibold text-slate-500">{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
