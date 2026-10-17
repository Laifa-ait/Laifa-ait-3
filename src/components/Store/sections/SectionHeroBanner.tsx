import React from "react";
import { CustomPageSection, HeroBannerSettings, CustomPageTheme } from "../../../domains/seller/customPage.types";

interface SectionHeroBannerProps {
  section: CustomPageSection<"hero_banner">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SectionHeroBanner: React.FC<SectionHeroBannerProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
}) => {
  const settings: HeroBannerSettings = section.settings;
  const styles = section.styles;

  const bgStyle: React.CSSProperties = {
    backgroundColor: styles.backgroundColor || theme.primaryColor || "#5B3765",
    color: styles.textColor || "#FFFFFF",
  };

  const overlayOpacity = typeof settings.overlayOpacity === "number" ? settings.overlayOpacity / 100 : 0.3;

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      style={bgStyle}
      className={`relative overflow-hidden transition-all cursor-pointer ${
        styles.borderRadius === "lg"
          ? "rounded-2xl"
          : styles.borderRadius === "md"
          ? "rounded-xl"
          : styles.borderRadius === "sm"
          ? "rounded-lg"
          : ""
      } ${
        isEditable && isSelected
          ? "ring-4 ring-emerald-500 shadow-2xl z-10"
          : isEditable
          ? "hover:ring-2 hover:ring-purple-400"
          : ""
      }`}
    >
      {settings.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={settings.imageUrl}
            alt={settings.title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}

      <div
        className={`relative z-10 mx-auto px-6 py-12 md:py-20 ${
          styles.containerWidth === "contained" ? "max-w-6xl" : "w-full"
        } ${
          settings.textAlignment === "left"
            ? "text-left"
            : settings.textAlignment === "right"
            ? "text-right"
            : "text-center"
        }`}
      >
        {settings.badgeText && (
          <span
            className="inline-block px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4 shadow-sm"
            style={{
              backgroundColor: theme.accentBadgeColor || "#059669",
              color: "#FFFFFF",
            }}
          >
            {settings.badgeText}
          </span>
        )}

        <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
          {settings.title}
        </h1>

        {settings.subtitle && (
          <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            {settings.subtitle}
          </p>
        )}

        {settings.ctaText && (
          <a
            href={settings.ctaLink || "#"}
            onClick={(e) => isEditable && e.preventDefault()}
            className="inline-flex items-center px-6 py-3.5 rounded-xl text-sm md:text-base font-bold transition-transform active:scale-95 shadow-lg"
            style={{
              backgroundColor: theme.secondaryColor || "#D4AF37",
              color: "#1F2937",
            }}
          >
            {settings.ctaText}
          </a>
        )}
      </div>
    </div>
  );
};
