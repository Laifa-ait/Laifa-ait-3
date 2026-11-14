import React from "react";
import { UploadCloud, Menu, ArrowLeft } from "lucide-react";

interface MobileStudioHeaderProps {
  shopName?: string;
  isPublished?: boolean;
  onPublish: () => void;
  onOpenMenu?: () => void;
  onExitStudio?: () => void;
}

export const MobileStudioHeader: React.FC<MobileStudioHeaderProps> = ({
  shopName,
  isPublished,
  onPublish,
  onOpenMenu,
  onExitStudio,
}) => {
  const handleBack = () => {
    if (onExitStudio) {
      onExitStudio();
    } else if (typeof window !== "undefined") {
      window.location.assign("/dashboard/seller");
    }
  };

  return (
    <div className="md:hidden h-[52px] min-h-[52px] bg-white border-b border-slate-200 px-3 flex items-center justify-between gap-2 z-20 select-none shrink-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          type="button"
          onClick={handleBack}
          className="h-10 w-10 rounded-lg border border-slate-200 bg-white active:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
          title="Retour au Tableau de Bord"
          aria-label="Retour au Tableau de Bord"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-white active:bg-slate-100 text-slate-800 font-medium text-[12.5px] flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            aria-label="Ouvrir le menu Studio"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        )}

        {shopName && (
          <span className="text-[12.5px] font-semibold text-slate-900 truncate hidden xs:inline">
            {shopName}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onPublish}
        className="h-10 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[12.5px] font-semibold text-white flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        <span>{isPublished ? "Mettre à jour" : "Publier"}</span>
      </button>
    </div>
  );
};
