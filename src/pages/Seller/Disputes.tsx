import React, { useEffect, useState } from "react";
import { AlertTriangle, Package, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/format";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { DisputeChat } from "../../components/Disputes/DisputeChat";
import { Dispute } from "../../domains/dispute/dispute.types";
import { apiGet } from "../../lib/api";

export const SellerDisputes: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [cases, setCases] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpenFor, setChatOpenFor] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const data = await apiGet<{ success: boolean; disputes: Dispute[] }>("/api/v1/disputes");
        if (data?.disputes) {
          setCases(data.disputes);
        }
      } catch (e) {
        console.error("Error fetching disputes:", e);
        toast.error(t("Erreur lors du chargement des litiges"));
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [currentUser, t]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1836] tracking-tight">
          {t("Litiges & Médiation Clients")}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          {t("Suivez et résolvez les réclamations ouvertes par les acheteurs sur vos commandes.")}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-[#E0B4B2]/40">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">{t("Chargement des dossiers...")}</div>
        ) : cases.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#1A1836]">{t("Aucun litige en cours")}</p>
            <p className="text-xs text-zinc-500">
              {t("Votre boutique ne présente aucune réclamation active auprès de la médiation.")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-[#FAF7F8] border border-[#E0B4B2]/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="w-11 h-11 bg-[#E99856]/20 text-[#A54055] rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-sm text-[#1A1836]">
                        {t("Commande #")}
                        {(c.orderId || c.id || "").substring(0, 8).toUpperCase()}
                      </p>
                      <span className="text-[10px] bg-[#A54055]/10 text-[#A54055] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#1A1836]">
                      {t("Motif :")} {c.reason}
                    </p>
                    {c.details && (
                      <p className="text-xs text-zinc-600 italic">"{c.details}"</p>
                    )}

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#A54055] tabular-nums">
                        <Package className="w-3.5 h-3.5" />
                        <span>
                          {formatPrice(c.frozenAmount || 0)} ({t("Montant concerné")})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setChatOpenFor(c.id || null)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1A1836] to-[#42164B] hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#E99856]" />
                        <span>{t("Ouvrir la médiation")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {chatOpenFor && (
        <div className="fixed inset-0 z-50 bg-[#1A1836]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <DisputeChat disputeId={chatOpenFor} onClose={() => setChatOpenFor(null)} />
          </div>
        </div>
      )}
    </div>
  );
};
