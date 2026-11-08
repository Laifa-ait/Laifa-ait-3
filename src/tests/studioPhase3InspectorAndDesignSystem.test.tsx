// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  resolveResponsiveSectionValues,
  sanitizeControlledCssClasses,
  sanitizeAnchorId,
  isSectionConditionallyVisible,
} from "../components/Store/sections/responsiveInheritanceHelper";
import { SectionResponsiveTab } from "../pages/Seller/StoreBuilder/components/inspector/SectionResponsiveTab";
import { SectionAdvancedTab } from "../pages/Seller/StoreBuilder/components/inspector/SectionAdvancedTab";
import { SectionStyleTab } from "../pages/Seller/StoreBuilder/components/inspector/SectionStyleTab";
import { buildStoreThemeCssVariables } from "../components/Store/useStoreFontLoader";
import { useStudioStore } from "../pages/Seller/StoreBuilder/store/useStudioStore";
import type { CustomPageSection, CustomPageTheme } from "../domains/seller/customPage.types";

let container: HTMLDivElement;
let root: Root;

function renderElement(ui: React.ReactElement) {
  act(() => {
    root.render(ui);
  });
}

describe("Phase 3 — Inspecteur, Héritage Responsive (Desktop/Tablette/Mobile) & Design System Global", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStudioStore.setState({ viewport: "desktop", activeInspectorTab: "responsive" });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("1. 3-tier Responsive Inheritance: Desktop (42px) and Mobile override (25px) coexist without overwriting each other and revert to inheritance on reset", () => {
    const baseSection: CustomPageSection = {
      id: "sec-hero-resp",
      type: "hero_banner",
      title: "Bannière Responsive",
      isVisible: true,
      order: 0,
      settings: {
        title: "Collection Été",
        imageUrl: "https://example.com/hero.jpg",
        titleFontSizePx: 42,
        responsive: {
          mobile: {
            titleFontSizePx: 25,
          },
        },
      } as CustomPageSection["settings"],
      styles: { paddingY: 48 },
    };

    const desktopResolved = resolveResponsiveSectionValues(baseSection, undefined, "desktop");
    const tabletResolved = resolveResponsiveSectionValues(baseSection, undefined, "tablet");
    const mobileResolved = resolveResponsiveSectionValues(baseSection, undefined, "mobile");

    // Desktop keeps 42px
    expect(desktopResolved.titleFontSizePx).toBe(42);
    expect(desktopResolved.inheritanceSource.titleFontSizePx).toBe("desktop");

    // Tablet has no override -> inherits 42px from Desktop
    expect(tabletResolved.titleFontSizePx).toBe(42);
    expect(tabletResolved.inheritanceSource.titleFontSizePx).toBe("desktop");

    // Mobile uses its explicit 25px override while inheriting paddingY (48px) from Desktop
    expect(mobileResolved.titleFontSizePx).toBe(25);
    expect(mobileResolved.inheritanceSource.titleFontSizePx).toBe("mobile");
    expect(mobileResolved.paddingY).toBe(48);
    expect(mobileResolved.inheritanceSource.paddingY).toBe("desktop");

    // Test UI reset in SectionResponsiveTab
    const patches: Array<Record<string, unknown>> = [];
    renderElement(
      <SectionResponsiveTab
        section={baseSection}
        settings={baseSection.settings as unknown as Record<string, unknown>}
        styles={baseSection.styles}
        onSettingsChange={(patch) => {
          if (typeof patch === "object") patches.push(patch);
        }}
      />,
    );

    const mobileTabBtn = container.querySelector('[data-testid="responsive-device-mobile"]') as HTMLButtonElement;
    act(() => mobileTabBtn.click());

    expect(container.querySelector('[data-testid="resolved-title-size"]')?.textContent).toBe("25px");

    const resetBtn = container.querySelector('[data-testid="reset-overrides-mobile"]') as HTMLButtonElement;
    expect(resetBtn).toBeTruthy();
    act(() => resetBtn.click());

    expect(patches.length).toBe(1);
    expect((patches[0].responsive as Record<string, unknown>).mobile).toBeUndefined();
  });

  it("2. SectionAdvancedTab sanitizes anchorId and controlled CSS classes against XSS/JS injection and evaluates conditional visibility", () => {
    expect(sanitizeAnchorId("  #Catalogue ÉTÉ <script>! ")).toBe("catalogue-t-script");
    expect(
      sanitizeControlledCssClasses("olmart-card-elevated javascript:alert(1) <img/onerror=1> shadow-sm {color:red}"),
    ).toBe("olmart-card-elevated shadow-sm");

    expect(isSectionConditionallyVisible({ visibilityRule: "in_stock_only" }, 0)).toBe(false);
    expect(isSectionConditionallyVisible({ visibilityRule: "in_stock_only" }, 5)).toBe(true);

    const onSettingsChange = vi.fn();
    renderElement(
      <SectionAdvancedTab
        sectionId="sec-adv-1"
        settings={{ anchorId: "promo", customCssClasses: "olmart-card-elevated" }}
        onSettingsChange={onSettingsChange}
      />,
    );

    const ariaInput = container.querySelector('[data-testid="advanced-aria-label-input"]') as HTMLInputElement;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(ariaInput, "Section Promotions Vérifiées");
      ariaInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onSettingsChange).toHaveBeenCalledWith("ariaLabel", "Section Promotions Vérifiées");
  });

  it("3. SectionStyleTab allows resetting explicit section styles back to Global Design System inheritance", () => {
    const onStylesChange = vi.fn();
    renderElement(
      <SectionStyleTab
        styles={{ backgroundColor: "#112233", borderRadius: "lg", shadow: "floating" }}
        onStylesChange={onStylesChange}
      />,
    );

    const resetBtn = container.querySelector('[data-testid="reset-section-styles-btn"]') as HTMLButtonElement;
    act(() => resetBtn.click());

    expect(onStylesChange).toHaveBeenCalledWith(
      expect.objectContaining({
        backgroundColor: undefined,
        borderRadius: undefined,
        shadow: undefined,
      }),
    );
  });

  it("4. Global Design System generates complete --store-* CSS variables for colors, typography, buttons, cards, and spacing", () => {
    const customTheme: CustomPageTheme = {
      sector: "mode",
      primaryColor: "#023859",
      secondaryColor: "#011C40",
      accentColor: "#54ACBF",
      canvasColor: "#FAF6F0",
      surfaceColor: "#FFFFFF",
      fontFamily: "'DM Sans', sans-serif",
      headingFontFamily: "'Outfit', sans-serif",
      bodyFontFamily: "'DM Sans', sans-serif",
      borderRadiusPx: 12,
      spacingYPx: 32,
      titleFontSizePx: 40,
      bodyFontSizePx: 16,
      lineHeight: 1.25,
    };

    const vars = buildStoreThemeCssVariables(customTheme);
    expect(vars["--store-primary"]).toBe("#023859");
    expect(vars["--store-secondary"]).toBe("#011C40");
    expect(vars["--store-accent"]).toBe("#54ACBF");
    expect(vars["--store-border-radius"]).toBe("12px");
    expect(vars["--store-spacing-y"]).toBe("32px");
    expect(vars["--store-title-size"]).toBe("40px");
    expect(vars["--store-body-size"]).toBe("16px");
    expect(vars["--store-line-height"]).toBe("1.25");
    expect(vars["--store-font-heading"]).toContain("Outfit");
    expect(vars["--store-font-body"]).toContain("DM Sans");
  });
});
