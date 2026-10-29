import React from "react";
import { ShieldCheck, AlertCircle, Palette, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SellerUserProfile } from "../../../../types/seller";

interface OverviewHeaderProps {
  userProfile: SellerUserProfile | null;
  outOfStockCount: number;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  userProfile,
  outOfStockCount,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isVerified = userProfile?.status === "ACTIVE" || userProfile?.status === "active";

  return (
    <div
      className="rounded-3xl bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] p-6 sm:p-8 text-white shadow-lg border border-[#A54055]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      id="seller-overview-header"
    >
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {t("seller.overview.hello", "Bonjour, ")}
            {userProfile?.shopName || userProfile?.displayName || t("Commerçant Partenaire")}
          </h2>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isVerified
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                : "bg-[#E99856]/20 text-[#E99856] border-[#E99856]/30"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isVerified ? t("Boutique Certifiée") : t("Vérification en cours")}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#E0B4B2]">
          {t(
            "seller.overview.welcome_desc",
            "Pilotez vos ventes, vos stocks et vos expéditions sur les 69 Wilayas d'Algérie."
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {userProfile?.sellerTrustScore !== undefined && (
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white/10 border border-white/15 rounded-2xl cursor-help"
            title={t(
              "seller.overview.trust_score_desc",
              "Votre Trust Score garantit votre visibilité sur Olmart."
            )}
            id="seller-trust-score-card"
          >
            <ShieldCheck
              className={`w-5 h-5 ${
                userProfile.sellerTrustScore >= 80
                  ? "text-emerald-400"
                  : userProfile.sellerTrustScore >= 50
                  ? "text-[#E99856]"
                  : "text-rose-400"
              }`}
            />
            <div className="text-start">
              <p className="text-[9px] font-bold text-[#E0B4B2] uppercase tracking-wider leading-none mb-0.5">
                {t("seller.overview.trust_score", "Trust Score")}
              </p>
              <p className="text-xs font-black text-white tabular-nums">
                {userProfile.sellerTrustScore} / 100
              </p>
            </div>
          </div>
        )}

        {outOfStockCount > 0 && (
          <button
            type="button"
            onClick={() => navigate("/dashboard/seller/catalog")}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 rounded-2xl cursor-pointer transition-colors"
            id="seller-stock-alert-card"
          >
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
            <div className="text-start">
              <p className="text-[9px] font-bold text-rose-200 uppercase tracking-wider leading-none mb-0.5">
                {t("seller.overview.stock_alert", "Alerte Stock")}
              </p>
              <p className="text-xs font-extrabold text-white tabular-nums">
                {outOfStockCount} {t("en rupture")}
              </p>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate("/dashboard/seller/catalog?action=new")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#E99856]" />
          <span>{t("seller.overview.new_product", "Nouveau Produit")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard/seller/studio")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E99856] to-[#d8823e] text-[#1A1836] font-extrabold text-xs rounded-2xl shadow-md hover:brightness-105 transition-all cursor-pointer border-none"
          id="seller-header-studio-btn"
        >
          <Palette className="w-4 h-4" />
          <span>{t("seller.overview.open_studio", "Studio Vitrine")}</span>
        </button>
      </div>
    </div>
  );
};
