import React from "react";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { CustomPageTheme, HeroBannerSettings, HeroLayoutModelId } from "../../../../../../domains/seller/customPage.types";

interface HeroColorElementPickersProps {
  activeModel: HeroLayoutModelId;
  settings: Partial<HeroBannerSettings>;
  theme: CustomPageTheme;
  supportsBadgeAndSecondaryCta: boolean;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

function safeHex(val: string | undefined, fallback: string): string {
  return val && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim()) ? val.trim() : fallback;
}

export const HeroColorElementPickers: React.FC<HeroColorElementPickersProps> = ({
  activeModel,
  settings: s,
  theme,
  supportsBadgeAndSecondaryCta,
  onSettingsChange,
}) => {
  const themeSurface = safeHex(theme.surfaceColor, "#FFFFFF");
  const themeCanvas = safeHex(theme.canvasColor, "#F8FAFC");
  const themeAccent = safeHex(theme.accentColor || theme.primaryColor, "#0F172A");

  const resolvedBg = safeHex(s.bannerBgColor, activeModel === "cinema-full" ? "#1E293B" : themeSurface);
  const resolvedTitle = safeHex(s.titleColor, activeModel === "cinema-full" ? "#FFFFFF" : safeHex(theme.secondaryColor, "#0F172A"));
  const resolvedSub = safeHex(s.subtitleColor, activeModel === "cinema-full" ? "#F4F4F5" : safeHex(theme.mutedTextColor, "#475569"));
  const resolvedCtaBg = safeHex(s.ctaBgColor, safeHex(theme.buttonColor, "#0F172A"));
  const resolvedCtaText = safeHex(s.ctaTextColor, safeHex(theme.buttonTextColor, "#FFFFFF"));
  const resolvedBadgeBg = safeHex(s.badgeBgColor, themeAccent);
  const resolvedBadgeText = safeHex(s.badgeTextColor, safeHex(theme.badgeTextColor, "#FFFFFF"));
  const resolvedBorder = safeHex(s.bannerBorderColor, safeHex(theme.borderColor, "#E2E8F0"));
  const resolvedShadowColor = safeHex(s.bannerShadowColor, "#0F172A");

  const isTextHidden = Boolean(s.hideAllText);
  const isCtaVisible = !isTextHidden && s.showCta !== false;
  const isTransparentCta = s.ctaStyle === "outline" || s.ctaStyle === "minimal";
  const isFullEdge =
    !s.bannerFloating &&
    (s.containerMode === "full" ||
      (Boolean(s.fullTopWidth) && s.containerMode !== "contained") ||
      (activeModel === "cinema-full" && s.containerMode !== "contained"));
  const hasBorderEnabled =
    typeof s.bannerBorderWidthPx === "number"
      ? s.bannerBorderWidthPx > 0
      : Boolean(s.bannerBorderColor) || !isFullEdge;
  const isShadowActive =
    s.bannerShadowEnabled !== false &&
    Boolean((s.bannerShadow && s.bannerShadow !== "none") || s.bannerFloating);

  const previewBackground = s.useCornerColors
    ? `radial-gradient(at 0% 0%, ${s.cornerColorTl || themeCanvas} 0px, transparent 55%), radial-gradient(at 100% 0%, ${s.cornerColorTr || themeSurface} 0px, transparent 55%), radial-gradient(at 100% 100%, ${s.cornerColorBr || themeCanvas} 0px, transparent 55%), radial-gradient(at 0% 100%, ${s.cornerColorBl || themeSurface} 0px, transparent 55%), ${resolvedBg}`
    : s.bannerBgGradient || resolvedBg;

  const handleInvertColors = (): void => {
    if (activeModel === "cinema-full") {
      const isLightTitle = resolvedTitle.toUpperCase() === "#FFFFFF" || resolvedTitle.toUpperCase() === "#FAF8F5" || resolvedTitle.toUpperCase() === "#F8FAFC";
      onSettingsChange({
        paletteId: "custom",
        titleColor: isLightTitle ? "#0F172A" : "#FFFFFF",
        subtitleColor: isLightTitle ? "#334155" : "#F4F4F5",
        overlayColor: isLightTitle ? "#FFFFFF" : "#0A0C10",
        overlayOpacity: Math.max(45, s.overlayOpacity ?? 45),
        overlayEnabled: true,
        ctaBgColor: resolvedCtaText,
        ctaTextColor: resolvedCtaBg,
      });
      return;
    }
    onSettingsChange({
      paletteId: "custom",
      bannerBgColor: resolvedTitle,
      bannerBgGradient: "",
      titleColor: resolvedBg,
      subtitleColor: resolvedBg,
      ctaBgColor: resolvedCtaText,
      ctaTextColor: resolvedCtaBg,
    });
  };

  const cellCls = "h-9 px-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11.5px] font-medium text-slate-700 cursor-pointer";
  const colorInputCls = "w-6 h-5 rounded cursor-pointer";
  const cornerCls = "h-8 px-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11px] text-slate-600";

  return (
    <>
      <div className="space-y-2 pt-3 border-t border-slate-200">
        {!isTextHidden && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-slate-900">Aperçu en direct des couleurs</span>
              <button
                type="button" data-testid="hero-invert-colors-btn"
                onClick={handleInvertColors}
                className="h-6 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] font-medium text-slate-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Inverser contraste</span>
              </button>
            </div>

            <div
              data-testid="hero-color-live-mini-preview"
              style={{ background: previewBackground, borderColor: hasBorderEnabled ? resolvedBorder : "transparent" }}
              className="rounded-xl border p-3 flex items-center justify-between gap-2.5 shadow-2xs transition-colors"
            >
              <div className="min-w-0 space-y-0.5">
                {supportsBadgeAndSecondaryCta && Boolean((s.badgeText || "").trim()) && (
                  <span style={{ backgroundColor: resolvedBadgeBg, color: resolvedBadgeText }} className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider">
                    {s.badgeText}
                  </span>
                )}
                <p style={{ color: resolvedTitle }} className="text-[12px] font-bold leading-tight truncate">
                  {s.title || "Titre de votre bannière"}
                </p>
                <p style={{ color: resolvedSub }} className="text-[10px] font-medium leading-tight truncate opacity-90">
                  {s.subtitle || "Sous-titre descriptif"}
                </p>
              </div>
              {isCtaVisible && (
                <span
                  style={{
                    backgroundColor: isTransparentCta ? "transparent" : resolvedCtaBg,
                    color: isTransparentCta ? resolvedTitle : resolvedCtaText,
                    border: s.ctaStyle === "outline" ? `1.5px solid ${s.ctaBorderColor || resolvedTitle}` : undefined,
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 shadow-2xs"
                >
                  {s.ctaText || "Découvrir"}
                </span>
              )}
            </div>
          </>
        )}

        <span className="block text-[12px] font-semibold text-slate-900 pt-1">Couleurs par élément</span>
        {isTextHidden && (
          <p className="text-[11px] text-slate-500">Mode photo seule actif à l&apos;étape 4 : les couleurs de texte et bouton sont masquées.</p>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {!isTextHidden && (
            <>
              <label className={cellCls}><span>Titre</span><input type="color" data-testid="hero-title-color" value={resolvedTitle} onChange={(e) => onSettingsChange({ titleColor: e.target.value, paletteId: "custom" })} className={colorInputCls} /></label>
              <label className={cellCls}><span>Sous-titre</span><input type="color" data-testid="hero-subtitle-color" value={resolvedSub} onChange={(e) => onSettingsChange({ subtitleColor: e.target.value, paletteId: "custom" })} className={colorInputCls} /></label>
            </>
          )}
          {isCtaVisible && (
            <>
              {!isTransparentCta && (
                <label className={cellCls}><span>Fond du bouton</span><input type="color" data-testid="hero-step2-cta-bg-color" value={resolvedCtaBg} onChange={(e) => onSettingsChange("ctaBgColor", e.target.value)} className={colorInputCls} /></label>
              )}
              <label className={cellCls}><span>Texte bouton</span><input type="color" data-testid="hero-step2-cta-text-color" value={resolvedCtaText} onChange={(e) => onSettingsChange("ctaTextColor", e.target.value)} className={colorInputCls} /></label>
            </>
          )}
          {!isTextHidden && supportsBadgeAndSecondaryCta && (
            <>
              <label className={cellCls}><span>Fond du badge</span><input type="color" data-testid="hero-badge-bg-color" value={resolvedBadgeBg} onChange={(e) => onSettingsChange("badgeBgColor", e.target.value)} className={colorInputCls} /></label>
              <label className={cellCls}><span>Texte badge</span><input type="color" data-testid="hero-badge-text-color" value={resolvedBadgeText} onChange={(e) => onSettingsChange("badgeTextColor", e.target.value)} className={colorInputCls} /></label>
            </>
          )}
          <label className={cellCls}>
            <span>{activeModel === "cinema-full" && s.imageFit !== "contain" ? "Fond de secours" : "Fond bannière"}</span>
            <input type="color" data-testid="hero-bg-color" value={resolvedBg} onChange={(e) => onSettingsChange({ bannerBgColor: e.target.value, bannerBgGradient: "", paletteId: "custom" })} className={colorInputCls} />
          </label>
          <div className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11.5px] font-medium text-slate-700">
            <button
              type="button" data-testid="hero-border-toggle"
              onClick={() => onSettingsChange({ bannerBorderWidthPx: hasBorderEnabled ? 0 : 1 })}
              className="text-left truncate cursor-pointer hover:text-slate-900"
              title="Cliquer pour activer ou désactiver la bordure"
            >
              {hasBorderEnabled ? "Bordure" : "Sans bord"}
            </button>
            {hasBorderEnabled && (
              <input type="color" data-testid="hero-banner-border-color" value={resolvedBorder} onChange={(e) => onSettingsChange({ bannerBorderColor: e.target.value, bannerBorderWidthPx: s.bannerBorderWidthPx || 1 })} className={colorInputCls} />
            )}
          </div>
          {isShadowActive && (
            <div className="col-span-2 h-9 px-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11.5px] font-medium text-slate-700">
              <span>Couleur de l&apos;ombre</span>
              <div className="flex items-center gap-1.5">
                <input type="color" data-testid="hero-step2-shadow-color" value={resolvedShadowColor} onChange={(e) => onSettingsChange({ bannerShadowColor: e.target.value, bannerShadowEnabled: true })} className={colorInputCls} />
                {s.bannerShadowColor && (
                  <button type="button" onClick={() => onSettingsChange("bannerShadowColor", undefined)} title="Réinitialiser" className="p-0.5 text-slate-400 hover:text-slate-900 cursor-pointer">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {activeModel !== "cinema-full" && (
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium text-slate-800">Dégradé doux dans les 4 coins</span>
            <button
              type="button" data-testid="hero-toggle-corner-colors"
              onClick={() => {
                const next = !s.useCornerColors;
                onSettingsChange(
                  next
                    ? { useCornerColors: true, cornerColorTl: s.cornerColorTl || s.bannerBgColor || themeCanvas, cornerColorTr: s.cornerColorTr || themeSurface, cornerColorBr: s.cornerColorBr || themeCanvas, cornerColorBl: s.cornerColorBl || themeSurface }
                    : { useCornerColors: false }
                );
              }}
              className={`h-6 px-2 rounded-md text-[11px] font-medium border cursor-pointer ${s.useCornerColors ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
            >
              {s.useCornerColors ? "Activé" : "Désactivé"}
            </button>
          </div>
          {s.useCornerColors && (
            <div className="grid grid-cols-2 gap-1.5" data-testid="hero-corner-colors-grid">
              <label className={cornerCls}><span>Haut gauche</span><input type="color" data-testid="hero-corner-color-tl" value={safeHex(s.cornerColorTl, themeCanvas)} onChange={(e) => onSettingsChange("cornerColorTl", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
              <label className={cornerCls}><span>Haut droit</span><input type="color" data-testid="hero-corner-color-tr" value={safeHex(s.cornerColorTr, themeSurface)} onChange={(e) => onSettingsChange("cornerColorTr", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
              <label className={cornerCls}><span>Bas gauche</span><input type="color" data-testid="hero-corner-color-bl" value={safeHex(s.cornerColorBl, themeSurface)} onChange={(e) => onSettingsChange("cornerColorBl", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
              <label className={cornerCls}><span>Bas droit</span><input type="color" data-testid="hero-corner-color-br" value={safeHex(s.cornerColorBr, themeCanvas)} onChange={(e) => onSettingsChange("cornerColorBr", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
            </div>
          )}
        </div>
      )}
    </>
  );
};
