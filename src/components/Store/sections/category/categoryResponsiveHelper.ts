import { CategoryCardSize } from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";

/**
 * Resolves the responsive grid column classes across:
 * - Phone (< 560px container)
 * - Tablet (@[560px] to 899px container — iPad / Tablet Portrait)
 * - Desktop (@[900px]+ container)
 */
export function resolveCategoryGridCols(
  columnsDesktop: number,
  columnsMobile: number,
  cardSize: CategoryCardSize = "balanced",
  previewViewport: "mobile" | "tablet" | "desktop" = "desktop"
): string {
  const mobileCols =
    cardSize === "compact" ? "grid-cols-2" : columnsMobile === 1 ? "grid-cols-1" : "grid-cols-2";

  if (previewViewport === "mobile") {
    return mobileCols;
  }

  if (previewViewport === "tablet") {
    if (columnsDesktop <= 1) return "grid-cols-1";
    if (columnsDesktop === 2) return "grid-cols-2";
    return "grid-cols-3";
  }

  if (columnsDesktop <= 1) return "grid-cols-1";
  if (columnsDesktop === 2) return `${mobileCols} @[560px]:grid-cols-2`;
  if (columnsDesktop === 3) return `${mobileCols} @[560px]:grid-cols-2 @[900px]:grid-cols-3`;
  return `${mobileCols} @[560px]:grid-cols-3 @[900px]:grid-cols-4`;
}

/**
 * Resolves responsive grid gap across Phone, Tablet, and Desktop.
 */
export function resolveCategoryGapClass(
  gapSize: string,
  cardSize: CategoryCardSize = "balanced"
): string {
  if (gapSize === "compact" || cardSize === "compact") {
    return "gap-2 @[560px]:gap-2.5 @[900px]:gap-3";
  }
  if (gapSize === "spacious") {
    return "gap-3 @[560px]:gap-4 @[900px]:gap-5";
  }
  return "gap-2.5 @[560px]:gap-3.5 @[900px]:gap-4";
}

/**
 * Resolves Bento mosaic spans across Phone (2 cols), Tablet (2-3 cols), and Desktop (4 cols)
 * ensuring zero orphan cards at any breakpoint.
 */
export function resolveResponsiveBentoSpan(
  idx: number,
  total: number,
  heroH: string,
  cellH: string,
  previewViewport: "mobile" | "tablet" | "desktop" = "desktop"
): string {
  // Mobile (2-column grid): Hero is col-span-2 (idx 0).
  // Remaining count is (total - 1). If (total - 1) is odd and idx is the last item, span full width (col-span-2) so no orphan on mobile!
  const isLastItem = idx === total - 1;
  const remainingAfterHero = total - 1;
  const mobileFullSpan = idx === 0 || (remainingAfterHero > 0 && remainingAfterHero % 2 === 1 && isLastItem);
  const mobileSpan = mobileFullSpan ? "col-span-2" : "col-span-1";

  if (previewViewport === "mobile") {
    return `${mobileSpan} ${idx === 0 ? heroH : cellH}`;
  }

  if (previewViewport === "tablet") {
    if (idx === 0) return `col-span-2 @[560px]:col-span-2 ${heroH}`;
    if (remainingAfterHero % 2 === 1 && isLastItem) {
      return `col-span-2 @[560px]:col-span-2 ${cellH}`;
    }
    return `col-span-1 ${cellH}`;
  }

  // Desktop (@[900px] 4-column Bento grid) with Tablet (@[560px] 2-column) and Mobile (2-column) fallbacks
  if (total === 1) {
    return `col-span-2 @[560px]:col-span-2 @[900px]:col-span-4 @[900px]:row-span-2 ${heroH}`;
  }
  if (idx === 0) {
    return `col-span-2 @[560px]:col-span-2 @[900px]:col-span-2 @[900px]:row-span-2 ${heroH}`;
  }
  if (total === 2) {
    return `col-span-2 @[560px]:col-span-2 @[900px]:col-span-2 @[900px]:row-span-2 ${heroH}`;
  }
  if (total === 3) {
    return `${mobileSpan} @[560px]:col-span-1 @[900px]:col-span-2 ${cellH}`;
  }
  if (total === 4) {
    return idx === 3
      ? `${mobileSpan} @[560px]:col-span-2 @[900px]:col-span-2 ${cellH}`
      : `${mobileSpan} @[560px]:col-span-1 @[900px]:col-span-1 ${cellH}`;
  }
  if (total === 6) {
    if (idx === 3 || idx === 4) {
      return `${mobileSpan} @[560px]:col-span-1 @[900px]:col-span-2 ${cellH}`;
    }
    if (idx === 5) {
      return `col-span-2 @[560px]:col-span-2 @[900px]:col-span-2 ${cellH}`;
    }
    return `${mobileSpan} @[560px]:col-span-1 @[900px]:col-span-1 ${cellH}`;
  }

  // For total >= 5 (excluding 6 handled above):
  // First 5 items (idx 0..4) fill rows 1-2 (Hero 2x2 + 4 single cells = 8 cells).
  // Remaining items after idx 4: rem = total - 5.
  const remAfterFive = total - 5;
  if (remAfterFive > 0 && idx >= 5) {
    const mod = remAfterFive % 4;
    if (mod === 1 && isLastItem) {
      return `${mobileSpan} @[560px]:col-span-2 @[900px]:col-span-4 ${cellH}`;
    }
    if (mod === 2 && idx >= total - 2) {
      return `${mobileSpan} @[560px]:col-span-1 @[900px]:col-span-2 ${cellH}`;
    }
    if (mod === 3 && isLastItem) {
      return `${mobileSpan} @[560px]:col-span-2 @[900px]:col-span-2 ${cellH}`;
    }
  }

  return `${mobileSpan} @[560px]:col-span-1 @[900px]:col-span-1 ${cellH}`;
}
