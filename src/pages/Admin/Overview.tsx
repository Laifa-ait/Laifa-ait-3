import React, { Suspense } from "react";
import { RefreshCw, BarChart3, Activity } from "lucide-react";

const OverviewChart = React.lazy(() => import("../../components/Admin/OverviewChart"));
const TrafficChart = React.lazy(() => import("../../components/Admin/TrafficChart"));

import { WorkspaceActions } from "../../components/Admin/WorkspaceActions";
import { AdminManualGuide } from "../../components/Admin/AdminManualGuide";
import { useAdminOverview } from "./hooks/useAdminOverview";

import { OverviewKpiCards } from "../../components/Admin/Overview/OverviewKpiCards";
import { OverviewQuickActions } from "../../components/Admin/Overview/OverviewQuickActions";
import { OverviewFunnelAnalytics } from "../../components/Admin/Overview/OverviewFunnelAnalytics";
import { OverviewTopLists } from "../../components/Admin/Overview/OverviewTopLists";
import { OverviewGlobalOrdersTable } from "../../components/Admin/Overview/OverviewGlobalOrdersTable";

export const Overview: React.FC = () => {
  const {
    t,
    stats,
    data,
    recentEvents,
    globalOrders,
    loadingOrders,
    insights,
    analyticsEvents,
    loadingRefresh,
    refreshAnalytics,
    debouncedRefresh,
    disputeCount,
    topProducts,
    topSellers,
    wilayaStats,
    realTimeTraffic,
  } = useAdminOverview();

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold uppercase tracking-tight text-zinc-900 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#A54055] shrink-0" />
            <span>{t("Tableau de Bord Exécutif")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            {t("Vue synthétique des métriques financières, de l'état des opérations et des alertes critiques.")}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => {
              refreshAnalytics();
              debouncedRefresh();
            }}
            disabled={loadingRefresh}
            className="min-h-[44px] px-5 py-2.5 bg-[#1A1836] text-white hover:bg-[#42164B] rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#E99856] ${loadingRefresh ? "animate-spin" : ""}`} />
            <span>{t("Actualiser")}</span>
          </button>
        </div>
      </div>

      <OverviewKpiCards stats={stats} disputeCount={disputeCount} />

      <OverviewQuickActions />

      <AdminManualGuide />

      <WorkspaceActions />

      <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] p-4 sm:p-6 md:p-10 border border-zinc-100 shadow-sm space-y-4 sm:space-y-6">
        <h3 className="text-sm sm:text-lg font-sans font-bold text-zinc-900 uppercase tracking-wide">
          {t("Évolution des Revenus & Commandes")}
        </h3>
        <div className="h-[240px] sm:h-[320px] md:h-[350px] w-full">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#A54055] border-t-transparent rounded-full animate-spin" /></div>}>
            <OverviewChart data={data} />
          </Suspense>
        </div>
      </div>

      <OverviewFunnelAnalytics analyticsEvents={analyticsEvents} insights={insights} onRefresh={refreshAnalytics} />

      <OverviewTopLists topProducts={topProducts} topSellers={topSellers} wilayaStats={wilayaStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] p-4 sm:p-6 md:p-10 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-50 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <h4 className="text-sm sm:text-xl font-sans font-bold flex items-center gap-3 text-zinc-900">
              <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-[#A54055] animate-pulse shrink-0" />
              <span>{t("Graphique de Trafic & Conversions en Temps Réel")}</span>
            </h4>
          </div>
          <div className="h-[220px] sm:h-[280px] md:h-[300px] w-full">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#A54055] border-t-transparent rounded-full animate-spin" /></div>}>
              <TrafficChart data={realTimeTraffic} t={t} />
            </Suspense>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 sm:p-8 border-b border-zinc-50">
            <h4 className="text-base sm:text-lg font-sans font-bold flex items-center gap-3">
              <Activity className="w-5 h-5 text-[#E99856]" />
              {t("Flux d'Activité")}
            </h4>
          </div>
          <div className="flex-1 divide-y divide-zinc-50 overflow-y-auto max-h-[340px]">
            {recentEvents.map((e, i) => (
              <div key={i} className="p-4 sm:p-6 hover:bg-zinc-50/50 transition-colors flex gap-3.5">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${(e.color || "text-zinc-400").replace("text-", "bg-")}`} />
                <div>
                  <p className="text-xs font-sans font-bold text-zinc-950 leading-tight">{e.label}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 tabular-nums">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OverviewGlobalOrdersTable globalOrders={globalOrders} loadingOrders={loadingOrders} />
    </div>
  );
};

