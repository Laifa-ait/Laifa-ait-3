import React, { useState } from "react";
import { useSellerStudio } from "./hooks/useSellerStudio";
import { StudioWorkspace } from "./StudioWorkspace";
import { StudioSubscriptionBanner } from "./components/StudioSubscriptionBanner";
import { StudioSubscriptionModal } from "./components/StudioSubscriptionModal";
import {
  SubscriptionPlan,
  SubscriptionRequest,
} from "../../../domains/seller/subscription.types";
import { RefreshCw } from "lucide-react";

interface StoreBuilderActiveProps {
  subscription?: unknown;
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
}

export const StoreBuilderActive: React.FC<StoreBuilderActiveProps> = ({
  daysRemaining = 14,
  plans = [],
  pendingRequest,
  onRequestPlan,
  onSubmitProof,
}) => {
  const {
    loading,
    saveStatus,
    storeConfig,
    sections,
    products,
    mediaGallery,
    selectedSectionId,
    setSelectedSectionId,
    addSection,
    updateSection,
    reorderSections,
    deleteSection,
    duplicateSection,
    toggleVisibility,
    saveStoreConfig,
    publishStudio,
  } = useSellerStudio();

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-[#F7F8FA]">
        <div className="text-center space-y-3 p-8 bg-[#FFFFFF] rounded-[10px] border border-[#E5E7EB] shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#F97316] animate-spin mx-auto" />
          <p className="text-[14px] font-semibold text-[#17191C]">
            Initialisation du Studio Olmart...
          </p>
          <p className="text-[13px] text-[#667085]">
            Chargement de la vitrine et des modules
          </p>
        </div>
      </div>
    );
  }

  const isPublished = Boolean(storeConfig?.isPublished);

  return (
    <div className="flex flex-col h-full bg-[#F7F8FA]">
      <StudioSubscriptionBanner
        daysRemaining={daysRemaining}
        pendingRequest={pendingRequest}
        isPublished={isPublished}
        onOpenSubModal={() => setIsSubModalOpen(true)}
      />

      <StudioWorkspace
        saveStatus={saveStatus}
        storeConfig={storeConfig}
        sections={sections}
        products={products}
        mediaGallery={mediaGallery}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        addSection={addSection}
        updateSection={updateSection}
        reorderSections={reorderSections}
        deleteSection={deleteSection}
        duplicateSection={duplicateSection}
        toggleVisibility={toggleVisibility}
        saveStoreConfig={saveStoreConfig}
        publishStudio={publishStudio}
        pendingRequest={pendingRequest}
        onRequestPublication={() => setIsSubModalOpen(true)}
      />

      {onRequestPlan && onSubmitProof && (
        <StudioSubscriptionModal
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          plans={plans}
          pendingRequest={pendingRequest}
          storeConfig={storeConfig}
          sections={sections}
          onRequestPlan={onRequestPlan}
          onSubmitProof={onSubmitProof}
        />
      )}
    </div>
  );
};

export default StoreBuilderActive;

