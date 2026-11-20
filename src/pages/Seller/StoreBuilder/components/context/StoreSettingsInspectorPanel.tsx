import React, { useEffect, useRef, useState } from "react";
import {
  StoreConfig, StoreCommerceConfig, StoreStatusConfig, StorePixelsConfig,
} from "../../../../../domains/seller/customPage.types";
import { AlertCircle, Check, RefreshCw, Globe, Truck, ShieldAlert } from "lucide-react";
import { StoreSettingsCommerceAndStatusTabs } from "./StoreSettingsCommerceAndStatusTabs";
import {
  buildStoreSettingsFormDefaults, extractSaveErrorMessage,
  resolveLiveShopSlugPatch, resolveSubmitShopSlug, sanitizeShopName,
} from "../../utils/studioConfigSanitizers";

interface StoreSettingsInspectorPanelProps {
  storeConfig: StoreConfig | null;
  onLiveChange?: (patch: Partial<StoreConfig>) => void;
  onSaveConfig: (updated: Partial<StoreConfig>) => Promise<void>;
}

type SettingsTab = "general" | "commerce" | "status_pixels";

export const StoreSettingsInspectorPanel: React.FC<StoreSettingsInspectorPanelProps> = ({
  storeConfig, onLiveChange, onSaveConfig,
}) => {
  const refs = useRef({ onLiveChange, fallbackSlug: storeConfig?.shopSlug });
  refs.current = { onLiveChange, fallbackSlug: storeConfig?.shopSlug };
  const hasMountedRef = useRef(false);
  const skipNextEmitRef = useRef(false);
  const lastSyncSigRef = useRef(`${storeConfig?.updatedAt || ""}|${storeConfig?.sellerId || ""}|${storeConfig?.shopName || ""}|${storeConfig?.shopSlug || ""}`);

  const initial = buildStoreSettingsFormDefaults(storeConfig);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [shopName, setShopName] = useState(initial.shopName);
  const [shopSlug, setShopSlug] = useState(initial.shopSlug);
  const [shopDescription, setShopDescription] = useState(initial.shopDescription);
  const [wilaya, setWilaya] = useState(initial.wilaya);
  const [commune, setCommune] = useState(initial.commune);
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle);
  const [commerce, setCommerce] = useState<StoreCommerceConfig>(initial.commerce);
  const [storeStatus, setStoreStatus] = useState<StoreStatusConfig>(initial.storeStatus);
  const [pixels, setPixels] = useState<StorePixelsConfig>(initial.pixels);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const nextSig = `${storeConfig?.updatedAt || ""}|${storeConfig?.sellerId || ""}|${storeConfig?.shopName || ""}|${storeConfig?.shopSlug || ""}`;
    if (!storeConfig || nextSig === lastSyncSigRef.current) return;
    lastSyncSigRef.current = nextSig;
    skipNextEmitRef.current = true;
    const next = buildStoreSettingsFormDefaults(storeConfig);
    setShopName(next.shopName); setShopSlug(next.shopSlug); setShopDescription(next.shopDescription);
    setWilaya(next.wilaya); setCommune(next.commune); setMetaTitle(next.metaTitle);
    setCommerce(next.commerce); setStoreStatus(next.storeStatus); setPixels(next.pixels);
  }, [storeConfig]);

  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    if (skipNextEmitRef.current) { skipNextEmitRef.current = false; return; }
    refs.current.onLiveChange?.({
      shopName: sanitizeShopName(shopName),
      ...resolveLiveShopSlugPatch(shopSlug, refs.current.fallbackSlug),
      shopDescription: shopDescription.trim(), wilaya, commune,
      commerceConfig: commerce, storeStatus, pixelsConfig: pixels,
    });
  }, [shopName, shopSlug, shopDescription, wilaya, commune, commerce, storeStatus, pixels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSavedSuccess(false); setSaveError(null);
    try {
      const safeSlug = resolveSubmitShopSlug(shopSlug, storeConfig?.shopSlug);
      const safeShopName = sanitizeShopName(shopName);
      setShopName(safeShopName);
      setShopSlug(safeSlug);

      await onSaveConfig({
        shopName: safeShopName, shopSlug: safeSlug, shopDescription: shopDescription.trim(), wilaya, commune,
        seo: {
          metaTitle: metaTitle.trim() || `${safeShopName} | Olmart Algérie`,
          metaDescription: shopDescription ? shopDescription.slice(0, 160) : `Découvrez les produits de ${safeShopName} sur Olmart Algérie`,
        },
        commerceConfig: commerce, storeStatus, pixelsConfig: pixels,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: unknown) {
      setSaveError(extractSaveErrorMessage(err, "Impossible d'enregistrer la configuration."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="px-4 pt-3.5 border-b border-slate-200 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">Paramètres boutique</h2>
            <p className="text-[11px] text-slate-500">SEO, livraison 69 Wilayas, statut &amp; pixels</p>
          </div>
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <Check className="w-3.5 h-3.5" /> Enregistré
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 border-t border-slate-100">
          {[
            { id: "general" as const, label: "Général", icon: Globe },
            { id: "commerce" as const, label: "COD & 69W", icon: Truck },
            { id: "status_pixels" as const, label: "Pixels & Statut", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 border-b-2 text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                  active ? "border-slate-900 text-slate-900 font-semibold" : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[12.5px]">
        {activeTab === "general" ? (
          <>
            <div className="space-y-1">
              <label className="text-[11.5px] font-medium text-slate-700 block">Nom de la boutique</label>
              <input type="text" value={shopName} onChange={(e) => { setSaveError(null); setShopName(e.target.value); }} placeholder="Ma Boutique" className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-900 focus:border-slate-900 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11.5px] font-medium text-slate-700 block">Lien URL (slug)</label>
              <div className="flex items-center">
                <span className="h-9 px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-[11.5px] text-slate-500 font-mono flex items-center">olmart.dz/</span>
                <input type="text" value={shopSlug} onChange={(e) => { setSaveError(null); setShopSlug(e.target.value); }} placeholder="ma-boutique" className="flex-1 h-9 px-2.5 bg-white border border-slate-200 rounded-r-lg text-[12.5px] font-mono text-slate-900 focus:border-slate-900 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11.5px] font-medium text-slate-700 block mb-1">Wilaya</label>
                <input type="text" value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-900 focus:border-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-slate-700 block mb-1">Commune</label>
                <input type="text" value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-900 focus:border-slate-900 focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11.5px] font-medium text-slate-700 block">Titre SEO (Google)</label>
              <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Boutique Officielle | Olmart Algérie" className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-900 focus:border-slate-900 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11.5px] font-medium text-slate-700 block">Description vitrine &amp; Meta</label>
              <textarea value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} rows={3} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-900 resize-none focus:border-slate-900 focus:outline-none" />
            </div>
          </>
        ) : (
          <StoreSettingsCommerceAndStatusTabs
            activeTab={activeTab} commerce={commerce} setCommerce={setCommerce}
            storeStatus={storeStatus} setStoreStatus={setStoreStatus} pixels={pixels} setPixels={setPixels}
          />
        )}

        <div className="pt-3 border-t border-slate-200 space-y-2">
          {saveError && (
            <div role="alert" data-testid="settings-save-error" className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{saveError}</span>
            </div>
          )}
          <button type="submit" disabled={saving} data-testid="settings-save-btn" className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[12.5px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {saving ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Enregistrement…</span></>) : (<span>Enregistrer la configuration</span>)}
          </button>
        </div>
      </form>
    </div>
  );
};
