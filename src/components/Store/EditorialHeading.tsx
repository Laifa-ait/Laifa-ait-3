import React from "react";
import type {
  CustomPageSectionStyles,
  CustomPageTheme,
  EditorialHeadingAccentStyle,
  EditorialUnderlineStyle,
} from "../../domains/seller/customPage.types";

interface ParsedHeadingToken {
  text: string;
  isItalicAccent: boolean;
  isUnderlined: boolean;
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

/**
 * Découpe un titre contenant la syntaxe d'accentuation artistique :
 * - *comme ceci* : police d'accentuation contrastée (Serif Italique ou Calligraphie Arabe) + couleur/dégradé
 * - {comme ceci} : soulignement artistique dessiné à la main en SVG
 * - *{comme ceci}* ou {*comme ceci*} : combinaison des deux effets
 */
export function parseEditorialHeadingTokens(rawText: string): ParsedHeadingToken[] {
  if (!rawText) return [];
  const pattern = /(\*\{[^{}*]+\}\*|\{\*[^{}*]+\*\}|\*[^*]+\*|\{[^{}]+\})/g;
  const parts = rawText.split(pattern).filter((part) => part.length > 0);

  return parts.map((part) => {
    if (
      (part.startsWith("*{") && part.endsWith("}*")) ||
      (part.startsWith("{*") && part.endsWith("*}"))
    ) {
      return {
        text: part.slice(2, -2),
        isItalicAccent: true,
        isUnderlined: true,
      };
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return {
        text: part.slice(1, -1),
        isItalicAccent: true,
        isUnderlined: false,
      };
    }
    if (part.startsWith("{") && part.endsWith("}") && part.length > 2) {
      return {
        text: part.slice(1, -1),
        isItalicAccent: false,
        isUnderlined: true,
      };
    }
    return {
      text: part,
      isItalicAccent: false,
      isUnderlined: false,
    };
  });
}

function HandDrawnUnderlineSvg({
  styleVariant,
  strokeColor,
}: {
  styleVariant: EditorialUnderlineStyle;
  strokeColor: string;
}) {
  if (styleVariant === "golden-wave") {
    return (
      <svg
        viewBox="0 0 120 12"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 left-0 w-full h-2.5 overflow-visible"
      >
        <path
          d="M2 7 C 22 1, 42 11, 62 6 C 82 1, 100 11, 118 5"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-1.5 left-0 w-full h-2.5 overflow-visible"
    >
      <path
        d="M3 8.5 Q 58 2.5 117 6.5"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M14 10.2 Q 66 5.5 112 8.2"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

interface EditorialHeadingProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span";
  theme?: CustomPageTheme;
  sectionStyles?: CustomPageSectionStyles;
  accentColorOverride?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  title?: string;
}

export const EditorialHeading: React.FC<EditorialHeadingProps> = ({
  text,
  as: Tag = "h2",
  theme,
  sectionStyles,
  accentColorOverride,
  className = "",
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  title,
}) => {
  const tokens = parseEditorialHeadingTokens(text);
  const isArabicText = ARABIC_CHAR_REGEX.test(text);

  const letterSpacingEm =
    typeof sectionStyles?.letterSpacing === "number"
      ? sectionStyles.letterSpacing
      : typeof theme?.letterSpacing === "number"
      ? theme.letterSpacing
      : undefined;

  const lineHeightVal =
    typeof sectionStyles?.lineHeight === "number"
      ? sectionStyles.lineHeight
      : typeof theme?.lineHeight === "number"
      ? theme.lineHeight
      : undefined;

  const accentStyle: EditorialHeadingAccentStyle =
    sectionStyles?.headingAccentStyle || theme?.headingAccentStyle || "metallic-gold";

  const underlineStyle: EditorialUnderlineStyle =
    sectionStyles?.headingUnderlineStyle || theme?.headingUnderlineStyle || "brush-stroke";

  const accentHex =
    accentColorOverride || theme?.accentColor || theme?.primaryColor || "#C59B27";

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(typeof letterSpacingEm === "number" && !isArabicText
      ? { letterSpacing: `${letterSpacingEm}em` }
      : {}),
    ...(typeof lineHeightVal === "number" ? { lineHeight: lineHeightVal } : {}),
  };

  return (
    <Tag
      dir={isArabicText ? "rtl" : undefined}
      className={className}
      style={combinedStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={title}
    >
      {tokens.map((tok, index) => {
        if (!tok.isItalicAccent && !tok.isUnderlined) {
          return <React.Fragment key={index}>{tok.text}</React.Fragment>;
        }

        const isTokenArabic = ARABIC_CHAR_REGEX.test(tok.text);
        const fontFamily = tok.isItalicAccent
          ? isTokenArabic
            ? "'Amiri', 'Reem Kufi', 'Noto Naskh Arabic', Georgia, serif"
            : "'Playfair Display', 'Cormorant Garamond', Georgia, serif"
          : undefined;

        const gradientClass =
          tok.isItalicAccent && accentStyle === "metallic-gold"
            ? "bg-clip-text text-transparent bg-gradient-to-r from-[#C59B27] via-[#F7DF8B] to-[#9A7115]"
            : tok.isItalicAccent && accentStyle === "copper-bronze"
            ? "bg-clip-text text-transparent bg-gradient-to-r from-[#B45309] via-[#F59E0B] to-[#78350F]"
            : "";

        const underlineStroke =
          accentStyle === "metallic-gold"
            ? "#D4AF37"
            : accentStyle === "copper-bronze"
            ? "#D97706"
            : accentHex;

        return (
          <span
            key={index}
            className={`relative inline-block px-0.5 ${
              tok.isItalicAccent && !isTokenArabic ? "italic font-semibold" : ""
            } ${gradientClass}`}
            style={{
              fontFamily,
              color:
                tok.isItalicAccent && accentStyle === "accent-color"
                  ? accentHex
                  : undefined,
            }}
          >
            {tok.text}
            {tok.isUnderlined && (
              <HandDrawnUnderlineSvg
                styleVariant={underlineStyle}
                strokeColor={underlineStroke}
              />
            )}
          </span>
        );
      })}
    </Tag>
  );
};

interface EditorialDropCapParagraphProps {
  text: string;
  dropCap?: boolean;
  accentColor?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const EditorialDropCapParagraph: React.FC<EditorialDropCapParagraphProps> = ({
  text,
  dropCap,
  accentColor = "#C59B27",
  className = "",
  onClick,
}) => {
  const trimmed = (text || "").trim();
  const isArabic = ARABIC_CHAR_REGEX.test(trimmed);

  if (!dropCap || trimmed.length < 2) {
    return (
      <p dir={isArabic ? "rtl" : undefined} onClick={onClick} className={className}>
        {text}
      </p>
    );
  }

  const firstChar = trimmed.charAt(0);
  const restText = trimmed.slice(1);

  return (
    <p dir={isArabic ? "rtl" : undefined} onClick={onClick} className={className}>
      <span
        className={`${
          isArabic ? "float-right ml-3" : "float-left mr-3"
        } text-4xl @md:text-5xl font-serif font-extrabold leading-none px-2.5 py-1.5 rounded-lg border shadow-2xs select-none`}
        style={{
          fontFamily: isArabic
            ? "'Amiri', Georgia, serif"
            : "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
          color: accentColor,
          borderColor: `${accentColor}35`,
          backgroundColor: `${accentColor}10`,
        }}
      >
        {firstChar}
      </span>
      {restText}
    </p>
  );
};
