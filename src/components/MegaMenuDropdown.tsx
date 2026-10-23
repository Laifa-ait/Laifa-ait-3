import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { MegaMenuCategory, FeaturedProduct } from "../context/MegaMenuContext";
import { Product } from "../domains/product/product.types";
import { Language } from "../domains/home/homepage.types";
import { getTranslatedField } from "../utils/translations";
import { OptimizedImage } from "./ui/OptimizedImage";

interface MegaMenuDropdownProps {
  activeCategoryData: MegaMenuCategory | undefined;
  activeSectionName: string | null;
  setActiveSectionName: (name: string) => void;
  hoveredProduct: FeaturedProduct | null;
  setHoveredProduct: (p: FeaturedProduct | null) => void;
  productCache: Record<string, Product>;
  onClose: () => void;
}

const CATEGORY_FEATURED_CONFIG: Record<
  string,
  { title: string; image: string; link?: string }
> = {
  "Bricolage & Outillage": {
    title: "OUTILS DE PROS - Équipez-vous pour l'action",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=Bricolage%20%26%20Outillage",
  },
  "Maison & Déco": {
    title: "DESIGN & CONFORT - Sublimez votre intérieur",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=Maison%20%26%20D%C3%A9co",
  },
  "Électronique": {
    title: "HIGH-TECH DE POINTE - Performance & Innovation",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=%C3%89lectronique",
  },
  "Électroménager": {
    title: "ÉLECTROMÉNAGER - L'art de vivre au quotidien",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=%C3%89lectrom%C3%A9nager",
  },
  "Home Appliances": {
    title: "ÉLECTROMÉNAGER - L'art de vivre au quotidien",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=%C3%89lectrom%C3%A9nager",
  },
  "Mode": {
    title: "STYLE & ÉLÉGANCE - Les nouvelles tendances",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=Mode",
  },
  "Auto & Moto": {
    title: "SHOWROOM AUTO - Véhicules & Pièces certifiées",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    link: "/auto",
  },
  "Beauté & Santé": {
    title: "SOIN & BIEN-ÊTRE - Révélez votre éclat naturel",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=Beaut%C3%A9%20%26%20Sant%C3%A9",
  },
  "Sport & Loisirs": {
    title: "DÉPASSEZ VOS LIMITES - Équipement sportif pro",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=Sport%20%26%20Loisirs",
  },
  "Bébé & Puériculture": {
    title: "DOUCEUR & SÉCURITÉ - Le meilleur pour bébé",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=B%C3%A9b%C3%A9%20%26%20Pu%C3%A9riculture",
  },
  "Artisanat & Tradition": {
    title: "AUTHENTICITÉ - L'artisanat d'exception",
    image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=Artisanat%20%26%20Tradition",
  },
};

export const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({
  activeCategoryData,
  activeSectionName,
  setActiveSectionName,
  hoveredProduct,
  setHoveredProduct,
  productCache,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  const displayedProductInfo = hoveredProduct || activeCategoryData?.featuredProduct;
  const productToDisplay = displayedProductInfo?.productId
    ? productCache[displayedProductInfo.productId]
    : null;

  const activeCategoryName = activeCategoryData?.name || "";
  const categoryConfig = CATEGORY_FEATURED_CONFIG[activeCategoryName] || {
    title: `${activeCategoryName.toUpperCase()} - Découvrez la sélection`,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    link: `/shop?category=${encodeURIComponent(activeCategoryName)}`,
  };

  const featuredTitle = productToDisplay
    ? getTranslatedField(productToDisplay, "name", lang)
    : categoryConfig.title;

  const featuredImage = productToDisplay
    ? productToDisplay.images?.[0] || productToDisplay.image
    : categoryConfig.image;

  const featuredLink = productToDisplay
    ? `/product/${productToDisplay.id}`
    : categoryConfig.link || `/shop?category=${encodeURIComponent(activeCategoryName)}`;

  const activeSection = activeCategoryData?.sections.find((s) => s.name === activeSectionName) || activeCategoryData?.sections[0];

  return (
    <AnimatePresence>
      {activeCategoryData && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.995 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-0 right-0 z-50 pt-3 pb-8 px-4 sm:px-6 md:px-8 pointer-events-auto"
        >
          {/* Cadre arrondi flottant haute fidélité */}
          <div className="max-w-[88rem] mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.14)] p-6 sm:p-8">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Colonne 1 : SOUS-CATÉGORIES (SANS PETITS LOGOS, avec chevron sur l'actif) */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3 pr-2 lg:pr-6 lg:border-r border-slate-100">
                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase mb-4">
                  {t("sub_categories", "SOUS-CATÉGORIES")}
                </h3>
                <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {activeCategoryData.sections.map((section, idx) => {
                    const isActive = (activeSection?.name === section.name);
                    return (
                      <button
                        key={`sec-${idx}-${section.name}`}
                        type="button"
                        onMouseEnter={() => setActiveSectionName(section.name)}
                        onClick={() => setActiveSectionName(section.name)}
                        className={`w-full text-left py-2.5 px-3.5 rounded-xl text-[13px] font-semibold transition-all duration-150 flex items-center justify-between cursor-pointer ${
                          isActive
                            ? "bg-[#5B4865] text-white shadow-xs"
                            : "bg-transparent text-slate-800 hover:text-slate-950 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">
                          {t(section.name) || section.name}
                        </span>
                        {isActive && <ChevronRight className="w-4 h-4 text-white shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colonne 2 : Éléments de la sous-catégorie active en grille 2 colonnes */}
              <div className="col-span-12 md:col-span-8 lg:col-span-6 px-2 lg:px-4">
                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase mb-4">
                  {activeSection ? (t(activeSection.name) || activeSection.name).toUpperCase() : t("explore", "EXPLORER")}
                </h3>
                {activeSection ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
                    {activeSection.links.map((link, linkIdx) => (
                      <Link
                        key={`link-${linkIdx}-${link.name}`}
                        to={`/shop?category=${encodeURIComponent(
                          activeCategoryData.name
                        )}&subcategory=${encodeURIComponent(
                          activeSection.name.trim()
                        )}&subsubcategory=${encodeURIComponent(link.name.trim())}`}
                        onClick={onClose}
                        onMouseEnter={() => {
                          if (link.featuredProduct) setHoveredProduct(link.featuredProduct);
                        }}
                        className="group flex items-center justify-between py-1.5 text-[13px] font-medium text-slate-800 hover:text-[#5B4865] transition-colors cursor-pointer"
                      >
                        <span className="truncate group-hover:translate-x-0.5 transition-transform">
                          {t(link.name) || link.name}
                        </span>
                        <span className="text-slate-300 group-hover:text-[#5B4865] text-xs font-bold shrink-0 ml-2">
                          {linkIdx % 4 === 3 ? "⌄" : "•"}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Colonne 3 : EN VEDETTE (Poster visuel moderne avec CTA Découvrir) */}
              <div className="col-span-12 lg:col-span-3 pl-2 lg:pl-6 lg:border-l border-slate-100 flex flex-col">
                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase mb-4">
                  {t("featured", "EN VEDETTE")}
                </h3>
                <div className="relative w-full aspect-[4/5] max-h-[420px] rounded-3xl overflow-hidden bg-slate-900 shadow-md group">
                  <OptimizedImage
                    src={featuredImage}
                    alt={featuredTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end text-white">
                    <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-white leading-tight mb-3 line-clamp-3">
                      {featuredTitle}
                    </h4>
                    <Link
                      to={featuredLink}
                      onClick={onClose}
                      className="w-fit px-5 py-2 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-full text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {t("discover", "Découvrir")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
