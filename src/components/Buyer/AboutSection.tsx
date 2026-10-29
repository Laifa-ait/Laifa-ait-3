import React from "react";
import { ExternalLink, ShieldCheck, Heart, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1836] tracking-tight">
          {t("À propos d'Olmart")}
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
          {t("Rôle de la plateforme, mentions légales et protection des données.")}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A54055] to-[#E99856] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
            O
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#1A1836]">Olmart Algerian Marketplace</h3>
            <p className="text-xs text-zinc-500">Version 4.6.16 • Couverture 69 Wilayas</p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("Plateforme technologique de mise en relation directe")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF7F8] border border-[#E0B4B2]/40 flex items-start gap-3">
          <Store className="w-5 h-5 text-[#A54055] shrink-0 mt-0.5" />
          <p className="text-xs text-[#1A1836] leading-relaxed">
            {t(
              "Olmart agit exclusivement comme tiers technique de liaison entre les acheteurs et les vendeurs indépendants en Algérie. Chaque commerçant partenaire est seul responsable de ses stocks, de sa tarification, de la garantie de ses produits et de la livraison des commandes."
            )}
          </p>
        </div>

        <div className="space-y-2 pt-2 divide-y divide-[#FAF7F8]">
          <Link
            to="/privacy-policy"
            className="flex items-center justify-between py-3 text-xs sm:text-sm font-semibold text-[#1A1836] hover:text-[#A54055] transition-colors group"
          >
            <span>{t("Politique de confidentialité & Protection des données")}</span>
            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#A54055]" />
          </Link>

          <Link
            to="/refund-policy"
            className="flex items-center justify-between py-3 text-xs sm:text-sm font-semibold text-[#1A1836] hover:text-[#A54055] transition-colors group"
          >
            <span>{t("Conditions générales d'utilisation & Charte vendeurs")}</span>
            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#A54055]" />
          </Link>

          <Link
            to="/dashboard/buyer?tab=support"
            className="flex items-center justify-between py-3 text-xs sm:text-sm font-semibold text-[#1A1836] hover:text-[#A54055] transition-colors group"
          >
            <span>{t("Centre d'assistance et médiation")}</span>
            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#A54055]" />
          </Link>
        </div>

        <div className="p-4 bg-gradient-to-r from-[#1A1836] to-[#42164B] rounded-2xl text-center text-xs text-[#E0B4B2] flex items-center justify-center gap-1.5">
          <span>{t("Conçu et développé avec")}</span>
          <Heart className="w-3.5 h-3.5 text-[#E99856] fill-[#E99856]" />
          <span>{t("pour l'Algérie")}</span>
        </div>
      </div>
    </div>
  );
};
