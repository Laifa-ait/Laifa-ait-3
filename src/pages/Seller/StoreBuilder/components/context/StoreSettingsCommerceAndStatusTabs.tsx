import React from "react";
import {
  StoreCommerceConfig,
  StoreStatusConfig,
  StorePixelsConfig,
} from "../../../../../domains/seller/customPage.types";

interface StoreSettingsCommerceAndStatusTabsProps {
  activeTab: "commerce" | "status_pixels";
  commerce: StoreCommerceConfig;
  setCommerce: React.Dispatch<React.SetStateAction<StoreCommerceConfig>>;
  storeStatus: StoreStatusConfig;
  setStoreStatus: React.Dispatch<React.SetStateAction<StoreStatusConfig>>;
  pixels: StorePixelsConfig;
  setPixels: React.Dispatch<React.SetStateAction<StorePixelsConfig>>;
}

export const StoreSettingsCommerceAndStatusTabs: React.FC<
  StoreSettingsCommerceAndStatusTabsProps
> = ({ activeTab, commerce, setCommerce, storeStatus, setStoreStatus, pixels, setPixels }) => {
  if (activeTab === "commerce") {
    return (
      <>
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
          <span className="font-semibold text-[12.5px] text-[#0F172A]">
            Activer le Paiement à la livraison (COD)
          </span>
          <input
            type="checkbox"
            checked={commerce.codEnabled}
            onChange={(e) => setCommerce((p) => ({ ...p, codEnabled: e.target.checked }))}
            className="w-4 h-4 accent-[#023859]"
          />
        </label>
        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-[#17191C] block">
            Seuil de livraison gratuite (DZD - 0 pour désactiver)
          </label>
          <input
            type="number"
            min={0}
            value={commerce.freeShippingThresholdDZD}
            onChange={(e) =>
              setCommerce((p) => ({ ...p, freeShippingThresholdDZD: Number(e.target.value) || 0 }))
            }
            className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11.5px] font-semibold text-[#17191C] block mb-1">
              Minimum commande (DA)
            </label>
            <input
              type="number"
              min={0}
              value={commerce.minOrderAmountDZD}
              onChange={(e) =>
                setCommerce((p) => ({ ...p, minOrderAmountDZD: Number(e.target.value) || 0 }))
              }
              className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
            />
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-[#17191C] block mb-1">
              Préparation (Heures)
            </label>
            <input
              type="number"
              min={1}
              max={720}
              value={commerce.preparationTimeHours}
              onChange={(e) =>
                setCommerce((p) => ({ ...p, preparationTimeHours: Number(e.target.value) || 24 }))
              }
              className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
            />
          </div>
        </div>
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
          <span className="font-semibold text-[12.5px] text-[#0F172A]">
            Bouton Commande rapide WhatsApp
          </span>
          <input
            type="checkbox"
            checked={commerce.whatsappOrderEnabled}
            onChange={(e) =>
              setCommerce((p) => ({ ...p, whatsappOrderEnabled: e.target.checked }))
            }
            className="w-4 h-4 accent-[#023859]"
          />
        </label>
        {commerce.whatsappOrderEnabled && (
          <input
            type="text"
            value={commerce.whatsappNumber || ""}
            onChange={(e) => setCommerce((p) => ({ ...p, whatsappNumber: e.target.value }))}
            placeholder="Ex: +213 550 00 00 00"
            className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded-lg text-[13px]"
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-[12px] font-bold text-[#0F172A] block">
          Mode d'ouverture de la boutique
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: "open", label: "Ouverte" },
              { id: "vacation", label: "Vacances" },
              { id: "password", label: "Pré-lancement" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setStoreStatus((p) => ({ ...p, mode: m.id }))}
              className={`h-8 rounded-lg text-[11.5px] font-bold border cursor-pointer ${
                storeStatus.mode === m.id
                  ? "bg-[#023859] text-white border-[#023859]"
                  : "bg-white text-[#334155] border-[#CBD5E1]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {storeStatus.mode !== "open" && (
        <textarea
          value={storeStatus.vacationMessage || ""}
          onChange={(e) => setStoreStatus((p) => ({ ...p, vacationMessage: e.target.value }))}
          rows={2}
          placeholder="Message affiché aux visiteurs..."
          className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[12px]"
        />
      )}
      <div className="pt-2 border-t border-[#E2E8F0] space-y-2.5">
        <span className="block text-[12px] font-bold text-[#0F172A]">
          Pixels Marketing & Conversion
        </span>
        <input
          type="text"
          value={pixels.metaPixelId || ""}
          onChange={(e) => setPixels((p) => ({ ...p, metaPixelId: e.target.value }))}
          placeholder="Meta (Facebook) Pixel ID"
          className="w-full h-8.5 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[12px]"
        />
        <input
          type="text"
          value={pixels.tiktokPixelId || ""}
          onChange={(e) => setPixels((p) => ({ ...p, tiktokPixelId: e.target.value }))}
          placeholder="TikTok Pixel ID"
          className="w-full h-8.5 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[12px]"
        />
        <input
          type="text"
          value={pixels.ga4MeasurementId || ""}
          onChange={(e) => setPixels((p) => ({ ...p, ga4MeasurementId: e.target.value }))}
          placeholder="Google Analytics 4 (G-XXXXXXXX)"
          className="w-full h-8.5 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[12px]"
        />
      </div>
    </>
  );
};
