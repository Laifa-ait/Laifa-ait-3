import React, { useState } from "react";
import type {
  CustomPageSection,
  CustomPageTheme,
  KineticMarqueeSeparator,
  KineticMarqueeSettings,
} from "../../../domains/seller/customPage.types";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveShadowClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { Pause, Play, Sparkles } from "lucide-react";

interface KineticMarqueeSectionProps {
  section: CustomPageSection<"kinetic_marquee">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function renderSeparatorGlyph(separator: KineticMarqueeSeparator, color: string) {
  const glyph = separator === "diamond" ? "◆" : separator === "crescent" ? "☾" : separator === "dot" ? "•" : "✦";
  return (
    <span className="inline-flex items-center justify-center mx-4 text-sm" style={{ color }}>
      {glyph}
    </span>
  );
}

export const KineticMarqueeSection: React.FC<KineticMarqueeSectionProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const rawSettings = (section.settings || {}) as unknown as Record<string, unknown>;
  const settings: KineticMarqueeSettings = section.settings || {
    textFr: "COLLECTION CONTEMPORAINE • ÉDITION STUDIO • LIVRAISON NATIONALE",
  };
  const styles = section.styles || {};

  const hasExplicitEmptyText =
    "textFr" in rawSettings &&
    String(rawSettings.textFr || "").trim() === "" &&
    (!settings.showBilingual || String(rawSettings.textAr || "").trim() === "");

  const textFr = hasExplicitEmptyText
    ? ""
    : settings.textFr || "COLLECTION CONTEMPORAINE • ÉDITION STUDIO • LIVRAISON NATIONALE";
  const textAr =
    settings.textAr || "تشكيلة عصرية • إصدار ستوديو • توصيل وطني سريع";
  const showBilingual = settings.showBilingual !== false && Boolean(textAr) && !hasExplicitEmptyText;
  const speed = settings.speed || "normal";
  const textStyle = settings.textStyle || "alternating";
  const separator = settings.separator || "dot";
  const direction = settings.direction || "ltr";
  const tiltDeg = settings.tiltDeg ?? 0;
  const uppercase = settings.uppercase !== false;

  const durationSec = speed === "slow" ? 36 : speed === "fast" ? 13 : 22;
  const bgColor = styles.backgroundColor || theme.secondaryColor || "#0F172A";
  const textColor = styles.headingColor || styles.textColor || "#FFFFFF";
  const secondaryTextColor = styles.subtitleColor || styles.kickerColor || theme.accentColor || theme.primaryColor || "#94A3B8";
  const glyphColor = styles.iconColor || secondaryTextColor;

  const letterSpacingEm =
    typeof styles.letterSpacing === "number"
      ? styles.letterSpacing
      : typeof theme.letterSpacing === "number"
      ? theme.letterSpacing
      : 0.06;

  const repeatedBlocks = [0, 1, 2, 3, 4, 5];

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      style={buildSectionContainerStyle(styles, bgColor, textColor, theme)}
      className={`relative overflow-hidden transition-all select-none ${resolveBorderRadiusClass(
        styles.borderRadius,
      )} ${resolveShadowClass(styles.shadow)} ${
        isEditable && !isSelected ? "cursor-pointer" : ""
      }`}
    >
      <style>{`
        @keyframes olmartKineticMarqueeLtr {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes olmartKineticMarqueeRtl {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .olmart-kinetic-track {
            animation-play-state: paused !important;
          }
        }
      `}</style>

      {isEditable && isSelected && (
        <div className="bg-black/25 backdrop-blur-xs px-3 py-1 flex items-center justify-between text-[10px] font-bold text-white/90 border-b border-white/10">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Bandeau Cinétique Infini ({speed.toUpperCase()} • {textStyle})</span>
          </span>
          <span className="font-mono opacity-80">FR {showBilingual ? "+ AR" : "Seul"}</span>
        </div>
      )}

      {hasExplicitEmptyText ? (
        <div
          data-testid="kinetic-marquee-empty-state"
          className="py-3 px-4 text-center text-xs font-medium opacity-85"
          style={{ color: textColor }}
        >
          {isEditable
            ? "Texte du bandeau vide — saisissez un message dans l'inspecteur ou masquez cette section."
            : ""}
        </div>
      ) : (
        <div
          className="relative py-3 @sm:py-4 overflow-hidden"
          style={{
            transform: tiltDeg !== 0 ? `rotate(${tiltDeg}deg) scale(1.02)` : undefined,
          }}
        >
          <button
            type="button"
            data-testid="kinetic-marquee-pause-btn"
            aria-label={isPaused ? "Reprendre le défilement" : "Mettre en pause le défilement"}
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused((prev) => !prev);
            }}
            className="absolute end-2 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          <div
            className="olmart-kinetic-track flex w-max items-center whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
            style={{
              animation: `${
                direction === "rtl" ? "olmartKineticMarqueeRtl" : "olmartKineticMarqueeLtr"
              } ${durationSec}s linear infinite`,
              animationPlayState: isPaused ? "paused" : undefined,
            }}
          >
            {repeatedBlocks.map((idx) => {
              const isHollow =
                textStyle === "hollow-stroke" ||
                (textStyle === "alternating" && idx % 2 === 1);

              const itemStyle: React.CSSProperties = isHollow
                ? {
                    WebkitTextStroke: `1.25px ${textColor}`,
                    color: "transparent",
                    letterSpacing: `${letterSpacingEm}em`,
                  }
                : {
                    color: textColor,
                    letterSpacing: `${letterSpacingEm}em`,
                  };

              return (
                <div key={idx} className="inline-flex items-center">
                  <span
                    className={`text-base @sm:text-xl @md:text-2xl font-extrabold tracking-wider ${
                      uppercase ? "uppercase" : ""
                    }`}
                    style={itemStyle}
                  >
                    {textFr}
                  </span>

                  {renderSeparatorGlyph(separator, glyphColor)}

                  {showBilingual && (
                    <>
                      <span
                        dir="rtl"
                        className="text-base @sm:text-xl @md:text-2xl font-bold"
                        style={{
                          fontFamily: "'Cairo', system-ui, sans-serif",
                          ...(isHollow
                            ? {
                                WebkitTextStroke: `1px ${secondaryTextColor}`,
                                color: "transparent",
                              }
                            : { color: secondaryTextColor }),
                        }}
                      >
                        {textAr}
                      </span>
                      {renderSeparatorGlyph(separator, glyphColor)}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
    </div>
  );
};
