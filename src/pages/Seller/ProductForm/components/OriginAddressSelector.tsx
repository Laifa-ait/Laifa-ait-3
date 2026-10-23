import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Truck } from "lucide-react";
import { ProductFormData } from "../../../../types/seller";
import {
  getDairasForWilaya,
  getCommunesForDaira
} from "../../../../data/algerianCommunesDatabase";

interface OriginAddressSelectorProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  ALGERIA_WILAYAS: string[];
}

export const OriginAddressSelector: React.FC<OriginAddressSelectorProps> = ({
  formData,
  setFormData,
  ALGERIA_WILAYAS
}) => {
  const { t } = useTranslation();
  const selectedWilaya = formData.originWilaya || formData.wilaya || "16 - Alger";

  const availableDairas = useMemo(() => {
    return getDairasForWilaya(selectedWilaya);
  }, [selectedWilaya]);

  const activeDaira = formData.originDaira || (availableDairas.length > 0 ? availableDairas[0] : "");

  const availableCommunes = useMemo(() => {
    return getCommunesForDaira(selectedWilaya, activeDaira);
  }, [selectedWilaya, activeDaira]);

  const activeCommune = formData.originCommune || (availableCommunes.length > 0 ? availableCommunes[0].name : "");

  const handleWilayaChange = (newWilaya: string) => {
    const dairas = getDairasForWilaya(newWilaya);
    const firstDaira = dairas.length > 0 ? dairas[0] : "";
    const communes = getCommunesForDaira(newWilaya, firstDaira);
    const firstCommune = communes.length > 0 ? communes[0].name : "";

    setFormData((prev) => ({
      ...prev,
      wilaya: newWilaya,
      originWilaya: newWilaya,
      originDaira: firstDaira,
      originCommune: firstCommune
    }));
  };

  const handleDairaChange = (newDaira: string) => {
    const communes = getCommunesForDaira(selectedWilaya, newDaira);
    const firstCommune = communes.length > 0 ? communes[0].name : "";

    setFormData((prev) => ({
      ...prev,
      originDaira: newDaira,
      originCommune: firstCommune
    }));
  };

  return (
    <div className="bg-[#FFFBF5] p-5 rounded-2xl border border-[#E5DED4] space-y-4">
      <div className="flex items-center gap-2 text-slate-900">
        <Truck className="w-4 h-4 text-[#C75C1A]" />
        <h5 className="font-bold text-xs uppercase tracking-wider">
          {t("Adresse d'Expédition de votre Boutique (Origine du Colis)")}
        </h5>
      </div>
      <p className="text-xs text-slate-500">
        {t("Précisez l'adresse exacte d'où partira le colis (Wilaya, Daïra et Commune). Le tarif de l'acheteur sera calculé automatiquement à partir de ce point de départ.")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t("Wilaya d'origine")} <span className="text-rose-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-xs text-slate-900 focus:border-[#C75C1A] transition-colors"
            value={selectedWilaya}
            onChange={(e) => handleWilayaChange(e.target.value)}
          >
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t("Daïra d'origine")} <span className="text-rose-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-xs text-slate-900 focus:border-[#C75C1A] transition-colors"
            value={activeDaira}
            onChange={(e) => handleDairaChange(e.target.value)}
          >
            {availableDairas.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t("Commune d'origine")} <span className="text-rose-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-xs text-slate-900 focus:border-[#C75C1A] transition-colors"
            value={activeCommune}
            onChange={(e) => setFormData((prev) => ({ ...prev, originCommune: e.target.value }))}
          >
            {availableCommunes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} {c.name_ar ? `(${c.name_ar})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
