import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Tag, ImageIcon, MapPin } from "lucide-react";

interface BannerAdminHeaderProps {
  activeTab: "banners" | "tags" | "wilayas";
  setActiveTab: (tab: "banners" | "tags" | "wilayas") => void;
  handleOpenBannerModal: () => void;
  totalBannersCount?: number;
  configuredWilayasCount?: number;
}

export const BannerAdminHeader: React.FC<BannerAdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  handleOpenBannerModal,
  totalBannersCount = 0,
  configuredWilayasCount = 0,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div
        id="banner-admin-header-card"
        className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-start"
      >
        <div id="banner-admin-header-info">
          <span className="text-xs font-sans font-black text-orange-600 uppercase tracking-[0.2em] block">
            {t("OLMART PREMIER ACCUEIL • STUDIO 2026")}
          </span>
          <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight mt-1">
            {t("Gestion des Bannières & Campagnes")}
          </h2>
          <p className="text-xs text-zinc-500 max-w-xl font-medium mt-1">
            {t(
              "Contrôle total du design : thèmes bicolores, marges photo, ombres portées, compte à rebours, multi-sélection produits et campagnes 69 Wilayas."
            )}
          </p>
        </div>

        {activeTab === "banners" && (
          <button
            id="btn-add-banner-header"
            onClick={() => handleOpenBannerModal()}
            className="h-12 px-6 bg-zinc-950 text-white rounded-2xl hover:bg-zinc-850 font-sans font-extrabold text-xs uppercase tracking-widest transition-all shadow-md select-none cursor-pointer flex items-center gap-2 border-none"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>{t("Créer une Bannière")}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs Panel */}
      <div
        id="banner-admin-tabs-nav"
        className="flex border-b border-zinc-200 gap-2 overflow-x-auto select-none no-scrollbar"
      >
        <button
          id="tab-btn-banners"
          onClick={() => setActiveTab("banners")}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-sans font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "banners"
              ? "border-zinc-950 text-zinc-950 font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-650"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{t("Bannières & Zones")}</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-black">
            {totalBannersCount}
          </span>
        </button>

        <button
          id="tab-btn-wilayas"
          onClick={() => setActiveTab("wilayas")}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-sans font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "wilayas"
              ? "border-orange-600 text-orange-600 font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-650"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t("Campagnes par Wilaya (69)")}</span>
          {configuredWilayasCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black">
              {configuredWilayasCount}
            </span>
          )}
        </button>

        <button
          id="tab-btn-tags"
          onClick={() => setActiveTab("tags")}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-sans font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "tags"
              ? "border-zinc-950 text-zinc-950 font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-650"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t("Tags de Redirection")}</span>
        </button>
      </div>
    </>
  );
};
