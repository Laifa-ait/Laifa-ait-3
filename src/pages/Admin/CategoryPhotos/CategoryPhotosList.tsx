import React from "react";
import { Layers, RefreshCw, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CATEGORY_KEYS, CategoryPhotoConfig } from "./types";

interface CategoryPhotosListProps {
  selectedKey: string;
  onSelectKey: (key: string) => void;
  configs: Record<string, CategoryPhotoConfig>;
  loading: boolean;
  onRefresh: () => void;
}

export const CategoryPhotosList: React.FC<CategoryPhotosListProps> = ({
  selectedKey,
  onSelectKey,
  configs,
  loading,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>{t("Choix de la Catégorie")}</span>
        </h3>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
        {CATEGORY_KEYS.map((cat) => {
          const isSelected = cat.key === selectedKey;
          const cfg = configs[cat.key];
          const displayImg = cfg?.image || cat.defaultImage;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectKey(cat.key)}
              className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? "bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                  : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700"
              }`}
            >
              <img
                src={displayImg}
                alt={cat.key}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold truncate">{cat.key}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  {cfg?.title || cat.defaultTitle}
                </p>
              </div>
              {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 me-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
