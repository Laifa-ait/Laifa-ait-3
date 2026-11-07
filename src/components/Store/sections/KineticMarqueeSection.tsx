import React from "react";
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
import { Sparkles } from "lucide-react";

interface KineticMarqueeSectionProps {
  section: CustomPageSection<"kinetic_marquee">;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function renderSeparatorGlyph(separator: KineticMarqueeSeparator, color: string) {
  if (separator === "diamond") {
    return (
      <span className="inline-flex items-center justify-center mx-4 text-sm" style={{ color }}>
        ◆
      </span>
    );
  }
  if (separator === "crescent") {
    return (
      <span className="inline-flex items-center justify-center mx-4 text-base" style={{ color }}>
        ☾
      </span>
    );
  }
  if (separator === "dot") {
    return (
      <span className="inline-flex items-center justify-center mx-4 text-base" style={{ color }}>
        •
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center mx-4 text-sm" style={{ color }}>
      ✦
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
  const settings: KineticMarqueeSettings = section.settings || {
    textFr: "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE • LIVRAISON 69 WILAYAS",
  };
  const styles = section.styles || {};

  const textFr =
    settings.textFr || "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE • LIVRAISON 69 WILAYAS";
  const textAr =
    settings.textAr || "صنع بحب في الجزائر • إصدار محدود • توصيل لجميع الولايات";
  const showBilingual = settings.showBilingual !== false && Boolean(textAr);
  const speed = settings.speed || "normal";
  const textStyle = settings.textStyle || "alternating";
  const separator = settings.separator || "star";
  const direction = settings.direction || "ltr";
  const tiltDeg = settings.tiltDeg ?? 0;
  const uppercase = settings.uppercase !== false;

  const durationSec = speed === "slow" ? 36 : speed === "fast" ? 13 : 22;
  const bgColor = styles.backgroundColor || theme.secondaryColor || "#011C40";
  const textColor = styles.textColor || "#FFFFFF";
  const accentColor = theme.accentColor || theme.primaryColor || "#F59E0B";

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
      style={buildSectionContainerStyle(styles, bgColor, textColor)}
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

      <div
        className="py-3 @sm:py-4 overflow-hidden"
        style={{
          transform: tiltDeg !== 0 ? `rotate(${tiltDeg}deg) scale(1.02)` : undefined,
        }}
      >
        <div
          className="olmart-kinetic-track flex w-max items-center whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
          style={{
            animation: `${
              direction === "rtl" ? "olmartKineticMarqueeRtl" : "olmartKineticMarqueeLtr"
            } ${durationSec}s linear infinite`,
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

                {renderSeparatorGlyph(separator, accentColor)}

                {showBilingual && (
                  <>
                    <span
                      dir="rtl"
                      className="text-base @sm:text-xl @md:text-2xl font-bold"
                      style={{
                        fontFamily: "'Amiri', 'Reem Kufi', Georgia, serif",
                        ...(isHollow
                          ? {
                              WebkitTextStroke: `1px ${accentColor}`,
                              color: "transparent",
                            }
                          : { color: accentColor }),
                      }}
                    >
                      {textAr}
                    </span>
                    {renderSeparatorGlyph(separator, textColor)}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <SectionDividerRenderer divider={styles.divider} theme={theme} />
    </div>
  );
};
