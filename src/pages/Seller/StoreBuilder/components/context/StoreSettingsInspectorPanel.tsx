import React, { useState } from "react";
import { StoreConfig } from "../../../../../domains/seller/customPage.types";
import { Check, RefreshCw } from "lucide-react";

interface StoreSettingsInspectorPanelProps {
  storeConfig: StoreConfig | null;
  onSaveConfig: (updated: Partial<StoreConfig>) => Promise<void>;
}

export const StoreSettingsInspectorPanel: React.FC<StoreSettingsInspectorPanelProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  const [shopName, setShopName] = useState(storeConfig?.shopName || "");
  const [shopSlug, setShopSlug] = useState(storeConfig?.shopSlug || "");
  const [shopDescription, setShopDescription] = useState(storeConfig?.shopDescription || "");
  const [wilaya, setWilaya] = useState(storeConfig?.wilaya || "Alger");
  const [commune, setCommune] = useState(storeConfig?.commune || "");
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
        seo: storeConfig?.seo || {
          metaTitle: `${safeShopName} | Olmart Algérie`,
          metaDescription: shopDescription
            ? shopDescription.slice(0, 160)
            : `Découvrez les produits de ${safeShopName} sur Olmart Algérie`,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF]">
      {/* Header */}
      <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#17191C]">Informations boutique</h2>
          <p className="text-[13px] text-[#667085]">Coordonnées et référencement</p>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1 text-[13px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-lg border border-[#15803D]/20">
            <Check className="w-3.5 h-3.5" /> Enregistré
          </span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-[14px]">
        {/* Nom de la boutique */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] block">
            Nom de la boutique
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
            placeholder="Ex: Maison DZ"
            required
          />
        </div>

        {/* Identifiant URL (Slug) */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] block">
            Lien URL personnalisé (slug)
          </label>
          <div className="flex items-center">
            <span className="h-[44px] px-2.5 bg-[#F5F6F8] border border-r-0 border-[#E4E7EC] rounded-l-lg text-[13px] text-[#667085] flex items-center">
              olmart.dz/
            </span>
            <input
              type="text"
              value={shopSlug}
              onChange={(e) => setShopSlug(e.target.value)}
              className="flex-1 h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-r-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
              placeholder="maison-dz"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] block">
            Description de la vitrine
          </label>
          <textarea
            value={shopDescription}
            onChange={(e) => setShopDescription(e.target.value)}
            rows={3}
            className="w-full p-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316] resize-none"
            placeholder="Présentez brièvement vos créations, votre savoir-faire ou vos collections..."
          />
        </div>

        {/* Wilaya & Commune */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#17191C] block">Wilaya</label>
            <input
              type="text"
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
              placeholder="Alger"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#17191C] block">Commune</label>
            <input
              type="text"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
              placeholder="Bab El Oued"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E4E7EC]">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-[40px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <span>Enregistrer les coordonnées</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
