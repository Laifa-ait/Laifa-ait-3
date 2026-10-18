import React, { useState } from "react";
import { StoreConfig, CustomPageTheme, StoreThemeSector } from "../../../../domains/seller/customPage.types";
import { PaletteControls } from "./identity/PaletteControls";
import { TypographySliders } from "./identity/TypographySliders";
import { Store, Check } from "lucide-react";

interface StoreIdentityEditorProps {
  storeConfig: StoreConfig | null;
  onSaveConfig: (updated: Partial<StoreConfig>) => Promise<void>;
}

export const StoreIdentityEditor: React.FC<StoreIdentityEditorProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  const [shopName, setShopName] = useState(storeConfig?.shopName || "");
  const [shopSlug, setShopSlug] = useState(storeConfig?.shopSlug || "");
  const [shopDescription, setShopDescription] = useState(storeConfig?.shopDescription || "");
  const [wilaya, setWilaya] = useState(storeConfig?.wilaya || "Alger");
  const [commune, setCommune] = useState(storeConfig?.commune || "");
  const [primaryColor, setPrimaryColor] = useState(storeConfig?.theme?.primaryColor || "#ea580c");
  const [secondaryColor, setSecondaryColor] = useState(storeConfig?.theme?.secondaryColor || "#f97316");
  const [accentColor, setAccentColor] = useState(storeConfig?.theme?.accentColor || "#ea580c");
  const [canvasColor, setCanvasColor] = useState(storeConfig?.theme?.canvasColor || "#f8fafc");
  const [surfaceColor, setSurfaceColor] = useState(storeConfig?.theme?.surfaceColor || "#ffffff");
  const [fontFamily, setFontFamily] = useState(storeConfig?.theme?.fontFamily || "'Plus Jakarta Sans', sans-serif");
  const [borderRadiusPx, setBorderRadiusPx] = useState(storeConfig?.theme?.borderRadiusPx ?? 12);
  const [spacingYPx, setSpacingYPx] = useState(storeConfig?.theme?.spacingYPx ?? 24);
  const [titleFontSizePx, setTitleFontSizePx] = useState(storeConfig?.theme?.titleFontSizePx ?? 28);
  const [bodyFontSizePx, setBodyFontSizePx] = useState(storeConfig?.theme?.bodyFontSizePx ?? 14);
  const [sector, setSector] = useState<StoreThemeSector>(storeConfig?.theme?.sector || "mode");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updatedTheme: CustomPageTheme = {
        sector,
        primaryColor,
        secondaryColor,
        accentColor,
        canvasColor,
        surfaceColor,
        fontFamily,
        borderRadiusPx,
        spacingYPx,
        titleFontSizePx,
        bodyFontSizePx,
      };

      const safeSlug = (shopSlug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "boutique";
      const safeShopName = (shopName || "").trim() || "Ma Boutique";

      await onSaveConfig({
        shopName: safeShopName,
        shopSlug: safeSlug,
        shopDescription: shopDescription.trim(),
        wilaya,
        commune,
        theme: updatedTheme,
        seo: storeConfig?.seo || {
          metaTitle: `${safeShopName} | Olmart Algérie`,
          metaDescription: shopDescription ? shopDescription.slice(0, 160) : `Découvrez les produits de ${safeShopName} sur Olmart Algérie`,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-8 lg:p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-200">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Identité Visuelle & Thème de la Vitrine
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Paramétrez les informations publiques, l'URL de votre boutique et la charte graphique globale.
            </p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Enregistré avec succès</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Identité de Base */}
          <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-orange-600 font-mono">
              1. Informations Générales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Nom Commercial de la Boutique</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Secteur d'Activité</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as StoreThemeSector)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                >
                  <option value="mode">Mode & Prêt-à-porter</option>
                  <option value="beaute">Beauté & Cosmétique</option>
                  <option value="artisanat">Artisanat & Tradition Algérienne</option>
                  <option value="tech">High-Tech & Électronique</option>
                  <option value="maison">Maison, Déco & Mobilier</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Adresse Web / Slug Personnalisé</label>
              <div className="flex items-center">
                <span className="bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono text-[11px]">
                  olmart.dz/store/
                </span>
                <input
                  type="text"
                  value={shopSlug}
                  onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className="flex-1 p-2.5 bg-white border border-slate-200 rounded-r-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Slogan ou Description Rapide</label>
              <textarea
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={2}
                placeholder="Présentez votre boutique en quelques mots..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Wilaya d'attachement</label>
                <input
                  type="text"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  placeholder="Ex: Alger (16)"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Commune</label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="Ex: Bab Ezzouar"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Palette Controls */}
          <PaletteControls
            canvasColor={canvasColor}
            setCanvasColor={setCanvasColor}
            surfaceColor={surfaceColor}
            setSurfaceColor={setSurfaceColor}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
          />

          {/* Typography & Sliders */}
          <TypographySliders
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            borderRadiusPx={borderRadiusPx}
            setBorderRadiusPx={setBorderRadiusPx}
            spacingYPx={spacingYPx}
            setSpacingYPx={setSpacingYPx}
            titleFontSizePx={titleFontSizePx}
            setTitleFontSizePx={setTitleFontSizePx}
            bodyFontSizePx={bodyFontSizePx}
            setBodyFontSizePx={setBodyFontSizePx}
          />

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistrer le Thème & Identité</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
