import React from "react";
import { useTranslation } from "react-i18next";
import { Truck, Package, ShieldCheck } from "lucide-react";
import { ProductFormData } from "../../../../types/seller";
import { CarrierCardsSelector } from "./CarrierCardsSelector";
import { OriginAddressSelector } from "./OriginAddressSelector";
import { VolumetricNotice } from "./VolumetricNotice";

interface CarrierLogisticsSectionProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  ALGERIA_WILAYAS: string[];
}

export const CarrierLogisticsSection: React.FC<CarrierLogisticsSectionProps> = ({
  formData,
  setFormData,
  ALGERIA_WILAYAS
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* 1. Sélection des transporteurs algériens avec grilles tarifaires publiques */}
      <CarrierCardsSelector
        formData={formData}
        setFormData={setFormData}
      />

      {/* 2. Origine du colis chez le vendeur (Wilaya, Daïra, Commune) */}
      <OriginAddressSelector
        formData={formData}
        setFormData={setFormData}
        ALGERIA_WILAYAS={ALGERIA_WILAYAS}
      />

      {/* 3. Détection et alerte dynamique du poids volumétrique */}
      <VolumetricNotice
        dimensions={formData.dimensions}
        weight={formData.weight}
        category={formData.category}
      />

      {/* 4. Modes de livraison autorisés (Domicile vs Stop Desk) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="p-3.5 border border-[#E5DED4] rounded-xl bg-white flex items-center justify-between cursor-pointer hover:border-[#C75C1A] transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-orange-50 text-[#C75C1A]">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <span className="block font-bold text-slate-900 text-xs">
                {t("Livraison à Domicile")} 🚚
              </span>
              <span className="text-[10px] text-slate-500">
                {t("Remise en main propre chez l'acheteur")}
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#C75C1A] rounded"
            checked={formData.allowHomeDelivery !== false}
            onChange={(e) => setFormData((prev) => ({ ...prev, allowHomeDelivery: e.target.checked }))}
          />
        </label>

        <label className="p-3.5 border border-[#E5DED4] rounded-xl bg-white flex items-center justify-between cursor-pointer hover:border-[#C75C1A] transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-orange-50 text-[#C75C1A]">
              <Package className="w-4 h-4" />
            </span>
            <div>
              <span className="block font-bold text-slate-900 text-xs">
                {t("Point Relais (Stop Desk)")} 📦
              </span>
              <span className="text-[10px] text-slate-500">
                {t("Retrait économique en agence partenaire")}
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#C75C1A] rounded"
            checked={formData.allowStopDesk !== false}
            onChange={(e) => setFormData((prev) => ({ ...prev, allowStopDesk: e.target.checked }))}
          />
        </label>
      </div>

      {/* 5. Prise en charge des frais de port par le vendeur */}
      <label className="p-3.5 border border-emerald-200 rounded-xl bg-emerald-50/50 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <span className="block font-bold text-emerald-950 text-xs">
              {t("Offrir la Livraison Gratuite (0 DA pour l'acheteur)")} 🎁
            </span>
            <span className="text-[10px] text-emerald-700">
              {t("Vous prenez en charge les frais de port pour booster vos ventes")}
            </span>
          </div>
        </div>
        <input
          type="checkbox"
          className="w-4 h-4 accent-emerald-600 rounded"
          checked={Boolean(formData.freeShipping)}
          onChange={(e) => setFormData((prev) => ({ ...prev, freeShipping: e.target.checked }))}
        />
      </label>
    </div>
  );
};
