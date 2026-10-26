import React from "react";
import { CustomPageSectionStyles, CustomPageTheme } from "../../../domains/seller/customPage.types";

export function resolveSectionPaddingY(paddingY?: "sm" | "md" | "lg" | "xl" | number): number {
  if (typeof paddingY === "number") return paddingY;
  const map: Record<string, number> = { sm: 16, md: 32, lg: 48, xl: 64 };
  return map[paddingY || "md"] ?? 32;
}

export function resolveSectionPaddingX(paddingX?: number): number {
  return typeof paddingX === "number" ? paddingX : 20;
}

export function resolveBorderRadiusClass(radius?: "none" | "sm" | "md" | "lg" | "full"): string {
  switch (radius) {
    case "none":
      return "rounded-none";
    case "sm":
      return "rounded-lg";
    case "lg":
      return "rounded-3xl";
    case "full":
      return "rounded-full";
    case "md":
    default:
      return "rounded-2xl";
  }
}

export function resolveShadowClass(shadow?: "none" | "sm" | "floating" | "brutal"): string {
  switch (shadow) {
    case "sm":
      return "shadow-sm";
    case "floating":
      return "shadow-xl shadow-slate-900/10";
    case "brutal":
      return "border-2 border-[#17191C] shadow-[5px_5px_0px_0px_#17191C]";
    case "none":
    default:
      return "";
  }
}

export function resolveContainerWidthClass(width?: "contained" | "full" | "narrow"): string {
  if (width === "full") return "w-full";
  if (width === "narrow") return "max-w-3xl mx-auto";
  return "max-w-6xl mx-auto";
}

export function resolveAnimationClass(animation?: "none" | "fade" | "slide-up" | "zoom"): string {
  switch (animation) {
    case "fade":
      return "animate-in fade-in duration-500";
    case "slide-up":
      return "animate-in fade-in slide-in-from-bottom-4 duration-500";
    case "zoom":
      return "animate-in fade-in zoom-in-95 duration-500";
    default:
      return "";
  }
}

export function buildSectionContainerStyle(
  styles: CustomPageSectionStyles = {},
  defaultBg = "transparent",
  defaultText = "#17191C"
): React.CSSProperties {
  return {
    backgroundColor: styles.backgroundColor || defaultBg,
    color: styles.textColor || defaultText,
    paddingTop: `${resolveSectionPaddingY(styles.paddingY)}px`,
    paddingBottom: `${resolveSectionPaddingY(styles.paddingY)}px`,
    paddingLeft: `${resolveSectionPaddingX(styles.paddingX)}px`,
    paddingRight: `${resolveSectionPaddingX(styles.paddingX)}px`,
  };
}

export const SectionDividerRenderer: React.FC<{
  divider?: "none" | "wave" | "slant" | "curve";
  color?: string;
  theme?: CustomPageTheme;
}> = ({ divider, color, theme }) => {
  if (!divider || divider === "none") return null;
  const fillColor = color || theme?.primaryColor || "#F97316";

  if (divider === "wave") {
    return (
      <div className="w-full overflow-hidden leading-none pointer-events-none pt-2 opacity-25">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-5">
          <path
            d="M0,30 C300,60 600,0 900,30 C1050,45 1150,20 1200,30 L1200,60 L0,60 Z"
            fill={fillColor}
          />
        </svg>
      </div>
    );
  }

  if (divider === "slant") {
    return (
      <div className="w-full overflow-hidden leading-none pointer-events-none pt-2 opacity-25">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-4">
          <polygon points="0,40 1200,0 1200,40" fill={fillColor} />
        </svg>
      </div>
    );
  }

  if (divider === "curve") {
    return (
      <div className="w-full overflow-hidden leading-none pointer-events-none pt-2 opacity-25">
        <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className="w-full h-5">
          <path d="M0,0 Q600,50 1200,0 L1200,50 L0,50 Z" fill={fillColor} />
        </svg>
      </div>
    );
  }

  return null;
};
