import React from "react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../domains/home/homepage.types";
import { useAuth } from "../../context/AuthContext";

interface SectionHeaderProps {
  section: HomepageSection;
  isDarkBg?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ section, isDarkBg = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  const titleText = section.title || section.name || t("home.sections.default");
  const seeMoreLabel = t("home.sections.see_more", "Voir tout");

  const targetLink = section.category
    ? `/shop?category=${encodeURIComponent(section.category)}`
    : section.tag
    ? `/shop?tag=${encodeURIComponent(section.tag)}`
    : `/collection/${encodeURIComponent(section.id || titleText)}`;

  const styleVariant = section.style || "clean";

  const renderStyleBadge = () => {
    if (section.themeName) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF2F2] text-[#622347] border border-[#E0B4B2]/60">
          <Sparkles className="w-2.5 h-2.5 text-[#A54055] fill-[#A54055]" />
          {section.themeName}
        </span>
      );
    }
    if (styleVariant === "premium") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#42164B] to-[#622347] text-white shadow-xs">
          <Sparkles className="w-2.5 h-2.5 fill-[#E99856] text-[#E99856]" />
          {t("Prestige")}
        </span>
      );
    }
    if (styleVariant === "immersive") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E99856] text-[#1A1836] shadow-xs">
          <Zap className="w-2.5 h-2.5 fill-[#1A1836] text-[#1A1836]" />
          {t("Flash Deal")}
        </span>
      );
    }
    if (styleVariant === "glass") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/50 backdrop-blur-md text-[#1A1836] border border-[#E0B4B2]/60">
          {t("Édition Spéciale")}
        </span>
      );
    }
    return null;
  };

  const getButtonStyles = () => {
    if (isDarkBg) {
      return "bg-white/10 hover:bg-white/20 text-white border border-white/20";
    }
    return "bg-white hover:bg-[#FAF7F6] text-[#1A1836] hover:text-[#622347] border border-[#EFE6E6] hover:border-[#E0B4B2] shadow-2xs font-semibold";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 pb-3 border-b border-[#EFE6E6] gap-3 group/header">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-xl sm:text-2xl font-display font-bold tracking-tight ${isDarkBg ? "text-white" : "text-[#1A1836]"}`}>
            {titleText}
          </h3>
          {renderStyleBadge()}
        </div>

        {section.subtitle && (
          <p className={`text-xs sm:text-sm font-medium ${isDarkBg ? "text-[#E0B4B2]" : "text-[#6E5A6F]"}`}>
            {section.subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => navigate(targetLink)}
          className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${getButtonStyles()}`}
        >
          <span>{seeMoreLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {userProfile?.role === "admin" && (
          <button
            type="button"
            onClick={() => navigate("/dashboard/admin/homepage")}
            className={`text-[11px] font-semibold px-2 py-1 transition-colors cursor-pointer ${
              isDarkBg ? "text-white/60 hover:text-white" : "text-[#9B879C] hover:text-[#622347]"
            }`}
          >
            {t("common.edit")}
          </button>
        )}
      </div>
    </div>
  );
};
