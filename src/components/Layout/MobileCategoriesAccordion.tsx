import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Box } from "lucide-react";
import { CATEGORY_ICONS } from "../../constants";
import { getCategoryTranslation } from "../../utils/translations";
import { CategoryIcons8Logo } from "../common/CategoryIcons8Logo";

interface CategoryLink {
  name: string;
}

interface CategorySection {
  name: string;
  links?: CategoryLink[];
}

interface CategoryItem {
  id: string;
  name: string;
  sections?: CategorySection[];
}

interface MobileCategoriesAccordionProps {
  categories: CategoryItem[];
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export const MobileCategoriesAccordion: React.FC<MobileCategoriesAccordionProps> = ({
  categories,
  onNavigate,
  onClose,
}) => {
  const { t } = useTranslation();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const toggleSub = (subKey: string) => {
    setExpandedSub((prev) => (prev === subKey ? null : subKey));
  };

  return (
    <div className="space-y-2.5">
      <h4 className="text-[10px] font-bold text-[#622347] uppercase tracking-[0.18em] px-1">
        {t("nav.sections.categories", "TOUTES LES CATÉGORIES")}
      </h4>
      <div className="flex flex-col space-y-2">
        {categories.map((cat, i) => {
          const IconComponent = CATEGORY_ICONS[cat.name] || Box;
          const isExpanded = expandedCat === cat.id;

          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xs border border-[#EFE6E6] overflow-hidden"
            >
              <button
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="w-full flex items-center justify-between p-3 bg-transparent border-none cursor-pointer hover:bg-[#FAF7F6] group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#FAF7F6] group-hover:bg-white transition-colors border border-transparent group-hover:border-[#EFE6E6] shadow-xs flex items-center justify-center">
                    <CategoryIcons8Logo
                      categoryName={cat.name}
                      categoryId={cat.id}
                      className="w-5 h-5 object-contain"
                      fallbackIcon={IconComponent}
                    />
                  </div>
                  <span className="font-semibold text-sm text-[#1A1836] group-hover:text-[#A54055] transition-colors">
                    {getCategoryTranslation(cat.name, t)}
                  </span>
                </div>
                {cat.sections && cat.sections.length > 0 && (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-300 text-[#622347]/50 rtl:rotate-180 ${
                      isExpanded ? "rotate-90 rtl:rotate-90 text-[#A54055]" : ""
                    }`}
                  />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && cat.sections && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#FAF7F6]/60 border-t border-[#EFE6E6]"
                  >
                    <div className="px-3 py-2 space-y-1">
                      {cat.sections.map((sec, j) => {
                        const subKey = `${cat.id}-${sec.name}`;
                        const isSubExpanded = expandedSub === subKey;
                        const hasLinks = Array.isArray(sec.links) && sec.links.length > 0;

                        return (
                          <div key={j} className="rounded-xl overflow-hidden bg-white/80">
                            <div className="flex items-center justify-between p-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigate(
                                    `/shop?category=${encodeURIComponent(
                                      cat.name
                                    )}&subcategory=${encodeURIComponent(sec.name)}`
                                  );
                                  onClose();
                                }}
                                className="flex-1 text-start text-xs text-[#1A1836] font-semibold border-none bg-transparent cursor-pointer hover:text-[#A54055] transition-colors p-1"
                              >
                                {getCategoryTranslation(sec.name, t)}
                              </button>
                              {hasLinks && (
                                <button
                                  type="button"
                                  onClick={() => toggleSub(subKey)}
                                  className="p-1 text-[#622347]/60 hover:text-[#1A1836] border-none bg-transparent cursor-pointer"
                                  aria-label={t("mobile_menu.open_subcategories", "Ouvrir les sous-rayons")}
                                >
                                  <ChevronRight
                                    className={`w-3.5 h-3.5 transition-transform duration-200 rtl:rotate-180 ${
                                      isSubExpanded ? "rotate-90 rtl:rotate-90 text-[#A54055]" : ""
                                    }`}
                                  />
                                </button>
                              )}
                            </div>

                            {hasLinks && isSubExpanded && (
                              <div className="px-2.5 pb-2 pt-0.5 flex flex-wrap gap-1 border-t border-cyan-100/40">
                                {sec.links!.map((link, k) => (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() => {
                                      onNavigate(
                                        `/shop?category=${encodeURIComponent(
                                          cat.name
                                        )}&subcategory=${encodeURIComponent(
                                          sec.name
                                        )}&subsubcategory=${encodeURIComponent(link.name)}`
                                      );
                                      onClose();
                                    }}
                                    className="text-[10px] px-2 py-1 rounded-md bg-cyan-50/80 hover:bg-cyan-100 text-cyan-900 font-medium transition-colors border border-cyan-100/60"
                                  >
                                    {getCategoryTranslation(link.name, t)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
