import React, { useEffect, useState, useCallback } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, Zap, Cpu, RefreshCw, ShieldAlert } from "lucide-react";
import { apiGet } from "../../../lib/api";
import { TelemetryTable, TransactionMetric } from "./TelemetryTable";

export interface TelemetryData {
  activeBackgroundTasks: number;
  totalTrackedTransactions: number;
  avgTransactionDurationMs: number;
  p95DurationMs: number;
  successRatePercent: number;
  window10mAvgDurationMs: number;
  window10mCount: number;
  highLatencyAlert: boolean;
  recentTransactions: TransactionMetric[];
}

export const TelemetryPanel: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchTelemetry = useCallback(async () => {
    try {
      const response = await apiGet<{ success?: boolean; data?: TelemetryData } & Partial<TelemetryData>>("/api/v1/admin/telemetry");
      const payload = (response.data ? response.data : response) as TelemetryData;
      setTelemetry(payload);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      console.error("[TelemetryPanel] Failed to fetch telemetry metrics", err);
      setError("Impossible de charger les métriques de télémétrie en temps réel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const isCritical =
    telemetry && (telemetry.highLatencyAlert || telemetry.successRatePercent < 95);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Télémétrie & Perfs ACID (Ring Buffer)</h3>
            <p className="text-xs text-slate-400">
              Monitoring in-memory des transactions Firestore & workers d'arrière-plan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            MàJ : {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchTelemetry}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {isCritical && telemetry && (
        <div className="p-5 bg-red-900/90 text-white rounded-3xl border-2 border-red-500 shadow-lg flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-300 flex items-center justify-center shrink-0 border border-red-400/30">
            <ShieldAlert className="w-6 h-6 text-red-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold uppercase tracking-wide flex items-center gap-2 text-red-200">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              Alerte Critique — Dégradation des Performances Métier
            </h4>
            <div className="text-xs text-red-100 mt-1 space-y-1">
              {telemetry.highLatencyAlert && (
                <p>
                  • <strong>Haute Latence Détectée :</strong> Latence moyenne sur 10 min ={" "}
                  <span className="font-mono underline font-bold text-amber-200">
                    {telemetry.window10mAvgDurationMs} ms
                  </span>{" "}
                  (seuil critique : 800 ms sur {telemetry.window10mCount} transaction(s)).
                </p>
              )}
              {telemetry.successRatePercent < 95 && (
                <p>
                  • <strong>Taux d'Échec Élevé :</strong> Taux de succès des transactions ={" "}
                  <span className="font-mono underline font-bold text-red-200">
                    {telemetry.successRatePercent}%
                  </span>{" "}
                  (seuil minimal : 95%).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {/* KPI Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Workers Actifs</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {telemetry?.activeBackgroundTasks ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tâches asynchrones</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Latence Moyenne</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {telemetry?.avgTransactionDurationMs ?? 0} <span className="text-sm font-normal text-slate-500">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sur {telemetry?.totalTrackedTransactions ?? 0} échantillons
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Latence p95</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {telemetry?.p95DurationMs ?? 0} <span className="text-sm font-normal text-slate-500">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Percentile 95</p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between ${
          telemetry?.highLatencyAlert ? "bg-amber-50 border-amber-300" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">F. Glissante 10m</span>
            <Clock className={`w-4 h-4 ${telemetry?.highLatencyAlert ? "text-amber-600" : "text-emerald-600"}`} />
          </div>
          <div className={`text-3xl font-extrabold font-mono ${
            telemetry?.highLatencyAlert ? "text-amber-900" : "text-slate-900"
          }`}>
            {telemetry?.window10mAvgDurationMs ?? 0} <span className="text-sm font-normal text-slate-500">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {telemetry?.window10mCount ?? 0} trans. (Seuil : 800ms)
          </p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between ${
          (telemetry?.successRatePercent ?? 100) < 95 ? "bg-red-50 border-red-300" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Taux de Succès</span>
            <CheckCircle2 className={`w-4 h-4 ${(telemetry?.successRatePercent ?? 100) < 95 ? "text-red-600" : "text-emerald-600"}`} />
          </div>
          <div className={`text-3xl font-extrabold font-mono ${
            (telemetry?.successRatePercent ?? 100) < 95 ? "text-red-900" : "text-slate-900"
          }`}>
            {telemetry?.successRatePercent ?? 100} <span className="text-sm font-normal text-slate-500">%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">ACID transactions</p>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <TelemetryTable transactions={telemetry?.recentTransactions ?? []} />
    </div>
  );
};
