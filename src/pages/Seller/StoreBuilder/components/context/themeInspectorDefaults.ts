import {
  CustomPageSection,
  CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";
import { DEFAULT_MODERN_THEME } from "../../constants/studioThemeDefaults";

export const DEFAULT_GLOBAL_DESIGN_SYSTEM: CustomPageTheme = {
  ...DEFAULT_MODERN_THEME,
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

export function buildUpdatedHeroPhotoPatch(
  heroSection: CustomPageSection | undefined,
  imageUrl: string
): Partial<CustomPageSection> | null {
  if (!heroSection) return null;
  const cur = (heroSection.settings || {}) as Record<string, unknown>;
  const cin = cur.cinematicConfig as Record<string, Record<string, unknown>> | undefined;
  const desktop = (cin?.responsive?.desktop as Record<string, unknown>) || {};
  const nextCin = cin
    ? {
        ...cin,
        image: { ...(cin.image || {}), src: imageUrl },
        responsive: { ...(cin.responsive || {}), desktop: { ...desktop, imageSrc: imageUrl } },
      }
    : undefined;
  return {
    settings: { ...cur, imageUrl, ...(nextCin ? { cinematicConfig: nextCin } : {}) } as unknown as CustomPageSection["settings"],
  };
}


