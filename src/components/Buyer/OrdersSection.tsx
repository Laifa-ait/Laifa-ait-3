import React from "react";
import { Package, Clock, ChevronRight, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import { normalizeTimestamp, AppTimestamp } from "../../utils/date";

export interface BuyerOrderItem {
  productId?: string;
  id?: string;
  name: string;
  title?: string;
  quantity: number;
  price: number;
  image?: string;
  imageUrl?: string;
}

export interface BuyerOrder {
  id: string;
  orderNumber?: string;
  userId: string;
  total: number;
  status: string;
  createdAt: AppTimestamp;
  items: BuyerOrderItem[];
  shippingAddress?: { wilaya: string; communes?: string; commune?: string };
  unreadBuyerMessages?: boolean;
  unreadSellerMessages?: boolean;
  lastMessageText?: string;
  lastMessageAt?: AppTimestamp;
}

interface OrdersSectionProps {
  orders: BuyerOrder[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatOrderDate = (createdAt: AppTimestamp | null | undefined) => {
    if (!createdAt) return "";
    try {
      return normalizeTimestamp(createdAt).toDate().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "livré":
      case "complete":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: t("Livré") };
      case "shipped":
      case "expédié":
      case "in_transit":
        return { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: t("En cours de livraison") };
      case "cancelled":
      case "annulé":
        return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: t("Annulé") };
      default:
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: t("En préparation") };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1836] tracking-tight">
            {t("Commandes et suivi")}
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
            {t("Consultez vos reçus, suivez l'acheminement et échangez avec les vendeurs.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E0B4B2]/50 bg-white hover:bg-[#FAF7F8] text-xs font-bold text-[#A54055] transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t("Continuer vos achats")}</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-12 text-center shadow-2xs">
          <div className="w-8 h-8 border-3 border-[#A54055] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 mt-3">{t("Chargement de vos commandes...")}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-12 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1836]">{t("Aucune commande enregistrée")}</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {t("Vos achats et suivis de colis apparaîtront ici dès votre première commande.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A54055] to-[#622347] text-white text-xs sm:text-sm font-bold hover:brightness-110 transition-all shadow-xs cursor-pointer border-none"
          >
            {t("Découvrir la boutique")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/dashboard/buyer/order/${order.id}`)}
                className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-5 sm:p-6 hover:shadow-md hover:border-[#A54055]/40 transition-all cursor-pointer shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FAF7F8] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#1A1836]">
                        {t("Commande")} #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                    <span className="font-extrabold text-sm text-[#1A1836] tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div>
                    {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? "s" : ""} •{" "}
                    {order.shippingAddress?.wilaya || "Algérie"}
                  </div>
                  <div className="flex items-center gap-1 text-[#A54055] font-bold">
                    <span>{t("Détails & Facture")}</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-xl border border-[#E0B4B2]/50 bg-white hover:bg-[#FAF7F8] text-xs font-bold text-[#A54055] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {loadingMore ? t("Chargement...") : t("Charger plus de commandes")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
