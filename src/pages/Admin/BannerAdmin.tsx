import React from "react";
import { useTranslation } from "react-i18next";
import { useBannerAdmin } from "../../hooks/useBannerAdmin";
import { BannerListTable } from "../../components/Admin/BannerAdmin/BannerListTable";
import { BannerFormModal } from "../../components/Admin/BannerAdmin/BannerFormModal";
import { BannerPreviewModal } from "../../components/Admin/BannerAdmin/BannerPreviewModal";
import { TagManagerSection } from "../../components/Admin/BannerAdmin/TagManagerSection";
import { BannerAdminHeader } from "../../components/Admin/BannerAdmin/BannerAdminHeader";
import { WilayaCampaignsSection } from "../../components/Admin/BannerAdmin/WilayaCampaignsSection";

export const BannerAdmin: React.FC = () => {
  const { t } = useTranslation();
  const state = useBannerAdmin();

  const {
    activeTab,
    setActiveTab,
    banners,
    tags,
    isLoading,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    previewBannerData,
    previewDeviceMode,
    setPreviewDeviceMode,
    tagName,
    tagSlug,
    setTagSlug,
    handleCreateTag,
    handleDeleteTag,
    handleTagNameChange,
    handleOpenBannerModal,
    handleDeleteBanner,
    handleToggleBannerActive,
    handleDuplicateBanner,
    shiftIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = state;

  const configuredWilayasCount = Object.keys(state.wilayaBanners || {}).length;

  return (
    <div id="banner-admin-root" className="min-h-screen bg-[#fcfcfd] p-4 sm:p-8 space-y-8 pb-24">
      <BannerAdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleOpenBannerModal={() => handleOpenBannerModal(null)}
        totalBannersCount={banners.length}
        configuredWilayasCount={configuredWilayasCount}
      />

      {isLoading ? (
        <div id="banner-admin-loading-spinner" className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
            {t("Chargement des configurations d'Algérie...")}
          </span>
        </div>
      ) : activeTab === "banners" ? (
        <div id="tab-content-banners" className="animate-fade-in">
          <BannerListTable
            banners={banners}
            tags={tags}
            handleOpenBannerModal={handleOpenBannerModal}
            handleDeleteBanner={handleDeleteBanner}
            handleToggleBannerActive={handleToggleBannerActive}
            handleDuplicateBanner={handleDuplicateBanner}
            shiftIndex={shiftIndex}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            draggedIndex={state.draggedIndex}
            setPreviewDeviceMode={setPreviewDeviceMode}
            setIsPreviewModalOpen={setIsPreviewModalOpen}
            setPreviewBannerData={state.setPreviewBannerData}
          />
        </div>
      ) : activeTab === "wilayas" ? (
        <WilayaCampaignsSection
          selectedWilaya={state.selectedWilaya}
          setSelectedWilaya={state.setSelectedWilaya}
          wilayaBanners={state.wilayaBanners || {}}
          currentWilayaData={state.currentWilayaData}
          updateCurrentWilayaField={state.updateCurrentWilayaField}
          handleWilayaImageUpload={state.handleWilayaImageUpload}
          handleSaveWilayaCampaign={state.handleSaveWilayaCampaign}
          handleDeleteWilayaCampaign={state.handleDeleteWilayaCampaign}
          isUploadingWilayaImg={state.isUploadingWilayaImg}
          isSavingWilaya={state.isSavingWilaya}
        />
      ) : (
        <TagManagerSection
          tags={tags}
          tagName={tagName}
          tagSlug={tagSlug}
          setTagSlug={setTagSlug}
          handleCreateTag={handleCreateTag}
          handleDeleteTag={handleDeleteTag}
          handleTagNameChange={handleTagNameChange}
        />
      )}

      <BannerFormModal state={state} />

      <BannerPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          state.setPreviewBannerData(null);
        }}
        previewBannerData={previewBannerData}
        tags={tags}
        previewDeviceMode={previewDeviceMode}
        setPreviewDeviceMode={setPreviewDeviceMode}
      />
    </div>
  );
};
