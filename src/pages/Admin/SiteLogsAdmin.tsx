import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Bug, CheckCircle2, Clock, RefreshCw, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiGet, apiPatch, apiPost } from "../../lib/api";

interface SiteError {
  id: string;
  type?: string;
  url?: string;
  stack?: string;
  componentStack?: string;
  message: string;
  source?: string;
  resolved?: boolean;
  timestamp?: string;
  userAgent?: string;
}

export const SiteLogsAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<SiteError[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "unresolved" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSiteErrors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: SiteError[] }>("/api/v1/admin/site-errors");
      setErrors(res?.data || []);
    } catch (error) {
      console.error("Error fetching site errors:", error);
      toast.error("Impossible de charger les journaux d'erreurs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteErrors();
  }, [fetchSiteErrors]);

  const handleResolveError = async (errorId: string, currentResolved: boolean) => {
    try {
      const nextResolved = !currentResolved;
      await apiPatch(`/api/v1/admin/site-errors/${errorId}/resolve`, { resolved: nextResolved });
      setErrors((prev) => prev.map((e) => (e.id === errorId ? { ...e, resolved: nextResolved } : e)));
      toast.success(nextResolved ? "Erreur marquée comme résolue" : "Erreur réouverte");
    } catch (error) {
      console.error("Error updating site error:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleClearResolved = async () => {
    try {
      const res = await apiPost<{ success: boolean; data: { deletedCount: number } }>(
        "/api/v1/admin/site-errors/clear-resolved",
        {}
      );
      const deleted = res?.data?.deletedCount ?? 0;
      toast.success(`${deleted} erreur(s) résolue(s) purgée(s)`);
      await fetchSiteErrors();
    } catch (error) {
      console.error("Error clearing resolved errors:", error);
      toast.error("Échec de la purge des erreurs résolues");
    }
  };

  const filteredErrors = useMemo(() => {
    return errors.filter((err) => {
      if (filterTab === "unresolved" && err.resolved) return false;
      if (filterTab === "resolved" && !err.resolved) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (err.message || "").toLowerCase().includes(q) ||
          (err.url || "").toLowerCase().includes(q) ||
          (err.source || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [errors, filterTab, searchQuery]);

  const unresolvedCount = useMemo(() => errors.filter((e) => !e.resolved).length, [errors]);
  const resolvedCount = useMemo(() => errors.filter((e) => e.resolved).length, [errors]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#1A1836] tracking-tight flex items-center gap-3">
            <Bug className="w-7 h-7 text-[#A54055]" />
            <span>Supervision des Exceptions Frontend</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">
            {t("Remontée automatique et résolution transactionnelle des exceptions clientes.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {resolvedCount > 0 && (
            <button
              onClick={handleClearResolved}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Purger résolues ({resolvedCount})
            </button>
          )}
          <button
            onClick={fetchSiteErrors}
            disabled={loading}
            className="px-4 py-2.5 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#E99856] ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(
            [
              { id: "all", label: `Toutes (${errors.length})` },
              { id: "unresolved", label: `Ouvertes (${unresolvedCount})` },
              { id: "resolved", label: `Résolues (${resolvedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer tabular-nums ${
                filterTab === tab.id
                  ? "bg-[#1A1836] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher message, route..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#A54055]"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 font-medium tracking-wide animate-pulse">
            {t("Chargement des erreurs détectées...")}
          </div>
        ) : filteredErrors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-zinc-900 font-bold uppercase tracking-wider text-sm mb-1">
              {t("Aucune erreur détectée")}
            </p>
            <p className="text-zinc-500 text-xs">
              {t("Le système est stable et aucune exception ne correspond à ce filtre.")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredErrors.map((error) => (
              <div
                key={error.id}
                className={`p-6 rounded-2xl border transition-all ${
                  error.resolved
                    ? "bg-zinc-50 border-zinc-200 opacity-65"
                    : "bg-red-50/40 border-red-200/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {error.resolved ? (
                        <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                          {t("Résolu")}
                        </span>
                      ) : (
                        <span className="bg-[#A54055] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                          {t("Ouvert")}
                        </span>
                      )}
                      <span className="text-zinc-500 text-xs font-mono tabular-nums flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {error.timestamp ? new Date(error.timestamp).toLocaleString("fr-FR") : "Récemment"}
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                        {error.source || "Frontend"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-1 break-words">{error.message}</h3>
                    {error.url && (
                      <p className="text-xs text-zinc-500 truncate font-mono mb-2">Route : {error.url}</p>
                    )}

                    {error.stack && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer font-bold uppercase tracking-wider text-[10px] text-zinc-500 mb-2 hover:text-zinc-800">
                          {t("Afficher la trace d'exécution (Stack)")}
                        </summary>
                        <pre className="bg-[#1A1836] text-emerald-400 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => handleResolveError(error.id, !!error.resolved)}
                      className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition-colors border cursor-pointer ${
                        error.resolved
                          ? "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                          : "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-sm"
                      }`}
                    >
                      {error.resolved ? "Réouvrir" : "Marquer Résolu"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
