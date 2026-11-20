import React from "react";
import { useNavigate } from "react-router-dom";
import "./studio-tokens.css";
import { useSellerStudio } from "./hooks/useSellerStudio";
import { StudioWorkspace } from "./StudioWorkspace";
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SellerSubscription,
} from "../../../domains/seller/subscription.types";
import { Loader2 } from "lucide-react";

interface StoreBuilderActiveProps {
  subscription?: SellerSubscription | null;
  hasActiveSubscription?: boolean;
  daysRemaining?: number;
  sellerId?: string;
  plans?: SubscriptionPlan[];
  pendingRequest?: SubscriptionRequest | null;
  onRequestPlan?: (planId: string) => Promise<void>;
  onSubmitProof?: (payload: {
    requestId: string;
    transactionReference: string;
    paymentDate: string;
    proofFileUrl?: string;
    receiptNote?: string;
  }) => Promise<void>;
  onRefreshStatus?: () => Promise<void>;
}

export const StoreBuilderActive: React.FC<StoreBuilderActiveProps> = () => {
  const navigate = useNavigate();
  const {
    loading,
    saveStatus,
    lastSaveError,
    isPublishing,
    storeConfig,
    sections,
    products,
    catalogStatus,
    catalogError,
    catalogTruncated,
    reloadCatalog,
    historyList,
    mediaGallery,
    draftLayout,
    publishedLayout,
    selectedSectionId,
    setSelectedSectionId,
    recoverableBackup,
    applyRecoveredBackup,
    dismissRecoveredBackup,
    addSection,
    updateSection,
    reorderSections,
    deleteSection,
    duplicateSection,
    toggleVisibility,
    replaceSections,
    saveStoreConfig,
    uploadMedia,
    deleteMedia,
    isMediaUploading,
    mediaUploadProgress,
    mediaUploadError,
    publishStudio,
    rollbackVersion,
    saveDraftNow,
    forceOverwriteDraft,
    refreshData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useSellerStudio();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] h-full bg-[var(--studio-background)]">
        <div className="text-center space-y-2.5 p-7 bg-[var(--studio-white)] rounded-xl border border-[var(--studio-border)] max-w-xs w-full">
          <Loader2 className="w-6 h-6 text-slate-900 animate-spin mx-auto" />
          <p className="text-[13px] font-semibold text-slate-900">
            Chargement de l&apos;éditeur boutique
          </p>
          <p className="text-[12px] text-slate-500">
            Synchronisation de vos sections et du catalogue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--studio-background)] overflow-hidden">
      <StudioWorkspace
        saveStatus={saveStatus}
        lastSaveError={lastSaveError}
        isPublishing={isPublishing}
        storeConfig={storeConfig}
        draftLayout={draftLayout}
        publishedLayout={publishedLayout}
        sections={sections}
        products={products}
        catalogStatus={catalogStatus}
        catalogError={catalogError}
        catalogTruncated={catalogTruncated}
        onReloadCatalog={reloadCatalog}
        historyList={historyList}
        mediaGallery={mediaGallery}
        onUploadMedia={uploadMedia}
        onDeleteMedia={deleteMedia}
        isMediaUploading={isMediaUploading}
        mediaUploadProgress={mediaUploadProgress}
        mediaUploadError={mediaUploadError}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        recoverableBackup={recoverableBackup}
        onRestoreBackup={applyRecoveredBackup}
        onDismissBackup={dismissRecoveredBackup}
        onReloadServerVersion={() => refreshData(true)}
        onForceOverwriteDraft={forceOverwriteDraft}
        addSection={addSection}
        updateSection={updateSection}
        reorderSections={reorderSections}
        deleteSection={deleteSection}
        duplicateSection={duplicateSection}
        toggleVisibility={toggleVisibility}
        saveStoreConfig={saveStoreConfig}
        onSaveDraft={saveDraftNow}
        onReplaceSections={replaceSections}
        publishStudio={publishStudio}
        onRollback={(versionNumber) => void rollbackVersion(versionNumber)}
        onExitStudio={() => navigate("/dashboard/seller")}
        onOpenSponsorships={() => navigate("/dashboard/seller/sponsorships")}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
};

export default StoreBuilderActive;
