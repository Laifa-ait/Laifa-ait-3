import React from "react";
import { Helmet } from "react-helmet-async";
import { Store, Package, Layout } from "lucide-react";
import { StoreAboutView } from "../../components/Store/StoreAboutView";
import { StoreProfileHeader } from "../../components/Store/StoreProfileHeader";
import { StoreBoutiqueNavbar } from "../../components/Store/StoreBoutiqueNavbar";
import { StoreProfileModals } from "../../components/Store/StoreProfileModals";
import { StoreLoadingState, StoreErrorState } from "../../components/Store/StoreProfileStates";
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
import { apiPost } from "../../lib/api";
import type {
  CategoryItem,
  CollectionPageDesignConfig,
  CustomPageSeo,
  CustomPageTheme,
} from "../../domains/seller/customPage.types";

export interface PublicStoreInfo {
  id: string;
  sellerId: string;
  shopName: string;
  shopDescription?: string;
  wilaya: string;
  legalStatus?: string;
  avgPreparationTime?: string;
  returnPolicy?: string;
  followersCount?: number;
  rating?: number | null;
  status?: string;
  logoUrl?: string;
  bannerUrl?: string;
  shopSlug?: string;
  coverImage?: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  uid?: string;
  userUid?: string;
  error?: string;
  photoURL?: string;
  photoUrl?: string;
  avatar?: string;
  banner?: string;
  storeBanner?: string;
  sellerBanner?: string;
  bannerImage?: string;
  brand?: string;
  hasPaidStudioSubscription?: boolean;
  theme?: CustomPageTheme;
  seo?: CustomPageSeo;
  collectionPageConfig?: CollectionPageDesignConfig;
}

const DEFAULT_CASBAH_THEME: CustomPageTheme = {
  sector: "artisanat",
  primaryColor: "#B45309",
  secondaryColor: "#18181B",
  accentColor: "#B45309",
  canvasColor: "#FAF6F0",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  headingFontFamily: "'Cormorant Garamond', Georgia, serif",
  bodyFontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  borderRadiusPx: 16,
  spacingYPx: 28,
  titleFontSizePx: 36,
  bodyFontSizePx: 15,
  surfaceTexture: "cotton-paper",
  ambientLighting: "golden-hour",
  cardMaterial: "solid-matte",
  frameShape: "casbah-arch",
  headingAccentStyle: "metallic-gold",
  headingUnderlineStyle: "brush-stroke",
};

export const StoreProfile: React.FC = () => {
  const sp = useStoreProfile();
  const { storeInfo, publishedLayout, products, loading, d, activeTab, setActiveTab } = sp;

  const [activeRayonView, setActiveRayonView] = React.useState<CategoryItem | null>(null);
  const [isCollectionViewOpen, setIsCollectionViewOpen] = React.useState<boolean>(false);

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
      products.map((p) => p.id)
    );
  }, [publishedLayout?.sections, storeInfo?.shopName, storeInfo?.shopDescription, storeInfo?.bannerUrl, products]);

  const allStoreRayons = React.useMemo<CategoryItem[]>(() => {
    const catSec = effectiveSections.find((s) => s.type === "featured_categories");
    const raw = (catSec?.settings as { categories?: CategoryItem[] } | undefined)?.categories;
    return Array.isArray(raw) ? raw : [];
  }, [effectiveSections]);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ viewMode?: string; categorySlug?: string; categoryItem?: CategoryItem }>).detail || {};
      if (detail.viewMode === "category") {
        setActiveRayonView(detail.categoryItem || allStoreRayons.find((c) => c.slug === detail.categorySlug) || null);
        setIsCollectionViewOpen(true);
      } else if (detail.viewMode === "collection") {
        setActiveRayonView(null);
        setIsCollectionViewOpen(true);
      }
    };
    window.addEventListener("studio:navigate-page", handler);
    return () => window.removeEventListener("studio:navigate-page", handler);
  }, [allStoreRayons]);

  React.useEffect(() => {
    if (storeInfo?.sellerId) {
      apiPost(`/api/v1/public/stores/${encodeURIComponent(storeInfo.sellerId)}/track`, {
        eventType: "store_view",
        source: new URLSearchParams(window.location.search).get("src") || "direct",
      }).catch(() => {});
    }
  }, [storeInfo?.sellerId]);

  const storeThemeStyles = buildStoreThemeCssVariables(theme);
  const primary = theme.primaryColor || "#B45309";
  const textColor = theme.secondaryColor || "#18181B";
  const accentColor = theme.accentColor || primary;
  const sectionGapPx = typeof theme.spacingYPx === "number" ? theme.spacingYPx : 28;

  if (loading) return <StoreLoadingState message={d("loading")} />;
  if (!storeInfo) {
    return <StoreErrorState errorType={sp.errorType} d={d} onRetry={sp.reloadStore} onBack={() => sp.navigate("/shop")} />;
  }

  const totalProductsCount = sp.totalCount ?? products.length;
  const seoTitle = storeInfo.seo?.metaTitle || `${storeInfo.shopName} | Olmart Algérie`;
  const seoDesc = storeInfo.seo?.metaDescription || storeInfo.shopDescription || `Découvrez ${storeInfo.shopName} sur Olmart.`;
  const seoImage = storeInfo.seo?.ogImage || storeInfo.bannerUrl || storeInfo.logoUrl;
  const canonicalUrl = `https://olmart.dz/store/${storeInfo.shopSlug || storeInfo.sellerId || storeInfo.id}`;

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

      <div className="relative z-10"><StoreBoutiqueNavbar storeInfo={storeInfo} /></div>

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
            { id: "home" as const, label: "Accueil Vitrine", icon: Layout, active: activeTab === "home" && !isCollectionViewOpen },
            { id: "products" as const, label: "Catalogue & Collections", icon: Package, active: activeTab === "products" || isCollectionViewOpen, count: totalProductsCount },
            { id: "about" as const, label: "Histoire & Maison", icon: Store, active: activeTab === "about" && !isCollectionViewOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setIsCollectionViewOpen(false); setActiveTab(tab.id); }}
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
        </div>

        {isCollectionViewOpen || activeTab === "products" ? (
          <StoreCollectionPageView
            activeCategory={activeRayonView} allCategories={allStoreRayons} products={products}
            theme={theme} config={storeInfo.collectionPageConfig}
            onSelectCategory={(cat) => setActiveRayonView(cat)}
            onBackToHome={() => { setIsCollectionViewOpen(false); setActiveRayonView(null); setActiveTab("home"); }}
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
            {effectiveSections.map((section) => (
              <StoreSectionRenderer key={section.id} section={section} theme={theme} products={products} isEditable={false} />
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
