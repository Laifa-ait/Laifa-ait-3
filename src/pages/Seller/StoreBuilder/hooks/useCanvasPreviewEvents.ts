import { useEffect } from "react";
import {
  CategoryItem,
  CollectionPageDesignConfig,
  StoreCustomPageItem,
} from "../../../../domains/seller/customPage.types";

interface UseCanvasPreviewEventsParams {
  setCanvasViewMode: (
    mode: "home" | "category" | "collection" | "custom-page",
  ) => void;
  setActiveCategorySlug: (slug: string | null) => void;
  setActiveCategoryOverride?: (cat: CategoryItem | null) => void;
  setActiveCustomPage: (page: StoreCustomPageItem | null) => void;
  setLiveCollectionConfig: (
    cfg: CollectionPageDesignConfig | undefined,
  ) => void;
  setIsAuditModalOpen: (open: boolean) => void;
  setIsQrModalOpen: (open: boolean) => void;
  setIsInteractiveMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useCanvasPreviewEvents({
  setCanvasViewMode,
  setActiveCategorySlug,
  setActiveCategoryOverride,
  setActiveCustomPage,
  setLiveCollectionConfig,
  setIsAuditModalOpen,
  setIsQrModalOpen,
  setIsInteractiveMode,
}: UseCanvasPreviewEventsParams): void {
  useEffect(() => {
    const pageNavHandler = (event: Event) => {
      const detail =
        (
          event as CustomEvent<{
            viewMode?: "home" | "category" | "collection" | "custom-page";
            categorySlug?: string;
            categoryItem?: CategoryItem;
            customPage?: StoreCustomPageItem;
          }>
        ).detail || {};
      if (detail.viewMode === "home") {
        setCanvasViewMode("home");
        setActiveCategorySlug(null);
        setActiveCategoryOverride?.(null);
      } else if (detail.viewMode === "category") {
        setCanvasViewMode("category");
        setActiveCategoryOverride?.(detail.categoryItem || null);
        setActiveCategorySlug(
          detail.categorySlug || detail.categoryItem?.slug || null,
        );
      } else if (detail.viewMode === "collection") {
        setCanvasViewMode("collection");
        setActiveCategorySlug(null);
        setActiveCategoryOverride?.(null);
      } else if (detail.viewMode === "custom-page" && detail.customPage) {
        setCanvasViewMode("custom-page");
        setActiveCustomPage(detail.customPage);
        setActiveCategorySlug(null);
        setActiveCategoryOverride?.(null);
      }
    };
    const colConfigHandler = (event: Event) => {
      const cfg = (
        event as CustomEvent<{
          collectionPageConfig?: CollectionPageDesignConfig;
        }>
      ).detail?.collectionPageConfig;
      if (cfg) setLiveCollectionConfig(cfg);
    };
    const openAudit = () => setIsAuditModalOpen(true);
    const openQr = () => setIsQrModalOpen(true);
    const toggleInteractive = () => setIsInteractiveMode((p) => !p);

    window.addEventListener("studio:navigate-page", pageNavHandler);
    window.addEventListener("studio:collection-config-updated", colConfigHandler);
    window.addEventListener("studio:open-audit", openAudit);
    window.addEventListener("studio:open-qr", openQr);
    window.addEventListener("studio:toggle-interactive", toggleInteractive);
    return () => {
      window.removeEventListener("studio:navigate-page", pageNavHandler);
      window.removeEventListener(
        "studio:collection-config-updated",
        colConfigHandler,
      );
      window.removeEventListener("studio:open-audit", openAudit);
      window.removeEventListener("studio:open-qr", openQr);
      window.removeEventListener("studio:toggle-interactive", toggleInteractive);
    };
  }, [
    setActiveCategorySlug,
    setActiveCategoryOverride,
    setActiveCustomPage,
    setCanvasViewMode,
    setIsAuditModalOpen,
    setIsInteractiveMode,
    setIsQrModalOpen,
    setLiveCollectionConfig,
  ]);
}
