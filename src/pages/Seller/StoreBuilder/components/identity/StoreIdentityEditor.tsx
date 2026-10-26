import React, { useState } from "react";
import { SellerStoreConfig, CustomPageTheme, StoreThemeSector } from "../../../../../domains/seller/customPage.types";
import { PaletteControls } from "./PaletteControls";
import { TypographySliders } from "./TypographySliders";
import { Store, Check } from "lucide-react";

interface StoreIdentityEditorProps {
  storeConfig?: SellerStoreConfig | null;
  onSave?: (updated: Partial<SellerStoreConfig>) => Promise<void>;
  onSaveConfig?: (updated: Partial<SellerStoreConfig>) => Promise<void>;
}

export const StoreIdentityEditor: React.FC<StoreIdentityEditorProps> = ({
  storeConfig,
  onSave,
  onSaveConfig,
}) => {
  const handleSave = onSave || onSaveConfig;
  const [shopName, setShopName] = useState(storeConfig?.shopName || "");
  const [shopSlug, setShopSlug] = useState(storeConfig?.shopSlug || "");
  const [shopDescription, setShopDescription] = useState(storeConfig?.shopDescription || "");
  const [wilaya, setWilaya] = useState(storeConfig?.wilaya || "Alger");
  const [commune, setCommune] = useState(storeConfig?.commune || "");
  const [primaryColor, setPrimaryColor] = useState(storeConfig?.theme?.primaryColor || "#B85B35");
  const [secondaryColor, setSecondaryColor] = useState(storeConfig?.theme?.secondaryColor || "#1C2A39");
  const [accentColor, setAccentColor] = useState(storeConfig?.theme?.accentColor || "#D4AF37");
  const [canvasColor, setCanvasColor] = useState(storeConfig?.theme?.canvasColor || "#FAF6F0");
  const [surfaceColor, setSurfaceColor] = useState(storeConfig?.theme?.surfaceColor || "#FFFFFF");
  const [fontFamily, setFontFamily] = useState(storeConfig?.theme?.fontFamily || "'Plus Jakarta Sans', sans-serif");
  const [borderRadiusPx, setBorderRadiusPx] = useState(storeConfig?.theme?.borderRadiusPx ?? 10);
  const [spacingYPx, setSpacingYPx] = useState(storeConfig?.theme?.spacingYPx ?? 24);
  const [titleFontSizePx, setTitleFontSizePx] = useState(storeConfig?.theme?.titleFontSizePx ?? 32);
  const [bodyFontSizePx, setBodyFontSizePx] = useState(storeConfig?.theme?.bodyFontSizePx ?? 16);
  const [sector, setSector] = useState<StoreThemeSector>(storeConfig?.theme?.sector || "artisanat");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleSave) return;
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

      const safeSlug =
        (shopSlug || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "boutique";
      const safeShopName = (shopName || "").trim() || "Ma Boutique";

      await handleSave({
        shopName: safeShopName,
        shopSlug: safeSlug,
        shopDescription: shopDescription.trim(),
        wilaya,
        commune,
        theme: updatedTheme,
        seo: storeConfig?.seo || {
          metaTitle: `${safeShopName} | Olmart Algérie`,
          metaDescription: shopDescription
            ? shopDescription.slice(0, 160)
            : `Découvrez les produits de ${safeShopName} sur Olmart Algérie`,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 p-3 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-orange-50 text-[#F97316] rounded-xl border border-orange-200 shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              Identité & Charte
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              Nom, URL et thème global
            </p>
          </div>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[11px] font-bold shrink-0">
            <Check className="w-3 h-3" />
            <span>OK</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#F97316]">
            1. Informations Générales
          </h3>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Nom Commercial</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#F97316]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Secteur d'Activité</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as StoreThemeSector)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#F97316]"
            >
              <option value="artisanat">Artisanat & Tradition Algérienne</option>
              <option value="mode">Mode & Prêt-à-porter</option>
              <option value="beaute">Beauté & Cosmétique</option>
              <option value="tech">High-Tech & Électronique</option>
              <option value="maison">Maison, Déco & Mobilier</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Lien de la boutique (Slug)</label>
            <div className="flex items-center min-w-0">
              <span className="bg-slate-100 h-9 px-2.5 flex items-center border border-r-0 border-slate-200 rounded-l-lg text-slate-500 font-mono text-[10px] shrink-0">
                /store/
              </span>
              <input
                type="text"
                value={shopSlug}
                onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="min-w-0 flex-1 h-9 px-2.5 bg-white border border-slate-200 rounded-r-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-[#F97316]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Slogan / Description</label>
            <textarea
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={2}
              placeholder="Présentez votre boutique..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Wilaya</label>
              <input
                type="text"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                placeholder="Ex: Alger"
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Commune</label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="Ex: Hydra"
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
        </div>

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

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? "Enregistrement..." : "Enregistrer l'Identité"}</span>
        </button>
      </form>
    </div>
  );
};
