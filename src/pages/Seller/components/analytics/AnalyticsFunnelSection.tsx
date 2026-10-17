import React from "react";
import { Eye, Truck, Clock, CheckCircle2, RotateCcw } from "lucide-react";

interface FunnelProps {
  storeViews: number;
  productViews: number;
  cartAdds: number;
  statusBreakdown: {
    created: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
}

export const AnalyticsFunnelSection: React.FC<FunnelProps> = ({
  storeViews,
  productViews,
  cartAdds,
  statusBreakdown: sb,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Eye className="w-4 h-4 text-orange-600" />
          Entonnoir d&apos;Achat Client
        </h3>
        <div className="space-y-3">
          {[
            { label: "Visites Boutique", count: storeViews, pct: 100, color: "bg-slate-800" },
            { label: "Vues Produits", count: productViews, pct: Math.min(100, Math.round((productViews / Math.max(1, storeViews)) * 100)), color: "bg-blue-600" },
            { label: "Ajouts au Panier", count: cartAdds, pct: Math.min(100, Math.round((cartAdds / Math.max(1, storeViews)) * 100)), color: "bg-amber-500" },
            { label: "Commandes Livrées", count: sb.delivered, pct: Math.min(100, Math.round((sb.delivered / Math.max(1, storeViews)) * 100)), color: "bg-emerald-600" },
          ].map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{step.label}</span>
                <span>{step.count} ({step.pct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${step.color} transition-all duration-500 rounded-full`} style={{ width: `${Math.max(5, step.pct)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-600" />
          Répartition des Commandes par Statut
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-slate-500" />
            <p className="text-[10px] uppercase font-bold text-slate-400">En attente</p>
            <p className="text-lg font-black text-slate-800">{sb.created}</p>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
            <p className="text-[10px] uppercase font-bold text-blue-600">Confirmée</p>
            <p className="text-lg font-black text-blue-900">{sb.confirmed}</p>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
            <Truck className="w-4 h-4 mx-auto mb-1 text-amber-600" />
            <p className="text-[10px] uppercase font-bold text-amber-600">Expédiée</p>
            <p className="text-lg font-black text-amber-900">{sb.shipped}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
            <p className="text-[10px] uppercase font-bold text-emerald-600">Livrée COD</p>
            <p className="text-lg font-black text-emerald-800">{sb.delivered}</p>
          </div>
          <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-center col-span-2 sm:col-span-1">
            <RotateCcw className="w-4 h-4 mx-auto mb-1 text-red-600" />
            <p className="text-[10px] uppercase font-bold text-red-600">Annulée / Retour</p>
            <p className="text-lg font-black text-red-800">{sb.cancelled + sb.returned}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
