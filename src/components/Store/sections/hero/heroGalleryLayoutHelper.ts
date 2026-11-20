import { CustomPageTheme, HeroBannerSettings } from "../../../../domains/seller/customPage.types";
import { ResolvedHeroDeviceProfile } from "./heroResponsiveHelper";
import { hexToRgba } from "./heroVisualEffectsHelper";

export interface ResolvedHeroGalleryLayout {
  isMobile: boolean;
  isTablet: boolean;
  passePartoutPx: number;
  innerRadiusPx: number;
  secondaryRadiusPx: number;
  galleryGapPx: number;
  secondaryImages: string[];
  hasMultiGallery: boolean;
  useDockedCaption: boolean;
  dockCaptionFirst: boolean;
  frameMinHeightPx: number;
  innerRingClass: string;
  plaqueBgCss: string;
  plaqueBorderCss: string;
  dockedAlignClass: string;
  secondarySlotMinHeightPx: number;
}

function isDarkHex(hex?: string): boolean {
  if (!hex) return false;
  const clean = hex.trim().replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 130;
}

export function resolveHeroGalleryLayout(
  settings: HeroBannerSettings,
  theme: CustomPageTheme,
  profile: ResolvedHeroDeviceProfile
): ResolvedHeroGalleryLayout {
  const isMobile = profile.viewport === "mobile";
  const isTablet = profile.viewport === "tablet";
  const basePad = Math.min(48, Math.max(16, profile.innerPaddingPx || 32));
  const passePartoutPx = isMobile
    ? Math.min(18, Math.max(10, Math.round(basePad * 0.45)))
    : isTablet
      ? Math.min(30, Math.max(14, Math.round(basePad * 0.72)))
      : basePad;

  const innerRadiusPx = Math.max(0, profile.borderRadiusPx - Math.round(passePartoutPx * 0.45));
  const secondaryRadiusPx = innerRadiusPx === 0 ? 0 : Math.max(6, innerRadiusPx - 2);
  const rawGap = Math.min(32, Math.max(8, profile.diptychGapPx || 14));
  const galleryGapPx = isMobile
    ? Math.min(14, Math.max(8, Math.round(rawGap * 0.65)))
    : isTablet
      ? Math.min(20, Math.max(10, Math.round(rawGap * 0.85)))
      : rawGap;

  const secondaryImages = [profile.secondaryImageSrc, profile.tertiaryImageSrc].filter(
    (u): u is string => Boolean(u && u.trim())
  );
  const hasMultiGallery = secondaryImages.length > 0;
  const framePlacement = settings.textFrame?.placement || "auto";
  const useDockedCaption =
    framePlacement === "overlay"
      ? false
      : framePlacement === "docked-below" || framePlacement === "docked-above"
        ? true
        : isMobile || (isTablet && hasMultiGallery);
  const dockCaptionFirst =
    framePlacement === "docked-above"
      ? true
      : framePlacement === "docked-below"
        ? false
        : isMobile
          ? settings.mobileStackOrder === "text-first" ||
            (!settings.mobileStackOrder && profile.textPosition9.startsWith("top"))
          : profile.textPosition9.startsWith("top");

  const frameMinHeightPx = isMobile
    ? hasMultiGallery
      ? Math.min(270, Math.max(190, Math.round(profile.heightPx * 0.52)))
      : Math.min(340, Math.max(210, Math.round(profile.heightPx * 0.62)))
    : isTablet
      ? Math.max(280, profile.heightPx - passePartoutPx * 2)
      : Math.max(300, profile.heightPx - passePartoutPx * 2);

  const surfaceBaseHex = settings.bannerBgColor || theme.surfaceColor || theme.canvasColor || "#FFFFFF";
  const darkSurface = isDarkHex(surfaceBaseHex);
  const secondarySlotMinHeightPx = isMobile
    ? secondaryImages.length === 2
      ? 136
      : 160
    : Math.max(
        130,
        Math.floor(
          (frameMinHeightPx - (secondaryImages.length > 1 ? galleryGapPx : 0)) /
            Math.max(1, secondaryImages.length)
        )
      );

  const dockedAlignClass =
    profile.textAlign === "center"
      ? "items-center justify-center"
      : profile.textAlign === "right"
        ? "items-end justify-end"
        : "items-start justify-start";

  return {
    isMobile,
    isTablet,
    passePartoutPx,
    innerRadiusPx,
    secondaryRadiusPx,
    galleryGapPx,
    secondaryImages,
    hasMultiGallery,
    useDockedCaption,
    dockCaptionFirst,
    frameMinHeightPx,
    innerRingClass: darkSurface ? "ring-1 ring-inset ring-white/15" : "ring-1 ring-inset ring-black/8",
    plaqueBgCss: hexToRgba(surfaceBaseHex, 0.93, darkSurface ? [18, 22, 28] : [255, 255, 255]),
    plaqueBorderCss: darkSurface ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(15, 23, 42, 0.08)",
    dockedAlignClass,
    secondarySlotMinHeightPx,
  };
}
