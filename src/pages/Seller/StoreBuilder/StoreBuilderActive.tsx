import React from "react";
import { useSellerStudio } from "./hooks/useSellerStudio";
import { StudioWorkspace } from "./StudioWorkspace";
import { StudioSubscriptionBanner } from "./components/StudioSubscriptionBanner";
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SellerSubscription,
} from "../../../domains/seller/subscription.types";
import { RefreshCw } from "lucide-react";

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
  const {
    loading,
    saveStatus,
    storeConfig,
    sections,
    products,
    historyList,
    mediaGallery,
    publishedLayout,
    selectedSectionId,
    setSelectedSectionId,
    addSection,
    updateSection,
    reorderSections,
    deleteSection,
    duplicateSection,
    toggleVisibility,
    saveStoreConfig,
    uploadMedia,
    deleteMedia,
    publishStudio,
    rollbackVersion,
    triggerAutoSave,
  } = useSellerStudio();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] h-full bg-[#F7F8FA]">
        <div className="text-center space-y-3 p-8 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#F97316] animate-spin mx-auto" />
          <p className="text-[14px] font-semibold text-[#17191C]">
            Initialisation du Studio Olmart...
          </p>
          <p className="text-[13px] text-[#667085]">
            Chargement de votre vitrine, de votre catalogue et de vos sections
          </p>
        </div>
      </div>
    );
  }

  const isPublished = Boolean(publishedLayout && publishedLayout.sections?.length > 0);

  return (
    <div className="flex flex-col h-full bg-[#F7F8FA] overflow-hidden">
      <StudioSubscriptionBanner
        isPublished={isPublished}
        versionNumber={publishedLayout?.versionNumber}
        sectionCount={sections.length}
        productCount={products.length}
      />

      <StudioWorkspace
        saveStatus={saveStatus}
        storeConfig={storeConfig}
        publishedLayout={publishedLayout}
        sections={sections}
        products={products}
        historyList={historyList}
        mediaGallery={mediaGallery}
        onUploadMedia={uploadMedia}
        onDeleteMedia={deleteMedia}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        addSection={addSection}
        updateSection={updateSection}
        reorderSections={reorderSections}
        deleteSection={deleteSection}
        duplicateSection={duplicateSection}
        toggleVisibility={toggleVisibility}
        saveStoreConfig={saveStoreConfig}
        onSaveDraft={() => triggerAutoSave(sections)}
        publishStudio={(changeSummary) => void publishStudio(changeSummary)}
        onRollback={(versionNumber) => void rollbackVersion(versionNumber)}
      />
    </div>
  );
};

export default StoreBuilderActive;
