import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { useTranslation } from "react-i18next";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnalyticsFunnelSection } from "./components/analytics/AnalyticsFunnelSection";

interface AnalyticsTopProduct {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
  viewsCount: number;
  image?: string;
}

interface SellerAnalyticsData {
  orderedRevenue: number;
  deliveredRevenue: number;
  totalOrders: number;
  aov: number;
  conversionRate: number;
  trackingAvailable: boolean;
  storeViews: number;
  productViews: number;
  cartAdds: number;
  statusBreakdown?: {
    created: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  trafficSources?: { direct: number; search: number; social: number; sponsored: number };
  topProducts: AnalyticsTopProduct[];
  chartData: Array<{ name: string; ordered: number; delivered: number; orders: number }>;
  followersCount: number;
  reviewsCount: number;
  averageRating: number;
}

export const SellerAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("7d");
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<SellerAnalyticsData>({
    orderedRevenue: 0,
    deliveredRevenue: 0,
    totalOrders: 0,
    aov: 0,
    conversionRate: 0,
    storeViews: 0,
    productViews: 0,
    cartAdds: 0,
    topProducts: [],
    chartData: [],
    followersCount: 0,
    reviewsCount: 0,
    averageRating: 0,
    trackingAvailable: false,
  });

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const stats = await apiGet<SellerAnalyticsData>(`/api/v1/seller/analytics?period=${period}`);
        if (!cancelled && stats) {
          setData(stats);
        }
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [currentUser, period]);

  const sb = data.statusBreakdown || { created: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 };
  const ts = data.trafficSources || { direct: 0, search: 0, social: 0, sponsored: 0 };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            {t("seller.analytics.title", "Analytics & Performance Vendeur")}
          </h2>
          <p className="text-slate-500 font-medium">{t("seller.analytics.subtitle", "Séparation stricte du CA COD encaissé vs commandé brut.")}</p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm p-1 border border-slate-200">
          {[
            { id: "7d" as const, label: "7 Jours" },
            { id: "30d" as const, label: "30 Jours" },
            { id: "90d" as const, label: "90 Jours" },
            { id: "all" as const, label: "Tout" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p.id ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">CA Livré (Encaissé COD)</p>
              <h3 className="text-2xl font-black text-emerald-700">{formatPrice(data.deliveredRevenue)}</h3>
              <span className="text-[10px] text-emerald-600 font-medium">Fonds réels reçus à la livraison</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">CA Commandé Brut</p>
              <h3 className="text-2xl font-black text-slate-900">{formatPrice(data.orderedRevenue)}</h3>
              <span className="text-[10px] text-slate-500 font-medium">Toutes commandes non annulées</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Commandes Totales</p>
              <h3 className="text-2xl font-black text-slate-900">{data.totalOrders}</h3>
              <span className="text-[10px] text-purple-600 font-medium">Panier moyen: {formatPrice(data.aov)}</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Taux de Conversion</p>
              <h3 className="text-2xl font-black text-orange-600">{data.trackingAvailable ? `${data.conversionRate.toFixed(2)}%` : "—"}</h3>
              <span className="text-[10px] text-slate-500 font-medium">{data.trackingAvailable ? `${data.storeViews} visites boutique` : t("seller.analytics.tracking_unavailable", "Suivi des visites non disponible")}</span>
            </motion.div>
          </div>

          {data.trackingAvailable ? (
            <AnalyticsFunnelSection storeViews={data.storeViews} productViews={data.productViews} cartAdds={data.cartAdds} statusBreakdown={sb} />
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-900">
              {t("seller.analytics.funnel_unavailable", "Le suivi des visites et des ajouts au panier n’est pas encore activé. Ces statistiques ne sont pas affichées.")}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-6">Évolution des Ventes : CA Livré vs Commandé</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dx={-10} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Area type="monotone" dataKey="ordered" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.1} fill="#3b82f6" name="Commandé Brut" />
                  <Area type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={3} fillOpacity={0.2} fill="#10b981" name="Livré Encaissé" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Top Produits : Vues vs Ventes Livrées</h3>
              <div className="divide-y divide-slate-100">
                {data.topProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucune donnée de vente pour cette période.</p>
                ) : (
                  data.topProducts.map((prod) => (
                    <div key={prod.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {prod.image ? <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                        </div>
                        <span className="font-bold text-slate-800 line-clamp-1">{prod.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 font-semibold shrink-0">
                        {data.trackingAvailable && <span>{prod.viewsCount} vues</span>}
                        <span className="text-emerald-700 font-black">{prod.salesCount} ventes ({formatPrice(prod.revenue)})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                Fidélisation & Canaux
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                  <span className="font-semibold text-slate-600">Abonnés Boutique</span>
                  <span className="font-black text-slate-900">{data.followersCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                  <span className="font-semibold text-slate-600">Avis Vérifiés</span>
                  <span className="font-black text-slate-900">{data.reviewsCount} ({data.averageRating.toFixed(1)} ★)</span>
                </div>
                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Sources de trafic</p>
                  {data.trackingAvailable ? <><p>Direct : {ts.direct}% | Recherche : {ts.search}%</p><p>Réseaux : {ts.social}% | Sponsorisé : {ts.sponsored}%</p></> : <p>{t("seller.analytics.traffic_unavailable", "Sources de trafic non suivies pour le moment.")}</p>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
