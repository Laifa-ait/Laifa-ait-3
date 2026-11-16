import React from "react";
import { Compass, Grid, Image as ImageIcon, Link2, Sliders, Sparkles } from "lucide-react";
import {
  HeroBannerSettings, HeroDeviceMeasureConfig, HeroImageFilterPreset, HeroLayoutModelId, HeroShadowToken, HeroTextPosition9,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import { StudioImagePicker } from "../content/StudioImagePicker";

interface HeroPhotoAndCtaStepPanelsProps {
  activeStep: "all" | 1 | 2 | 3 | 4;
  activeModel: HeroLayoutModelId;
  deviceTab: "desktop" | "tablet" | "mobile";
  profile: ResolvedHeroDeviceProfile;
  settings: Record<string, unknown>;
  products: Product[];
  inputClass: string;
  labelClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>) => void;
}

const POSITION_9_GRID: Array<{ id: HeroTextPosition9; label: string }> = [
  { id: "top-left", label: "Haut-Gauche" }, { id: "top-center", label: "Haut-Centre" }, { id: "top-right", label: "Haut-Droite" },
  { id: "center-left", label: "Centre-Gauche" }, { id: "center", label: "Centre" }, { id: "center-right", label: "Centre-Droite" },
  { id: "bottom-left", label: "Bas-Gauche" }, { id: "bottom-center", label: "Bas-Centre" }, { id: "bottom-right", label: "Bas-Droite" },
];

const IMAGE_FILTER_PRESETS: Array<{ id: HeroImageFilterPreset; label: string }> = [
  { id: "none", label: "Naturel" }, { id: "warm-editorial", label: "Éditorial Chaud" }, { id: "vivid-contrast", label: "Contraste Vif" },
  { id: "bw-art", label: "Noir & Blanc Art" }, { id: "soft-matte", label: "Mat Doux" }, { id: "golden-film", label: "Film Doré" },
];

export const HeroPhotoAndCtaStepPanels: React.FC<HeroPhotoAndCtaStepPanelsProps> = ({
  activeStep, activeModel, deviceTab, profile, settings, products, inputClass, onSettingsChange, onDeviceConfigChange,
}) => {
  const s = settings as Partial<HeroBannerSettings>;
  const isDesktop = deviceTab === "desktop";
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  const defaultCategories = categories.length > 0 ? categories : ["Nouveautés", "Collections", "Essentiels"];
  const imageFieldForDevice = deviceTab === "mobile" ? "mobileImageUrl" : deviceTab === "tablet" ? "tabletImageUrl" : "imageUrl";

  const handleFocalChange = (nextX: number, nextY: number): void => {
    const posField = deviceTab === "mobile" ? "imagePositionMobile" : deviceTab === "tablet" ? "imagePositionTablet" : "imagePositionDesktop";
    onDeviceConfigChange({ focalX: nextX, focalY: nextY }, { [posField]: `${nextX}% ${nextY}%` });
  };

  const handleZoomChange = (nextZoom: number): void => {
    const zoomField = deviceTab === "mobile" ? "imageZoomMobile" : deviceTab === "tablet" ? "imageZoomTablet" : "imageZoomDesktop";
    onDeviceConfigChange({ zoom: nextZoom }, { [zoomField]: nextZoom });
  };

  const showStep3 = activeStep === "all" || activeStep === 3;
  const showStep4 = activeStep === "all" || activeStep === 4;
  const titleLen = (s.title || "").trim().length;
  const subtitleLen = (s.subtitle || "").trim().length;
  const badgeLen = (s.badgeText || "").trim().length;

  return (
    <div className="space-y-4">
      {showStep3 && (
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3" data-testid="hero-step-panel-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-700" /> Étape 3 — Photo, Cadrage, Ombre &amp; Filtres
          </span>
          <StudioImagePicker label={`Photographie Principale (${deviceTab.toUpperCase()})`} value={(s[imageFieldForDevice] as string) || s.imageUrl || ""} onChange={(val) => onSettingsChange(imageFieldForDevice, val)} products={products} />
          {(activeModel === "bento-hero" || activeModel === "atelier-collage" || activeModel === "cinema-full") && (
            <StudioImagePicker label={activeModel === "bento-hero" ? "2ème Photographie (Diptyque)" : activeModel === "atelier-collage" ? "2ème Photographie (Galerie)" : "2ème Photographie (Swap)"} value={s.secondaryImageUrl || ""} onChange={(val) => onSettingsChange("secondaryImageUrl", val)} products={products} />
          )}
          {activeModel === "atelier-collage" && (
            <StudioImagePicker label="3ème Photographie (Galerie optionnelle)" value={s.tertiaryImageUrl || ""} onChange={(val) => onSettingsChange("tertiaryImageUrl", val)} products={products} />
          )}
          <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-zinc-200">
            <button type="button" onClick={() => onSettingsChange("imageFit", "cover")} className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${(s.imageFit || "cover") === "cover" ? "bg-zinc-900 text-white" : "text-zinc-600"}`}>Remplir (cover)</button>
            <button type="button" onClick={() => onSettingsChange("imageFit", "contain")} className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${s.imageFit === "contain" ? "bg-zinc-900 text-white" : "text-zinc-600"}`}>Afficher entier (contain)</button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-zinc-600 bg-white p-2.5 rounded-xl border border-zinc-200">
            <label>Focal X ({profile.focalX}%) <input type="range" data-testid="hero-focal-x-slider" min={0} max={100} value={profile.focalX} onChange={(e) => handleFocalChange(Number(e.target.value), profile.focalY)} className="w-full accent-zinc-900" /></label>
            <label>Focal Y ({profile.focalY}%) <input type="range" data-testid="hero-focal-y-slider" min={0} max={100} value={profile.focalY} onChange={(e) => handleFocalChange(profile.focalX, Number(e.target.value))} className="w-full accent-zinc-900" /></label>
            <label>Zoom ({Math.round(profile.zoom * 100)}%) <input type="range" data-testid="hero-zoom-slider" min={100} max={160} step={5} value={Math.round(profile.zoom * 100)} onChange={(e) => handleZoomChange(Number(e.target.value) / 100)} className="w-full accent-zinc-900" /></label>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-zinc-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Filtre Photographique &amp; Ombre Image
              </span>
              <button type="button" data-testid="hero-reset-image-filters-btn" onClick={() => onSettingsChange({ imageFilterPreset: "none", imageBrightness: 100, imageContrast: 100, imageSaturation: 100, imageSepia: 0, imageBlurPx: 0, imageShadow: "none" })} className="text-[9.5px] font-bold text-zinc-500 hover:text-zinc-900 underline cursor-pointer">Réinitialiser</button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {IMAGE_FILTER_PRESETS.map((fp) => (
                <button key={fp.id} type="button" data-testid={`hero-filter-preset-${fp.id}`} onClick={() => onSettingsChange("imageFilterPreset", fp.id)} className={`py-1.5 px-1.5 rounded-lg text-[9.5px] font-bold border cursor-pointer transition-all ${(s.imageFilterPreset || "none") === fp.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"}`}>
                  {fp.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-600">
              <label>Luminosité ({s.imageBrightness ?? 100}%)<input type="range" data-testid="hero-filter-brightness" min={50} max={150} step={5} value={s.imageBrightness ?? 100} onChange={(e) => onSettingsChange("imageBrightness", Number(e.target.value))} className="w-full accent-zinc-900" /></label>
              <label>Contraste ({s.imageContrast ?? 100}%)<input type="range" data-testid="hero-filter-contrast" min={50} max={150} step={5} value={s.imageContrast ?? 100} onChange={(e) => onSettingsChange("imageContrast", Number(e.target.value))} className="w-full accent-zinc-900" /></label>
              <label>Saturation ({s.imageSaturation ?? 100}%)<input type="range" data-testid="hero-filter-saturation" min={0} max={200} step={5} value={s.imageSaturation ?? 100} onChange={(e) => onSettingsChange("imageSaturation", Number(e.target.value))} className="w-full accent-zinc-900" /></label>
              <label>
                Sépia ({s.imageSepia ?? 0}%) &amp; Flou ({s.imageBlurPx ?? 0}px)
                <div className="flex gap-1">
                  <input type="range" data-testid="hero-filter-sepia" min={0} max={100} step={5} value={s.imageSepia ?? 0} onChange={(e) => onSettingsChange("imageSepia", Number(e.target.value))} className="w-1/2 accent-zinc-900" />
                  <input type="range" data-testid="hero-filter-blur" min={0} max={12} step={1} value={s.imageBlurPx ?? 0} onChange={(e) => onSettingsChange("imageBlurPx", Number(e.target.value))} className="w-1/2 accent-zinc-900" />
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100">
              <span className="text-[10px] font-bold text-zinc-600">Ombre portée du cadre photo</span>
              <select data-testid="hero-image-shadow-select" value={s.imageShadow || "none"} onChange={(e) => onSettingsChange("imageShadow", e.target.value as HeroShadowToken)} className="h-7 rounded-lg border border-zinc-200 bg-white px-2 text-[10.5px] font-bold text-zinc-800">
                <option value="none">Aucune ombre</option><option value="sm">Ombre Douce</option><option value="md">Ombre Moyenne</option><option value="lg">Ombre Profonde</option><option value="floating">Lévitation Luxe</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showStep4 && (
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3" data-testid="hero-step-panel-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-zinc-700" /> Étape 4 — Texte, Grille &amp; Contrôle du Bouton
            </span>
            <button type="button" data-testid="hero-toggle-guides-btn" onClick={() => onSettingsChange("showCompositionGuides", !s.showCompositionGuides)} className={`px-2 py-1 rounded-lg text-[9px] font-bold border flex items-center gap-1 cursor-pointer ${s.showCompositionGuides ? "bg-sky-900 text-white border-sky-900" : "bg-white text-zinc-600 border-zinc-200"}`}>
              <Grid className="w-3 h-3" /> <span>Guides</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-white p-1.5 rounded-xl border border-zinc-200">
            {POSITION_9_GRID.map((pos) => (
              <button key={pos.id} type="button" data-testid={`hero-pos9-${pos.id}`} onClick={() => onDeviceConfigChange({ textPosition9: pos.id }, isDesktop ? { textPosition9: pos.id } : undefined)} className={`py-1.5 px-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${profile.textPosition9 === pos.id ? "bg-zinc-900 text-white shadow-2xs" : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"}`}>
                {pos.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-zinc-200">
            {(["left", "center", "right"] as const).map((align) => (
              <button key={align} type="button" onClick={() => onDeviceConfigChange({ textAlign: align }, isDesktop ? { textAlignment: align } : undefined)} className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer ${profile.textAlign === align ? "bg-zinc-900 text-white" : "text-zinc-600"}`}>
                {align === "left" ? "Gauche" : align === "center" ? "Centré" : "Droite"}
              </button>
            ))}
          </div>
          <div className="space-y-2 pt-1 border-t border-zinc-200/70">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-700">
              <span>Écriture &amp; Typographie</span>
              <span className="font-mono text-[9.5px] font-semibold text-zinc-500">Titre {titleLen}/65 · Phrase {subtitleLen}/140 · Badge {badgeLen}/28</span>
            </div>
            <input data-testid="hero-badge-input" value={s.badgeText || ""} onChange={(e) => onSettingsChange({ badgeText: e.target.value, showBadge: Boolean(e.target.value) })} placeholder="Badge optionnel (ex: NOUVELLE COLLECTION)" className={inputClass} />
            <input data-testid="hero-title-input" value={s.title || ""} onChange={(e) => onSettingsChange("title", e.target.value)} placeholder="1. Le Titre (recommandé ≤ 65 caractères)" className={inputClass} />
            <textarea data-testid="hero-subtitle-input" rows={2} value={s.subtitle || ""} onChange={(e) => onSettingsChange({ subtitle: e.target.value, showSubtitle: true })} placeholder="2. Petite phrase explicative sous le titre (recommandé ≤ 140 car.)..." className={inputClass} />
            <div className="grid grid-cols-3 gap-1.5">
              <select value={s.titleFontFamily || "sans"} onChange={(e) => onSettingsChange("titleFontFamily", e.target.value)} className={inputClass}><option value="sans">Sans Moderne</option><option value="serif">Serif Prestige</option><option value="display">Display Pur</option></select>
              <select value={profile.titleSizeToken} onChange={(e) => { const val = e.target.value as "sm" | "md" | "lg" | "xl"; const sizeField = deviceTab === "mobile" ? "titleSizeMobile" : deviceTab === "tablet" ? "titleSizeTablet" : "titleSizeDesktop"; onDeviceConfigChange({ titleSize: val }, { [sizeField]: val }); }} className={inputClass}><option value="sm">Titre Discret</option><option value="md">Titre Moyen</option><option value="lg">Titre Grand</option><option value="xl">Monumental</option></select>
              <select data-testid="hero-text-shadow-select" value={s.textShadow || "none"} onChange={(e) => onSettingsChange("textShadow", e.target.value)} className={inputClass}><option value="none">Ombre Texte: 0</option><option value="soft">Ombre Douce</option><option value="strong">Ombre Forte</option></select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={String(profile.textBoxMaxWidth)} onChange={(e) => { const v = Number(e.target.value) as 360 | 480 | 620; onDeviceConfigChange({ textBoxMaxWidth: v }, isDesktop ? { textBoxMaxWidth: v } : undefined); }} className={inputClass}><option value="360">Bloc Compact (360px)</option><option value="480">Bloc Moyen (480px)</option><option value="620">Bloc Large (620px)</option></select>
              <select value={String(profile.textVerticalGap)} onChange={(e) => { const v = Number(e.target.value) as 8 | 16 | 24; onDeviceConfigChange({ textVerticalGap: v }, isDesktop ? { textVerticalGap: v } : undefined); }} className={inputClass}><option value="8">Espacement Serré (8px)</option><option value="16">Espacement Équilibré (16px)</option><option value="24">Espacement Aéré (24px)</option></select>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-zinc-700 flex items-center gap-1"><Sliders className="w-3.5 h-3.5 text-zinc-800" /> Contrôle Complet du Bouton d&apos;Action</span>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-700 cursor-pointer"><input type="checkbox" data-testid="hero-cta-toggle" checked={s.showCta !== false} onChange={(e) => onSettingsChange("showCta", e.target.checked)} className="accent-zinc-900" /><span>Afficher</span></label>
            </div>
            <input value={s.ctaText || ""} onChange={(e) => onSettingsChange({ ctaText: e.target.value, showCta: true })} placeholder="Texte du bouton (ex: Découvrir la collection)" className={inputClass} />
            <div className="grid grid-cols-3 gap-1.5">
              <select data-testid="hero-cta-style-select" value={s.ctaStyle || "pill"} onChange={(e) => onSettingsChange("ctaStyle", e.target.value)} className={inputClass}><option value="sharp">Rectangle</option><option value="pill">Pilule</option><option value="outline">Contour</option></select>
              <select data-testid="hero-cta-size-select" value={s.ctaButtonSize || "md"} onChange={(e) => onSettingsChange("ctaButtonSize", e.target.value)} className={inputClass}><option value="sm">Compact (SM)</option><option value="md">Standard (MD)</option><option value="lg">Large (LG)</option></select>
              <select data-testid="hero-cta-shadow-select" value={s.ctaShadow || "none"} onChange={(e) => onSettingsChange("ctaShadow", e.target.value as HeroShadowToken)} className={inputClass}><option value="none">Sans Ombre</option><option value="sm">Ombre Douce</option><option value="md">Ombre Moyenne</option><option value="floating">Flottante</option><option value="glow">Halo Couleur</option><option value="brutal">Brutale</option></select>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200"><span>Fond</span><input type="color" data-testid="hero-cta-bg-color" value={s.ctaBgColor || "#111827"} onChange={(e) => onSettingsChange("ctaBgColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
              <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200"><span>Texte</span><input type="color" data-testid="hero-cta-text-color" value={s.ctaTextColor || "#FFFFFF"} onChange={(e) => onSettingsChange("ctaTextColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
              <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200"><span>Bordure</span><input type="color" data-testid="hero-cta-border-color" value={s.ctaBorderColor || "#111827"} onChange={(e) => onSettingsChange("ctaBorderColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-600">
              <label>Arrondi bouton ({s.ctaBorderRadiusPx ?? (s.ctaStyle === "sharp" ? 0 : 999)}px)<input type="range" data-testid="hero-cta-radius-slider" min={0} max={40} step={2} value={typeof s.ctaBorderRadiusPx === "number" ? s.ctaBorderRadiusPx : s.ctaStyle === "sharp" ? 0 : 28} onChange={(e) => onSettingsChange("ctaBorderRadiusPx", Number(e.target.value))} className="w-full accent-zinc-900" /></label>
              <label>Épaisseur bordure ({s.ctaBorderWidthPx ?? (s.ctaStyle === "outline" ? 2 : 0)}px)<input type="range" data-testid="hero-cta-border-width-slider" min={0} max={6} step={1} value={typeof s.ctaBorderWidthPx === "number" ? s.ctaBorderWidthPx : s.ctaStyle === "outline" ? 2 : 0} onChange={(e) => onSettingsChange("ctaBorderWidthPx", Number(e.target.value))} className="w-full accent-zinc-900" /></label>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-700 cursor-pointer"><input type="checkbox" data-testid="hero-cta-arrow-toggle" checked={s.ctaShowArrow !== false} onChange={(e) => onSettingsChange("ctaShowArrow", e.target.checked)} className="accent-zinc-900" /><span>Afficher l&apos;icône flèche →</span></label>
              <span className="text-[9.5px] text-zinc-400 flex items-center gap-1"><Link2 className="w-3 h-3" /> Destination</span>
            </div>
            <select value={s.ctaTargetType || "catalog"} onChange={(e) => onSettingsChange("ctaTargetType", e.target.value)} className={inputClass}><option value="catalog">1. Vers la page Catalogue complet</option><option value="category">2. Vers une page de Catégorie / Rayon</option><option value="product">3. Vers une Fiche Produit spécifique</option></select>
            {s.ctaTargetType === "category" && (
              <select value={s.ctaTargetCategory || ""} onChange={(e) => onSettingsChange({ ctaTargetCategory: e.target.value, ctaLink: `#category=${encodeURIComponent(e.target.value)}` })} className={inputClass}><option value="">-- Sélectionner un rayon --</option>{defaultCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
            )}
            {s.ctaTargetType === "product" && (
              <select value={s.ctaTargetProductId || s.spotlightProductId || ""} onChange={(e) => onSettingsChange({ ctaTargetProductId: e.target.value, spotlightProductId: e.target.value, ctaLink: `#product-${e.target.value}` })} className={inputClass}><option value="">-- Sélectionner un produit du catalogue --</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} — {(p.promoPrice || p.price).toLocaleString("fr-DZ")} DA</option>)}</select>
            )}
            <div className="pt-2 border-t border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-zinc-700">2ème Bouton Secondaire (Optionnel)</span>
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-700 cursor-pointer">
                  <input type="checkbox" data-testid="hero-secondary-cta-toggle" checked={Boolean(s.showSecondaryCta || (s.secondaryCtaText || "").trim())} onChange={(e) => onSettingsChange({ showSecondaryCta: e.target.checked, secondaryCtaText: e.target.checked ? s.secondaryCtaText || "En savoir plus" : "" })} className="accent-zinc-900" />
                  <span>Activer</span>
                </label>
              </div>
              {(s.showSecondaryCta || (s.secondaryCtaText || "").trim()) && (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <input value={s.secondaryCtaText || ""} onChange={(e) => onSettingsChange({ secondaryCtaText: e.target.value, showSecondaryCta: Boolean(e.target.value) })} placeholder="Texte 2ème bouton" className={inputClass} />
                    <input value={s.secondaryCtaLink || "#catalog"} onChange={(e) => onSettingsChange("secondaryCtaLink", e.target.value)} placeholder="Lien (#catalog)" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200"><span>Fond 2ème</span><input type="color" value={s.secondaryCtaBgColor || "#FFFFFF"} onChange={(e) => onSettingsChange("secondaryCtaBgColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
                    <label className="text-[9.5px] font-bold text-zinc-600 flex items-center justify-between bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200"><span>Texte 2ème</span><input type="color" value={s.secondaryCtaTextColor || "#111827"} onChange={(e) => onSettingsChange("secondaryCtaTextColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer" /></label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
