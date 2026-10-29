import React, { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Package, Check, X, AlertCircle, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { auth } from "../../lib/firebase";
import { Order, OrderStatus } from "../../domains/order/order.types";

export const ReturnManagement: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [returns, setReturns] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const data = await apiGet<{ orders?: Order[] }>("/api/v1/seller/orders");
        if (data?.orders) {
          setReturns(data.orders.filter((o: Order) => o.returnRequest !== undefined && o.returnRequest !== null));
        }
      } catch (err: unknown) {
        console.error("Error fetching returns: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, [currentUser]);

  const handleReturnAction = async (orderId: string, action: "accepted" | "rejected" | "received") => {
    const progressToast = toast.loading(t("Mise à jour du statut sur le serveur..."));
    try {
      if (!auth.currentUser) throw new Error(t("Veuillez vous authentifier d'abord."));
      const idToken = await auth.currentUser.getIdToken();

      let targetStatusVal: OrderStatus = "return_requested";
      if (action === "accepted") targetStatusVal = "return_approved";
      else if (action === "rejected") targetStatusVal = "return_rejected";
      else if (action === "received") targetStatusVal = "refunded";

      const response = await fetch("/api/v1/seller/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderIds: [orderId], status: targetStatusVal }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || t("Échec de la validation serveur."));
      }

      setReturns((prev) =>
        prev.map((r) =>
          r.id === orderId
            ? {
                ...r,
                status: targetStatusVal,
                returnRequest: r.returnRequest
                  ? {
                      ...r.returnRequest,
                      status: action === "accepted" ? "approved" : action === "rejected" ? "rejected" : "received",
                    }
                  : undefined,
              }
            : r
        )
      );
      toast.success(t("Statut de retour mis à jour avec succès !"), { id: progressToast });
    } catch (err: unknown) {
      console.error(err);
      toast.error(`${t("Erreur de mise à jour :")} ${err instanceof Error ? err.message : String(err)}`, {
        id: progressToast,
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-zinc-500">{t("Chargement des retours...")}</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1836] tracking-tight">
            {t("Retours & Échanges Clients")}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {t("Gérez les demandes de retour soumises par vos acheteurs.")}
          </p>
        </div>
        <div className="px-4 py-1.5 bg-[#A54055]/10 rounded-full text-xs font-extrabold text-[#A54055] tabular-nums">
          {returns.length} {returns.length === 1 ? t("demande") : t("demandes")} {t("en cours")}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-[#E0B4B2]/40 divide-y divide-[#FAF7F8]">
        {returns.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F8] text-[#A54055] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#1A1836]">{t("Aucune demande de retour pour le moment")}</p>
            <p className="text-xs text-zinc-500">
              {t("Les demandes d'échange ou de retour de vos clients s'afficheront ici.")}
            </p>
          </div>
        ) : (
          returns.map((r) => {
            const isReturnedByCarrier = Boolean(
              r.carrier_tracking_events?.some((e: { status_key?: string }) => e.status_key === "TRACKING_STATUS_RETURNED")
            );
            return (
              <div key={r.id} className="py-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-10 h-10 bg-[#FAF7F8] text-[#A54055] rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-sm text-[#1A1836]">
                        {t("Commande #")}{r.id.substring(0, 8).toUpperCase()}
                      </p>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                          r.returnRequest?.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : r.returnRequest?.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {r.returnRequest?.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#1A1836] font-semibold">
                      {t("Motif :")} {r.returnRequest?.reason}
                    </p>
                    {r.returnRequest?.details && (
                      <p className="text-xs text-zinc-600 bg-[#FAF7F8] p-3 rounded-xl border border-[#E0B4B2]/30">
                        "{r.returnRequest.details}"
                      </p>
                    )}

                    {r.returnRequest?.photos && r.returnRequest.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {r.returnRequest.photos.map((photoUrl: string, idx: number) => (
                          <a
                            key={idx}
                            href={photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative w-14 h-14 rounded-xl overflow-hidden border border-[#E0B4B2]/50 hover:opacity-85 transition-opacity"
                          >
                            <img loading="lazy" src={photoUrl} alt={`Preuve ${idx + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {r.returnRequest?.status === "pending" && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleReturnAction(r.id, "accepted")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t("Accepter")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReturnAction(r.id, "rejected")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>{t("Refuser")}</span>
                    </button>
                  </div>
                )}

                {r.returnRequest?.status === "approved" && (
                  <div className="flex flex-col items-end gap-1 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleReturnAction(r.id, "received")}
                      disabled={!isReturnedByCarrier}
                      className="px-4 py-2 bg-[#1A1836] text-white rounded-xl font-bold text-xs hover:bg-[#42164B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
                    >
                      {t("Confirmer réception & Rembourser")}
                    </button>
                    {!isReturnedByCarrier && (
                      <div className="text-[10px] text-amber-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{t("En attente du retour transporteur")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
