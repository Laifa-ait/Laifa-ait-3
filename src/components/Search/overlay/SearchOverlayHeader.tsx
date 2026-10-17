import React from "react";
import { Compass, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchOverlayHeaderProps {
  onClose: () => void;
}

export const SearchOverlayHeader: React.FC<SearchOverlayHeaderProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between border-b border-emerald-600/20 shrink-0 bg-white/70 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Compass className="w-6 h-6 text-emerald-600 animate-pulse" />
        <span id="global-search-title" className="font-bold text-lg tracking-wide uppercase text-slate-900">
          {t("search_global", "Recherche Olmart Marketplace")}
        </span>
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-[11px] text-slate-500 font-mono">
          <span>{t("common.shortcut_prefix", "Raccourci")}</span>
          <span className="font-bold text-emerald-600">/</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-full transition-all duration-200 hover:rotate-90 cursor-pointer flex items-center justify-center shadow-xs"
        aria-label={t("close", "Fermer")}
      >
        <X className="w-5 h-5 stroke-[2]" />
      </button>
    </div>
  );
};
