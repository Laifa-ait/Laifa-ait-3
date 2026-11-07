import React, { useState } from "react";
import {
  StoreConfig,
  StoreCommerceConfig,
  StoreStatusConfig,
  StorePixelsConfig,
} from "../../../../../domains/seller/customPage.types";
import { Check, RefreshCw, Globe, Truck, ShieldAlert } from "lucide-react";
import { StoreSettingsCommerceAndStatusTabs } from "./StoreSettingsCommerceAndStatusTabs";

interface StoreSettingsInspectorPanelProps {
  storeConfig: StoreConfig | null;
  onSaveConfig: (updated: Partial<StoreConfig>) => Promise<void>;
}

type SettingsTab = "general" | "commerce" | "status_pixels";

export const StoreSettingsInspectorPanel: React.FC<StoreSettingsInspectorPanelProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [shopName, setShopName] = useState(storeConfig?.shopName || "");
  const [shopSlug, setShopSlug] = useState(storeConfig?.shopSlug || "");
  const [shopDescription, setShopDescription] = useState(storeConfig?.shopDescription || "");
  const [wilaya, setWilaya] = useState(storeConfig?.wilaya || "Alger");
  const [commune, setCommune] = useState(storeConfig?.commune || "");
  const [metaTitle, setMetaTitle] = useState(storeConfig?.seo?.metaTitle || "");

  const [commerce, setCommerce] = useState<StoreCommerceConfig>({
    codEnabled: storeConfig?.commerceConfig?.codEnabled ?? true,
    freeShippingThresholdDZD: storeConfig?.commerceConfig?.freeShippingThresholdDZD ?? 8000,
    minOrderAmountDZD: storeConfig?.commerceConfig?.minOrderAmountDZD ?? 0,
    preparationTimeHours: storeConfig?.commerceConfig?.preparationTimeHours ?? 24,
    whatsappOrderEnabled: storeConfig?.commerceConfig?.whatsappOrderEnabled ?? false,
    whatsappNumber: storeConfig?.commerceConfig?.whatsappNumber || "",
  });

  const [storeStatus, setStoreStatus] = useState<StoreStatusConfig>({
    mode: storeConfig?.storeStatus?.mode || "open",
    vacationMessage:
      storeConfig?.storeStatus?.vacationMessage ||
      "Notre boutique est momentanément en pause logistique. De retour très vite !",
    passwordProtectionCode: storeConfig?.storeStatus?.passwordProtectionCode || "",
  });

  const [pixels, setPixels] = useState<StorePixelsConfig>({
    metaPixelId: storeConfig?.pixelsConfig?.metaPixelId || "",
    tiktokPixelId: storeConfig?.pixelsConfig?.tiktokPixelId || "",
    ga4MeasurementId: storeConfig?.pixelsConfig?.ga4MeasurementId || "",
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const safeSlug =
        (shopSlug || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "boutique";
      const safeShopName = (shopName || "").trim() || "Ma Boutique";

      await onSaveConfig({
        shopName: safeShopName,
        shopSlug: safeSlug,
        shopDescription: shopDescription.trim(),
        wilaya,
        commune,
        seo: {
          metaTitle: metaTitle.trim() || `${safeShopName} | Olmart Algérie`,
          metaDescription: shopDescription
            ? shopDescription.slice(0, 160)
            : `Découvrez les produits de ${safeShopName} sur Olmart Algérie`,
        },
        commerceConfig: commerce,
        storeStatus,
        pixelsConfig: pixels,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] select-none">
      <div className="p-3.5 border-b border-[#E4E7EC]">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h2 className="text-[14px] font-bold text-[#17191C]">Paramètres Boutique 3.0</h2>
            <p className="text-[11.5px] text-[#667085]">SEO, Logistique 69 Wilayas, Statut & Pixels</p>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-[12px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-lg border border-[#15803D]/20 font-semibold">
              <Check className="w-3.5 h-3.5" /> Enregistré
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`h-7 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "general" ? "bg-white text-[#011C40] shadow-2xs" : "text-[#475569]"
            }`}
          >
            <Globe className="w-3 h-3" /> Général
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commerce")}
            className={`h-7 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "commerce" ? "bg-white text-[#011C40] shadow-2xs" : "text-[#475569]"
            }`}
          >
            <Truck className="w-3 h-3" /> COD & 69W
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("status_pixels")}
            className={`h-7 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "status_pixels" ? "bg-white text-[#011C40] shadow-2xs" : "text-[#475569]"
            }`}
          >
            <ShieldAlert className="w-3 h-3" /> Pixels & Statut
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[13px]">
        {activeTab === "general" ? (
          <>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#17191C] block">Nom de la boutique</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#17191C] block">Lien URL (slug)</label>
              <div className="flex items-center">
                <span className="h-9 px-2.5 bg-[#F5F6F8] border border-r-0 border-[#CBD5E1] rounded-l-lg text-[12px] text-[#667085] flex items-center">
                  olmart.dz/
                </span>
                <input
                  type="text"
                  value={shopSlug}
                  onChange={(e) => setShopSlug(e.target.value)}
                  className="flex-1 h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-r-lg text-[13px]"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[12px] font-semibold text-[#17191C] block mb-1">Wilaya</label>
                <input
                  type="text"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#17191C] block mb-1">Commune</label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#17191C] block">Titre SEO (Google)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Boutique Officielle | Olmart Algérie"
                className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#17191C] block">Description vitrine & Meta</label>
              <textarea
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[12.5px] resize-none"
              />
            </div>
          </>
        ) : (
          <StoreSettingsCommerceAndStatusTabs
            activeTab={activeTab}
            commerce={commerce}
            setCommerce={setCommerce}
            storeStatus={storeStatus}
            setStoreStatus={setStoreStatus}
            pixels={pixels}
            setPixels={setPixels}
          />
        )}

        <div className="pt-3 border-t border-[#E4E7EC]">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-10 bg-[#023859] hover:bg-[#011C40] text-white rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <span>Enregistrer la configuration</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
