import React, { useEffect, useRef, useState } from "react";
import { SellerStoreConfig, CustomPageTheme, StoreThemeSector } from "../../../../../domains/seller/customPage.types";
import { PaletteControls } from "./PaletteControls";
import { TypographySliders } from "./TypographySliders";
import { Check } from "lucide-react";

interface StoreIdentityEditorProps {
  storeConfig?: SellerStoreConfig | null;
  onLiveChange?: (patch: Partial<SellerStoreConfig>) => void;
  onThemeChangeLive?: (theme: CustomPageTheme) => void;
  onSave?: (updated: Partial<SellerStoreConfig>) => Promise<void>;
  onSaveConfig?: (updated: Partial<SellerStoreConfig>) => Promise<void>;
}

const ALL_SECTORS: Array<{ id: StoreThemeSector; label: string }> = [
  { id: "artisanat", label: "Artisanat & Tradition Algérienne" },
  { id: "mode", label: "Mode & Prêt-à-porter" },
  { id: "beaute", label: "Beauté, Parfums & Cosmétique" },
  { id: "tech", label: "High-Tech, Gaming & Électronique" },
  { id: "maison", label: "Maison, Déco & Mobilier" },
  { id: "alimentation", label: "Épicerie Fine & Terroir" },
  { id: "sport", label: "Sport, Fitness & Outdoor" },
  { id: "accessoires", label: "Bijoux, Montres & Maroquinerie" },
  { id: "enfants", label: "Univers Bébé & Enfants" },
];

export const StoreIdentityEditor: React.FC<StoreIdentityEditorProps> = ({
  storeConfig,
  onLiveChange,
  onThemeChangeLive,
  onSave,
  onSaveConfig,
}) => {
  const handleSave = onSave || onSaveConfig;
  const callbacksRef = useRef({ onLiveChange, onThemeChangeLive, baseTheme: storeConfig?.theme });
  callbacksRef.current = { onLiveChange, onThemeChangeLive, baseTheme: storeConfig?.theme };

  const [shopName, setShopName] = useState(storeConfig?.shopName || "");
  const [shopSlug, setShopSlug] = useState(storeConfig?.shopSlug || "");
  const [shopDescription, setShopDescription] = useState(storeConfig?.shopDescription || "");
  const [wilaya, setWilaya] = useState(storeConfig?.wilaya || "Alger");
  const [commune, setCommune] = useState(storeConfig?.commune || "");
  const [primaryColor, setPrimaryColor] = useState(storeConfig?.theme?.primaryColor || "#0F172A");
  const [secondaryColor, setSecondaryColor] = useState(storeConfig?.theme?.secondaryColor || "#334155");
  const [accentColor, setAccentColor] = useState(storeConfig?.theme?.accentColor || "#0F172A");
  const [canvasColor, setCanvasColor] = useState(storeConfig?.theme?.canvasColor || "#F8FAFC");
  const [surfaceColor, setSurfaceColor] = useState(storeConfig?.theme?.surfaceColor || "#FFFFFF");
  const [fontFamily, setFontFamily] = useState(storeConfig?.theme?.fontFamily || "'Plus Jakarta Sans', sans-serif");
  const [borderRadiusPx, setBorderRadiusPx] = useState(storeConfig?.theme?.borderRadiusPx ?? 10);
  const [spacingYPx, setSpacingYPx] = useState(storeConfig?.theme?.spacingYPx ?? 24);
  const [titleFontSizePx, setTitleFontSizePx] = useState(storeConfig?.theme?.titleFontSizePx ?? 32);
  const [bodyFontSizePx, setBodyFontSizePx] = useState(storeConfig?.theme?.bodyFontSizePx ?? 16);
  const [sector, setSector] = useState<StoreThemeSector>(storeConfig?.theme?.sector || "artisanat");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const updatedTheme: CustomPageTheme = {
      ...(callbacksRef.current.baseTheme || {}),
      sector, primaryColor, secondaryColor, accentColor, canvasColor, surfaceColor,
      fontFamily, borderRadiusPx, spacingYPx, titleFontSizePx, bodyFontSizePx,
    };
    callbacksRef.current.onThemeChangeLive?.(updatedTheme);
    callbacksRef.current.onLiveChange?.({
      shopName: (shopName || "").trim() || "Ma Boutique",
      shopSlug: (shopSlug || "").trim(),
      shopDescription: shopDescription.trim(),
      wilaya,
      commune,
      theme: updatedTheme,
    });
  }, [
    shopName, shopSlug, shopDescription, wilaya, commune, sector,
    primaryColor, secondaryColor, accentColor, canvasColor, surfaceColor,
    fontFamily, borderRadiusPx, spacingYPx, titleFontSizePx, bodyFontSizePx,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleSave) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updatedTheme: CustomPageTheme = {
        ...storeConfig?.theme,
        sector, primaryColor, secondaryColor, accentColor, canvasColor, surfaceColor,
        fontFamily, borderRadiusPx, spacingYPx, titleFontSizePx, bodyFontSizePx,
      };
      const safeSlug = (shopSlug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "boutique";
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
          metaDescription: shopDescription ? shopDescription.slice(0, 160) : `Découvrez ${safeShopName} sur Olmart`,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 flex flex-col h-full select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-slate-900 truncate">Identité &amp; Charte</h2>
          <p className="text-[11px] text-slate-500 truncate">Nom, secteur (9 univers) et couleurs</p>
        </div>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-medium shrink-0">
            <Check className="w-3.5 h-3.5" />
            <span>Enregistré</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="space-y-3">
          <h3 className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
            Informations générales
          </h3>

          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Nom commercial</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Secteur d&apos;activité</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as StoreThemeSector)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {ALL_SECTORS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Lien boutique (Slug)</label>
            <div className="flex items-center min-w-0">
              <span className="bg-slate-50 h-8.5 px-2.5 flex items-center border border-r-0 border-slate-200 rounded-l-lg text-slate-500 font-mono text-[10.5px] shrink-0">
                /store/
              </span>
              <input
                type="text"
                value={shopSlug}
                onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="min-w-0 flex-1 h-8.5 px-2.5 bg-white border border-slate-200 rounded-r-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Description</label>
            <textarea
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={2}
              placeholder="Présentez votre boutique..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 resize-none focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-medium text-slate-700 block">Wilaya</label>
              <input type="text" value={wilaya} onChange={(e) => setWilaya(e.target.value)} placeholder="Ex: Alger" className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700 block">Commune</label>
              <input type="text" value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="Ex: Hydra" className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
          </div>
        </div>

        <PaletteControls
          canvasColor={canvasColor} setCanvasColor={setCanvasColor}
          surfaceColor={surfaceColor} setSurfaceColor={setSurfaceColor}
          accentColor={accentColor} setAccentColor={setAccentColor}
          primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor} setSecondaryColor={setSecondaryColor}
        />

        <TypographySliders
          fontFamily={fontFamily} setFontFamily={setFontFamily}
          borderRadiusPx={borderRadiusPx} setBorderRadiusPx={setBorderRadiusPx}
          spacingYPx={spacingYPx} setSpacingYPx={setSpacingYPx}
          titleFontSizePx={titleFontSizePx} setTitleFontSizePx={setTitleFontSizePx}
          bodyFontSizePx={bodyFontSizePx} setBodyFontSizePx={setBodyFontSizePx}
        />

        <button type="submit" disabled={saving} className="w-full h-9 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50">
          <Check className="w-3.5 h-3.5" />
          <span>{saving ? "Enregistrement..." : "Enregistrer l'identité"}</span>
        </button>
      </form>
    </div>
  );
};
