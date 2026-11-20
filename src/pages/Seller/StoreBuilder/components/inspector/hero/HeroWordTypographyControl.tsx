import React, { useState } from "react";
import { Eraser } from "lucide-react";
import type {
  CustomPageTheme,
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
} from "../../../../../../domains/seller/customPage.types";
import type { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import {
  HERO_WORD_FONT_OPTIONS,
  ensureHeroFontLoaded,
  mapTitlePxToSizeToken,
  normalizeHeroFontId,
  resolveHeroDefaultTitlePx,
  resolveHeroFontCss,
  toggleInlineMarkupSelection,
} from "../../../../../../components/Store/sections/hero/heroTypographyHelper";
import { HeroWordParagraphControls } from "./HeroWordParagraphControls";

interface HeroWordTypographyControlProps {
  deviceTab: "desktop" | "tablet" | "mobile";
  profile: ResolvedHeroDeviceProfile;
  settings: Partial<HeroBannerSettings>;
  theme: CustomPageTheme;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>) => void;
}

const TITLE_SIZE_PRESETS = [18, 20, 24, 28, 32, 36, 42, 48, 56, 64] as const;
const SUBTITLE_SIZE_PRESETS = [11, 12, 13, 14, 15, 16, 18, 20, 22, 24] as const;

export const HeroWordTypographyControl: React.FC<HeroWordTypographyControlProps> = ({
  deviceTab, profile, settings, theme, titleInputRef, onSettingsChange, onDeviceConfigChange,
}) => {
  const [target, setTarget] = useState<"title" | "subtitle">("title");
  const isTitle = target === "title";
  const isDesktop = deviceTab === "desktop";

  const activeFontId = normalizeHeroFontId(isTitle ? settings.titleFontFamily : settings.subtitleFontFamily);
  const currentFontSizePx = isTitle
    ? (profile.customTitleFontSizePx ?? resolveHeroDefaultTitlePx(profile.titleSizeToken, deviceTab))
    : (profile.customSubtitleFontSizePx ?? (deviceTab === "mobile" ? 13 : 15));

  const isBold = isTitle
    ? settings.titleFontWeight !== "normal"
    : settings.subtitleFontWeight === "bold" || settings.subtitleFontWeight === "semibold";
  const isItalic = isTitle ? Boolean(settings.titleItalic) : Boolean(settings.subtitleItalic);
  const isUnderline = isTitle ? Boolean(settings.titleUnderline) : Boolean(settings.subtitleUnderline);
  const activeCase = (isTitle ? settings.titleTextTransform : settings.subtitleTextTransform) || "none";
  const activeColor = isTitle
    ? (settings.titleColor || theme.secondaryColor || "#0F172A")
    : (settings.subtitleColor || theme.mutedTextColor || "#475569");
  const activeShadow = settings.textShadow === "soft" || settings.textShadow === "sm"
    ? "soft"
    : settings.textShadow === "strong" || settings.textShadow === "lg" || settings.textShadow === "md"
      ? "strong"
      : "none";
  const activeLineHeight = isTitle ? (settings.titleLineHeight ?? 1.1) : (settings.subtitleLineHeight ?? 1.4);
  const activeLetterSpacing = isTitle ? (settings.titleLetterSpacingEm ?? 0) : (settings.subtitleLetterSpacingEm ?? 0);

  const applyFontSize = (nextPx: number) => {
    const clamped = isTitle ? Math.min(68, Math.max(16, Math.round(nextPx))) : Math.min(26, Math.max(11, Math.round(nextPx)));
    if (isTitle) {
      const token = mapTitlePxToSizeToken(clamped, deviceTab);
      const sizeField = deviceTab === "mobile" ? "titleSizeMobile" : deviceTab === "tablet" ? "titleSizeTablet" : "titleSizeDesktop";
      onDeviceConfigChange(
        { titleFontSizePx: clamped, titleSize: token },
        isDesktop ? { titleFontSizePx: clamped, [sizeField]: token } : { [sizeField]: token }
      );
      return;
    }
    onDeviceConfigChange({ subtitleFontSizePx: clamped }, isDesktop ? { subtitleFontSizePx: clamped } : undefined);
  };

  const applyFontFamily = (fontId: string) => {
    ensureHeroFontLoaded(fontId);
    onSettingsChange(isTitle ? "titleFontFamily" : "subtitleFontFamily", fontId);
  };

  const handleToggleBold = () => onSettingsChange(isTitle ? "titleFontWeight" : "subtitleFontWeight", isBold ? "normal" : isTitle ? "black" : "bold");

  const handleInlineOrGlobalStyle = (kind: "italic" | "underline") => {
    const el = isTitle ? titleInputRef.current : null;
    if (isTitle && el && el.selectionStart !== null && el.selectionEnd !== null && el.selectionEnd > el.selectionStart) {
      const raw = settings.title || "";
      const { nextText, nextStart, nextEnd } = toggleInlineMarkupSelection(raw, el.selectionStart, el.selectionEnd, kind);
      if (nextText !== raw) {
        onSettingsChange("title", nextText);
        requestAnimationFrame(() => { el.focus(); el.setSelectionRange(nextStart, nextEnd); });
        return;
      }
    }
    onSettingsChange(kind === "italic" ? (isTitle ? "titleItalic" : "subtitleItalic") : (isTitle ? "titleUnderline" : "subtitleUnderline"), kind === "italic" ? !isItalic : !isUnderline);
  };

  const handleCycleCase = () => onSettingsChange(isTitle ? "titleTextTransform" : "subtitleTextTransform", activeCase === "none" ? "uppercase" : activeCase === "uppercase" ? "capitalize" : "none");
  const handleCycleShadow = () => onSettingsChange("textShadow", activeShadow === "none" ? "soft" : activeShadow === "soft" ? "strong" : "none");

  const handleClearFormatting = () => {
    if (isTitle) {
      const cleanTitle = (settings.title || "").replace(/\*([^*]+)\*/g, "$1").replace(/\{([^{}]+)\}/g, "$1");
      onSettingsChange({ title: cleanTitle, titleFontFamily: "theme", titleFontWeight: undefined, titleItalic: false, titleUnderline: false, titleTextTransform: "none", titleLineHeight: undefined, titleLetterSpacingEm: undefined, textShadow: "none", titleFontSizePx: undefined });
      onDeviceConfigChange({ titleFontSizePx: undefined, titleSize: "lg" });
      return;
    }
    onSettingsChange({ subtitleFontFamily: "theme", subtitleFontWeight: undefined, subtitleItalic: false, subtitleUnderline: false, subtitleTextTransform: "none", subtitleLineHeight: undefined, subtitleLetterSpacingEm: undefined, subtitleFontSizePx: undefined });
    onDeviceConfigChange({ subtitleFontSizePx: undefined });
  };

  const sizeOptions = isTitle ? TITLE_SIZE_PRESETS : SUBTITLE_SIZE_PRESETS;
  const wordBtnBase = "h-7 min-w-[28px] px-1.5 rounded-md flex items-center justify-center text-[12px] transition-colors cursor-pointer shrink-0";
  const wordBtnInactive = "text-slate-700 hover:bg-slate-200/70";
  const wordBtnActive = "bg-slate-900 text-white shadow-2xs";

  return (
    <div data-testid="hero-word-typography-ribbon" className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <div className="inline-flex items-center rounded-md bg-slate-200/70 p-0.5">
          {(["title", "subtitle"] as const).map((t) => (
            <button
              key={t} type="button" data-testid={`hero-word-target-${t}`} onClick={() => setTarget(t)}
              className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                target === t ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t === "title" ? "Titre" : "Sous-titre"}
            </button>
          ))}
        </div>
        <button
          type="button" data-testid="hero-word-clear-btn" onClick={handleClearFormatting} title="Effacer toute la mise en forme"
          className="h-6 px-2 rounded-md text-[10.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <Eraser className="w-3 h-3" /><span>Effacer</span>
        </button>
      </div>

      <div className="p-2.5 space-y-2">
        <div className="flex items-center gap-1.5">
          <select
            aria-label="Police de caractères" data-testid="hero-word-font-select" value={activeFontId}
            onChange={(e) => applyFontFamily(e.target.value)}
            style={{ fontFamily: resolveHeroFontCss(activeFontId, theme.headingFontFamily || theme.fontFamily) }}
            className="flex-1 min-w-0 h-8 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
          >
            {HERO_WORD_FONT_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>

          <select
            aria-label="Taille de police en pixels" data-testid="hero-word-size-select" value={String(currentFontSizePx)}
            onChange={(e) => applyFontSize(Number(e.target.value))}
            className="w-[58px] shrink-0 h-8 rounded-md border border-slate-200 bg-white px-1.5 text-[12px] font-semibold tabular-nums text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
          >
            {!sizeOptions.includes(currentFontSizePx as never) && <option value={String(currentFontSizePx)}>{currentFontSizePx}</option>}
            {sizeOptions.map((px) => <option key={px} value={String(px)}>{px}</option>)}
          </select>

          <div className="inline-flex items-center rounded-md border border-slate-200 bg-white overflow-hidden shrink-0">
            <button type="button" data-testid="hero-word-size-dec" onClick={() => applyFontSize(currentFontSizePx - 2)} title="Réduire la taille de police" className="h-8 w-7 flex items-center justify-center text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer border-r border-slate-200">
              A<span className="text-[9px] ml-0.5">−</span>
            </button>
            <button type="button" data-testid="hero-word-size-inc" onClick={() => applyFontSize(currentFontSizePx + 2)} title="Augmenter la taille de police" className="h-8 w-7 flex items-center justify-center text-[12px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
              A<span className="text-[9px] ml-0.5">+</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 px-1.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-0.5">
            <button type="button" data-testid="hero-word-bold-btn" aria-pressed={isBold} title="Gras (G)" onClick={handleToggleBold} className={`${wordBtnBase} font-extrabold ${isBold ? wordBtnActive : wordBtnInactive}`}>G</button>
            <button type="button" data-testid="hero-word-italic-btn" aria-pressed={isItalic} title="Italique (I) — sélectionnez un mot dans le titre pour le mettre en italique" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInlineOrGlobalStyle("italic")} className={`${wordBtnBase} italic font-serif font-semibold ${isItalic ? wordBtnActive : wordBtnInactive}`}>I</button>
            <button type="button" data-testid="hero-word-underline-btn" aria-pressed={isUnderline} title="Souligné (S) — sélectionnez un mot dans le titre pour le souligner" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInlineOrGlobalStyle("underline")} className={`${wordBtnBase} underline underline-offset-2 font-semibold ${isUnderline ? wordBtnActive : wordBtnInactive}`}>S</button>
          </div>

          <span aria-hidden="true" className="w-px h-4 bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1">
            <button type="button" data-testid="hero-word-case-btn" title={`Casse : ${activeCase === "uppercase" ? "MAJUSCULES" : activeCase === "capitalize" ? "Capitale" : "Normale"}`} onClick={handleCycleCase} className={`${wordBtnBase} font-semibold text-[11px] ${activeCase !== "none" ? wordBtnActive : wordBtnInactive}`}>
              {activeCase === "uppercase" ? "AA" : activeCase === "capitalize" ? "Ab" : "Aa"}
            </button>
            <label title="Couleur de police" className={`${wordBtnBase} relative flex-col gap-0.5 ${wordBtnInactive}`}>
              <span className="text-[12px] font-bold leading-none text-slate-900">A</span>
              <span className="w-4 h-[3px] rounded-xs border border-black/15" style={{ backgroundColor: activeColor }} />
              <input type="color" aria-label="Couleur de police" data-testid="hero-word-color-input" value={/^#[0-9a-fA-F]{6}$/.test(activeColor) ? activeColor : "#0F172A"} onChange={(e) => onSettingsChange(isTitle ? "titleColor" : "subtitleColor", e.target.value)} className="sr-only" />
            </label>
            <button type="button" data-testid="hero-word-shadow-btn" aria-pressed={activeShadow !== "none"} title={`Ombre du texte : ${activeShadow === "strong" ? "Forte" : activeShadow === "soft" ? "Douce" : "Aucune"}`} onClick={handleCycleShadow} className={`${wordBtnBase} px-2 text-[11px] font-medium gap-1 ${activeShadow !== "none" ? wordBtnActive : wordBtnInactive}`}>
              <span style={{ textShadow: "0 1px 3px rgba(0,0,0,0.45)" }} className="font-bold">A</span>
              <span className="text-[10.5px] whitespace-nowrap">{activeShadow === "strong" ? "Forte" : activeShadow === "soft" ? "Douce" : "Ombre"}</span>
            </button>
          </div>
        </div>

        <HeroWordParagraphControls
          isTitle={isTitle} isDesktop={isDesktop} profile={profile}
          activeLineHeight={activeLineHeight} activeLetterSpacing={activeLetterSpacing}
          onSettingsChange={onSettingsChange} onDeviceConfigChange={onDeviceConfigChange}
        />
      </div>
    </div>
  );
};
