import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Store, Package, SearchX, AlertTriangle, Layout, Plus } from 'lucide-react';
import { ProductCard } from '../../components/Product/ProductCard';
import { StoreProductsFilter } from '../../components/Store/StoreProductsFilter';
import { StoreAboutView } from '../../components/Store/StoreAboutView';
import { StoreProfileHeader } from '../../components/Store/StoreProfileHeader';
import { StoreBoutiqueNavbar } from '../../components/Store/StoreBoutiqueNavbar';
import { StoreProfileModals } from '../../components/Store/StoreProfileModals';
import { StoreLoadingState, StoreErrorState } from '../../components/Store/StoreProfileStates';
import { SellerCouponBanner } from '../../components/Shop/SellerCouponBanner';
import { StoreSectionRenderer } from '../../components/Store/sections/StoreSectionRenderer';
import { StoreCollectionPageView } from '../../components/Store/StoreCollectionPageView';
import { useStoreProfile } from './hooks/useStoreProfile';
import { apiPost } from '../../lib/api';
import type {
  CategoryItem,
  CollectionPageDesignConfig,
  CustomPageSeo,
  CustomPageTheme,
} from '../../domains/seller/customPage.types';

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

export const StoreProfile: React.FC = () => {
  const {
    navigate,
    t,
    isRTL,
    d,
    storeInfo,
    publishedLayout,
    products,
    loading,
    isFollowing,
    followLoading,
    showConfirm,
    setShowConfirm,
    displayLimit,
    setDisplayLimit,
    totalCount,
    LOAD_MORE_LIMIT,
    isEditingAbout,
    setIsEditingAbout,
    savingAbout,
    editForm,
    setEditForm,
    uploadingLogo,
    uploadingBanner,
    isOwner,
    adjustingImage,
    setAdjustingImage,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleLogoFileSelect,
    handleBannerFileSelect,
    handleSaveAdjustedImage,
    handleFollowToggle,
    executeFollowAction,
    handleSaveAbout,
    errorType,
    productsError,
    reloadStore,
  } = useStoreProfile();

  const [activeRayonView, setActiveRayonView] = React.useState<CategoryItem | null>(null);
  const [isCollectionViewOpen, setIsCollectionViewOpen] = React.useState<boolean>(false);

  const hasPaidCustomStore = Boolean(
    storeInfo?.hasPaidStudioSubscription &&
      publishedLayout &&
      Array.isArray(publishedLayout.sections) &&
      publishedLayout.sections.length > 0
  );

  const allStoreRayons = React.useMemo<CategoryItem[]>(() => {
    if (!hasPaidCustomStore) return [];
    const sections = publishedLayout?.sections || [];
    const catSec = sections.find((s) => s.type === 'featured_categories');
    if (!catSec) return [];
    const raw = (catSec.settings as { categories?: CategoryItem[] }).categories;
    return Array.isArray(raw) ? raw : [];
  }, [hasPaidCustomStore, publishedLayout?.sections]);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{
        viewMode?: string;
        categorySlug?: string;
        categoryItem?: CategoryItem;
      }>;
      const detail = custom.detail || {};
      if (detail.viewMode === 'category') {
        const found =
          detail.categoryItem ||
          allStoreRayons.find((c) => c.slug === detail.categorySlug) ||
          null;
        setActiveRayonView(found);
        setIsCollectionViewOpen(true);
      } else if (detail.viewMode === 'collection') {
        setActiveRayonView(null);
        setIsCollectionViewOpen(true);
      }
    };
    window.addEventListener('studio:navigate-page', handler);
    return () => window.removeEventListener('studio:navigate-page', handler);
  }, [allStoreRayons]);

  React.useEffect(() => {
    if (storeInfo?.sellerId) {
      apiPost(`/api/v1/public/stores/${encodeURIComponent(storeInfo.sellerId)}/track`, {
        eventType: 'store_view',
        source: new URLSearchParams(window.location.search).get('src') || 'direct',
      }).catch(() => {});
    }
  }, [storeInfo?.sellerId]);

  const storeTheme = storeInfo?.theme;
  const storeThemeStyles: React.CSSProperties = React.useMemo(() => {
    const primary = storeTheme?.primaryColor || '#023859';
    const secondary = storeTheme?.secondaryColor || '#26658C';
    const accent = storeTheme?.accentColor || '#54ACBF';
    const canvas = storeTheme?.canvasColor || '#F8FBFC';
    const surface = storeTheme?.surfaceColor || '#FFFFFF';
    const borderRadius = storeTheme?.borderRadiusPx ? `${storeTheme.borderRadiusPx}px` : '16px';

    return {
      backgroundColor: canvas,
      fontFamily:
        storeTheme?.fontFamily || "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      ['--store-primary' as string]: primary,
      ['--store-secondary' as string]: secondary,
      ['--store-accent' as string]: accent,
      ['--store-surface' as string]: surface,
      ['--store-border-radius' as string]: borderRadius,
    };
  }, [storeTheme]);

  if (loading) {
    return <StoreLoadingState message={d('loading')} />;
  }

  if (!storeInfo) {
    return (
      <StoreErrorState
        errorType={errorType}
        d={d}
        onRetry={reloadStore}
        onBack={() => navigate('/shop')}
      />
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || p.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const visibleProducts = filteredProducts.slice(0, displayLimit);
  const hasMore = displayLimit < filteredProducts.length;
  const totalProductsCount = totalCount ?? products.length;

  const seoTitle = storeInfo.seo?.metaTitle || `${storeInfo.shopName} | Olmart Algérie`;
  const seoDesc =
    storeInfo.seo?.metaDescription ||
    storeInfo.shopDescription ||
    `Découvrez les articles de ${storeInfo.shopName} sur Olmart Algérie.`;
  const seoImage = storeInfo.seo?.ogImage || storeInfo.bannerUrl || storeInfo.logoUrl;
  const canonicalUrl = `https://olmart.dz/store/${storeInfo.shopSlug || storeInfo.sellerId || storeInfo.id}`;

  const theme = storeInfo.theme || {
    sector: 'mode',
    primaryColor: '#023859',
    secondaryColor: '#26658C',
    accentColor: '#54ACBF',
    canvasColor: '#F8FBFC',
    surfaceColor: '#FFFFFF',
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  };

  return (
    <div
      id="storefront-root"
      style={storeThemeStyles}
      className="@container/store @container min-h-screen pb-16 font-sans transition-colors"
    >
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {seoImage && <meta property="og:image" content={seoImage} />}
      </Helmet>

      {/* 1. Dedicated Boutique Top Navigation */}
      <StoreBoutiqueNavbar storeInfo={storeInfo} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 2. Store Header with Integrated Reassurance Bar */}
        <StoreProfileHeader
          storeInfo={storeInfo}
          productsCount={totalProductsCount}
          isOwner={isOwner}
          uploadingBanner={uploadingBanner}
          uploadingLogo={uploadingLogo}
          isFollowing={isFollowing}
          followLoading={followLoading}
          d={d}
          onBannerSelect={handleBannerFileSelect}
          onLogoSelect={handleLogoFileSelect}
          onFollowToggle={handleFollowToggle}
        />

        {/* 3. Seller Promo Coupon Banner (if any active coupons) */}
        <SellerCouponBanner
          sellerId={storeInfo.sellerId || storeInfo.id || storeInfo.uid}
          className="my-4"
        />

        {/* 4. Clean Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#26658C]/15 mb-5 pb-2.5 overflow-x-auto no-scrollbar">
          {hasPaidCustomStore && (
            <button
              type="button"
              onClick={() => setActiveTab('home' as unknown as 'products' | 'about')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                (activeTab as string) === 'home'
                  ? 'bg-[#023859] text-white shadow-2xs'
                  : 'text-[#023859]/80 hover:bg-[#A7EBF2]/20 hover:text-[#011C40]'
              }`}
            >
              <Layout className="w-4 h-4 text-[#54ACBF]" />
              <span>Accueil Vitrine</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#023859] text-white shadow-2xs'
                : 'text-[#023859]/80 hover:bg-[#A7EBF2]/20 hover:text-[#011C40]'
            }`}
          >
            <Package className="w-4 h-4 text-[#54ACBF]" />
            <span>{d('articles')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                activeTab === 'products'
                  ? 'bg-[#54ACBF]/30 text-[#A7EBF2]'
                  : 'bg-[#26658C]/10 text-[#023859]'
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'about'
                ? 'bg-[#023859] text-white shadow-2xs'
                : 'text-[#023859]/80 hover:bg-[#A7EBF2]/20 hover:text-[#011C40]'
            }`}
          >
            <Store className="w-4 h-4 text-[#54ACBF]" />
            <span>À propos</span>
          </button>
        </div>

        {/* 5. Active Tab Content */}
        {isCollectionViewOpen ? (
          <StoreCollectionPageView
            activeCategory={activeRayonView}
            allCategories={allStoreRayons}
            products={products}
            theme={theme}
            config={storeInfo.collectionPageConfig}
            onSelectCategory={(cat) => setActiveRayonView(cat)}
            onBackToHome={() => {
              setIsCollectionViewOpen(false);
              setActiveRayonView(null);
            }}
          />
        ) : (activeTab as string) === 'home' && hasPaidCustomStore && publishedLayout ? (
          <div className="space-y-6">
            {publishedLayout.sections.map((section) => (
              <StoreSectionRenderer
                key={section.id}
                section={section}
                theme={theme}
                products={products}
                isEditable={false}
              />
            ))}
          </div>
        ) : activeTab === 'products' ? (
          <div className="space-y-5">
            <StoreProductsFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              storeCategories={Array.from(
                new Set(products.map((p) => p.category).filter(Boolean))
              )}
              getCategoryCount={(cat) => products.filter((p) => p.category === cat).length}
              filteredCount={filteredProducts.length}
              isRTL={isRTL}
            />

            {productsError ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-red-200/60 shadow-2xs space-y-3">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-base sm:text-lg font-bold text-[#011C40]">
                  {d('productsError')}
                </h3>
                <p className="text-xs text-[#26658C]/80 max-w-sm mx-auto">
                  {d('productsErrorDesc')}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={reloadStore}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#023859] text-white rounded-xl text-xs font-bold hover:bg-[#011C40] transition-colors cursor-pointer"
                  >
                    <span>{d('retry')}</span>
                  </button>
                </div>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#26658C]/15 shadow-2xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#A7EBF2]/25 flex items-center justify-center mx-auto text-[#023859]">
                  <SearchX className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#011C40]">
                  {searchQuery || selectedCategory
                    ? 'Aucun article ne correspond à votre recherche'
                    : d('emptyStore')}
                </h3>
                <p className="text-xs sm:text-sm text-[#26658C]/80 max-w-sm mx-auto">
                  {searchQuery || selectedCategory
                    ? 'Essayez avec d’autres mots-clés ou affichez tous les rayons.'
                    : d('emptyDesc')}
                </p>
                {isOwner && !searchQuery && !selectedCategory && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/seller/catalog?action=new')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#023859] hover:bg-[#011C40] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4 text-[#A7EBF2]" />
                      <span>Ajouter un article au catalogue</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center pt-6">
                    <button
                      type="button"
                      onClick={() => setDisplayLimit((prev) => prev + LOAD_MORE_LIMIT)}
                      className="px-7 py-2.5 bg-white hover:bg-[#F8FBFC] border border-[#26658C]/20 text-[#023859] hover:border-[#54ACBF] rounded-xl font-bold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
                    >
                      {d('loadMore')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <StoreAboutView
            storeInfo={storeInfo}
            isOwner={isOwner}
            isEditingAbout={isEditingAbout}
            setIsEditingAbout={setIsEditingAbout}
            savingAbout={savingAbout}
            editForm={editForm}
            setEditForm={setEditForm}
            saveAboutInfo={handleSaveAbout}
            totalCount={totalProductsCount}
            isRTL={isRTL}
            d={d}
            t={t}
          />
        )}
      </div>

      {/* Modals */}
      <StoreProfileModals
        adjustingImage={adjustingImage}
        setAdjustingImage={setAdjustingImage}
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        isRTL={isRTL}
        onSaveAdjustedImage={handleSaveAdjustedImage}
        onExecuteFollowAction={executeFollowAction}
      />
    </div>
  );
};
