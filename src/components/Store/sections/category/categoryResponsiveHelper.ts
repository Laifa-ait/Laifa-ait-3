import { useEffect, useState, RefObject } from "react";
import {
  CategoryCardSize,
  CategoryLayoutType,
  CategoryAspectRatio,
  CategoryDeviceViewport,
  CategoryDeviceProfile,
} from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";

const VALID_LAYOUTS = new Set<string>([
  "grid", "bento", "bubbles", "overlay", "carousel", "pills",
  "mesh-3d", "accordion", "arch", "polaroid", "magazine", "glass-dock",
]);
const VALID_SIZES = new Set<string>(["compact", "balanced", "large"]);
const VALID_RATIOS = new Set<string>(["1/1", "4/5", "16/9", "4/3", "circle"]);
const SYMMETRIC_GRID_LAYOUTS = new Set<string>(["arch", "polaroid", "bubbles", "grid", "pills", "mesh-3d"]);
const MODULAR_SPAN_LAYOUTS = new Set<string>(["bento", "glass-dock", "overlay"]);

export function useCategoryContainerDevice(
  containerRef: RefObject<HTMLElement | null>,
  previewViewport?: CategoryDeviceViewport,
  isStudioPreview?: boolean
): CategoryDeviceViewport {
  const [measuredDevice, setMeasuredDevice] = useState<CategoryDeviceViewport>(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return "mobile";
      if (window.innerWidth < 1024) return "tablet";
    }
    return "desktop";
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const updateFromWidth = (width: number) => {
      if (width <= 0) return;
      const next: CategoryDeviceViewport = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
      setMeasuredDevice((prev) => (prev === next ? prev : next));
    };
    updateFromWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) updateFromWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  if (isStudioPreview && previewViewport) return previewViewport;
  if (previewViewport && previewViewport !== "desktop") return previewViewport;
  return measuredDevice;
}

export function resolveCategoryDeviceProfile(
  rawSettings: Record<string, unknown>,
  device: CategoryDeviceViewport
): CategoryDeviceProfile {
  const baseLayout: CategoryLayoutType = VALID_LAYOUTS.has(String(rawSettings.layout))
    ? (String(rawSettings.layout) as CategoryLayoutType)
    : "grid";
  const rawLayoutTablet = String(rawSettings.layoutTablet || "inherit");
  const rawLayoutMobile = String(rawSettings.layoutMobile || "inherit");
  const hasCustomTabletLayout = VALID_LAYOUTS.has(rawLayoutTablet);
  const hasCustomMobileLayout = VALID_LAYOUTS.has(rawLayoutMobile);

  const layout: CategoryLayoutType =
    device === "tablet" && hasCustomTabletLayout
      ? (rawLayoutTablet as CategoryLayoutType)
      : device === "mobile"
      ? hasCustomMobileLayout
        ? (rawLayoutMobile as CategoryLayoutType)
        : hasCustomTabletLayout
        ? (rawLayoutTablet as CategoryLayoutType)
        : baseLayout
      : baseLayout;

  const baseSize: CategoryCardSize = VALID_SIZES.has(String(rawSettings.cardSize))
    ? (String(rawSettings.cardSize) as CategoryCardSize)
    : "balanced";
  const rawSizeTablet = String(rawSettings.cardSizeTablet || "inherit");
  const rawSizeMobile = String(rawSettings.cardSizeMobile || "inherit");
  const hasCustomTabletSize = VALID_SIZES.has(rawSizeTablet);
  const hasCustomMobileSize = VALID_SIZES.has(rawSizeMobile);

  const cardSize: CategoryCardSize =
    device === "tablet" && hasCustomTabletSize
      ? (rawSizeTablet as CategoryCardSize)
      : device === "mobile" && hasCustomMobileSize
      ? (rawSizeMobile as CategoryCardSize)
      : baseSize;

  const baseRatio: CategoryAspectRatio = VALID_RATIOS.has(String(rawSettings.aspectRatio))
    ? (String(rawSettings.aspectRatio) as CategoryAspectRatio)
    : layout === "bubbles"
    ? "circle"
    : "4/5";
  const rawRatioTablet = String(rawSettings.aspectRatioTablet || "inherit");
  const rawRatioMobile = String(rawSettings.aspectRatioMobile || "inherit");
  const hasCustomTabletRatio = VALID_RATIOS.has(rawRatioTablet);
  const hasCustomMobileRatio = VALID_RATIOS.has(rawRatioMobile);

  const aspectRatio: CategoryAspectRatio =
    layout === "bubbles"
      ? "circle"
      : device === "tablet" && hasCustomTabletRatio
      ? (rawRatioTablet as CategoryAspectRatio)
      : device === "mobile" && hasCustomMobileRatio
      ? (rawRatioMobile as CategoryAspectRatio)
      : baseRatio;

  const rawDesktopCols = Number(rawSettings.columnsDesktop ?? rawSettings.columns ?? (layout === "mesh-3d" ? 2 : 3));
  const colsDesktop = layout === "mesh-3d" ? Math.min(2, Math.max(1, rawDesktopCols)) : Math.min(4, Math.max(2, rawDesktopCols));
  const colsTablet =
    layout === "mesh-3d"
      ? 1
      : typeof rawSettings.columnsTablet === "number" && rawSettings.columnsTablet >= 1
      ? Math.min(3, Math.max(1, rawSettings.columnsTablet))
      : 2;
  const colsMobile =
    layout === "pills" || layout === "mesh-3d" || layout === "overlay"
      ? 1
      : typeof rawSettings.columnsMobile === "number" && rawSettings.columnsMobile >= 1
      ? Math.min(2, Math.max(1, rawSettings.columnsMobile))
      : 2;

  const columns = device === "mobile" ? colsMobile : device === "tablet" ? colsTablet : colsDesktop;

  return {
    device, layout, cardSize, aspectRatio, columns,
    hasCustomLayout: device === "tablet" ? hasCustomTabletLayout : device === "mobile" ? hasCustomMobileLayout : false,
    hasCustomCardSize: device === "tablet" ? hasCustomTabletSize : device === "mobile" ? hasCustomMobileSize : false,
    hasCustomAspectRatio: device === "tablet" ? hasCustomTabletRatio : device === "mobile" ? hasCustomMobileRatio : false,
  };
}

const COL_CLASS_LOOKUP: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
};

export function resolveCategoryActiveCols(
  columnsDesktop: number,
  columnsMobile: number,
  previewViewport: CategoryDeviceViewport = "desktop",
  columnsTablet?: number,
  layout?: string,
  totalItems?: number,
  cardSize: CategoryCardSize = "balanced"
): number {
  if (previewViewport === "mobile") {
    if (layout === "pills" || layout === "mesh-3d" || layout === "overlay") return 1;
    return Math.min(2, Math.max(1, columnsMobile || 2));
  }
  if (previewViewport === "tablet") {
    if (layout === "mesh-3d") return 1;
    if (typeof columnsTablet === "number" && columnsTablet >= 1) return Math.min(3, Math.max(1, columnsTablet));
    return 2;
  }
  if (layout === "mesh-3d") return Math.min(2, Math.max(1, columnsDesktop || 2));

  let dCols = Math.min(4, Math.max(2, columnsDesktop || 3));
  const isSymmetric = !layout || SYMMETRIC_GRID_LAYOUTS.has(layout);
  if (isSymmetric && typeof totalItems === "number" && totalItems > 0) {
    if (totalItems < dCols) dCols = Math.max(1, totalItems);
    else if (totalItems === 4 && dCols === 3) dCols = cardSize === "large" ? 2 : 4;
  }
  return dCols;
}

export function resolveCategoryGridCols(
  columnsDesktop: number,
  columnsMobile: number,
  cardSize: CategoryCardSize = "balanced",
  previewViewport: CategoryDeviceViewport = "desktop",
  columnsTablet?: number,
  layout?: string,
  totalItems?: number
): string {
  const cols = resolveCategoryActiveCols(columnsDesktop, columnsMobile, previewViewport, columnsTablet, layout, totalItems, cardSize);
  return COL_CLASS_LOOKUP[cols] || "grid-cols-3";
}

/**
 * RÈGLE 1 CORRIGÉE :
 * - Modèles symétriques (`arch`, `polaroid`, `bubbles`, `grid`, `pills`, `mesh-3d`) : TOUJOURS `col-span-1`.
 * - Modèles modulaires à hauteur fixe (`bento`, `glass-dock`, `overlay`) : utilise `col-span-2` pour combler la ligne.
 */
export function resolveAntiHoleSpanClass(idx: number, total: number, cols: number, layout?: string): string {
  if (layout && !MODULAR_SPAN_LAYOUTS.has(layout)) return "col-span-1";
  if (cols <= 1 || total <= 0) return "col-span-1";
  const remainder = total % cols;
  if (remainder === 0) return "col-span-1";
  if (cols === 2) return idx === total - 1 ? "col-span-2" : "col-span-1";
  if (cols === 3) {
    if (remainder === 1) return total === 1 ? "col-span-3" : idx === 0 || idx === total - 1 ? "col-span-2" : "col-span-1";
    return idx === total - 1 ? "col-span-2" : "col-span-1";
  }
  if (cols === 4) {
    if (remainder === 1) return total === 1 ? "col-span-4" : idx === 0 || idx === 1 || idx === total - 1 ? "col-span-2" : "col-span-1";
    if (remainder === 2) return idx >= total - 2 ? "col-span-2" : "col-span-1";
    return idx === total - 1 ? "col-span-2" : "col-span-1";
  }
  return "col-span-1";
}

export function resolveOuterAndMediaRadius(cardRadius: string): { outerRadiusClass: string; mediaRadiusClass: string } {
  if (cardRadius === "none") return { outerRadiusClass: "rounded-none", mediaRadiusClass: "rounded-none" };
  if (cardRadius === "sm") return { outerRadiusClass: "rounded-lg", mediaRadiusClass: "rounded-md" };
  if (cardRadius === "lg") return { outerRadiusClass: "rounded-3xl", mediaRadiusClass: "rounded-2xl" };
  if (cardRadius === "full") return { outerRadiusClass: "rounded-full", mediaRadiusClass: "rounded-full" };
  return { outerRadiusClass: "rounded-2xl", mediaRadiusClass: "rounded-xl" };
}

export function resolveCategoryGapClass(gapSize: string, cardSize: CategoryCardSize = "balanced"): string {
  if (gapSize === "compact" || cardSize === "compact") return "gap-2.5 @[768px]:gap-3";
  if (gapSize === "spacious" || cardSize === "large") return "gap-4 @[768px]:gap-5";
  return "gap-3 @[768px]:gap-4";
}

export function resolveResponsiveBentoSpan(
  idx: number,
  total: number,
  heroH: string,
  cellH: string,
  previewViewport: CategoryDeviceViewport = "desktop",
  columnsOnDevice = 3
): string {
  if (previewViewport === "mobile" || previewViewport === "tablet" || columnsOnDevice <= 2) {
    if (total === 4) return `${idx === 0 || idx === 3 ? "col-span-2" : "col-span-1"} ${idx === 0 || idx === 3 ? heroH : cellH}`;
    const isWide = idx === 0 || (total > 1 && (total - 1) % 2 === 1 && idx === total - 1);
    return `${isWide ? "col-span-2" : "col-span-1"} ${isWide ? heroH : cellH}`;
  }
  if (total === 4) return `${idx === 0 || idx === 3 ? "col-span-2" : "col-span-1"} ${idx === 0 || idx === 3 ? heroH : cellH}`;
  return `${resolveAntiHoleSpanClass(idx, total, 3, "bento")} ${idx === 0 ? heroH : cellH}`;
}
