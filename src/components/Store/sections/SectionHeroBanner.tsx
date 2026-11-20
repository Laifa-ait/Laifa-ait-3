import React from "react";
import {
  CustomPageSection,
  CustomPageTheme,
  HeroBannerSettings,
  HeroSubElement,
} from "../../../domains/seller/customPage.types";
import { HeroArch } from "./hero/HeroArch";
import { HeroDiptych } from "./hero/HeroDiptych";
import { HeroFullBleed } from "./hero/HeroFullBleed";
import { HeroGallery } from "./hero/HeroGallery";
import { HeroSplit } from "./hero/HeroSplit";
import {
  normalizeHeroSettingsAdapter,
  resolveHeroDeviceProfile,
} from "./hero/heroResponsiveHelper";
import {
  resolveSectionPaddingX,
  resolveSectionPaddingY,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";

interface SectionHeroBannerProps {
  section: CustomPageSection<"hero_banner">;
  theme: CustomPageTheme;
  products?: import("../../../domains/product/product.types").Product[];
  previewViewport?: "desktop" | "tablet" | "mobile";
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  activeSubElement?: HeroSubElement | null;
  onSelectSubElement?: (sub: HeroSubElement | null) => void;
  onInlineUpdate?: (patch: Partial<HeroBannerSettings>) => void;
}

export const SectionHeroBanner: React.FC<SectionHeroBannerProps> = ({
  section,
  theme,
  products = [],
  previewViewport = "desktop",
  isEditable = false,
  onSelect,
  activeSubElement,
  onSelectSubElement,
  onInlineUpdate,
}) => {
  const storeSelectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const storeSubElement = useStudioStore((s) => s.selectedSubElement);
  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);

  const styles = section.styles || {};
  const rawSettings = normalizeHeroSettingsAdapter(section.settings);
  const styleBorderRadiusPx =
    styles.borderRadius === "none" ? 0
    : styles.borderRadius === "sm" ? 12
    : styles.borderRadius === "md" ? 24
    : styles.borderRadius === "lg" || styles.borderRadius === "full" ? 40
    : undefined;

  const mappedFrameArch: HeroBannerSettings["archShape"] | undefined =
    styles.frameShape === "pill" ? "capsule"
    : styles.frameShape === "cut-corners" || styles.frameShape === "diamond" || styles.frameShape === "chamfered-tech" ? "asymmetric-leaf"
    : styles.frameShape === "sharp-couture" || styles.frameShape === "architectural-sharp" ? "floating-frame"
    : styles.frameShape === "arch-minimal" || styles.frameShape === "soft-modern" ? "roman-arch"
    : undefined;

  const settings: HeroBannerSettings = {
    ...rawSettings,
    bannerBgColor: styles.backgroundColor || rawSettings.bannerBgColor,
    bannerBorderColor: styles.sectionBorderColor || rawSettings.bannerBorderColor,
    bannerBorderWidthPx:
      typeof rawSettings.bannerBorderWidthPx === "number"
        ? rawSettings.bannerBorderWidthPx
        : styles.sectionBorderWidthPx,
    bannerFloating: rawSettings.bannerFloating ?? styles.floatingCard ?? false,
    titleColor: styles.headingColor || styles.textColor || rawSettings.titleColor,
    subtitleColor: styles.subtitleColor || styles.textColor || rawSettings.subtitleColor,
    badgeBgColor: styles.badgeBgColor || rawSettings.badgeBgColor,
    badgeTextColor: styles.badgeTextColor || rawSettings.badgeTextColor,
    ctaBgColor: styles.buttonBgColor || rawSettings.ctaBgColor,
    ctaTextColor: styles.buttonTextColor || rawSettings.ctaTextColor,
    ctaBorderColor: styles.buttonBorderColor || rawSettings.ctaBorderColor,
    ctaStyle: (styles.buttonStyle as HeroBannerSettings["ctaStyle"]) || rawSettings.ctaStyle,
    ctaShadow: (styles.buttonShadow as HeroBannerSettings["ctaShadow"]) || rawSettings.ctaShadow,
    ctaBorderRadiusPx:
      typeof styles.buttonBorderRadiusPx === "number" ? styles.buttonBorderRadiusPx : rawSettings.ctaBorderRadiusPx,
    ctaBorderWidthPx:
      typeof styles.buttonBorderWidthPx === "number" ? styles.buttonBorderWidthPx : rawSettings.ctaBorderWidthPx,
    ctaShowArrow:
      typeof styles.buttonShowArrow === "boolean" ? styles.buttonShowArrow : rawSettings.ctaShowArrow,
    bannerShadow: (styles.shadow as HeroBannerSettings["bannerShadow"]) || rawSettings.bannerShadow,
    bannerShadowEnabled: rawSettings.bannerShadowEnabled ?? styles.shadowEnabled,
    bannerShadowColor: rawSettings.bannerShadowColor || styles.shadowColor,
    overlayColor: rawSettings.overlayColor || styles.overlayColor,
    borderRadiusPx:
      typeof rawSettings.borderRadiusPx === "number" ? rawSettings.borderRadiusPx : styleBorderRadiusPx,
    useCornerColors: styles.useCornerColors ?? rawSettings.useCornerColors,
    cornerColorTl: styles.cornerColorTl || rawSettings.cornerColorTl,
    cornerColorTr: styles.cornerColorTr || rawSettings.cornerColorTr,
    cornerColorBr: styles.cornerColorBr || rawSettings.cornerColorBr,
    cornerColorBl: styles.cornerColorBl || rawSettings.cornerColorBl,
    usePerCornerRadius: styles.usePerCornerRadius ?? rawSettings.usePerCornerRadius,
    borderRadiusTlPx: styles.borderRadiusTlPx ?? rawSettings.borderRadiusTlPx,
    borderRadiusTrPx: styles.borderRadiusTrPx ?? rawSettings.borderRadiusTrPx,
    borderRadiusBrPx: styles.borderRadiusBrPx ?? rawSettings.borderRadiusBrPx,
    borderRadiusBlPx: styles.borderRadiusBlPx ?? rawSettings.borderRadiusBlPx,
    imageFilterPreset: styles.imageFilterPreset || rawSettings.imageFilterPreset,
    imageBrightness: styles.imageBrightness ?? rawSettings.imageBrightness,
    imageContrast: styles.imageContrast ?? rawSettings.imageContrast,
    imageSaturation: styles.imageSaturation ?? rawSettings.imageSaturation,
    imageSepia: styles.imageSepia ?? rawSettings.imageSepia,
    imageBlurPx: styles.imageBlurPx ?? rawSettings.imageBlurPx,
    archShape: rawSettings.archShape || mappedFrameArch || "roman-arch",
  };

  const sectionOpacity =
    typeof (section.settings as unknown as Record<string, unknown>)?.sectionOpacity === "number"
      ? Number((section.settings as unknown as Record<string, unknown>).sectionOpacity)
      : 100;

  const profile = resolveHeroDeviceProfile(settings, previewViewport);
  const resolvedSubElement =
    activeSubElement !== undefined
      ? activeSubElement
      : storeSelectedSectionId === section.id
        ? (storeSubElement as HeroSubElement | null)
        : null;

  const isSubSelected = (sub: HeroSubElement): boolean =>
    Boolean(
      isEditable &&
        (resolvedSubElement === sub ||
          (sub === "ctaPrimary" && resolvedSubElement === "cta"))
    );

  const selectSub = (e: React.MouseEvent, sub: HeroSubElement): void => {
    if (!isEditable) return;
    e.stopPropagation();
    onSelect?.();
    if (onSelectSubElement) {
      onSelectSubElement(sub);
    } else {
      setActiveInspectorTab("content");
      selectSection(section.id, sub);
    }
  };

  const getSubRing = (sub: HeroSubElement): string =>
    isSubSelected(sub) ? "ring-2 ring-[#005BD3] ring-offset-2 rounded-lg" : "";

  const handleTextPatch = (field: keyof HeroBannerSettings, val: string): void => {
    if (onInlineUpdate) {
      onInlineUpdate({ [field]: val });
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("studio:patch-section-settings", {
          detail: {
            sectionId: section.id,
            patch: { [field]: val },
            ...(field === "title" ? { title: val } : {}),
          },
        })
      );
    }
  };

  const isFloatingBanner = Boolean(settings.bannerFloating);
  const explicitContained =
    settings.containerMode === "contained" ||
    styles.containerWidth === "contained" ||
    styles.containerWidth === "narrow";
  const isFullWidthContainer =
    !isFloatingBanner &&
    (settings.containerMode === "full" ||
      (styles.containerWidth === "full" && settings.containerMode !== "contained") ||
      (Boolean(settings.fullTopWidth) && settings.containerMode !== "contained") ||
      (profile.heroLayout === "cinema-full" && !explicitContained));

  const sharedStyleProps = {
    settings,
    sectionStyles: styles,
    theme,
    profile,
    previewViewport,
    products,
    isEditable,
    isEdgeToEdge: isFullWidthContainer,
    activeSubElement: resolvedSubElement,
    isSubSelected,
    selectSub,
    getSubRing,
    handleTextPatch,
  };

  const hasCustomPaddingY = styles.paddingY !== undefined;
  const hasCustomPaddingX = !isFullWidthContainer && styles.paddingX !== undefined;
  const padY = hasCustomPaddingY ? resolveSectionPaddingY(styles.paddingY, theme.spacingYPx) : undefined;
  const padX = hasCustomPaddingX ? resolveSectionPaddingX(styles.paddingX) : undefined;

  const wrapperClass = isFloatingBanner
    ? "max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-8"
    : isFullWidthContainer
      ? "w-full px-0"
      : styles.containerWidth === "narrow"
        ? "max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-5"
        : "max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5";

  const renderArchitecturalStyle = (): React.ReactNode => {
    switch (profile.heroLayout) {
      case "cinema-full":
        return <HeroFullBleed {...sharedStyleProps} />;
      case "arch-palace":
        return <HeroArch {...sharedStyleProps} />;
      case "atelier-collage":
        return <HeroGallery {...sharedStyleProps} />;
      case "bento-hero":
        return <HeroDiptych {...sharedStyleProps} />;
      case "editorial-split":
      default:
        return <HeroSplit {...sharedStyleProps} />;
    }
  };

  return (
    <section
      onClick={isEditable ? onSelect : undefined}
      data-testid="section-hero-banner-root"
      data-banner-presentation={isFloatingBanner ? "floating" : isFullWidthContainer ? "full-bleed" : "contained"}
      className="@container relative w-full overflow-visible transition-colors duration-300 motion-reduce:transition-none"
      style={{
        backgroundColor: theme.canvasColor || "var(--store-canvas, #F8FAFC)",
        color: styles.textColor || theme.secondaryColor || "var(--store-text, #0F172A)",
        ...(sectionOpacity < 100 ? { opacity: sectionOpacity / 100 } : {}),
        ...(padY !== undefined ? { paddingTop: `${padY}px`, paddingBottom: `${padY}px` } : {}),
        ...(padX !== undefined ? { paddingLeft: `${padX}px`, paddingRight: `${padX}px` } : {}),
      }}
    >
      <div className={wrapperClass}>{renderArchitecturalStyle()}</div>
      <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
    </section>
  );
};
