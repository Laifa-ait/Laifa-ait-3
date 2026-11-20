import React from "react";
import { Type, Sparkles } from "lucide-react";
import type {
  EditorialHeadingAccentStyle,
  EditorialUnderlineStyle,
} from "../../../../../../types/studio.types";
import { EditorialHeading } from "../../../../../../components/Store/EditorialHeading";
import { DEFAULT_EDITORIAL_SAMPLE_TITLE, DEFAULT_MODERN_THEME } from "../../../constants/studioThemeDefaults";

interface EditorialTypographyControlBoxProps {
  letterSpacing?: number;
  lineHeight?: number;
  headingAccentStyle?: EditorialHeadingAccentStyle;
  headingUnderlineStyle?: EditorialUnderlineStyle;
  accentColor?: string;
  isAr?: boolean;
  onChange: (patch: {
    letterSpacing?: number;
    lineHeight?: number;
    headingAccentStyle?: EditorialHeadingAccentStyle;
    headingUnderlineStyle?: EditorialUnderlineStyle;
  }) => void;
}

const ACCENT_STYLE_OPTIONS: Array<{
  id: EditorialHeadingAccentStyle;
  labelFr: string;
  labelAr: string;
}> = [
  { id: "accent-color", labelFr: "Couleur Accent", labelAr: "لون الهوية" },
  { id: "copper-bronze", labelFr: "Acier Architectural", labelAr: "فولاذ عصري" },
  { id: "metallic-gold", labelFr: "Or Métallique", labelAr: "ذهبي معدني" },
];

const UNDERLINE_STYLE_OPTIONS: Array<{
  id: EditorialUnderlineStyle;
  labelFr: string;
  labelAr: string;
}> = [
  { id: "hairline", labelFr: "Filet Architectural", labelAr: "خط معماري" },
  { id: "brush-stroke", labelFr: "Trait Dynamique", labelAr: "لمسة ديناميكية" },
  { id: "golden-wave", labelFr: "Courbe Fine", labelAr: "موجة دقيقة" },
];

export const EditorialTypographyControlBox: React.FC<
  EditorialTypographyControlBoxProps
> = ({
  letterSpacing = 0,
  lineHeight = 1.15,
  headingAccentStyle = "accent-color",
  headingUnderlineStyle = "hairline",
  accentColor = DEFAULT_MODERN_THEME.accentColor,
  isAr = false,
  onChange,
}) => {
  return (
    <div className="space-y-3 p-3 rounded-xl bg-[var(--studio-background)] border border-[var(--studio-border)] select-none">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-[var(--studio-black)] uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[var(--studio-primary)]" />
          <span>
            {isAr
              ? "5. الطباعة الفنية والخطوط"
              : "Compositeur Typographique Éditorial"}
          </span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-[var(--studio-highlight-soft)] text-[var(--studio-focus)] text-[9px] font-extrabold">
          *Italique* &amp; &#123;Souligné&#125;
        </span>
      </div>

      {/* Live Mini Preview of *...* and {...} syntax */}
      <div className="p-2.5 rounded-lg bg-[var(--studio-primary)] text-[var(--studio-white)] text-center shadow-2xs">
        <EditorialHeading
          as="h4"
          text={
            isAr
              ? "تصميم *معاصر* {استوديو}"
              : DEFAULT_EDITORIAL_SAMPLE_TITLE
          }
          accentColorOverride={accentColor}
          sectionStyles={{
            letterSpacing,
            lineHeight,
            headingAccentStyle,
            headingUnderlineStyle,
          }}
          className="text-sm font-extrabold"
        />
        <p className="text-[9.5px] text-white/75 mt-1.5">
          {isAr
            ? "استخدم *نجمة* للخط المائل و {أقواس} للتسطير في أي عنوان."
            : "Entourez un mot de *...* pour l'emphase et de {...} pour le soulignement architectural."}
        </p>
      </div>

      {/* Tracking / Letter Spacing (-0.04em to +0.25em) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] tabular-nums">
          <span className="font-semibold text-[var(--studio-black)]">
            {isAr ? "تباعد الحروف (Tracking)" : "Approche / Tracking (letterSpacing)"}
          </span>
          <span className="font-mono font-bold text-[var(--studio-primary)]">
            {letterSpacing > 0 ? `+${letterSpacing.toFixed(2)}em` : `${letterSpacing.toFixed(2)}em`}
          </span>
        </div>
        <input
          type="range"
          min={-0.04}
          max={0.25}
          step={0.01}
          value={letterSpacing}
          onChange={(e) => onChange({ letterSpacing: parseFloat(e.target.value) })}
          className="w-full accent-[var(--studio-primary)] cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-[var(--studio-muted)] font-medium">
          <span>{isAr ? "مضغوط (-0.04em)" : "Brutaliste (-0.04em)"}</span>
          <span>{isAr ? "متوازن (0em)" : "Standard (0em)"}</span>
          <span>{isAr ? "فاخر (+0.25em)" : "Spacieux (+0.25em)"}</span>
        </div>
      </div>

      {/* Line Height (0.95 to 1.6) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] tabular-nums">
          <span className="font-semibold text-[var(--studio-black)]">
            {isAr ? "ارتفاع السطر (Line Height)" : "Interlignage (lineHeight)"}
          </span>
          <span className="font-mono font-bold text-[var(--studio-primary)]">{lineHeight.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.95}
          max={1.6}
          step={0.05}
          value={lineHeight}
          onChange={(e) => onChange({ lineHeight: parseFloat(e.target.value) })}
          className="w-full accent-[var(--studio-primary)] cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-[var(--studio-muted)] font-medium">
          <span>{isAr ? "ملصق (0.95)" : "Affiche (0.95)"}</span>
          <span>{isAr ? "متوازن (1.20)" : "Éditorial (1.20)"}</span>
          <span>{isAr ? "ايري (1.60)" : "Aéré (1.60)"}</span>
        </div>
      </div>

      {/* Accent Style for *...* */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[var(--studio-black)] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[var(--studio-focus)]" />
          <span>{isAr ? "لون الكلمات بين *نجمتين*" : "Finition des mots entre *astérisques*"}</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {ACCENT_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ headingAccentStyle: opt.id })}
              className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                headingAccentStyle === opt.id
                  ? "border-[var(--studio-primary)] bg-[var(--studio-highlight-soft)] text-[var(--studio-black)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-white)] text-[var(--studio-text)] hover:bg-[var(--studio-surface-subtle)]"
              }`}
            >
              {isAr ? opt.labelAr : opt.labelFr}
            </button>
          ))}
        </div>
      </div>

      {/* Underline Style for {...} */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[var(--studio-black)] block">
          {isAr ? "نمط التسطير الفني بين {أقواس}" : "Tracé du soulignement entre {accolades}"}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {UNDERLINE_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ headingUnderlineStyle: opt.id })}
              className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                headingUnderlineStyle === opt.id
                  ? "border-[var(--studio-primary)] bg-[var(--studio-highlight-soft)] text-[var(--studio-black)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-white)] text-[var(--studio-text)] hover:bg-[var(--studio-surface-subtle)]"
              }`}
            >
              {isAr ? opt.labelAr : opt.labelFr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
