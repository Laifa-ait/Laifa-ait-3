import type React from "react";
import type {
  CustomPageTheme,
  HeroBannerSettings,
  HeroTextFrameConfig,
} from "../../../../domains/seller/customPage.types";
import type { ResolvedHeroDeviceProfile } from "./heroResponsiveHelper";
import { hexToRgba, resolveHeroBoxShadowCss } from "./heroVisualEffectsHelper";

export interface HeroTextFramePreset {
  id: string;
  label: string;
  config: HeroTextFrameConfig;
}

export const HERO_TEXT_FRAME_PRESETS: ReadonlyArray<HeroTextFramePreset> = [
  {
    id: "glass-light",
    label: "Verre clair",
    config: {
      enabled: true, fillMode: "solid", bgColor: "#FFFFFF", opacity: 84, blurPx: 14,
      borderWidthPx: 1, borderStyle: "solid", borderColor: "#0F172A", borderOpacity: 12,
      borderRadiusPx: 18, paddingXPx: 24, paddingYPx: 20, shadow: "md",
    },
  },
  {
    id: "glass-dark",
    label: "Verre sombre",
    config: {
      enabled: true, fillMode: "solid", bgColor: "#0F172A", opacity: 78, blurPx: 14,
      borderWidthPx: 1, borderStyle: "solid", borderColor: "#FFFFFF", borderOpacity: 18,
      borderRadiusPx: 18, paddingXPx: 24, paddingYPx: 20, shadow: "lg",
    },
  },
  {
    id: "solid-card",
    label: "Carte unie",
    config: {
      enabled: true, fillMode: "solid", bgColor: "#FFFFFF", opacity: 100, blurPx: 0,
      borderWidthPx: 1, borderStyle: "solid", borderColor: "#E2E8F0", borderOpacity: 100,
      borderRadiusPx: 16, paddingXPx: 26, paddingYPx: 22, shadow: "floating",
    },
  },
  {
    id: "luxury-gradient",
    label: "Dégradé luxe",
    config: {
      enabled: true, fillMode: "gradient", bgColor: "#F6E7C8", gradientColor2: "#DFC089", gradientAngle: 135,
      opacity: 92, blurPx: 8, borderWidthPx: 2, borderStyle: "double", borderColor: "#8B6914", borderOpacity: 35,
      borderRadiusPx: 18, paddingXPx: 26, paddingYPx: 22, shadow: "md",
    },
  },
  {
    id: "outline-pure",
    label: "Contour pur",
    config: {
      enabled: true, fillMode: "solid", bgColor: "#FFFFFF", opacity: 0, blurPx: 6,
      borderWidthPx: 2, borderStyle: "solid", borderColor: "#FFFFFF", borderOpacity: 80,
      borderRadiusPx: 14, paddingXPx: 24, paddingYPx: 20, shadow: "none",
    },
  },
  {
    id: "none",
    label: "Sans cadre",
    config: { enabled: false },
  },
];

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

function normalizeHex6(raw: string | undefined, fallback: string): string {
  if (!raw || typeof raw !== "string") return fallback;
  const clean = raw.trim().replace("#", "");
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return `#${clean.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean.split("").map((c) => c + c).join("").toUpperCase()}`;
  }
  return fallback;
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

export interface ResolvedHeroTextFrame {
  enabled: boolean;
  placement: "auto" | "overlay" | "docked-below" | "docked-above";
  values: Required<Omit<HeroTextFrameConfig, "shadowColor">> & { shadowColor: string };
  frameStyle: React.CSSProperties;
}

export function resolveHeroTextFrame(
  settings: Partial<HeroBannerSettings>,
  theme: CustomPageTheme,
  profile: ResolvedHeroDeviceProfile,
  defaultEnabled: boolean
): ResolvedHeroTextFrame {
  const cfg = settings.textFrame || {};
  const enabled = cfg.enabled !== undefined ? Boolean(cfg.enabled) : defaultEnabled;
  const placement = cfg.placement || "auto";
  const isMobile = profile.viewport === "mobile";
  const isTablet = profile.viewport === "tablet";

  const surfaceFallback = settings.bannerBgColor || theme.surfaceColor || theme.canvasColor || "#FFFFFF";
  const bgColor = normalizeHex6(cfg.bgColor || surfaceFallback, "#FFFFFF");
  const darkSurface = isDarkHex(bgColor);
  const gradientColor2 = normalizeHex6(
    cfg.gradientColor2 || (darkSurface ? "#1E293B" : "#E7D5B8"),
    darkSurface ? "#1E293B" : "#E7D5B8"
  );
  const fillMode = cfg.fillMode === "gradient" ? "gradient" : "solid";
  const gradientAngle = clampNum(cfg.gradientAngle, 0, 360, 135);
  const opacity = clampNum(cfg.opacity, 0, 100, 93);
  const blurPx = clampNum(cfg.blurPx, 0, 24, 12);

  const borderWidthPx = clampNum(cfg.borderWidthPx, 0, 6, 1);
  const borderStyle = cfg.borderStyle || "solid";
  const borderColor = normalizeHex6(
    cfg.borderColor || (darkSurface ? "#FFFFFF" : "#0F172A"),
    darkSurface ? "#FFFFFF" : "#0F172A"
  );
  const borderOpacity = clampNum(cfg.borderOpacity, 0, 100, darkSurface ? 14 : 10);

  const defaultRadius = isMobile ? 12 : isTablet ? 14 : 16;
  const borderRadiusPx = clampNum(cfg.borderRadiusPx, 0, 48, defaultRadius);
  const defaultPadX = isMobile ? 16 : isTablet ? 20 : 24;
  const defaultPadY = isMobile ? 14 : isTablet ? 16 : 20;
  const paddingXPx = clampNum(cfg.paddingXPx, 0, 64, defaultPadX);
  const paddingYPx = clampNum(cfg.paddingYPx, 0, 64, defaultPadY);

  const maxWidthMode = cfg.maxWidthMode || "auto";
  const defaultMaxW = isTablet ? 440 : 540;
  const maxWidthPx = clampNum(cfg.maxWidthPx, 240, 800, defaultMaxW);
  const shadow = cfg.shadow || "md";
  const shadowColor = cfg.shadowColor ? normalizeHex6(cfg.shadowColor, "#0F172A") : "";
  const offsetXPx = clampNum(cfg.offsetXPx, -60, 60, 0);
  const offsetYPx = clampNum(cfg.offsetYPx, -60, 60, 0);

  const values = {
    enabled, placement, fillMode, bgColor, gradientColor2, gradientAngle, opacity, blurPx,
    borderWidthPx, borderStyle, borderColor, borderOpacity, borderRadiusPx,
    paddingXPx, paddingYPx, maxWidthMode, maxWidthPx, shadow, shadowColor, offsetXPx, offsetYPx,
  };

  if (!enabled) {
    const bareMaxW = maxWidthMode === "full" ? "100%" : maxWidthMode === "custom" ? `min(100%, ${maxWidthPx}px)` : `min(100%, ${defaultMaxW}px)`;
    return {
      enabled: false,
      placement,
      values,
      frameStyle: {
        background: "transparent",
        border: "none",
        boxShadow: "none",
        maxWidth: bareMaxW,
        width: maxWidthMode === "full" ? "100%" : undefined,
        ...(offsetXPx !== 0 || offsetYPx !== 0 ? { transform: `translate(${offsetXPx}px, ${offsetYPx}px)` } : {}),
      },
    };
  }

  const alpha = opacity / 100;
  const rgba1 = hexToRgba(bgColor, alpha, darkSurface ? [18, 22, 28] : [255, 255, 255]);
  const rgba2 = hexToRgba(gradientColor2, alpha, darkSurface ? [30, 41, 59] : [231, 213, 184]);
  const backgroundCss = fillMode === "gradient" ? `linear-gradient(${gradientAngle}deg, ${rgba1}, ${rgba2})` : rgba1;

  const borderRgba = hexToRgba(borderColor, borderOpacity / 100, darkSurface ? [255, 255, 255] : [15, 23, 42]);
  const borderCss = borderWidthPx > 0 ? `${borderWidthPx}px ${borderStyle} ${borderRgba}` : "none";

  const resolvedShadow = shadow === "none"
    ? "none"
    : resolveHeroBoxShadowCss(shadow, theme.primaryColor || "#0F172A", shadowColor || undefined)
      || "0 12px 32px -12px rgba(15, 23, 42, 0.18)";

  const maxWidthCss = maxWidthMode === "full"
    ? "100%"
    : maxWidthMode === "custom"
      ? `min(100%, ${maxWidthPx}px)`
      : `min(100%, ${defaultMaxW}px)`;

  const frameStyle: React.CSSProperties = {
    background: backgroundCss,
    border: borderCss,
    borderRadius: `${borderRadiusPx}px`,
    padding: `${paddingYPx}px ${paddingXPx}px`,
    maxWidth: maxWidthCss,
    width: maxWidthMode === "full" ? "100%" : undefined,
    boxShadow: resolvedShadow,
    ...(blurPx > 0 ? { backdropFilter: `blur(${blurPx}px)`, WebkitBackdropFilter: `blur(${blurPx}px)` } : {}),
    ...(offsetXPx !== 0 || offsetYPx !== 0 ? { transform: `translate(${offsetXPx}px, ${offsetYPx}px)` } : {}),
  };

  return { enabled: true, placement, values, frameStyle };
}
