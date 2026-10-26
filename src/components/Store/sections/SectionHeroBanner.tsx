import React from "react";
import {
  CustomPageSection,
  HeroBannerSettings,
  CustomPageTheme,
  HeroSubElement,
} from "../../../domains/seller/customPage.types";
import {
  resolveBorderRadiusClass,
  resolveShadowClass,
  resolveContainerWidthClass,
  resolveAnimationClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { Image as ImageIcon, Type, Sparkles, MousePointerClick, AlignLeft } from "lucide-react";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";
import { resolveBannerPosition } from "../../../pages/Seller/StoreBuilder/components/inspector/controls/AlignmentMatrix3x3";

interface SectionHeroBannerProps {
  section: CustomPageSection<"hero_banner">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  previewViewport?: "mobile" | "tablet" | "desktop";
}

function getContrastingTextColor(hex?: string): string {
  if (!hex || !hex.startsWith("#")) return "#FFFFFF";
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return "#FFFFFF";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111827" : "#FFFFFF";
}

export const SectionHeroBanner: React.FC<SectionHeroBannerProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
  previewViewport = "desktop",
}) => {
  const settings: HeroBannerSettings = section.settings;
  const styles = section.styles || {};

  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);
  const hoverElement = useStudioStore((s) => s.hoverElement);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const hoveredSectionId = useStudioStore((s) => s.hoveredSectionId);
  const hoveredSubElement = useStudioStore((s) => s.hoveredSubElement);

  const activeSubElement: HeroSubElement | null =
    selectedSectionId === section.id &&
    (selectedSubElement === "background" ||
      selectedSubElement === "badge" ||
      selectedSubElement === "title" ||
      selectedSubElement === "subtitle" ||
      selectedSubElement === "cta" ||
      selectedSubElement === "ctaPrimary" ||
      selectedSubElement === "ctaSecondary")
      ? selectedSubElement === "ctaPrimary"
        ? "cta"
        : selectedSubElement
      : null;

  const triggerSubElementFocus = (el: HeroSubElement, e?: React.MouseEvent) => {
    if (!isEditable) return;
    if (e) e.stopPropagation();
    if (onSelect) onSelect();
    setActiveInspectorTab("content");
    selectSection(section.id, el);
  };

  const isSubHovered = (el: HeroSubElement) =>
    isEditable && hoveredSectionId === section.id && hoveredSubElement === el;

  const posDesktop = settings.imagePositionDesktop || "50% 30%";
  const posTablet = settings.imagePositionTablet || posDesktop;
  const posMobile = settings.imagePositionMobile || posDesktop;

  const activeObjectPosition =
    previewViewport === "mobile"
      ? posMobile
      : previewViewport === "tablet"
      ? posTablet
      : posDesktop;

  const activeImageSrc =
    previewViewport === "mobile" && settings.mobileImageUrl
      ? settings.mobileImageUrl
      : settings.imageUrl;

  const heightDesktopMap: Record<string, number> = {
    sm: 280,
    md: 400,
    lg: 520,
    xl: 640,
  };
  const heightMobileMap: Record<string, number> = {
    sm: 220,
    md: 320,
    lg: 420,
  };

  const baseMinHeight =
    previewViewport === "mobile"
      ? heightMobileMap[settings.bannerHeightMobile || "md"] || 320
      : heightDesktopMap[settings.bannerHeightDesktop || "md"] || 400;

  const customPadY =
    typeof styles.paddingY === "number"
      ? styles.paddingY
      : { sm: 24, md: 48, lg: 72, xl: 96 }[styles.paddingY || "md"] ?? 48;
  const customPadX = typeof styles.paddingX === "number" ? styles.paddingX : 28;

  const overlayOpacity =
    typeof settings.overlayOpacity === "number" ? settings.overlayOpacity / 100 : 0.35;

  const resolvedCtaBg = settings.ctaBgColor || styles.buttonBgColor || theme.primaryColor || "#F97316";
  const resolvedCtaText = settings.ctaTextColor || styles.buttonTextColor || getContrastingTextColor(resolvedCtaBg);
  const resolvedBadgeBg = settings.badgeBgColor || theme.accentBadgeColor || "#F97316";
  const resolvedBadgeText = settings.badgeTextColor || getContrastingTextColor(resolvedBadgeBg);

  const showBadge = settings.showBadge !== false && Boolean(settings.badgeText);
  const showSubtitle = settings.showSubtitle !== false && Boolean(settings.subtitle);
  const showCta = settings.showCta !== false && Boolean(settings.ctaText);

  const bannerPos = resolveBannerPosition(
    settings.contentPosition,
    settings.textAlignment || "center",
    settings.verticalAlignment || "center"
  );

  const ctaShapeClass =
    settings.ctaStyle === "pill"
      ? "rounded-full"
      : settings.ctaStyle === "outline"
      ? "rounded-xl border-2 bg-transparent!"
      : settings.ctaStyle === "glass"
      ? "rounded-xl backdrop-blur-md bg-white/20! border border-white/40"
      : styles.borderRadius === "none"
      ? "rounded-none"
      : styles.borderRadius === "sm"
      ? "rounded-lg"
      : styles.borderRadius === "lg"
      ? "rounded-2xl"
      : "rounded-xl";

  // Overlay tint uses styles.backgroundColor when chosen in the "Couleurs" tab
  const overlayTintColor = styles.backgroundColor || "#0F172A";
  const effectiveTextColor =
    settings.titleColor ||
    styles.textColor ||
    (styles.backgroundColor ? getContrastingTextColor(styles.backgroundColor) : "#FFFFFF");

  return (
    <div className="flex flex-col">
      {/* Clean Light Sub-Toolbar when selected in Studio (Never overlaps Hero content) */}
      {isEditable && isSelected && (
        <div
          className="bg-[#F8FBFC] border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 pr-1">
              Éditer :
            </span>
            {[
              { id: "background" as const, label: "Image & Cadrage", icon: ImageIcon },
              { id: "badge" as const, label: "Badge", icon: Sparkles },
              { id: "title" as const, label: "Titre", icon: Type },
              { id: "subtitle" as const, label: "Sous-titre", icon: AlignLeft },
              { id: "cta" as const, label: "Bouton", icon: MousePointerClick },
            ].map((item) => {
              const Icon = item.icon;
              const isAct = activeSubElement === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => triggerSubElementFocus(item.id, e)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                    isAct
                      ? "bg-[#023859] text-white border-[#023859] shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-[#011C40]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0 whitespace-nowrap">
            Cadrage : {activeObjectPosition}
          </span>
        </div>
      )}

      <div
        onClick={isEditable ? (e) => triggerSubElementFocus("background", e) : undefined}
        style={{
          backgroundColor: overlayTintColor,
          color: effectiveTextColor,
        }}
        className={`relative overflow-hidden transition-all select-none ${resolveBorderRadiusClass(
          styles.borderRadius
        )} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)} ${
          isEditable && !isSelected ? " cursor-pointer" : ""
        }`}
      >

      {/* Background Media with Per-Device Focal Point */}
      {activeImageSrc && (
        <div className="absolute inset-0 z-0">
          <img
            src={activeImageSrc}
            alt={settings.title || "Bannière"}
            style={{
              objectPosition: activeObjectPosition,
              objectFit: settings.imageFit || "cover",
            }}
            className="w-full h-full transition-all duration-200"
          />
          <div
            className="absolute inset-0 transition-all duration-200"
            style={{
              backgroundColor: overlayTintColor,
              opacity: styles.backgroundColor ? Math.max(0.55, overlayOpacity) : overlayOpacity,
            }}
          />
        </div>
      )}

      {/* Foreground Content Container */}
      <div
        style={{
          minHeight: `${baseMinHeight}px`,
          paddingTop: `${Math.max(24, customPadY)}px`,
          paddingBottom: `${Math.max(24, customPadY)}px`,
          paddingLeft: `${Math.max(16, customPadX)}px`,
          paddingRight: `${Math.max(16, customPadX)}px`,
        }}
        className={`relative z-10 flex flex-col ${resolveContainerWidthClass(
          styles.containerWidth
        )} ${bannerPos.flexContainerClass}`}
      >
        {showBadge && (
          <span
            onMouseEnter={isEditable ? () => hoverElement(section.id, "badge") : undefined}
            onMouseLeave={isEditable ? () => hoverElement(section.id, null) : undefined}
            onClick={(e) => triggerSubElementFocus("badge", e)}
            style={{
              backgroundColor: resolvedBadgeBg,
              color: resolvedBadgeText,
            }}
            title={isEditable ? "Cliquer pour personnaliser le badge" : undefined}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4 shadow-md transition-all ${
              isEditable
                ? `cursor-pointer ${
                    activeSubElement === "badge"
                      ? "ring-2 ring-[#F97316] outline-2 outline-solid outline-white scale-105"
                      : isSubHovered("badge")
                      ? "ring-2 ring-white/90"
                      : "hover:ring-2 hover:ring-white"
                  }`
                : ""
            }`}
          >
            {settings.badgeText}
          </span>
        )}

        {/* Social Proof Badge (ChicWave & Earthy 2.2 Style) */}
        {settings.socialProofBadge && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold text-white mb-3 shadow-xs">
            <span className="text-amber-400 font-bold tracking-widest">★</span>
            <span>{settings.socialProofBadge}</span>
          </div>
        )}

        <h1
          onMouseEnter={isEditable ? () => hoverElement(section.id, "title") : undefined}
          onMouseLeave={isEditable ? () => hoverElement(section.id, null) : undefined}
          onClick={(e) => triggerSubElementFocus("title", e)}
          style={{
            color: effectiveTextColor,
          }}
          title={isEditable ? "Cliquer pour modifier le titre" : undefined}
          className={`text-2xl @sm:text-3xl @md:text-4xl @lg:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-sm max-w-3xl transition-all rounded-lg px-2 py-0.5 ${
            isEditable
              ? `cursor-pointer ${
                  activeSubElement === "title"
                    ? "ring-2 ring-[#F97316] bg-black/30 outline-2 outline-solid outline-[#3B82F6]"
                    : isSubHovered("title")
                    ? "bg-white/10 ring-1 ring-white/80"
                    : "hover:bg-white/10 hover:ring-1 hover:ring-white/60"
                }`
              : ""
          }`}
        >
          {settings.title || "Titre de votre boutique"}
        </h1>

        {showSubtitle && (
          <p
            onMouseEnter={isEditable ? () => hoverElement(section.id, "subtitle") : undefined}
            onMouseLeave={isEditable ? () => hoverElement(section.id, null) : undefined}
            onClick={(e) => triggerSubElementFocus("subtitle", e)}
            style={{
              color: settings.subtitleColor || effectiveTextColor,
            }}
            title={isEditable ? "Cliquer pour modifier le sous-titre" : undefined}
            className={`text-sm @sm:text-base @md:text-lg opacity-90 max-w-2xl mb-7 font-medium leading-relaxed drop-shadow-2xs transition-all rounded-lg px-2 py-0.5 ${
              isEditable
                ? `cursor-pointer ${
                    activeSubElement === "subtitle"
                      ? "ring-2 ring-[#F97316] bg-black/30 outline-2 outline-solid outline-[#3B82F6]"
                      : isSubHovered("subtitle")
                      ? "bg-white/10 ring-1 ring-white/80"
                      : "hover:bg-white/10 hover:ring-1 hover:ring-white/60"
                  }`
                : ""
            }`}
          >
            {settings.subtitle}
          </p>
        )}

        {(showCta || Boolean(settings.secondaryCtaText)) && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {showCta && (
                <a
                  href={settings.ctaLink || "#catalog"}
                  onMouseEnter={isEditable ? () => hoverElement(section.id, "cta") : undefined}
                  onMouseLeave={isEditable ? () => hoverElement(section.id, null) : undefined}
                  onClick={(e) => {
                    const link = String(settings.ctaLink || "#catalog");
                    if (isEditable) {
                      e.preventDefault();
                      triggerSubElementFocus("cta", e);
                    } else if (link.startsWith("#")) {
                      e.preventDefault();
                      if (link.startsWith("#rayon:")) {
                        window.dispatchEvent(
                          new CustomEvent("studio:navigate-page", {
                            detail: {
                              viewMode: "category",
                              categorySlug: link.replace("#rayon:", ""),
                            },
                          })
                        );
                      } else {
                        window.dispatchEvent(
                          new CustomEvent("studio:navigate-page", {
                            detail: { viewMode: "collection", pageId: "page-catalog" },
                          })
                        );
                      }
                    }
                  }}
                  title={isEditable ? "Cliquer pour modifier le bouton d'action" : undefined}
                  className={`inline-flex items-center justify-center px-6 py-3.5 text-sm @md:text-base font-bold transition-all active:scale-95 shadow-lg ${ctaShapeClass} ${
                    isEditable
                      ? `cursor-pointer ${
                          activeSubElement === "cta"
                            ? "ring-2 ring-[#F97316] outline-2 outline-solid outline-white scale-105"
                            : isSubHovered("cta")
                            ? "ring-2 ring-white/90"
                            : "hover:ring-2 hover:ring-white"
                        }`
                      : "hover:opacity-95"
                  }`}
                  style={{
                    backgroundColor: settings.ctaStyle === "outline" ? "transparent" : resolvedCtaBg,
                    color: settings.ctaStyle === "outline" ? effectiveTextColor : resolvedCtaText,
                    borderColor: settings.ctaStyle === "outline" ? resolvedCtaBg : undefined,
                  }}
                >
                  {settings.ctaText}
                </a>
              )}

              {settings.secondaryCtaText && (
                <a
                  href={settings.secondaryCtaLink || "#catalog"}
                  onMouseEnter={isEditable ? () => hoverElement(section.id, "ctaSecondary") : undefined}
                  onMouseLeave={isEditable ? () => hoverElement(section.id, null) : undefined}
                  onClick={(e) => {
                    if (isEditable) {
                      e.preventDefault();
                      triggerSubElementFocus("ctaSecondary", e);
                    }
                  }}
                  title={isEditable ? "Cliquer pour modifier le bouton secondaire" : undefined}
                  className={`inline-flex items-center justify-center px-6 py-3.5 text-sm @md:text-base font-bold transition-all border border-white/40 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md shadow-md ${ctaShapeClass} ${
                    isEditable
                      ? `cursor-pointer ${
                          activeSubElement === "ctaSecondary"
                            ? "ring-2 ring-[#F97316] outline-2 outline-solid outline-white scale-105"
                            : isSubHovered("ctaSecondary")
                            ? "ring-2 ring-white/90"
                            : "hover:ring-2 hover:ring-white"
                        }`
                      : ""
                  }`}
                >
                  {settings.secondaryCtaText}
                </a>
              )}
            </div>

            {isEditable && isSelected && activeSubElement === "cta" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const link = String(settings.ctaLink || "#catalog");
                  window.dispatchEvent(
                    new CustomEvent("studio:navigate-page", {
                      detail: link.startsWith("#rayon:")
                        ? {
                            viewMode: "category",
                            categorySlug: link.replace("#rayon:", ""),
                            openCustomizer: true,
                          }
                        : {
                            viewMode: "collection",
                            pageId: "page-catalog",
                            openCustomizer: true,
                          },
                    })
                  );
                }}
                className="px-3 py-1 rounded-full bg-[#111827]/90 hover:bg-[#F97316] text-white text-[11px] font-bold shadow-md border border-white/20 transition-all cursor-pointer"
              >
                Customiser la page affichée par ce bouton →
              </button>
            )}
          </div>
        )}
      </div>

        <SectionDividerRenderer divider={styles.divider} color={effectiveTextColor} theme={theme} />
      </div>
    </div>
  );
};
