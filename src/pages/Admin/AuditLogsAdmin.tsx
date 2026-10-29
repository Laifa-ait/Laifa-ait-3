import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apiGet } from "../../lib/api";
import { Clock, User, Activity, Search, RefreshCw, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { AdminDataTable } from "../../components/ui/Admin/AdminDataTable";
import { AuditLog, AuditLogTimestamp } from "../../domains/admin/types/auditLog.types";
import { exportToCSVNative } from "../../utils/csvExport";

const formatAuditTimestamp = (ts?: AuditLogTimestamp): string => {
  if (!ts) return "N/A";
  if (ts instanceof Date) {
    return isNaN(ts.getTime()) ? "N/A" : ts.toLocaleString("fr-FR");
  }
  if (typeof ts === "string" || typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("fr-FR");
  }
  if (typeof ts === "object") {
    if ("toDate" in ts && typeof ts.toDate === "function") {
      return ts.toDate().toLocaleString("fr-FR");
    }
    if ("seconds" in ts && typeof ts.seconds === "number") {
      return new Date(ts.seconds * 1000).toLocaleString("fr-FR");
    }
    if ("_seconds" in ts && typeof ts._seconds === "number") {
      return new Date(ts._seconds * 1000).toLocaleString("fr-FR");
    }
  }
  return "N/A";
};

export const AuditLogsAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ success?: boolean; logs?: AuditLog[]; data?: { logs?: AuditLog[] } }>(
        "/api/v1/admin/audit-logs?limit=150"
      );
      const list = res?.logs || res?.data?.logs || [];
      setLogs(list);
    } catch (err: unknown) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const distinctActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (selectedAction !== "ALL" && l.action !== selectedAction) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const detailsStr = l.details ? (typeof l.details === "string" ? l.details : JSON.stringify(l.details)) : "";
        const matchAction = (l.action || "").toLowerCase().includes(q);
        const matchAdmin = (l.adminEmail || l.adminId || "").toLowerCase().includes(q);
        const matchDetails = detailsStr.toLowerCase().includes(q);
        return matchAction || matchAdmin || matchDetails;
      }
      return true;
    });
  }, [logs, selectedAction, searchQuery]);

  const handleExportCsv = () => {
    const rows = filteredLogs.map((l) => ({
      ID: l.id || "",
      Action: l.action || "N/A",
      Admin: l.adminEmail || l.adminId || "Système",
      Details: l.details ? (typeof l.details === "string" ? l.details : JSON.stringify(l.details)) : "",
      Date: formatAuditTimestamp(l.timestamp || l.createdAt),
    }));
    exportToCSVNative(rows, `olmart-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const columns = [
    {
      header: t("Action"),
      accessor: (log: AuditLog) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1836]/10 text-[#1A1836] font-sans font-bold text-[10px] uppercase tracking-wider">
          {log.action || "N/A"}
        </span>
      ),
      className: "whitespace-nowrap",
    },
    {
      header: t("Détails & Cible"),
      accessor: (log: AuditLog) => {
        const detailsString = log.details
          ? typeof log.details === "string"
            ? log.details
            : JSON.stringify(log.details)
          : log.targetId
          ? `${log.targetType || "Cible"}: ${log.targetId}`
          : "-";
        return (
          <div className="max-w-md truncate text-xs text-zinc-600 font-mono" title={detailsString}>
            {detailsString}
          </div>
        );
      },
    },
    {
      header: t("Auteur (Admin)"),
      accessor: (log: AuditLog) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <User className="w-3.5 h-3.5 text-[#A54055]" />
          <span className="font-bold text-zinc-700 text-xs font-mono">
            {log.adminEmail || log.adminId || "Système"}
          </span>
        </div>
      ),
      className: "border-l border-zinc-50",
    },
    {
      header: t("Horodatage"),
      accessor: (log: AuditLog) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap text-zinc-500 text-xs font-medium tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          {formatAuditTimestamp(log.timestamp || log.createdAt)}
        </div>
      ),
      className: "border-l border-zinc-50 text-end",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("Journaux d'Audit & Traçabilité Sécurité")}
        subtitle={t("Historique immuable des opérations administratives et contrôles d'accès.")}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              disabled={filteredLogs.length === 0}
              className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#A54055]" />
              Exporter CSV
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-4 py-2.5 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#E99856] ${loading ? "animate-spin" : ""}`} />
              Rafraîchir
            </button>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer par admin, ID cible, action..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#A54055]"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 focus:outline-none focus:border-[#A54055]"
          >
            <option value="ALL">Toutes les actions ({logs.length})</option>
            {distinctActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
          <span className="text-xs font-bold text-zinc-400 tabular-nums whitespace-nowrap">
            {filteredLogs.length} entrée(s)
          </span>
        </div>
      </div>

      <AdminDataTable<AuditLog>
        data={filteredLogs}
        columns={columns}
        keyExtractor={(item) => item.id || ""}
        isLoading={loading}
        emptyState={
          <div className="p-12 text-center text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-300 opacity-50" />
            <p className="font-medium">{t("Aucun journal d'audit correspondant.")}</p>
          </div>
        }
      />
    </div>
  );
};
