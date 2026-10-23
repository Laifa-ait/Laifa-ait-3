import React, { useState } from "react";
import { useSellerStudio } from "./hooks/useSellerStudio";
import { StudioWorkspace } from "./StudioWorkspace";
import { StudioSubscriptionBanner } from "./components/StudioSubscriptionBanner";
import { StudioSubscriptionModal } from "./components/StudioSubscriptionModal";
import {
  SubscriptionPlan,
  SubscriptionRequest,
  SellerSubscription,
} from "../../../domains/seller/subscription.types";
import { RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

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

export const StoreBuilderActive: React.FC<StoreBuilderActiveProps> = ({
  subscription,
  hasActiveSubscription: hasActiveSubscriptionProp,
  daysRemaining = 0,
  plans = [],
  pendingRequest,
  onRequestPlan,
  onSubmitProof,
  onRefreshStatus,
}) => {
  const {
    loading,
    saveStatus,
    storeConfig,
    sections,
    products,
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
  } = useSellerStudio();

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const openSubscriptionModal = () => {
    setIsSubModalOpen(true);
    void onRefreshStatus?.();
  };

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

  const hasActiveSubscription = hasActiveSubscriptionProp ?? Boolean(subscription);
  const isPublished = Boolean(publishedLayout && hasActiveSubscription);
  const sectionLimit = hasActiveSubscription ? subscription?.limits?.maxCustomSections : undefined;
  const handlePublishStudio = () => {
    if (typeof sectionLimit === "number" && sections.length > sectionLimit) {
      toast.error(`Votre formule autorise ${sectionLimit} sections. Réduisez votre vitrine avant de la publier.`);
      return;
    }
    void publishStudio();
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F8FA]">
      <StudioSubscriptionBanner
        daysRemaining={daysRemaining}
        pendingRequest={pendingRequest}
        isPublished={isPublished}
        hasActiveSubscription={hasActiveSubscription}
        sectionCount={sections.length}
        sectionLimit={sectionLimit}
        onOpenSubModal={openSubscriptionModal}
      />

      <StudioWorkspace
        saveStatus={saveStatus}
        storeConfig={storeConfig}
        publishedLayout={publishedLayout}
        hasActiveSubscription={hasActiveSubscription}
        sections={sections}
        products={products}
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
        publishStudio={handlePublishStudio}
        pendingRequest={pendingRequest}
        onRequestPublication={openSubscriptionModal}
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
          onRefreshStatus={onRefreshStatus}
          onSubmitProof={onSubmitProof}
        />
      )}
    </div>
  );
};

export default StoreBuilderActive;

