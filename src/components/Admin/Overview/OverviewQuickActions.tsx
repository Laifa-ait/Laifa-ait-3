import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Users, AlertTriangle, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

export const OverviewQuickActions: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Link
        to="/dashboard/admin/products-moderation"
        className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#A54055] to-[#E99856] hover:brightness-105 text-white rounded-[2rem] transition-all shadow-md shadow-[#A54055]/25 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Modération")}
          <br />
          {t("Produits")}
        </span>
      </Link>
      <Link
        to="/dashboard/admin/sellers"
        className="flex flex-col items-center justify-center p-6 bg-[#1A1836] hover:bg-[#28163B] text-white rounded-[2rem] transition-all shadow-md shadow-[#1A1836]/25 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Users className="w-6 h-6 text-[#E99856]" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Modération")}
          <br />
          {t("Vendeurs")}
        </span>
      </Link>
      <Link
        to="/dashboard/admin/disputes"
        className="flex flex-col items-center justify-center p-6 bg-[#42164B] hover:bg-[#622347] text-white rounded-[2rem] transition-all shadow-md shadow-[#42164B]/20 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <AlertTriangle className="w-6 h-6 text-[#E0B4B2]" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Gérer")}
          <br />
          {t("Litiges")}
        </span>
      </Link>
      <Link
        to="/dashboard/admin/orders"
        className="flex flex-col items-center justify-center p-6 bg-white hover:bg-[#E0B4B2]/15 text-[#1A1836] border border-[#E0B4B2]/40 rounded-[2rem] transition-all shadow-xs group"
      >
        <div className="w-12 h-12 rounded-full bg-[#A54055]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <ShoppingCart className="w-6 h-6 text-[#A54055]" />
        </div>
        <span className="font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
          {t("Toutes")}
          <br />
          {t("Commandes")}
        </span>
      </Link>
    </div>
  );
};
