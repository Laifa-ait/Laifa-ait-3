import React, { useEffect, useRef } from "react";
import { AlertCircle, Check } from "lucide-react";
import { CustomPageTheme, HeroBannerSettings, HeroShadowToken } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { validateCinematicDestination } from "../../../../../../components/Store/sections/CinematicBanner/cinematicBanner.utils";
import { useStudioStore } from "../../../store/useStudioStore";

interface HeroCtaButtonControlsProps {
  settings: Partial<HeroBannerSettings>;
  theme: CustomPageTheme;
  products: Product[];
  supportsBadgeAndSecondaryCta: boolean;
  inputClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

const CTA_STYLE_OPTIONS: Array<{
  id: NonNullable<HeroBannerSettings["ctaStyle"]>;
  label: string;
  radius: number;
  borderW: number;
}> = [
  { id: "solid", label: "Normal", radius: 8, borderW: 0 },
  { id: "sharp", label: "Carré", radius: 0, borderW: 0 },
  { id: "pill", label: "Arrondi", radius: 999, borderW: 0 },
  { id: "outline", label: "Contour", radius: 8, borderW: 2 },
  { id: "minimal", label: "Souligné", radius: 0, borderW: 2 },
];

export const HeroCtaButtonControls: React.FC<HeroCtaButtonControlsProps> = ({
  settings: s,
  theme,
  products,
  supportsBadgeAndSecondaryCta,
  inputClass,
  onSettingsChange,
}) => {
  const selectedSubElement = useStudioStore((st) => st.selectedSubElement);
  const ctaInputRef = useRef<HTMLInputElement | null>(null);
  const isCtaFocused =
    selectedSubElement === "cta" ||
    selectedSubElement === "ctaPrimary" ||
    selectedSubElement === "ctaSecondary";

  useEffect(() => {
    if (isCtaFocused && ctaInputRef.current) {
      ctaInputRef.current.focus();
    }
  }, [isCtaFocused]);

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  const availableCategories = categories.length > 0 ? categories : ["Nouveautés", "Collections", "Essentiels"];
  const destCheck = validateCinematicDestination(
    {
      targetType: s.ctaTargetType || "catalog",
      targetCategory: s.ctaTargetCategory || "",
      targetProductId: s.ctaTargetProductId || s.spotlightProductId || "",
      href: s.ctaLink || "#catalog",
    },
    products
  );

  const activeStyle = s.ctaStyle || "solid";
  const isMinimalStyle = activeStyle === "minimal";
  const isTransparentBg = activeStyle === "outline" || isMinimalStyle;
  const rawRadius = typeof s.ctaBorderRadiusPx === "number" ? s.ctaBorderRadiusPx : activeStyle === "pill" ? 999 : activeStyle === "sharp" ? 0 : 8;
  const sliderRadius = Math.min(40, Math.max(0, rawRadius >= 40 ? 40 : rawRadius));
  const hasCtaShadow = Boolean(s.ctaShadow && s.ctaShadow !== "none");

  const handleStylePick = (opt: (typeof CTA_STYLE_OPTIONS)[number]) => {
    onSettingsChange({ ctaStyle: opt.id, ctaBorderRadiusPx: opt.radius, ctaBorderWidthPx: opt.borderW });
  };

  return (
    <div
      data-testid="hero-cta-editor-box"
      data-cta-focused={isCtaFocused ? "true" : "false"}
      className={`space-y-2.5 pt-3 border-t border-slate-200 ${
        isCtaFocused ? "p-2.5 rounded-xl bg-slate-50 ring-2 ring-slate-900/15" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-slate-900">Bouton principal</span>
        <label className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-700 cursor-pointer">
          <input type="checkbox" data-testid="hero-cta-toggle" checked={s.showCta !== false} onChange={(e) => onSettingsChange("showCta", e.target.checked)} className="accent-slate-900" />
          <span>Afficher</span>
        </label>
      </div>

      {s.showCta !== false && (
        <>
          <input ref={ctaInputRef} data-testid="hero-cta-text-input" value={s.ctaText || ""} onChange={(e) => onSettingsChange({ ctaText: e.target.value, showCta: true })} placeholder="Texte sur le bouton (ex: Découvrir)" className={inputClass} />

          <div className="grid grid-cols-5 gap-1">
            {CTA_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id} type="button" data-testid={`hero-cta-shape-${opt.id}`}
                onClick={() => handleStylePick(opt)}
                className={`h-7 rounded-md text-[10.5px] font-medium border cursor-pointer ${
                  activeStyle === opt.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className={`grid ${isMinimalStyle ? "grid-cols-1" : "grid-cols-2"} gap-1.5`}>
            <select data-testid="hero-cta-size-select" value={s.ctaButtonSize || "md"} onChange={(e) => onSettingsChange("ctaButtonSize", e.target.value)} className={inputClass}>
              <option value="sm">Taille : Petit</option>
              <option value="md">Taille : Moyen</option>
              <option value="lg">Taille : Grand</option>
            </select>
            {!isMinimalStyle && (
              <div className="flex items-center gap-1">
                <select data-testid="hero-cta-shadow-select" value={s.ctaShadow || "none"} onChange={(e) => onSettingsChange("ctaShadow", e.target.value as HeroShadowToken)} className={`${inputClass} flex-1`}>
                  <option value="none">Ombre : Aucune</option>
                  <option value="sm">Ombre légère</option>
                  <option value="md">Ombre moyenne</option>
                  <option value="floating">Flottante</option>
                  <option value="glow">Lumineuse</option>
                  <option value="brutal">Nette</option>
                </select>
                {hasCtaShadow && (
                  <input
                    type="color" data-testid="hero-cta-shadow-color"
                    title="Couleur de l'ombre du bouton"
                    value={s.ctaShadowColor || "#0F172A"}
                    onChange={(e) => onSettingsChange("ctaShadowColor", e.target.value)}
                    className="w-8 h-9 rounded-lg border border-slate-200 bg-white p-0.5 cursor-pointer shrink-0"
                  />
                )}
              </div>
            )}
          </div>

          <div className={`grid ${isTransparentBg ? "grid-cols-2" : "grid-cols-3"} gap-1.5`}>
            {!isTransparentBg && (
              <label className="h-8 px-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11px] font-medium text-slate-700">
                <span>Fond</span>
                <input type="color" data-testid="hero-cta-bg-color" value={s.ctaBgColor || theme.buttonColor || "#0F172A"} onChange={(e) => onSettingsChange("ctaBgColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" />
              </label>
            )}
            <label className="h-8 px-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11px] font-medium text-slate-700"><span>Texte</span><input type="color" data-testid="hero-cta-text-color" value={s.ctaTextColor || theme.buttonTextColor || "#FFFFFF"} onChange={(e) => onSettingsChange("ctaTextColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
            <label className="h-8 px-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11px] font-medium text-slate-700"><span>{isMinimalStyle ? "Trait" : "Bord"}</span><input type="color" data-testid="hero-cta-border-color" value={s.ctaBorderColor || theme.primaryColor || "#0F172A"} onChange={(e) => onSettingsChange("ctaBorderColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
          </div>

          {!isMinimalStyle && (
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 tabular-nums">
              <label>
                Arrondi ({rawRadius >= 900 ? "Pilule" : `${rawRadius}px`})
                <input type="range" data-testid="hero-cta-radius-slider" min={0} max={40} step={2} value={sliderRadius} onChange={(e) => onSettingsChange("ctaBorderRadiusPx", Number(e.target.value))} className="w-full accent-slate-900" />
              </label>
              <label>
                Épaisseur bord ({s.ctaBorderWidthPx ?? (activeStyle === "outline" ? 2 : 0)}px)
                <input type="range" data-testid="hero-cta-border-width-slider" min={0} max={6} step={1} value={typeof s.ctaBorderWidthPx === "number" ? s.ctaBorderWidthPx : activeStyle === "outline" ? 2 : 0} onChange={(e) => onSettingsChange("ctaBorderWidthPx", Number(e.target.value))} className="w-full accent-slate-900" />
              </label>
            </div>
          )}

          <label className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" data-testid="hero-cta-arrow-toggle" checked={s.ctaShowArrow !== false} onChange={(e) => onSettingsChange("ctaShowArrow", e.target.checked)} className="accent-slate-900" />
            <span>Afficher une flèche sur le bouton →</span>
          </label>

          <div className="space-y-1.5 pt-1">
            <span className="block text-[11.5px] font-medium text-slate-800">Lien quand le client clique</span>
            <select data-testid="hero-cta-destination-select" value={s.ctaTargetType || "catalog"} onChange={(e) => onSettingsChange("ctaTargetType", e.target.value)} className={inputClass}>
              <option value="catalog">Voir tout le catalogue</option>
              <option value="category">Ouvrir une catégorie</option>
              <option value="product">Ouvrir un produit précis</option>
            </select>
            {s.ctaTargetType === "category" && (
              <select value={s.ctaTargetCategory || ""} onChange={(e) => onSettingsChange({ ctaTargetCategory: e.target.value, ctaLink: `#category=${encodeURIComponent(e.target.value)}` })} className={inputClass}>
                <option value="">-- Choisir une catégorie --</option>
                {availableCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
            {s.ctaTargetType === "product" && (
              <select value={s.ctaTargetProductId || s.spotlightProductId || ""} onChange={(e) => onSettingsChange({ ctaTargetProductId: e.target.value, spotlightProductId: e.target.value, ctaLink: `#product-${e.target.value}` })} className={inputClass}>
                <option value="">-- Choisir un produit --</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {(p.promoPrice || p.price).toLocaleString("fr-DZ")} DA</option>)}
              </select>
            )}
            {!destCheck.isValid && destCheck.warningMessage && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{destCheck.warningMessage}</span>
              </div>
            )}
            {destCheck.isValid && s.ctaTargetType === "product" && destCheck.matchedProductTitle && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" /><span className="truncate">Produit relié : {destCheck.matchedProductTitle}</span>
              </div>
            )}
          </div>
        </>
      )}

      {supportsBadgeAndSecondaryCta && (
        <div className="pt-2.5 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium text-slate-800">2e bouton (optionnel)</span>
            <label className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-700 cursor-pointer">
              <input type="checkbox" data-testid="hero-secondary-cta-toggle" checked={Boolean(s.showSecondaryCta || (s.secondaryCtaText || "").trim())} onChange={(e) => onSettingsChange({ showSecondaryCta: e.target.checked, secondaryCtaText: e.target.checked ? s.secondaryCtaText || "En savoir plus" : "" })} className="accent-slate-900" />
              <span>Activer</span>
            </label>
          </div>
          {(s.showSecondaryCta || (s.secondaryCtaText || "").trim()) && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <input value={s.secondaryCtaText || ""} onChange={(e) => onSettingsChange({ secondaryCtaText: e.target.value, showSecondaryCta: Boolean(e.target.value) })} placeholder="Texte 2e bouton" className={inputClass} />
                <input value={s.secondaryCtaLink || "#catalog"} onChange={(e) => onSettingsChange("secondaryCtaLink", e.target.value)} placeholder="Lien (#catalog)" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <label className="h-8 px-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11px] text-slate-600"><span>Fond</span><input type="color" value={s.secondaryCtaBgColor || theme.surfaceColor || "#FFFFFF"} onChange={(e) => onSettingsChange("secondaryCtaBgColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
                <label className="h-8 px-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[11px] text-slate-600"><span>Texte</span><input type="color" value={s.secondaryCtaTextColor || theme.textColor || "#0F172A"} onChange={(e) => onSettingsChange("secondaryCtaTextColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
