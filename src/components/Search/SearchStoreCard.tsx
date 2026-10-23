import React from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SearchStoreResult } from "../../types/search";

interface SearchStoreCardProps {
  store: SearchStoreResult;
  onSelect: (storeId: string) => void;
}

export const SearchStoreCard: React.FC<SearchStoreCardProps> = ({ store, onSelect }) => {
  const { t } = useTranslation();
  const storeId = store.id || store.uid || "";
  const name = store.shopName || store.displayName || "Boutique";

  return (
    <button
      type="button"
      onClick={() => onSelect(storeId)}
      className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 flex items-center gap-3 group transition-all duration-150 rounded-xl outline-none cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200 shadow-2xs flex items-center justify-center">
        {store.logoUrl ? (
          <img
            loading="lazy"
            src={store.logoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-emerald-700 font-bold text-base uppercase">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <span className="font-bold text-[13px] text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
          {name}
        </span>
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5 truncate">
          {t("Wilaya", "Wilaya")} {store.wilaya ? store.wilaya : "Algérie"}
        </span>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
};
