import React from "react";
import { Type, Sparkles } from "lucide-react";
import type {
  EditorialHeadingAccentStyle,
  EditorialUnderlineStyle,
} from "../../../../../../types/studio.types";
import { EditorialHeading } from "../../../../../../components/Store/EditorialHeading";

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
  { id: "metallic-gold", labelFr: "Or Métallique", labelAr: "ذهبي معدني" },
  { id: "copper-bronze", labelFr: "Cuivre & Ambre", labelAr: "نحاسي دافئ" },
  { id: "accent-color", labelFr: "Couleur Accent 10%", labelAr: "لون الهوية 10%" },
];

const UNDERLINE_STYLE_OPTIONS: Array<{
  id: EditorialUnderlineStyle;
  labelFr: string;
  labelAr: string;
}> = [
  { id: "brush-stroke", labelFr: "Trait de Pinceau SVG", labelAr: "لمسة فرشاة فنية" },
  { id: "golden-wave", labelFr: "Onde Dorée Calligraphique", labelAr: "موجة ذهبية" },
];

export const EditorialTypographyControlBox: React.FC<
  EditorialTypographyControlBoxProps
> = ({
  letterSpacing = 0,
  lineHeight = 1.15,
  headingAccentStyle = "metallic-gold",
  headingUnderlineStyle = "brush-stroke",
  accentColor = "#C59B27",
  isAr = false,
  onChange,
}) => {
  return (
    <div className="space-y-3 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 select-none">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#023859]" />
          <span>
            {isAr
              ? "5. الطباعة الفنية والخطوط (الركيزة 3)"
              : "Compositeur Typographique Éditorial"}
          </span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold">
          *Italique* &amp; &#123;Souligné&#125;
        </span>
      </div>

      {/* Live Mini Preview of *...* and {...} syntax */}
      <div className="p-2.5 rounded-lg bg-[#011C40] text-white text-center shadow-2xs">
        <EditorialHeading
          as="h4"
          text={
            isAr
              ? "فن *الأناقة* في {القصبة}"
              : "L'Art de la *Haute Couture* {Algéroise}"
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
            ? "استخدم *نجمة* للخط المائل الذهبي و {أقواس} للتسطير الفني في أي عنوان."
            : "Entourez un mot de *...* pour l'italique d'art et de {...} pour le trait de pinceau SVG."}
        </p>
      </div>

      {/* Tracking / Letter Spacing (-0.04em to +0.25em) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#011C40]">
            {isAr ? "تباعد الحروف (Tracking)" : "Approche / Tracking (letterSpacing)"}
          </span>
          <span className="font-mono font-bold text-[#023859]">
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
          className="w-full accent-[#023859] cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
          <span>{isAr ? "مضغوط (-0.04em)" : "Brutaliste (-0.04em)"}</span>
          <span>{isAr ? "متوازن (0em)" : "Standard (0em)"}</span>
          <span>{isAr ? "فاخر (+0.25em)" : "Luxe (+0.25em)"}</span>
        </div>
      </div>

      {/* Line Height (0.95 to 1.6) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#011C40]">
            {isAr ? "ارتفاع السطر (Line Height)" : "Interlignage (lineHeight)"}
          </span>
          <span className="font-mono font-bold text-[#023859]">{lineHeight.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.95}
          max={1.6}
          step={0.05}
          value={lineHeight}
          onChange={(e) => onChange({ lineHeight: parseFloat(e.target.value) })}
          className="w-full accent-[#023859] cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
          <span>{isAr ? "ملصق (0.95)" : "Affiche (0.95)"}</span>
          <span>{isAr ? "متوازن (1.20)" : "Éditorial (1.20)"}</span>
          <span>{isAr ? "شاعري (1.60)" : "Poétique (1.60)"}</span>
        </div>
      </div>

      {/* Accent Style for *...* */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[#011C40] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
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
                  ? "border-[#023859] bg-[#F0F7FA] text-[#011C40]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isAr ? opt.labelAr : opt.labelFr}
            </button>
          ))}
        </div>
      </div>

      {/* Underline Style for {...} */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[#011C40] block">
          {isAr ? "نمط التسطير الفني بين {أقواس}" : "Tracé du soulignement SVG entre {accolades}"}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {UNDERLINE_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ headingUnderlineStyle: opt.id })}
              className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                headingUnderlineStyle === opt.id
                  ? "border-[#023859] bg-[#F0F7FA] text-[#011C40]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
