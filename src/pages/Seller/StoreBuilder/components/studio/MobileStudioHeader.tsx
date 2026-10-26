import React from "react";
import { Send, CheckCircle2, Menu, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface MobileStudioHeaderProps {
  shopName?: string;
  isPublished?: boolean;
  onPublish: () => void;
  onOpenMenu?: () => void;
}

export const MobileStudioHeader: React.FC<MobileStudioHeaderProps> = ({
  isPublished,
  onPublish,
  onOpenMenu,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const target = location.pathname.startsWith("/dashboard/seller")
      ? "/dashboard/seller"
      : "/seller";
    navigate(target);
  };

  return (
    <div className="md:hidden h-[52px] min-h-[52px] bg-white border-b border-slate-200 px-3 flex items-center justify-between z-20 select-none shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 active:bg-slate-100 text-[#011C40] hover:text-[#023859] font-semibold text-[12px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-2xs"
          title="Retour au Tableau de Bord"
          aria-label="Retour au Tableau de Bord"
        >
          <ArrowLeft className="w-4 h-4 text-[#023859]" />
          <span>Retour</span>
        </button>

        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 active:bg-slate-100 text-[#011C40] font-bold text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Ouvrir le menu de navigation Studio"
            aria-label="Ouvrir le menu Studio"
          >
            <Menu className="w-4 h-4 text-[#023859]" />
            <span>Outils</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onPublish}
        className={`h-9 px-3.5 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 ${
          isPublished ? "bg-[#023859] hover:bg-[#011C40]" : "bg-[#023859] hover:bg-[#011C40]"
        }`}
      >
        {isPublished ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mettre à jour</span>
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Publier</span>
          </>
        )}
      </button>
    </div>
  );
};
