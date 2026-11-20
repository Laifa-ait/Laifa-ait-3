import React, { useMemo, useState } from "react";
import { SaveStatus } from "../../hooks/useStudioSaveManager";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";
import { CustomPageSection, SellerStoreConfig } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { StudioNavMode } from "./studio.types";
import { MobileStudioHeader } from "./MobileStudioHeader";
import { MobileStudioNavigation, MobileStudioColumn } from "./MobileStudioNavigation";
import { MobileGuidedJourneyBar } from "./MobileGuidedJourneyBar";
import { StudioMobileMenu } from "./StudioMobileMenu";
import { StudioDirectPublishModal } from "../topbar/StudioDirectPublishModal";
import { evaluatePublishReadiness } from "../../utils/publishReadinessChecks";

interface MobileStudioBarProps {
  shopName?: string;
  isPublished: boolean;
  isPublishing?: boolean;
  versionNumber?: number;
  draftRevision?: number;
  saveStatus: SaveStatus;
  lastSaveError?: string | null;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  mobileColumn: MobileStudioColumn;
  setMobileColumn: (col: MobileStudioColumn) => void;
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
  sections: CustomPageSection[];
  products: Product[];
  catalogStatus?: CatalogLoadStatus;
  storeConfig?: SellerStoreConfig | null;
  onSaveDraft?: () => unknown | Promise<unknown>;
  onPublish: (changeSummary?: string) => boolean | void | Promise<boolean | void>;
  onExitStudio?: () => void;
}

export const MobileStudioBar: React.FC<MobileStudioBarProps> = ({
  shopName,
  isPublished,
  isPublishing = false,
  versionNumber = 1,
  draftRevision,
  saveStatus,
  lastSaveError,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  mobileColumn,
  setMobileColumn,
  navMode,
  onSelectNavMode,
  sections,
  products,
  catalogStatus,
  storeConfig,
  onSaveDraft,
  onPublish,
  onExitStudio,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [localPublishing, setLocalPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const readinessReport = useMemo(() => {
    if (!isPublishModalOpen) return undefined;
    return evaluatePublishReadiness({
      storeConfig,
      sections,
      products,
      catalogStatus,
      draftRevision,
      currentVersionNumber: versionNumber,
      hasUnsavedChanges: saveStatus === "unsaved" || saveStatus === "saving",
    });
  }, [isPublishModalOpen, catalogStatus, draftRevision, products, saveStatus, sections, storeConfig, versionNumber]);

  const effectivePublishing = isPublishing || localPublishing;
  const publishingLockRef = React.useRef(false);

  const handleConfirmPublish = async () => {
    if (effectivePublishing || publishingLockRef.current) return;
    publishingLockRef.current = true;
    setPublishError(null);
    try {
      const outcome = onPublish(changeSummary.trim() || undefined);
      if (outcome !== null && typeof outcome === "object" && "then" in outcome && typeof outcome.then === "function") {
        setLocalPublishing(true);
        const resolved = await outcome;
        if (resolved === false) {
          setPublishError("La publication a échoué. Vérifiez votre connexion ou les alertes puis réessayez.");
          return;
        }
      } else if (outcome === false) {
        setPublishError("La publication a échoué. Veuillez réessayer.");
        return;
      }
      setChangeSummary("");
      setIsPublishModalOpen(false);
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Échec de la publication. Veuillez réessayer.");
    } finally {
      publishingLockRef.current = false;
      setLocalPublishing(false);
    }
  };

  return (
    <>
      <div className="block md:hidden shrink-0">
        <MobileStudioHeader
          shopName={shopName}
          isPublished={isPublished}
          saveStatus={saveStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          onSaveDraft={onSaveDraft}
          onPublish={() => setIsPublishModalOpen(true)}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          onExitStudio={onExitStudio}
        />
        <MobileStudioNavigation
          mobileColumn={mobileColumn}
          setMobileColumn={setMobileColumn}
          sectionCount={sections.length}
        />
        <MobileGuidedJourneyBar
          navMode={navMode}
          onSelectNavMode={onSelectNavMode}
          onSaveDraft={onSaveDraft}
          lastSaveError={lastSaveError}
        />
      </div>

      <StudioMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navMode={navMode}
        onSelectNavMode={onSelectNavMode}
        onSaveDraft={onSaveDraft}
        lastSaveError={lastSaveError}
        shopName={shopName}
      />

      <StudioDirectPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setPublishError(null);
          setIsPublishModalOpen(false);
        }}
        changeSummary={changeSummary}
        setChangeSummary={setChangeSummary}
        isPublishing={effectivePublishing}
        publishError={publishError}
        readinessReport={readinessReport}
        onNavigateToFix={onSelectNavMode}
        onConfirm={() => void handleConfirmPublish()}
      />
    </>
  );
};
