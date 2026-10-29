import React from "react";
import { Activity, ShoppingBag, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../../utils/format";
import { normalizeTimestamp, AppTimestamp } from "../../../../utils/date";
import { SellerOverviewRecentOrder } from "../../../../types/seller";

interface OverviewActivityFeedProps {
  recentOrders: SellerOverviewRecentOrder[];
}

export const OverviewActivityFeed: React.FC<OverviewActivityFeedProps> = ({ recentOrders }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatOrderTime = (createdAt?: AppTimestamp): string => {
    if (!createdAt) return t("seller.overview.recent", "Récent");
    try {
      const date = normalizeTimestamp(createdAt).toDate();
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return t("seller.overview.recent", "Récent");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs overflow-hidden" id="seller-overview-activity-feed">
      <div className="p-6 border-b border-[#FAF7F8] flex items-center justify-between">
        <h4 className="text-base sm:text-lg font-extrabold flex items-center gap-2.5 text-[#1A1836]">
          <Activity className="w-5 h-5 text-[#A54055]" />
          <span>{t("seller.overview.latest_activities", "Dernières Commandes Reçues")}</span>
        </h4>
        <button
          type="button"
          onClick={() => navigate("/dashboard/seller/orders")}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#A54055] hover:text-[#622347] bg-transparent border-none cursor-pointer"
        >
          <span>{t("Tout voir")}</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
      <div className="divide-y divide-[#FAF7F8]">
        {recentOrders.map((o, i) => (
          <div
            key={o.id || i}
            onClick={() => navigate("/dashboard/seller/orders")}
            className="p-4 sm:p-5 flex items-center gap-4 hover:bg-[#FAF7F8] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#1A1836] truncate">
                {t("seller.overview.new_order_prefix", "Commande #")}
                {o.id.substring(0, 8).toUpperCase()}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                {formatOrderTime(o.createdAt)}
              </p>
            </div>
            <div className="text-end flex items-center gap-2">
              <p className="text-xs sm:text-sm font-extrabold text-[#1A1836] tabular-nums">
                {formatPrice(o.total)}
              </p>
              <ChevronRight className="w-4 h-4 text-zinc-400 rtl:rotate-180" />
            </div>
          </div>
        ))}
        {recentOrders.length === 0 && (
          <div className="p-8 text-center text-zinc-400 font-medium text-xs">
            {t("Aucune commande récente enregistrée.")}
          </div>
        )}
      </div>
    </div>
  );
};
