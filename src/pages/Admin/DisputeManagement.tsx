import React, { useEffect, useState, useMemo, useCallback } from "react";
import { AlertTriangle, Package, Sparkles, MessageSquare, Search, RefreshCw, ShieldCheck, Scale } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/format";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { DisputeChat } from "../../components/Disputes/DisputeChat";
import { apiGet, apiPost } from "../../lib/api";
import { Dispute } from "../../domains/dispute/dispute.types";

type DisputeTab = "active" | "resolved" | "all";

export const DisputeManagement: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [allCases, setAllCases] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DisputeTab>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [chatOpenFor, setChatOpenFor] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ success: boolean; disputes?: Dispute[]; data?: { disputes?: Dispute[] } }>(
        "/api/v1/disputes/admin/all"
      );
      setAllCases(data?.disputes || data?.data?.disputes || []);
    } catch {
      toast.error(t("Erreur lors du chargement des litiges"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (userProfile?.role === "admin" || userProfile?.role === "superadmin") void fetchCases();
  }, [userProfile, fetchCases]);

  const handleResolve = async (c: Dispute) => {
    if (!currentUser || (userProfile?.role !== "admin" && userProfile?.role !== "superadmin") || !c.id) {
      toast.error(t("Action non autorisée"));
      return;
    }
    const decision = decisions[c.id];
    if (!decision) {
      toast.error(t("Veuillez sélectionner une décision avant de résoudre."));
      return;
    }
    try {
      await apiPost(`/api/v1/disputes/admin/${c.id}/resolve`, { resolution: decision, note: notes[c.id] || "" });
      toast.success(t("Litige résolu et transaction séquestre exécutée !"));
      await fetchCases();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("Erreur lors de la résolution"));
    }
  };

  const kpis = useMemo(() => {
    const activeList = allCases.filter((d) => d.status === "open" || d.status === "mediation");
    const resolvedList = allCases.filter((d) => d.status !== "open" && d.status !== "mediation");
    const totalFrozen = activeList.reduce((acc, d) => acc + Number(d.frozenAmount || 0), 0);
    return { activeCount: activeList.length, resolvedCount: resolvedList.length, totalFrozen };
  }, [allCases]);

  const filteredCases = useMemo(() => {
    return allCases.filter((d) => {
      const isActive = d.status === "open" || d.status === "mediation";
      if (activeTab === "active" && !isActive) return false;
      if (activeTab === "resolved" && isActive) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (d.orderId || "").toLowerCase().includes(q) || (d.reason || "").toLowerCase().includes(q) || (d.details || "").toLowerCase().includes(q);
    });
  }, [allCases, activeTab, searchTerm]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#1A1836] flex items-center gap-3">
            <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-[#A54055] shrink-0" />
            <span>{t("Arbitrage des Litiges & Fonds Séquestres")}</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Médiation tripartite Acheteur / Vendeur et déblocage transactionnel des fonds gelés.
          </p>
        </div>
        <button
          onClick={fetchCases}
          disabled={loading}
          className="min-h-[42px] px-4 py-2.5 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-[#E99856] ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {[
          { label: "Fonds Séquestrés (Gelés)", val: formatPrice(kpis.totalFrozen), icon: Package, color: "text-[#A54055]", bg: "bg-[#A54055]/10 text-[#A54055]" },
          { label: "Dossiers Actifs / Médiation", val: kpis.activeCount, icon: AlertTriangle, color: "text-[#1A1836]", bg: "bg-amber-50 text-amber-600" },
          { label: "Dossiers Clôturés", val: kpis.resolvedCount, icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50 text-emerald-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">{card.label}</p>
              <p className={`text-xl sm:text-2xl font-extrabold tabular-nums mt-1 ${card.color}`}>{card.val}</p>
            </div>
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${card.bg}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide flex-nowrap">
          {(
            [
              { id: "active", label: `En cours (${kpis.activeCount})` },
              { id: "resolved", label: `Résolus (${kpis.resolvedCount})` },
              { id: "all", label: `Tous (${allCases.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all cursor-pointer tabular-nums ${
                activeTab === tab.id ? "bg-[#1A1836] text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher N° commande, motif..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#A54055]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-zinc-200/80">
        {loading ? (
          <div className="py-12 text-center text-zinc-400 font-bold text-xs uppercase tracking-widest animate-pulse">
            Chargement des dossiers d'arbitrage...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-medium">{t("Aucun dossier de litige correspondant.")}</div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredCases.map((c) => {
              const id = c.id || "";
              const isOpen = c.status === "open" || c.status === "mediation";
              return (
                <div key={id} className="p-4 sm:p-6 bg-zinc-50 border border-zinc-200/70 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-start gap-3.5 sm:gap-5 w-full">
                    <div className={`p-3 sm:p-4 rounded-2xl shrink-0 hidden sm:flex ${isOpen ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-sans font-bold text-[#1A1836] tabular-nums">
                          {t("Commande #")}{c.orderId?.substring(0, 8) || id.substring(0, 8)}
                        </p>
                        <span className="text-[10px] bg-zinc-200 text-zinc-800 font-sans font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">{c.status}</span>
                      </div>
                      <p className="text-sm font-bold text-zinc-800">{t("Raison :")} {c.reason}</p>
                      <p className="text-xs text-zinc-600 font-medium italic">"{c.details}"</p>
                      {c.aiSummary && (
                        <div className="mt-3 p-4 bg-[#42164B]/5 border border-[#42164B]/15 rounded-2xl flex gap-3">
                          <Sparkles className="w-4 h-4 text-[#A54055] shrink-0 mt-0.5" />
                          <div className="text-xs text-[#1A1836] font-medium leading-relaxed whitespace-pre-wrap">
                            <span className="font-bold block mb-1 uppercase tracking-widest text-[10px] text-[#A54055]">Synthèse Médiation IA</span>
                            {c.aiSummary}
                          </div>
                        </div>
                      )}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Package className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-xs font-sans font-bold text-emerald-700 tabular-nums">{formatPrice(c.frozenAmount || 0)} ({t("Séquestre")})</span>
                        <button
                          onClick={() => setChatOpenFor(id)}
                          className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#1A1836]/10 hover:bg-[#1A1836] text-[#1A1836] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {t("Chat & Preuves")}
                        </button>
                      </div>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                      <div className="w-full md:w-64 flex flex-col gap-2">
                        <select
                          value={decisions[id] || ""}
                          onChange={(e) => setDecisions({ ...decisions, [id]: e.target.value })}
                          className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#A54055]"
                        >
                          <option value="">{t("Décision d'arbitrage...")}</option>
                          <option value="buyer_refunded">{t("Rembourser l'acheteur")} ({formatPrice(c.frozenAmount || 0)})</option>
                          <option value="seller_paid">{t("Libérer les fonds au vendeur")}</option>
                          <option value="split">{t("Partage amiable (50/50)")}</option>
                        </select>
                        <input
                          type="text"
                          placeholder={t("Motif officiel de décision...")}
                          value={notes[id] || ""}
                          onChange={(e) => setNotes({ ...notes, [id]: e.target.value })}
                          className="w-full bg-white border border-zinc-200 px-4 py-2 rounded-xl text-xs font-medium outline-none focus:border-[#A54055]"
                        />
                      </div>
                      <button
                        onClick={() => handleResolve(c)}
                        className="w-full md:w-auto px-5 py-3.5 bg-[#A54055] hover:bg-[#622347] text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                      >
                        {t("Exécuter")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {chatOpenFor && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <DisputeChat disputeId={chatOpenFor} onClose={() => setChatOpenFor(null)} />
          </div>
        </div>
      )}
    </div>
  );
};
