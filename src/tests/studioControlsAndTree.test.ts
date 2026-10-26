import { describe, it, expect } from "vitest";
import { resolveBannerPosition } from "../pages/Seller/StoreBuilder/components/inspector/controls/AlignmentMatrix3x3";
import { buildHarmoniousColorSchemes } from "../pages/Seller/StoreBuilder/components/inspector/controls/ColorSchemePicker";
import { hasExpandableSubBlocks } from "../pages/Seller/StoreBuilder/components/studio/SectionSubBlocksTree";
import { CustomPageTheme } from "../domains/seller/customPage.types";

describe("Studio Step 2 — Visual Controllers & Hierarchical Tree", () => {
  it("resolves 9-point banner alignment matrix coordinates accurately", () => {
    const topLeft = resolveBannerPosition("top-left");
    expect(topLeft.horizontal).toBe("left");
    expect(topLeft.vertical).toBe("top");
    expect(topLeft.flexContainerClass).toContain("justify-start");
    expect(topLeft.flexContainerClass).toContain("items-start");

    const bottomRight = resolveBannerPosition("bottom-right");
    expect(bottomRight.horizontal).toBe("right");
    expect(bottomRight.vertical).toBe("bottom");
    expect(bottomRight.flexContainerClass).toContain("justify-end");
    expect(bottomRight.flexContainerClass).toContain("items-end");
  });

  it("computes 4 WCAG-compliant color schemes from seller theme", () => {
    const theme: CustomPageTheme = {
      sector: "artisanat",
      primaryColor: "#B85B35",
      secondaryColor: "#1C2A39",
      accentColor: "#D4AF37",
      canvasColor: "#FAF6F0",
      surfaceColor: "#FFFFFF",
      fontFamily: "Inter, sans-serif",
    };

    const schemes = buildHarmoniousColorSchemes(theme);
    expect(schemes).toHaveLength(4);
    expect(schemes.map((s) => s.id)).toEqual([
      "scheme_1",
      "scheme_2",
      "scheme_3",
      "scheme_4",
    ]);
    expect(schemes[2].backgroundColor).toBe("#B85B35");
    expect(schemes[3].backgroundColor).toBe("#111827");
    expect(schemes[3].textColor).toBe("#FFFFFF");
  });

  it("identifies expandable 2-level sections for the Shopify OS 2.0 tree", () => {
    expect(hasExpandableSubBlocks("hero_banner")).toBe(true);
    expect(hasExpandableSubBlocks("promo_carousel")).toBe(true);
    expect(hasExpandableSubBlocks("featured_categories")).toBe(true);
    expect(hasExpandableSubBlocks("curated_collections")).toBe(true);
    expect(hasExpandableSubBlocks("faq_accordion")).toBe(true);
    expect(hasExpandableSubBlocks("delivery_info")).toBe(false);
  });
});
