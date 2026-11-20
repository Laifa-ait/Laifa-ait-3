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
import defaultHeroImg from "../../assets/images/olmart_hero_flagship_1795059554378.jpg";

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

function normalizeWilayaName(raw: string): string {
  return raw.toLowerCase().replace(/^[0-9]+\s*[-–]?\s*/, "").trim();
}

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { activeWilaya, categoryHierarchy } = useShop();
  const { currentUser } = useAuth();
  const { getCategorieFavorite, categoriesVisiteesCount } = useUserHabits();
  const { dbBanners, isBannersLoading, customCategories, homepageSections } = useHomeData();

  const { sortedCategoryCards } = useHomeCategoryConfig(
    customCategories,
    categoryHierarchy,
    categoriesVisiteesCount,
    getCategorieFavorite()
  );

  // Dynamic Target Filtering for Hero Banners
  const filterByTargeting = useCallback(
    (item: Banner) => {
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
        const cleanActive = normalizeWilayaName(activeWilaya);
        const matches = regions.some((reg: string) => {
          const cleanReg = normalizeWilayaName(reg);
          return cleanReg === cleanActive || cleanActive.includes(cleanReg) || cleanReg.includes(cleanActive);
        });
        if (!matches) return false;
      }

      return true;
    },
    [currentUser, activeWilaya]
  );

  // Real Dynamic Target Filtering for Homepage Sections (Wilayas, Audience, Scheduling)
  const filterSectionByTargeting = useCallback(
    (section: HomepageSection) => {
      if (section.isActive === false || section.is_active === false) return false;

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
        const cleanActive = normalizeWilayaName(activeWilaya);
        const matches = regions.some((reg: string) => {
          const cleanReg = normalizeWilayaName(reg);
          return cleanReg === cleanActive || cleanActive.includes(cleanReg) || cleanReg.includes(cleanActive);
        });
        if (!matches) return false;
      }

      return true;
    },
    [currentUser, activeWilaya]
  );

  const targetedHeroBanners = useMemo<HomeHeroBanner[]>(() => {
    const isHeroZone = (b: Banner) => {
      const zone = (b.zone || b.position || "").toLowerCase().trim();
      return !zone || zone === "carousel_main" || zone === "hero" || zone.includes("carrousel") || zone.includes("carousel");
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
        desktop_image: defaultHeroImg,
        imageUrl: defaultHeroImg,
        title: t("home.hero.default_title"),
        subtitle: t("home.hero.default_subtitle"),
        button_text: t("home.hero.default_cta"),
        isActive: true,
      },
    ];
  }, [dbBanners, filterByTargeting, t]);

  return (
    <div className="relative w-full overflow-hidden bg-[#F7F8F6] font-sans text-[#0F1B1D]">
      <Helmet>
        <title>{t("seo_home_title")}</title>
        <meta name="description" content={t("seo_home_description")} />
        <meta name="keywords" content={t("seo_home_keywords")} />
        <meta
          property="og:image"
          content={targetedHeroBanners[0]?.desktop_image || targetedHeroBanners[0]?.imageUrl || defaultHeroImg}
        />
        <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : ""} />
      </Helmet>
      <h1 className="sr-only">{t("home.sr_title")}</h1>

      {/* Marketplace landing hero */}
      <section className="relative w-full overflow-hidden pb-8 pt-4 sm:pb-12 sm:pt-6 lg:pt-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 h-[24rem] w-[24rem] rounded-full bg-[#0D5C4B]/[0.06] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-44 h-[20rem] w-[20rem] rounded-full bg-[#E59A42]/[0.08] blur-3xl" />
        <div className="relative mx-auto w-full max-w-[90rem] px-4 sm:px-6 md:px-8">
          {isBannersLoading ? (
            <div className="min-h-[360px] w-full animate-pulse rounded-3xl border border-[#E3E9E5] bg-white shadow-xs sm:min-h-[430px] lg:min-h-[490px]" />
          ) : (
            <BentoHero banners={targetedHeroBanners} />
          )}
        </div>
      </section>

      {/*Grille des Rayons & Départements */}
      <NeoCategoryGrid categories={sortedCategoryCards} favoriteCategory={getCategorieFavorite()} />

      {/* Emplacements Sponsorisés Home (masqué si vide, zéro mock fallback) */}
      <SponsoredSection />

      {/* Sections administrables dynamiques */}
      {[...(homepageSections || [])]
        .filter((section) => section && filterSectionByTargeting(section))
        .sort((a, b) => (a.orderIndex ?? a.sort_order ?? 0) - (b.orderIndex ?? b.sort_order ?? 0))
        .map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}

      {/* Grille infinie de produits */}
      <HomeEndlessGrid />
    </div>
  );
};
