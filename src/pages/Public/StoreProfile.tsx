import React from "react";
import { Helmet } from "react-helmet-async";
import { Store, Package, Layout, FileText } from "lucide-react";
import { StoreAboutView } from "../../components/Store/StoreAboutView";
import { StoreProfileHeader } from "../../components/Store/StoreProfileHeader";
import { StoreBoutiqueNavbar } from "../../components/Store/StoreBoutiqueNavbar";
import { StoreCustomHeaderBar } from "../../components/Store/StoreCustomHeaderBar";
import { StoreProfileModals } from "../../components/Store/StoreProfileModals";
import { StoreLoadingState, StoreErrorState } from "../../components/Store/StoreProfileStates";
import { StoreVipLockGate } from "../../components/Store/StoreVipLockGate";
import { SellerCouponBanner } from "../../components/Shop/SellerCouponBanner";
import { StoreSectionRenderer } from "../../components/Store/sections/StoreSectionRenderer";
import { StoreCollectionPageView } from "../../components/Store/StoreCollectionPageView";
import { ArtisticAtmosphereLayer } from "../../components/Store/ArtisticAtmosphereLayer";
import {
  useStoreFontLoader,
  buildStoreThemeCssVariables,
} from "../../components/Store/useStoreFontLoader";
import { buildFiveActsHomeLayout } from "../Seller/StoreBuilder/constants/fiveActsLayoutPreset";
import { useStoreProfile } from "./hooks/useStoreProfile";
import { DEFAULT_CASBAH_THEME, PublicStoreInfo } from "./hooks/storeProfileVipHelper";
import { apiPost } from "../../lib/api";
import type { CategoryItem, CustomPageTheme, StoreConfig, StoreCustomPageItem } from "../../domains/seller/customPage.types";

export type { PublicStoreInfo };

export const StoreProfile: React.FC = () => {
  const sp = useStoreProfile();
  const { storeInfo, publishedLayout, products, loading, d, activeTab, setActiveTab } = sp;

  const [activeRayonView, setActiveRayonView] = React.useState<CategoryItem | null>(null);
  const [isCollectionViewOpen, setIsCollectionViewOpen] = React.useState<boolean>(false);
  const [activeCustomPage, setActiveCustomPage] = React.useState<StoreCustomPageItem | null>(null);

  const isDraftPreview = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("preview") === "draft" || publishedLayout?.status === "draft";
  }, [publishedLayout?.status]);

  const theme: CustomPageTheme = storeInfo?.theme
    ? { ...DEFAULT_CASBAH_THEME, ...storeInfo.theme }
    : DEFAULT_CASBAH_THEME;

  useStoreFontLoader(theme, storeInfo?.shopSlug || storeInfo?.sellerId || "public-store");

  const effectiveSections = React.useMemo(() => {
    if (publishedLayout?.sections && publishedLayout.sections.length > 0) {
      return publishedLayout.sections;
    }
    return buildFiveActsHomeLayout(
      storeInfo?.shopName || "Notre Maison",
      storeInfo?.shopDescription || "Créations authentiques livrées dans les 69 wilayas.",
      storeInfo?.bannerUrl,
      products.map((p) => p.id),
      "editorial-split",
      theme.sector || "artisanat"
    );
  }, [publishedLayout?.sections, storeInfo?.shopName, storeInfo?.shopDescription, storeInfo?.bannerUrl, products, theme.sector]);

  const displayedSections = React.useMemo(() => {
    if (activeCustomPage?.sectionIds && activeCustomPage.sectionIds.length > 0) {
      return effectiveSections.filter((s) => activeCustomPage.sectionIds?.includes(s.id));
    }
    return effectiveSections;
  }, [effectiveSections, activeCustomPage]);

  const allStoreRayons = React.useMemo<CategoryItem[]>(() => {
    const catSec = effectiveSections.find((s) => s.type === "featured_categories");
    const raw = (catSec?.settings as { categories?: CategoryItem[] } | undefined)?.categories;
    return Array.isArray(raw) ? raw : [];
  }, [effectiveSections]);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          viewMode?: string;
          categorySlug?: string;
          categoryItem?: CategoryItem;
          customPage?: StoreCustomPageItem;
          scrollToSectionType?: string;
        }>
      ).detail || {};

      if (detail.viewMode === "category") {
        setActiveCustomPage(null);
        setActiveRayonView(detail.categoryItem || allStoreRayons.find((c) => c.slug === detail.categorySlug) || null);
        setIsCollectionViewOpen(true);
      } else if (detail.viewMode === "collection") {
        setActiveCustomPage(null);
        setActiveRayonView(null);
        setIsCollectionViewOpen(true);
      } else if (detail.viewMode === "about") {
        setActiveCustomPage(null);
        setIsCollectionViewOpen(false);
        setActiveTab("about");
      } else if (detail.viewMode === "custom-page" && detail.customPage) {
        setIsCollectionViewOpen(detail.customPage.templateId === "collection");
        setActiveRayonView(null);
        setActiveCustomPage(detail.customPage);
        setActiveTab("home");
      } else if (detail.viewMode === "home") {
        setActiveCustomPage(null);
        setIsCollectionViewOpen(false);
        setActiveRayonView(null);
        setActiveTab("home");
        if (detail.scrollToSectionType) {
          const targetType = detail.scrollToSectionType;
          requestAnimationFrame(() => {
            document.querySelector(`[data-section-type="${targetType}"]`)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        }
      }
    };
    window.addEventListener("studio:navigate-page", handler);
    return () => window.removeEventListener("studio:navigate-page", handler);
  }, [allStoreRayons, setActiveTab]);

  React.useEffect(() => {
    if (storeInfo?.sellerId && !sp.isVipLocked) {
      apiPost(`/api/v1/public/stores/${encodeURIComponent(storeInfo.sellerId)}/track`, {
        eventType: "store_view",
        source: new URLSearchParams(window.location.search).get("src") || "direct",
      }).catch(() => {});
    }
  }, [storeInfo?.sellerId, sp.isVipLocked]);

  const storeThemeStyles = buildStoreThemeCssVariables(theme);
  const primary = theme.primaryColor || "#B45309";
  const textColor = theme.secondaryColor || "#18181B";
  const accentColor = theme.accentColor || primary;
  const sectionGapPx = typeof theme.spacingYPx === "number" ? theme.spacingYPx : 28;

  if (loading) return <StoreLoadingState message={d("loading")} />;
  if (!storeInfo) {
    return <StoreErrorState errorType={sp.errorType} d={d} onRetry={sp.reloadStore} onBack={() => sp.navigate("/shop")} />;
  }
  if (sp.isVipLocked) {
    return (
      <div id="storefront-root" style={storeThemeStyles} className="min-h-screen relative overflow-hidden">
        <ArtisticAtmosphereLayer theme={theme} />
        <div className="relative z-10">
          <StoreVipLockGate
            shopName={storeInfo.shopName} logoUrl={storeInfo.logoUrl} primaryColor={primary}
            vipError={sp.vipError} vipSubmitting={sp.vipSubmitting} onSubmitPassword={sp.submitVipPassword}
          />
        </div>
      </div>
    );
  }

  const totalProductsCount = sp.totalCount ?? products.length;
  const seoTitle = storeInfo.seo?.metaTitle || `${storeInfo.shopName} | Olmart Algérie`;
  const seoDesc = storeInfo.seo?.metaDescription || storeInfo.shopDescription || `Découvrez ${storeInfo.shopName} sur Olmart.`;
  const seoImage = storeInfo.seo?.ogImage || storeInfo.bannerUrl || storeInfo.logoUrl;
  const canonicalUrl = `https://olmart.dz/store/${storeInfo.shopSlug || storeInfo.sellerId || storeInfo.id}`;
  const publishedCustomPages = (storeInfo.customPages || []).filter((cp) => cp.isPublished !== false && !cp.isHome);

  return (
    <div id="storefront-root" style={storeThemeStyles} className="@container/store @container relative min-h-screen pb-16 transition-colors overflow-hidden">
      <ArtisticAtmosphereLayer theme={theme} />
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {seoImage && <meta property="og:image" content={seoImage} />}
      </Helmet>

      <div className="relative z-10">
        <StoreBoutiqueNavbar storeInfo={storeInfo} isOwner={sp.isOwner} isDraftPreview={isDraftPreview} />
        <StoreCustomHeaderBar
          storeConfig={storeInfo as unknown as StoreConfig}
          theme={theme}
          shopName={storeInfo.shopName}
          isEditable={false}
          disableSticky={true}
          onNavigateView={(mode) => {
            setActiveCustomPage(null);
            if (mode === "collection") {
              setActiveRayonView(null);
              setIsCollectionViewOpen(true);
            } else {
              setIsCollectionViewOpen(false);
              setActiveTab("home");
            }
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <StoreProfileHeader
          storeInfo={storeInfo} productsCount={totalProductsCount} isOwner={sp.isOwner}
          uploadingBanner={sp.uploadingBanner} uploadingLogo={sp.uploadingLogo}
          isFollowing={sp.isFollowing} followLoading={sp.followLoading} d={d}
          onBannerSelect={sp.handleBannerFileSelect} onLogoSelect={sp.handleLogoFileSelect} onFollowToggle={sp.handleFollowToggle}
        />

        <SellerCouponBanner sellerId={storeInfo.sellerId || storeInfo.id || storeInfo.uid} className="my-4" />

        <div className="flex items-center gap-2 border-b border-black/[0.08] mb-6 pb-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "home" as const, label: "Accueil Vitrine", icon: Layout, active: activeTab === "home" && !isCollectionViewOpen && !activeCustomPage },
            { id: "products" as const, label: "Catalogue & Collections", icon: Package, active: activeTab === "products" || (isCollectionViewOpen && !activeCustomPage), count: totalProductsCount },
            { id: "about" as const, label: "Histoire & Maison", icon: Store, active: activeTab === "about" && !isCollectionViewOpen && !activeCustomPage },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveCustomPage(null); setIsCollectionViewOpen(false); setActiveTab(tab.id); }}
                style={tab.active ? { backgroundColor: primary, color: "#FFFFFF" } : { color: textColor }}
                className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  tab.active ? "shadow-sm" : "bg-black/[0.04] hover:bg-black/[0.08]"
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: tab.active ? "#FFFFFF" : accentColor }} />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/15 tabular-nums">{tab.count}</span>
                )}
              </button>
            );
          })}
          {publishedCustomPages.map((cp) => {
            const isCpActive = activeCustomPage?.id === cp.id;
            return (
              <button
                key={cp.id}
                type="button"
                onClick={() => {
                  setActiveCustomPage(cp);
                  setIsCollectionViewOpen(cp.templateId === "collection");
                  setActiveRayonView(null);
                  setActiveTab("home");
                }}
                style={isCpActive ? { backgroundColor: primary, color: "#FFFFFF" } : { color: textColor }}
                className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isCpActive ? "shadow-sm" : "bg-black/[0.04] hover:bg-black/[0.08]"
                }`}
              >
                <FileText className="w-4 h-4" style={{ color: isCpActive ? "#FFFFFF" : accentColor }} />
                <span>{cp.title}</span>
              </button>
            );
          })}
        </div>

        {sp.productsError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <h3 className="text-sm font-bold">{d("productsError")}</h3>
              <p className="text-xs text-rose-800/90 mt-0.5">{d("productsErrorDesc")}</p>
            </div>
            <button
              type="button"
              onClick={sp.reloadStore}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
            >
              {d("retry")}
            </button>
          </div>
        )}

        {!sp.productsError && products.length === 0 && (
          <div className="mb-6 rounded-2xl border border-black/10 bg-white/80 px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold" style={{ color: textColor }}>{d("emptyStore")}</h3>
              <p className="text-xs opacity-75 mt-0.5" style={{ color: textColor }}>{d("emptyDesc")}</p>
            </div>
          </div>
        )}

        {isCollectionViewOpen || activeTab === "products" ? (
          <StoreCollectionPageView
            activeCategory={activeRayonView} allCategories={allStoreRayons} products={products}
            theme={theme} config={storeInfo.collectionPageConfig}
            pageTitle={activeCustomPage?.title}
            pageSubtitle={activeCustomPage?.subtitle}
            pageBannerUrl={activeCustomPage?.bannerUrl}
            onSelectCategory={(cat) => setActiveRayonView(cat)}
            onBackToHome={() => { setIsCollectionViewOpen(false); setActiveRayonView(null); setActiveCustomPage(null); setActiveTab("home"); }}
          />
        ) : activeTab === "about" ? (
          <StoreAboutView
            storeInfo={storeInfo} isOwner={sp.isOwner} isEditingAbout={sp.isEditingAbout}
            setIsEditingAbout={sp.setIsEditingAbout} savingAbout={sp.savingAbout}
            editForm={sp.editForm} setEditForm={sp.setEditForm} saveAboutInfo={sp.handleSaveAbout}
            totalCount={totalProductsCount} isRTL={sp.isRTL} d={d} t={sp.t}
          />
        ) : (
          <div className="flex flex-col" style={{ gap: `${sectionGapPx}px` }}>
            {displayedSections.map((section) => (
              <div key={section.id} data-section-type={section.type}>
                <StoreSectionRenderer section={section} theme={theme} products={products} isEditable={false} />
              </div>
            ))}
          </div>
        )}
      </div>

      <StoreProfileModals
        adjustingImage={sp.adjustingImage} setAdjustingImage={sp.setAdjustingImage}
        showConfirm={sp.showConfirm} setShowConfirm={sp.setShowConfirm}
        isRTL={sp.isRTL} onSaveAdjustedImage={sp.handleSaveAdjustedImage} onExecuteFollowAction={sp.executeFollowAction}
      />
    </div>
  );
};
