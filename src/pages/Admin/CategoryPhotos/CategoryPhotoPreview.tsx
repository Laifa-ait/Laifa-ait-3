import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CATEGORY_KEYS } from "./types";

interface CategoryPhotoPreviewProps {
  selectedKey: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export const CategoryPhotoPreview: React.FC<CategoryPhotoPreviewProps> = ({
  selectedKey,
  title,
  subtitle,
  imageUrl,
}) => {
  const { t } = useTranslation();
  const currentCategoryObj = CATEGORY_KEYS.find((c) => c.key === selectedKey);

  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("Aperçu en Direct sur la Page d'Accueil")}</span>
        </span>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
          Univers: {selectedKey}
        </span>
      </div>

      <div className="max-w-md mx-auto sm:mx-0 w-full relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-slate-800 border border-slate-700/80 shadow-2xl group">
        <img
          src={imageUrl || currentCategoryObj?.defaultImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent p-5 sm:p-6 flex flex-col justify-end">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
            {title || currentCategoryObj?.defaultTitle}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1 drop-shadow-sm">
            {subtitle || currentCategoryObj?.defaultSubtitle}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
            <span>DÉCOUVRIR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
