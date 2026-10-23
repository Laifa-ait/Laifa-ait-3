import React, { useEffect, useState, useCallback } from "react";
import {
  Car,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { autoAdminClient } from "../../domains/auto/autoAdmin.client";
import { AdminModerationListingItemDto, AdminReportItemDto } from "../../domains/auto/autoAdmin.types";
import { getWilayaNameById } from "../../domains/auto/auto.utils";
import { AutoRejectModal } from "./components/AutoRejectModal";
import { AutoModerationCard } from "./components/AutoModerationCard";

export const AutoModerationAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "reports" | "rejected">("pending");
  const [pendingList, setPendingList] = useState<AdminModerationListingItemDto[]>([]);
  const [rejectedList, setRejectedList] = useState<AdminModerationListingItemDto[]>([]);
  const [reportsList, setReportsList] = useState<AdminReportItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [rejectingItem, setRejectingItem] = useState<AdminModerationListingItemDto | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [modRes, repRes] = await Promise.all([
        autoAdminClient.getPendingModeration(),
        autoAdminClient.getReports(),
      ]);
      setPendingList(modRes.pending);
      setRejectedList(modRes.rejected);
      setReportsList(repRes);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await autoAdminClient.approveListing(id);
      await loadData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingItem) return;
    setActionLoadingId(rejectingItem.id);
    try {
      await autoAdminClient.rejectListing(rejectingItem.id, reason);
      await loadData();
    } finally {
      setActionLoadingId(null);
      setRejectingItem(null);
    }
  };

  const handleToggleBadge = async (id: string, current: boolean) => {
    setActionLoadingId(id);
    try {
      await autoAdminClient.toggleVerifiedBadge(id, !current);
      await loadData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDismissReport = async (id: string) => {
    setActionLoadingId(id);
    try {
      await autoAdminClient.dismissReport(id);
      await loadData();
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Console de Modération Olma Auto
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Contrôle technique & conformité des annonces automobiles (69 Wilayas)
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "pending"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            En attente ({pendingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "reports"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Signalements ({reportsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "rejected"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rejetées ({rejectedList.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-xs text-slate-500">Chargement des données de modération...</p>
        </div>
      ) : activeTab === "pending" ? (
        pendingList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Toutes les annonces sont traitées</h3>
            <p className="text-xs text-slate-500">Aucune annonce de véhicule en attente de validation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((item) => (
              <AutoModerationCard
                key={item.id}
                item={item}
                isActionLoading={actionLoadingId === item.id}
                onApprove={handleApprove}
                onReject={(it) => setRejectingItem(it)}
                onToggleBadge={handleToggleBadge}
              />
            ))}
          </div>
        )
      ) : activeTab === "reports" ? (
        reportsList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Aucun signalement actif</h3>
            <p className="text-xs text-slate-500">Toutes les alertes communautaires ont été traitées.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportsList.map((rep) => (
              <div key={rep.id} className="p-4 bg-white border border-rose-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-950 uppercase">Motif : {rep.reason}</h4>
                    {rep.details && <p className="text-xs text-slate-600 mt-0.5">"{rep.details}"</p>}
                    <p className="text-[10px] text-slate-400 mt-1">Annonce ciblée : Réf #{rep.listingId}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDismissReport(rep.id)}
                  disabled={actionLoadingId === rep.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
                >
                  Classer sans suite
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {rejectedList.map((rej) => (
            <div key={rej.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{rej.title}</h4>
                <p className="text-xs text-rose-600 font-medium mt-0.5">Motif : {rej.rejectionReason || "Non précisé"}</p>
                <p className="text-[10px] text-slate-400 mt-1">Vendeur : {rej.sellerDisplayName} • {getWilayaNameById(rej.wilayaId)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleApprove(rej.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Ré-approuver
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <AutoRejectModal
        isOpen={Boolean(rejectingItem)}
        listingTitle={rejectingItem?.title || ""}
        onClose={() => setRejectingItem(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};
