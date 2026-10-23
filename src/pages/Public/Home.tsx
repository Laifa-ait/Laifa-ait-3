import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
import { BentoHero } from "../../components/Home/BentoHero";
import { NeoCategoryGrid } from "../../components/Home/NeoCategoryGrid";
import { DynamicSection } from "../../components/Home/DynamicSection";
import { HomeEndlessGrid } from "../../components/Home/HomeEndlessGrid";
import { SponsoredSection } from "../../components/Home/SponsoredSection";
import { Banner, HomepageSection } from "../../domains/home/homepage.types";
import { Helmet } from "react-helmet-async";
import { useUserHabits } from "../../hooks/useUserHabits";
import { useHomeData } from "../../hooks/useHomeData";
import { useHomeCategoryConfig } from "./hooks/useHomeCategoryConfig";

interface HomeHeroBanner extends Partial<Banner> {
  id: string;
  desktop_image?: string;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  buttonText?: string;
  isActive?: boolean;
  is_active?: boolean;
  ctaLink?: string;
  translations?: Record<string, Record<string, string>>;
  mobile_image?: string | null;
  mobileImageUrl?: string;
}

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { activeWilaya } = useShop();
  const { currentUser } = useAuth();

  const {
    getCategorieFavorite,
    categoriesVisiteesCount,
  } = useUserHabits();

  const {
    dbBanners,
    isBannersLoading,
    customCategories,
    homepageSections,
  } = useHomeData();

  const { categoryHierarchy } = useShop();

  const { sortedCategoryCards } = useHomeCategoryConfig(
    customCategories,
    categoryHierarchy,
    categoriesVisiteesCount,
    getCategorieFavorite()
  );

  // Dynamic Target Filtering for Hero Banners
  const filterByTargeting = useCallback((item: Banner) => {
    if (item.isActive === false || item.is_active === false) return false;

    const startDate = item.startDate || item.start_date;
    if (startDate && new Date() < new Date(startDate as string | number)) return false;
    const endDate = item.endDate || item.end_date;
    if (endDate && new Date() > new Date(endDate as string | number)) return false;

    const audienceValue = item.targetUserType || item.target_user_type;
    if (audienceValue && audienceValue !== "all") {
      if (audienceValue === "logged_in" && !currentUser) return false;
      if (audienceValue === "new" && currentUser) return false;
    }

    const regions = item.targetRegions || item.target_regions;
    if (regions && regions.length > 0 && activeWilaya && activeWilaya !== "Tous") {
      const cleanActive = activeWilaya.toLowerCase().trim();
      const matches = regions.some((reg: string) => {
        const cleanReg = reg.toLowerCase().trim();
        return cleanReg === cleanActive || cleanActive.includes(cleanReg) || cleanReg.includes(cleanActive);
      });
      if (!matches) return false;
    }

    return true;
  }, [currentUser, activeWilaya]);

  // Real Dynamic Target Filtering for Homepage Sections (Wilayas, Audience, Scheduling)
  const filterSectionByTargeting = useCallback((section: HomepageSection) => {
    if (section.isActive === false) return false;

    const startDate = section.startDate;
    if (startDate && new Date() < new Date(startDate as string | number)) return false;
    const endDate = section.endDate;
    if (endDate && new Date() > new Date(endDate as string | number)) return false;

    const audience = section.targetAudience;
    if (audience && audience !== "all") {
      if (audience === "logged_in" && !currentUser) return false;
      if (audience === "new" && currentUser) return false;
      if (audience === "vip") {
        const isVip = Boolean(currentUser && (currentUser as { isVip?: boolean }).isVip);
        if (!isVip) return false;
      }
    }

    const regions = section.targetRegions;
    if (regions && regions.length > 0 && activeWilaya && activeWilaya !== "Tous") {
      const cleanActive = activeWilaya.toLowerCase().replace(/^[0-9]+\s*[-–]?\s*/, "").trim();
      const matches = regions.some((reg: string) => {
        const cleanReg = reg.toLowerCase().replace(/^[0-9]+\s*[-–]?\s*/, "").trim();
        return cleanReg === cleanActive || cleanActive.includes(cleanReg) || cleanReg.includes(cleanActive);
      });
      if (!matches) return false;
    }

    return true;
  }, [currentUser, activeWilaya]);

  const targetedHeroBanners = useMemo<HomeHeroBanner[]>(() => {
    const isHeroZone = (b: Banner) => {
      const zone = (b.zone || b.position || "").toLowerCase().trim();
      return (
        !zone ||
        zone === "carousel_main" ||
        zone === "hero" ||
        zone.includes("carrousel") ||
        zone.includes("carousel")
      );
    };

    const filtered = dbBanners
      .filter(isHeroZone)
      .filter((b) => filterByTargeting(b))
      .map((b) => {
        const desktopImg = b.desktop_image || b.desktopImage || b.imageUrl || "";
        const mobileImg = b.mobile_image || b.mobileImageUrl || desktopImg;
        return {
          ...b,
          desktop_image: desktopImg,
          imageUrl: desktopImg,
          mobile_image: mobileImg,
          mobileImageUrl: mobileImg,
        };
      });

    if (filtered.length > 0) return filtered;

    return [
      {
        id: "default-1",
        desktop_image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
        title: t("hero_title_1", "Sélection Mode & Décoration"),
        subtitle: t("hero_sub_1", "Les meilleures marques et artisans algériens livrés chez vous"),
        button_text: t("hero_btn_1", "Découvrir la sélection"),
        isActive: true,
      },
    ];
  }, [dbBanners, filterByTargeting, t]);

  return (
    <div className="relative w-full overflow-hidden bg-[#f6f7f3] font-sans text-slate-950">
      <Helmet>
        <title>{t("seo_home_title")}</title>
        <meta name="description" content={t("seo_home_description")} />
        <meta name="keywords" content={t("seo_home_keywords")} />
        <meta
          property="og:image"
          content={
            targetedHeroBanners[0]?.desktop_image ||
            targetedHeroBanners[0]?.imageUrl ||
            "/images/placeholders/product.svg"
          }
        />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <h1 className="sr-only">{t("home.sr_title")}</h1>

      {/* Marketplace landing hero */}
      <section className="relative w-full overflow-hidden pb-7 pt-4 sm:pb-10 sm:pt-7 lg:pt-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#E8DFEB]/55 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-48 h-[22rem] w-[22rem] rounded-full bg-[#F3E9D1]/60 blur-3xl" />
        <div className="relative mx-auto w-full max-w-[96rem] px-4 sm:px-6 md:px-8">
          {isBannersLoading ? (
            <div className="min-h-[460px] w-full animate-pulse rounded-[1.5rem] border border-white bg-white/80 shadow-sm sm:min-h-[430px] lg:min-h-[390px] 2xl:min-h-[410px]" />
          ) : (
            <BentoHero banners={targetedHeroBanners} />
          )}
        </div>
      </section>

      {/* The application switcher owns cross-platform navigation; keep this page focused on shopping. */}
      <NeoCategoryGrid
        categories={sortedCategoryCards}
        favoriteCategory={getCategorieFavorite()}
      />

      {/* Emplacements Sponsorisés Home (masqué si vide, zéro mock fallback) */}
      <SponsoredSection />

      {/* Sections administrables dynamiques */}
      {[...(homepageSections || [])]
        .filter((section) => section && filterSectionByTargeting(section))
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
        .map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}

      {/* d) La grille infinie de produits */}
      <HomeEndlessGrid />
    </div>
  );
};
