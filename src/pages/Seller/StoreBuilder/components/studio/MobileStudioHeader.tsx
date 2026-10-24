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
    <div className="md:hidden h-[52px] min-h-[52px] bg-[#FFFFFF] border-b border-[#E5E7EB] px-3 flex items-center justify-between z-20 select-none shrink-0">
      {/* Left: Clear Back button + Menu Studio */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="h-9 px-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] active:bg-[#FFF1E7] text-[#17191C] hover:text-[#EA580C] font-semibold text-[12px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-2xs"
          title="Retour au Tableau de Bord"
          aria-label="Retour au Tableau de Bord"
        >
          <ArrowLeft className="w-4 h-4 text-[#F97316]" />
          <span>Retour</span>
        </button>

        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] active:bg-[#FFF1E7] text-[#17191C] font-bold text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Ouvrir le menu de navigation Studio"
            aria-label="Ouvrir le menu Studio"
          >
            <Menu className="w-4 h-4 text-[#F97316]" />
            <span>Outils</span>
          </button>
        )}
      </div>

      {/* Right: Publier Button */}
      <button
        type="button"
        onClick={onPublish}
        className={`h-9 px-3.5 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 ${
          isPublished ? "bg-[#16A34A] hover:bg-[#15803D]" : "bg-[#F97316] hover:bg-[#EA580C]"
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
