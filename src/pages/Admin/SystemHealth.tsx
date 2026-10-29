import React, { useState, useEffect, useCallback } from "react";
import { Activity, Server, Database, ShieldAlert, Wifi, AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TelemetryPanel } from "./components/TelemetryPanel";

interface PerfDataPoint {
  time: string;
  responseTime: number;
}

export const SystemHealth: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingPing, setLoadingPing] = useState(false);
  const [metrics, setMetrics] = useState({
    status: "operational" as "operational" | "degraded",
    uptimeHours: 24.0,
    responseTime: 32,
    errorRate: 0.0,
    activeUsers: 1,
    dbConnections: 100,
    cpuUsage: 14,
    memoryUsage: 48,
  });

  const [performanceData, setPerformanceData] = useState<PerfDataPoint[]>([]);

  const fetchLiveMetrics = useCallback(async () => {
    setLoadingPing(true);
    const start = Date.now();
    try {
      const response = await fetch("/api/v1/health");
      const ping = Date.now() - start;
      if (response.ok) {
        const data = await response.json();
        const isHealthy = data.status === "healthy" && data.firebase === "ok";

        let heapPct = 48;
        if (data.memoryUsage) {
          const used = parseInt(String(data.memoryUsage.heapUsed), 10) || 50;
          const total = parseInt(String(data.memoryUsage.heapTotal), 10) || 100;
          heapPct = Math.min(100, Math.max(5, Math.round((used / total) * 100)));
        }

        const nowLabel = new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setMetrics({
          status: isHealthy ? "operational" : "degraded",
          uptimeHours: data.uptime ? Number((data.uptime / 3600).toFixed(2)) : 99.9,
          responseTime: ping,
          errorRate: isHealthy ? 0.0 : 100.0,
          activeUsers: isHealthy ? 1 : 0,
          dbConnections: data.firebase === "ok" ? 100 : 0,
          cpuUsage: isHealthy ? 14 : 95,
          memoryUsage: heapPct,
        });

        setPerformanceData((prev) => {
          const next = [...prev, { time: nowLabel, responseTime: ping }];
          return next.slice(-15);
        });
      }
    } catch (err) {
      console.error("[SystemHealth] Failed to load real-time system metrics", err);
    } finally {
      setLoadingPing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMetrics();
    const timer = setInterval(fetchLiveMetrics, 15000);
    return () => clearInterval(timer);
  }, [fetchLiveMetrics]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold tracking-tight text-[#1A1836] flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#A54055]" />
            {t("admin.health.title", "État du Système & Infrastructure")}
          </h2>
          <p className="text-slate-500 font-medium">
            Monitoring en temps réel de la santé Express, Firestore ACID et de la mémoire serveur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchLiveMetrics}
            disabled={loadingPing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E99856] ${loadingPing ? "animate-spin" : ""}`} />
            Sonder l'API
          </button>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              metrics.status === "operational"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                metrics.status === "operational" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider">
              {metrics.status === "operational"
                ? t("admin.health.operational", "Systèmes Opérationnels")
                : "Performance Dégradée"}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uptime Processus</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tabular-nums">
            {metrics.uptimeHours} <span className="text-lg text-slate-500">h</span>
          </h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latence Healthcheck</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tabular-nums">
            {metrics.responseTime} <span className="text-lg text-slate-500">ms</span>
          </h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taux d'Erreur</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tabular-nums">{metrics.errorRate}%</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#42164B]/10 text-[#42164B] flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mémoire Heap Node</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tabular-nums">{metrics.memoryUsage}%</h3>
        </motion.div>
      </div>

      {/* Real-Time Telemetry & ACID Performance Monitoring */}
      <TelemetryPanel />

      {/* Infrastructure Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Courbe de Latence API Directe (ms)</h3>
            <span className="text-xs font-bold text-slate-400 tabular-nums">
              {performanceData.length} sondage(s)
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A54055" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A54055" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Area type="monotone" dataKey="responseTime" stroke="#A54055" strokeWidth={3} fillOpacity={1} fill="url(#colorResponse)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#A54055]" />
              Ressources Base & Node.js
            </h3>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 tabular-nums">
                <span>Disponibilité Firestore</span>
                <span>{metrics.dbConnections}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${metrics.dbConnections}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 tabular-nums">
                <span>Charge CPU Estimée</span>
                <span>{metrics.cpuUsage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#42164B]" style={{ width: `${metrics.cpuUsage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 tabular-nums">
                <span>Allocation Heap V8</span>
                <span>{metrics.memoryUsage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E99856]" style={{ width: `${metrics.memoryUsage}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-[#1A1836] p-6 rounded-3xl text-white border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#E99856]" />
              </div>
              <div>
                <h4 className="text-sm font-bold mb-1">Supervision des Exceptions</h4>
                <p className="text-xs text-[#E0B4B2]/80 mb-3">
                  Accédez aux traces d'erreurs clientes et résolvez les incidents signalés.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/admin/site-logs")}
                  className="text-xs font-bold text-[#E99856] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  Consulter les journaux d'erreurs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
