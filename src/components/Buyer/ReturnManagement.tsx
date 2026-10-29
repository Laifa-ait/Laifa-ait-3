import React, { useState, useEffect, useMemo } from "react";
import {
  RotateCcw,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Package,
  ChevronRight,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { UserProfile } from "../../domains/user/user.types";
import { Order } from "../../domains/order/order.types";
import { normalizeTimestamp } from "../../utils/date";
import { formatPrice } from "../../utils/format";

export const ReturnManagement: React.FC<{ currentUser: UserProfile | { uid: string } | null }> = ({
  currentUser,
}) => {
  const { t } = useTranslation();
  const [returns, setReturns] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReturns = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const data = await apiGet<{ returns: Order[] }>("/api/v1/buyer/returns");
        if (data?.returns) {
          const list = [...data.returns].sort((a: Order, b: Order) => {
            const tA = a.returnRequest?.createdAt
              ? normalizeTimestamp(a.returnRequest.createdAt).toDate().getTime()
              : a.updatedAt
              ? normalizeTimestamp(a.updatedAt).toDate().getTime()
              : 0;
            const tB = b.returnRequest?.createdAt
              ? normalizeTimestamp(b.returnRequest.createdAt).toDate().getTime()
              : b.updatedAt
              ? normalizeTimestamp(b.updatedAt).toDate().getTime()
              : 0;
            return tB - tA;
          });
          setReturns(list);
        }
      } catch (err: unknown) {
        console.error("Error fetching returns for buyer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, [currentUser]);

  const getStatusBadge = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return { label: t("Validation en cours"), bg: "bg-amber-50 text-amber-800 border-amber-200/80", icon: Clock };
      case "approved":
        return { label: t("Retour Accepté"), bg: "bg-sky-50 text-sky-800 border-sky-200/80", icon: CheckCircle2 };
      case "returning":
        return { label: t("En cours de renvoi"), bg: "bg-indigo-50 text-indigo-800 border-indigo-200/80", icon: RotateCcw };
      case "received":
        return { label: t("Réceptionné"), bg: "bg-purple-50 text-purple-800 border-purple-200/80", icon: Package };
      case "completed":
      case "refunded":
        return { label: t("Remboursé"), bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80", icon: CreditCard };
      case "rejected":
        return { label: t("Refusée"), bg: "bg-rose-50 text-rose-800 border-rose-200/80", icon: XCircle };
      default:
        return { label: status || t("En traitement"), bg: "bg-stone-100 text-stone-700 border-stone-200", icon: Clock };
    }
  };

  const filteredReturns = useMemo(() => {
    if (filter === "pending") return returns.filter((r) => (r.returnRequest?.status || "").toLowerCase() === "pending");
    if (filter === "resolved") {
      return returns.filter((r) => ["approved", "completed", "refunded", "rejected"].includes((r.returnRequest?.status || "").toLowerCase()));
    }
    return returns;
  }, [returns, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1836]">
          {t("Mes Retours & Réclamations")}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          {t("Suivez l'état de vos demandes de retour et échanges directement auprès des vendeurs.")}
        </p>
      </div>

      {returns.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F8] border border-[#E0B4B2]/40 rounded-xl w-fit text-xs font-semibold">
          {(["all", "pending", "resolved"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-none ${
                filter === f ? "bg-[#1A1836] text-white shadow-2xs" : "bg-transparent text-zinc-600 hover:text-[#1A1836]"
              }`}
            >
              {f === "all" ? `${t("Tous")} (${returns.length})` : f === "pending" ? t("En attente") : t("Clôturés")}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">{t("Chargement de vos demandes...")}</div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-[#E99856]/15 text-[#E99856] rounded-2xl flex items-center justify-center mb-3.5">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1836] mb-1">
              {filter === "all" ? t("Aucune demande de retour enregistrée") : t("Aucun retour dans cette catégorie")}
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mb-6 leading-relaxed">
              {t("Si vous constatez un défaut sur une commande livrée, vous pouvez contacter directement le vendeur depuis le détail de votre commande.")}
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard/buyer?tab=orders")}
              className="px-5 py-2.5 bg-gradient-to-r from-[#1A1836] to-[#42164B] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-xs"
            >
              {t("Consulter mes commandes")}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#FAF7F8]">
            {filteredReturns.map((req) => {
              const badge = getStatusBadge(req.returnRequest?.status);
              const BadgeIcon = badge.icon;
              const dateStr = req.returnRequest?.createdAt
                ? normalizeTimestamp(req.returnRequest.createdAt).toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                : "Date récente";

              return (
                <div key={req.id} className="p-4 sm:p-5 hover:bg-[#FAF7F8] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#1A1836] text-xs sm:text-sm">#{req.id.substring(0, 10).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2.5 py-0.5 ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{dateStr}</span>
                      </div>
                      <div>
                        <span>{t("Montant :")} </span>
                        <strong className="text-[#1A1836] tabular-nums">{formatPrice(req.total)}</strong>
                      </div>
                    </div>
                    {req.returnRequest?.reason && (
                      <div className="bg-[#FAF7F8] rounded-xl p-2.5 border border-[#E0B4B2]/30 text-xs text-[#1A1836]">
                        <span className="font-semibold block">{t("Motif :")} {req.returnRequest.reason}</span>
                        {req.returnRequest.details && <p className="text-zinc-500 italic mt-0.5 line-clamp-2">"{req.returnRequest.details}"</p>}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/buyer/order/${req.id}`)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-xl text-xs font-bold text-[#1A1836] transition-colors cursor-pointer shrink-0"
                  >
                    <span>{t("Détail commande")}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-[#A54055]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center shrink-0 mt-0.5">
          <Store className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-[#1A1836]">{t("Responsabilité directe des vendeurs partenaires")}</h4>
          <p className="text-zinc-600 leading-relaxed">
            {t("Olmart agit exclusivement comme plateforme de mise en relation. Chaque vendeur indépendant gère ses stocks, son expédition et ses retours.")}
          </p>
        </div>
      </div>
    </div>
  );
};
