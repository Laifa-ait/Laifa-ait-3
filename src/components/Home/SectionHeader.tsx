import React from "react";
import { ArrowRight } from "lucide-react";
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
  const { t, i18n } = useTranslation();
  const { userProfile } = useAuth();
  const cleanLang = (i18n.language || "fr").split("-")[0] as "fr" | "ar" | "en";

  const rawTitle =
    section.translations?.[cleanLang]?.title ||
    section.title ||
    section.name ||
    t("home.sections.default");
  const titleText = t(rawTitle, rawTitle);

  const rawSubtitle = section.translations?.[cleanLang]?.subtitle || section.subtitle;
  const subtitleText = rawSubtitle ? t(rawSubtitle, rawSubtitle) : "";
  const seeMoreLabel = t("home.sections.see_more");

  const targetLink = section.category
    ? `/shop?category=${encodeURIComponent(section.category)}`
    : section.tag
    ? `/shop?tag=${encodeURIComponent(section.tag)}`
    : `/collection/${encodeURIComponent(section.id || titleText)}`;

  const styleVariant = section.style || "clean";

  const resolveKickerLabel = (): string | null => {
    if (section.themeName) return t(section.themeName, section.themeName);
    if (styleVariant === "premium") return t("home.sections.badge_prestige");
    if (styleVariant === "immersive") return t("home.sections.badge_flash");
    if (styleVariant === "glass") return t("home.sections.badge_special");
    return null;
  };

  const kickerLabel = resolveKickerLabel();

  const getButtonStyles = () => {
    if (isDarkBg) {
      return "bg-white/10 hover:bg-white/20 text-white border border-white/20";
    }
    return "bg-white hover:bg-[#F7F8F6] text-[#0F1B1D] hover:text-[#0D5C4B] border border-[#D4DFD9] hover:border-[#0D5C4B]/50 shadow-2xs font-semibold";
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 pb-3.5 border-b gap-3 group/header ${
        isDarkBg ? "border-white/15" : "border-[#E3E9E5]"
      }`}
    >
      <div className="space-y-1">
        {kickerLabel && (
          <p
            className={`text-xs font-semibold tracking-wide ${
              isDarkBg ? "text-[#E59A42]" : "text-[#0D5C4B]"
            }`}
          >
            {kickerLabel}
          </p>
        )}

        <h3
          className={`text-xl sm:text-2xl font-display font-bold tracking-tight text-balance ${
            isDarkBg ? "text-white" : "text-[#0F1B1D]"
          }`}
        >
          {titleText}
        </h3>

        {subtitleText && (
          <p className={`text-xs sm:text-sm font-medium ${isDarkBg ? "text-[#B8C8C4]" : "text-[#5F7073]"}`}>
            {subtitleText}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => navigate(targetLink)}
          className={`group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${getButtonStyles()}`}
        >
          <span>{seeMoreLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform" />
        </button>

        {userProfile?.role === "admin" && (
          <button
            type="button"
            onClick={() => navigate("/dashboard/admin/homepage")}
            className={`text-xs font-semibold px-2 py-1 transition-colors cursor-pointer ${
              isDarkBg ? "text-white/60 hover:text-white" : "text-[#839497] hover:text-[#0D5C4B]"
            }`}
          >
            {t("common.edit")}
          </button>
        )}
      </div>
    </div>
  );
};
