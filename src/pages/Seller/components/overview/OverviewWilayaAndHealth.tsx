import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerUserProfile, SellerOverviewWilayaStat } from "../../../../types/seller";

interface OverviewWilayaAndHealthProps {
  wilayaStats: SellerOverviewWilayaStat[];
  userProfile: SellerUserProfile | null;
}

export const OverviewWilayaAndHealth: React.FC<OverviewWilayaAndHealthProps> = ({
  wilayaStats,
  userProfile,
}) => {
  const { t } = useTranslation();
  const maxCount = Math.max(...wilayaStats.map((x) => x.count), 1);

  return (
    <div className="space-y-6 flex flex-col" id="seller-overview-wilaya-health">
      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs p-6" id="seller-delivery-zones-card">
        <div className="flex items-center gap-2 mb-5">
          <MapPin className="w-4.5 h-4.5 text-[#A54055]" />
          <h4 className="text-xs font-extrabold text-[#1A1836] uppercase tracking-wider">
            {t("seller.overview.flash_delivery_zones", "Top Wilayas Livrées")}
          </h4>
        </div>
        <div className="space-y-4">
          {wilayaStats.map((w, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#1A1836]">{w.name}</span>
                <span className="text-[11px] font-bold text-[#622347] tabular-nums">
                  {w.count} {t("seller.overview.order", "Commande")}
                  {w.count > 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-2 w-full bg-[#FAF7F8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(w.count / maxCount) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#A54055] to-[#E99856] rounded-full"
                />
              </div>
            </div>
          ))}
          {wilayaStats.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-6">
              {t("seller.overview.no_geo_data", "Aucune donnée géographique enregistrée.")}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs p-6 flex flex-col items-center text-center" id="seller-account-health-card">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-extrabold text-[#1A1836]">
          {t("seller.overview.account_health", "Santé du Compte Vendeur")}
        </h4>
        <p className="text-[11px] text-zinc-500 mb-5">
          {t("seller.overview.health_based_on_available_data", "Indicateurs de qualité de service")}
        </p>

        <div className="w-full space-y-3 text-xs">
          <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F8]">
            <span className="font-semibold text-zinc-600">{t("seller.overview.seller_rating", "Note Vendeur")}</span>
            <span className="font-extrabold text-[#1A1836] tabular-nums">
              {userProfile?.rating !== undefined && userProfile?.rating !== null
                ? `${Number(userProfile.rating).toFixed(1)} / 5`
                : t("seller.overview.no_rating", "Aucun avis")}
            </span>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F8]">
            <span className="font-semibold text-zinc-600">{t("Trust Score")}</span>
            <span className="font-extrabold text-emerald-700 tabular-nums">
              {userProfile?.sellerTrustScore ?? 100} / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
