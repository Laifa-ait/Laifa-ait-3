import { CategoryCardSize } from "../../../../pages/Seller/StoreBuilder/constants/categoryPresetTypes";

/**
 * Resolves the responsive grid column classes across:
 * - Phone (< 560px container)
 * - Tablet (@[560px] to 899px container — iPad / Tablet Portrait)
 * - Desktop (@[900px]+ container)
 * Strictly honors `columnsMobile` (1 or 2) without being overridden by `cardSize`.
 */
export function resolveCategoryGridCols(
  columnsDesktop: number,
  columnsMobile: number,
  _cardSize: CategoryCardSize = "balanced",
  previewViewport: "mobile" | "tablet" | "desktop" = "desktop"
): string {
  const mobileCols = columnsMobile === 1 ? "grid-cols-1" : "grid-cols-2";

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
 * Resolves distinct outer card and inner media border-radius classes.
 */
export function resolveOuterAndMediaRadius(cardRadius: string): {
  outerRadiusClass: string;
  mediaRadiusClass: string;
} {
  if (cardRadius === "none") {
    return { outerRadiusClass: "rounded-none", mediaRadiusClass: "rounded-none" };
  }
  if (cardRadius === "sm") {
    return { outerRadiusClass: "rounded-lg", mediaRadiusClass: "rounded-md" };
  }
  if (cardRadius === "lg") {
    return { outerRadiusClass: "rounded-3xl", mediaRadiusClass: "rounded-2xl" };
  }
  if (cardRadius === "full") {
    return { outerRadiusClass: "rounded-full", mediaRadiusClass: "rounded-full" };
  }
  return { outerRadiusClass: "rounded-2xl", mediaRadiusClass: "rounded-xl" };
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
  if (gapSize === "spacious" || cardSize === "large") {
    return "gap-3 @[560px]:gap-4 @[900px]:gap-5";
  }
  return "gap-2.5 @[560px]:gap-3.5 @[900px]:gap-4";
}

/**
 * Resolves Bento mosaic spans across Phone (1 or 2 cols), Tablet (2-3 cols), and Desktop (4 cols)
 * ensuring zero orphan cards at any breakpoint and full-width clarity when `columnsMobile === 1`.
 */
export function resolveResponsiveBentoSpan(
  idx: number,
  total: number,
  heroH: string,
  cellH: string,
  previewViewport: "mobile" | "tablet" | "desktop" = "desktop",
  columnsMobile = 2
): string {
  const isLastItem = idx === total - 1;
  const remainingAfterHero = total - 1;
  const mobileFullSpan =
    columnsMobile === 1 ||
    idx === 0 ||
    (remainingAfterHero > 0 && remainingAfterHero % 2 === 1 && isLastItem);
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
