import React, { useEffect, useRef, useState } from "react";
import { SellerStoreConfig, CustomPageTheme, StoreThemeSector } from "../../../../../domains/seller/customPage.types";
import { PaletteControls } from "./PaletteControls";
import { TypographySliders } from "./TypographySliders";
import { Check, AlertCircle } from "lucide-react";
import { DEFAULT_MODERN_SECTOR, DEFAULT_MODERN_THEME } from "../../constants/studioThemeDefaults";
import {
  extractSaveErrorMessage,
  resolveLiveShopSlugPatch,
  resolveSubmitShopSlug,
  sanitizeShopName,
} from "../../utils/studioConfigSanitizers";

interface StoreIdentityEditorProps {
  storeConfig?: SellerStoreConfig | null;
  onLiveChange?: (patch: Partial<SellerStoreConfig>) => void;
  onThemeChangeLive?: (theme: CustomPageTheme) => void;
  onSave?: (updated: Partial<SellerStoreConfig>) => Promise<void>;
  onSaveConfig?: (updated: Partial<SellerStoreConfig>) => Promise<void>;
}

const ALL_SECTORS: Array<{ id: StoreThemeSector; label: string }> = [
  { id: "mode", label: "Mode & Prêt-à-porter" },
  { id: "beaute", label: "Beauté, Parfums & Cosmétique" },
  { id: "tech", label: "High-Tech, Gaming & Électronique" },
  { id: "maison", label: "Maison, Déco & Mobilier" },
  { id: "artisanat", label: "Design, Objets & Architecture" },
  { id: "alimentation", label: "Gastronomie & Épicerie Fine" },
  { id: "sport", label: "Sport, Fitness & Outdoor" },
  { id: "accessoires", label: "Bijoux, Montres & Maroquinerie" },
  { id: "enfants", label: "Univers Bébé & Enfants" },
];

export const StoreIdentityEditor: React.FC<StoreIdentityEditorProps> = ({
  storeConfig, onLiveChange, onThemeChangeLive, onSave, onSaveConfig,
}) => {
  const handleSave = onSave || onSaveConfig;
  const callbacksRef = useRef({ onLiveChange, onThemeChangeLive, baseTheme: storeConfig?.theme, fallbackSlug: storeConfig?.shopSlug });
  callbacksRef.current = { onLiveChange, onThemeChangeLive, baseTheme: storeConfig?.theme, fallbackSlug: storeConfig?.shopSlug };
  const hasMountedRef = useRef(false);
  const skipNextEmitRef = useRef(false);
  const lastSyncSigRef = useRef(`${storeConfig?.updatedAt || ""}|${storeConfig?.sellerId || ""}|${storeConfig?.shopName || ""}|${storeConfig?.shopSlug || ""}`);

  const [shopName, setShopName] = useState(storeConfig?.shopName || "");
  const [shopSlug, setShopSlug] = useState(storeConfig?.shopSlug || "");
  const [shopDescription, setShopDescription] = useState(storeConfig?.shopDescription || "");
  const [wilaya, setWilaya] = useState(storeConfig?.wilaya || "Alger");
  const [commune, setCommune] = useState(storeConfig?.commune || "");
  const [primaryColor, setPrimaryColor] = useState(storeConfig?.theme?.primaryColor || DEFAULT_MODERN_THEME.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(storeConfig?.theme?.secondaryColor || DEFAULT_MODERN_THEME.secondaryColor);
  const [accentColor, setAccentColor] = useState(storeConfig?.theme?.accentColor || DEFAULT_MODERN_THEME.accentColor);
  const [canvasColor, setCanvasColor] = useState(storeConfig?.theme?.canvasColor || DEFAULT_MODERN_THEME.canvasColor || "#F8FAFC");
  const [surfaceColor, setSurfaceColor] = useState(storeConfig?.theme?.surfaceColor || DEFAULT_MODERN_THEME.surfaceColor || "#FFFFFF");
  const [fontFamily, setFontFamily] = useState(storeConfig?.theme?.fontFamily || DEFAULT_MODERN_THEME.fontFamily || "'DM Sans', sans-serif");
  const [borderRadiusPx, setBorderRadiusPx] = useState(storeConfig?.theme?.borderRadiusPx ?? 10);
  const [spacingYPx, setSpacingYPx] = useState(storeConfig?.theme?.spacingYPx ?? 24);
  const [titleFontSizePx, setTitleFontSizePx] = useState(storeConfig?.theme?.titleFontSizePx ?? 32);
  const [bodyFontSizePx, setBodyFontSizePx] = useState(storeConfig?.theme?.bodyFontSizePx ?? 16);
  const [sector, setSector] = useState<StoreThemeSector>(storeConfig?.theme?.sector || DEFAULT_MODERN_SECTOR);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const nextSig = `${storeConfig?.updatedAt || ""}|${storeConfig?.sellerId || ""}|${storeConfig?.shopName || ""}|${storeConfig?.shopSlug || ""}`;
    if (!storeConfig || nextSig === lastSyncSigRef.current) return;
    lastSyncSigRef.current = nextSig;
    skipNextEmitRef.current = true;
    setShopName(storeConfig.shopName || "");
    setShopSlug(storeConfig.shopSlug || "");
    setShopDescription(storeConfig.shopDescription || "");
    setWilaya(storeConfig.wilaya || "Alger");
    setCommune(storeConfig.commune || "");
    setPrimaryColor(storeConfig.theme?.primaryColor || DEFAULT_MODERN_THEME.primaryColor);
    setSecondaryColor(storeConfig.theme?.secondaryColor || DEFAULT_MODERN_THEME.secondaryColor);
    setAccentColor(storeConfig.theme?.accentColor || DEFAULT_MODERN_THEME.accentColor);
    setCanvasColor(storeConfig.theme?.canvasColor || DEFAULT_MODERN_THEME.canvasColor || "#F8FAFC");
    setSurfaceColor(storeConfig.theme?.surfaceColor || DEFAULT_MODERN_THEME.surfaceColor || "#FFFFFF");
    setFontFamily(storeConfig.theme?.fontFamily || DEFAULT_MODERN_THEME.fontFamily || "'DM Sans', sans-serif");
    setBorderRadiusPx(storeConfig.theme?.borderRadiusPx ?? 10);
    setSpacingYPx(storeConfig.theme?.spacingYPx ?? 24);
    setTitleFontSizePx(storeConfig.theme?.titleFontSizePx ?? 32);
    setBodyFontSizePx(storeConfig.theme?.bodyFontSizePx ?? 16);
    setSector(storeConfig.theme?.sector || DEFAULT_MODERN_SECTOR);
  }, [storeConfig]);

  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    if (skipNextEmitRef.current) { skipNextEmitRef.current = false; return; }
    const updatedTheme: CustomPageTheme = {
      ...(callbacksRef.current.baseTheme || {}),
      sector, primaryColor, secondaryColor, accentColor, canvasColor, surfaceColor,
      fontFamily, borderRadiusPx, spacingYPx, titleFontSizePx, bodyFontSizePx,
    };
    callbacksRef.current.onThemeChangeLive?.(updatedTheme);
    callbacksRef.current.onLiveChange?.({
      shopName: sanitizeShopName(shopName),
      ...resolveLiveShopSlugPatch(shopSlug, callbacksRef.current.fallbackSlug),
      shopDescription: shopDescription.trim(),
      wilaya, commune, theme: updatedTheme,
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
    setSaveError(null);
    try {
      const updatedTheme: CustomPageTheme = {
        ...storeConfig?.theme,
        sector, primaryColor, secondaryColor, accentColor, canvasColor, surfaceColor,
        fontFamily, borderRadiusPx, spacingYPx, titleFontSizePx, bodyFontSizePx,
      };
      const safeSlug = resolveSubmitShopSlug(shopSlug, storeConfig?.shopSlug);
      const safeShopName = sanitizeShopName(shopName);
      setShopName(safeShopName);
      setShopSlug(safeSlug);

      await handleSave({
        shopName: safeShopName,
        shopSlug: safeSlug,
        shopDescription: shopDescription.trim(),
        wilaya, commune, theme: updatedTheme,
        seo: storeConfig?.seo || {
          metaTitle: `${safeShopName} | Olmart Algérie`,
          metaDescription: shopDescription ? shopDescription.slice(0, 160) : `Découvrez ${safeShopName} sur Olmart`,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(extractSaveErrorMessage(err, "Impossible d'enregistrer l'identité."));
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

      <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="space-y-3">
          <h3 className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">Informations générales</h3>
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Nom commercial</label>
            <input
              type="text" value={shopName} onChange={(e) => { setSaveError(null); setShopName(e.target.value); }}
              placeholder="Ma Boutique"
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Secteur d&apos;activité</label>
            <select
              value={sector} onChange={(e) => { setSaveError(null); setSector(e.target.value as StoreThemeSector); }}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {ALL_SECTORS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Lien boutique (Slug)</label>
            <div className="flex items-center min-w-0">
              <span className="bg-slate-50 h-8.5 px-2.5 flex items-center border border-r-0 border-slate-200 rounded-l-lg text-slate-500 font-mono text-[10.5px] shrink-0">/store/</span>
              <input
                type="text" value={shopSlug}
                onChange={(e) => { setSaveError(null); setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")); }}
                placeholder="ma-boutique"
                className="min-w-0 flex-1 h-8.5 px-2.5 bg-white border border-slate-200 rounded-r-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Description</label>
            <textarea
              value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} rows={2}
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
          canvasColor={canvasColor} setCanvasColor={setCanvasColor} surfaceColor={surfaceColor} setSurfaceColor={setSurfaceColor}
          accentColor={accentColor} setAccentColor={setAccentColor} primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor} setSecondaryColor={setSecondaryColor}
        />
        <TypographySliders
          fontFamily={fontFamily} setFontFamily={setFontFamily} borderRadiusPx={borderRadiusPx} setBorderRadiusPx={setBorderRadiusPx}
          spacingYPx={spacingYPx} setSpacingYPx={setSpacingYPx} titleFontSizePx={titleFontSizePx} setTitleFontSizePx={setTitleFontSizePx}
          bodyFontSizePx={bodyFontSizePx} setBodyFontSizePx={setBodyFontSizePx}
        />

        {saveError && (
          <div role="alert" data-testid="identity-save-error" className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{saveError}</span>
          </div>
        )}
        <button type="submit" disabled={saving} data-testid="identity-save-btn" className="w-full h-9 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50">
          <Check className="w-3.5 h-3.5" />
          <span>{saving ? "Enregistrement..." : "Enregistrer l'identité"}</span>
        </button>
      </form>
    </div>
  );
};
