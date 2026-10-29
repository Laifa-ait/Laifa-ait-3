import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Percent, Network, ImageIcon } from "lucide-react";
import { CategoryVisuals } from "./components/CategoryVisuals";
import { CategoryHierarchy } from "./components/CategoryHierarchy";
import { CategoryPhotosAdmin } from "../CategoryPhotosAdmin";

export const CategoriesAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"hierarchy" | "commissions" | "photos">("hierarchy");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold text-zinc-950 uppercase tracking-tight">
            {t("Catégories, Arborescence & Commissions")}
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            {t("Pilotez l'ordre d'affichage des rayons, les taux de commission et les visuels de catégories.")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-zinc-100 p-1.5 rounded-2xl w-max">
        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === "hierarchy"
              ? "bg-[#1A1836] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Network className="w-4 h-4 text-[#E99856]" />
          {t("Hiérarchie & Ordre")}
        </button>
        <button
          onClick={() => setActiveTab("commissions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === "commissions"
              ? "bg-[#1A1836] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Percent className="w-4 h-4 text-[#E99856]" />
          {t("Taux de Commission")}
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === "photos"
              ? "bg-[#1A1836] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#E99856]" />
          {t("Visuels & Photos Rayons")}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "hierarchy" && <CategoryHierarchy />}
        {activeTab === "commissions" && <CategoryVisuals />}
        {activeTab === "photos" && <CategoryPhotosAdmin />}
      </div>
    </div>
  );
};
