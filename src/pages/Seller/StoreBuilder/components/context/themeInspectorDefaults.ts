import {
  CustomPageSection,
  CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";

export const DEFAULT_GLOBAL_DESIGN_SYSTEM: CustomPageTheme = {
  sector: "artisanat",
  canvasColor: "#F4ECE1",
  surfaceColor: "#FFFDF9",
  borderColor: "#DFCBB2",
  primaryColor: "#B84A27",
  secondaryColor: "#29170E",
  textColor: "#3D2518",
  mutedTextColor: "#7C5A46",
  accentColor: "#C88A2B",
  accentBadgeColor: "#B84A27",
  badgeTextColor: "#FFFDF9",
  buttonColor: "#29170E",
  buttonTextColor: "#FFFDF9",
  priceColor: "#9A3412",
  fontFamily: "'Cormorant Garamond', 'Plus Jakarta Sans', serif",
  headingFontFamily: "'Cormorant Garamond', serif",
  bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
  borderRadiusPx: 16,
  spacingYPx: 28,
  titleFontSizePx: 36,
  bodyFontSizePx: 15,
  surfaceTexture: "cotton-paper",
  ambientLighting: "golden-hour",
  cardMaterial: "solid-matte",
  frameShape: "casbah-arch",
};

export function stripHardcodedSectionColors(sections: CustomPageSection[]): CustomPageSection[] {
  return sections.map((sec) => {
    const rawSettings = { ...((sec.settings || {}) as Record<string, unknown>) };
    delete rawSettings.ctaBgColor;
    delete rawSettings.ctaTextColor;
    delete rawSettings.ctaBorderColor;
    delete rawSettings.badgeBgColor;
    delete rawSettings.badgeTextColor;
    delete rawSettings.cardAccentColor;
    delete rawSettings.bannerBgColor;
    delete rawSettings.bannerBgGradient;
    delete rawSettings.bannerBorderColor;
    delete rawSettings.titleColor;
    delete rawSettings.subtitleColor;

    const rawStyles = { ...(sec.styles || {}) };
    delete rawStyles.backgroundColor;
    delete rawStyles.textColor;
    delete rawStyles.headingColor;
    delete rawStyles.subtitleColor;
    delete rawStyles.kickerColor;
    delete rawStyles.cardBgColor;
    delete rawStyles.cardTextColor;
    delete rawStyles.cardBorderColor;
    delete rawStyles.priceColor;
    delete rawStyles.badgeBgColor;
    delete rawStyles.badgeTextColor;
    delete rawStyles.iconColor;
    delete rawStyles.dividerColor;
    delete rawStyles.sectionBorderColor;
    delete rawStyles.buttonBgColor;
    delete rawStyles.buttonTextColor;
    delete rawStyles.buttonBorderColor;

    return {
      ...sec,
      settings: rawSettings as unknown as CustomPageSection["settings"],
      styles: rawStyles,
    };
  });
}

const SECTION_STYLE_COLOR_KEYS = [
  "backgroundColor",
  "textColor",
  "headingColor",
  "subtitleColor",
  "kickerColor",
  "cardBgColor",
  "cardTextColor",
  "cardBorderColor",
  "priceColor",
  "badgeBgColor",
  "badgeTextColor",
  "iconColor",
  "dividerColor",
  "sectionBorderColor",
  "buttonBgColor",
  "buttonTextColor",
  "buttonBorderColor",
] as const;

const SECTION_SETTING_COLOR_KEYS = [
  "ctaBgColor",
  "ctaTextColor",
  "ctaBorderColor",
  "badgeBgColor",
  "badgeTextColor",
  "cardAccentColor",
  "bannerBgColor",
  "bannerBgGradient",
  "bannerBorderColor",
  "titleColor",
  "subtitleColor",
] as const;

export function countSectionsWithColorOverrides(sections: CustomPageSection[]): number {
  return sections.filter((sec) => {
    const rawStyles = (sec.styles || {}) as Record<string, unknown>;
    const rawSettings = (sec.settings || {}) as Record<string, unknown>;
    const hasStyleOverride = SECTION_STYLE_COLOR_KEYS.some(
      (k) => typeof rawStyles[k] === "string" && String(rawStyles[k]).trim().length > 0
    );
    const hasSettingOverride = SECTION_SETTING_COLOR_KEYS.some(
      (k) => typeof rawSettings[k] === "string" && String(rawSettings[k]).trim().length > 0
    );
    return hasStyleOverride || hasSettingOverride;
  }).length;
}

