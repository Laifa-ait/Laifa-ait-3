import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Trash2,
  MapPin,
  Search,
  RefreshCw,
  FileCheck2,
  Database,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiGet, apiPut, apiDelete, apiPost } from "../../lib/api";
import { useConfirm } from "../../hooks/useConfirm";

interface RealEstateProApplication {
  id: string;
  displayName?: string;
  email?: string;
  phone?: string;
  wilaya?: string;
  realEstateProInfo?: {
    companyName?: string;
    rcNumber?: string;
    agrementNumber?: string;
    verificationStatus?: "pending" | "verified" | "rejected";
  };
}

interface RealEstatePropertyItem {
  id: string;
  title: string;
  transactionType?: string;
  propertyType?: string;
  price?: number;
  wilaya?: string;
  commune?: string;
  isLegalVerified?: boolean;
}

export const ImmoModerationAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();
  const [activeTab, setActiveTab] = useState<"properties" | "agencies">("properties");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [proStatusFilter, setProStatusFilter] = useState<"pending" | "verified" | "rejected">("pending");
  const [applications, setApplications] = useState<RealEstateProApplication[]>([]);
  const [properties, setProperties] = useState<RealEstatePropertyItem[]>([]);

  const fetchImmoData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "agencies") {
        const res = await apiGet<{ success: boolean; data: RealEstateProApplication[] }>(
          `/api/v1/real-estate/admin/pro-applications?status=${proStatusFilter}`
        );
        if (res.success && Array.isArray(res.data)) setApplications(res.data);
      } else {
        const res = await apiGet<{ success: boolean; data: RealEstatePropertyItem[] }>(
          "/api/v1/real-estate/properties?limit=60"
        );
        if (res.success && Array.isArray(res.data)) setProperties(res.data);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur de chargement Olma Immo");
    } finally {
      setLoading(false);
    }
  }, [activeTab, proStatusFilter]);

  useEffect(() => {
    void fetchImmoData();
  }, [fetchImmoData]);

  const handleProStatus = async (userId: string, status: "verified" | "rejected") => {
    const confirmed = await showConfirmModal(
      status === "verified" ? "Certifier cette agence immobilière sur Olma Immo ?" : "Rejeter ce dossier professionnel ?"
    );
    if (!confirmed) return;
    try {
      await apiPut(`/api/v1/real-estate/admin/pro-applications/${userId}/status`, {
        status,
        rejectionReason: status === "rejected" ? "Documents RC ou Agrément incomplets" : undefined,
      });
      toast.success(status === "verified" ? "Agence certifiée" : "Dossier rejeté");
      void fetchImmoData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleToggleLegalVerify = async (prop: RealEstatePropertyItem) => {
    const nextState = !prop.isLegalVerified;
    try {
      await apiPut(`/api/v1/real-estate/properties/${prop.id}/verify-legal`, { isLegalVerified: nextState });
      toast.success(nextState ? "Acte / Livret Foncier certifié" : "Badge légal retiré");
      setProperties((prev) => prev.map((item) => (item.id === prop.id ? { ...item, isLegalVerified: nextState } : item)));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur de certification légale");
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const confirmed = await showConfirmModal("Supprimer définitivement cette annonce immobilière ?");
    if (!confirmed) return;
    try {
      await apiDelete(`/api/v1/real-estate/properties/${id}`);
      toast.success("Annonce immobilière supprimée");
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const handleSeedImmo = async () => {
    try {
      await apiPost("/api/v1/real-estate/seed", {});
      toast.success("Annonces Olma Immo générées");
      void fetchImmoData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du seed Immo");
    }
  };

  const filteredProperties = properties.filter(
    (p) => p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.wilaya?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <ConfirmationDialog />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold text-zinc-950 uppercase tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#A54055]" />
            {t("Modération Olma Immo")}
          </h1>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-1">
            {t("Contrôle des annonces immobilières, certification des actes notariés et agréments d'agences.")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => void handleSeedImmo()} className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer">
            <Database className="w-4 h-4 text-[#A54055]" /> {t("Seed Démo Immo")}
          </button>
          <button onClick={() => void fetchImmoData()} className="px-4 py-2.5 rounded-xl bg-[#1A1836] hover:bg-[#42164B] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {t("Actualiser")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("properties")} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${activeTab === "properties" ? "bg-[#A54055] text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"}`}>
            {t("Biens & Actes Fonciers")} ({properties.length})
          </button>
          <button onClick={() => setActiveTab("agencies")} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${activeTab === "agencies" ? "bg-[#A54055] text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"}`}>
            {t("Agences & Promoteurs Pro")}
          </button>
        </div>

        {activeTab === "properties" ? (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3.5 top-3" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t("Filtrer par titre ou wilaya...")} className="w-full ps-10 pe-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-[#A54055]" />
          </div>
        ) : (
          <div className="flex gap-2">
            {(["pending", "verified", "rejected"] as const).map((st) => (
              <button key={st} onClick={() => setProStatusFilter(st)} className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider cursor-pointer ${proStatusFilter === st ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                {st === "pending" ? "En attente" : st === "verified" ? "Certifiés" : "Rejetés"}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === "properties" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase">
                    {prop.transactionType || "Vente"} • {prop.propertyType || "Bien"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${prop.isLegalVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {prop.isLegalVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {prop.isLegalVerified ? "Acte Vérifié" : "Non certifié"}
                  </span>
                </div>
                <h3 className="font-sans font-bold text-base text-zinc-900 line-clamp-1">{prop.title}</h3>
                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A54055]" /> {prop.wilaya} {prop.commune ? `• ${prop.commune}` : ""}
                </p>
                <div className="text-sm font-bold text-[#1A1836]">{(prop.price || 0).toLocaleString("fr-DZ")} DZD</div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                <button onClick={() => void handleToggleLegalVerify(prop)} className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${prop.isLegalVerified ? "bg-zinc-100 text-zinc-700" : "bg-emerald-600 text-white"}`}>
                  <FileCheck2 className="w-3.5 h-3.5" /> {prop.isLegalVerified ? "Retirer Badge" : "Certifier Acte"}
                </button>
                <button onClick={() => void handleDeleteProperty(prop.id)} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">{app.realEstateProInfo?.companyName || app.displayName || "Agence"}</h3>
                  <p className="text-xs text-zinc-500">{app.email} • {app.phone || "Sans tél"}</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase">{app.wilaya || "Algérie"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div>RC : <strong>{app.realEstateProInfo?.rcNumber || "N/A"}</strong></div>
                <div>Agrément : <strong>{app.realEstateProInfo?.agrementNumber || "N/A"}</strong></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => void handleProStatus(app.id, "verified")} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4" /> Approuver
                </button>
                <button onClick={() => void handleProStatus(app.id, "rejected")} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer">
                  <XCircle className="w-4 h-4" /> Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
