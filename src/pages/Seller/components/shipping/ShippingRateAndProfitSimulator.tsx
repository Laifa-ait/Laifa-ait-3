import React, { useState } from "react";
import { MapPin, Calculator, Save, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { apiPut } from "../../../../lib/api";
import toast from "react-hot-toast";

export interface WilayaRateItem {
  code: string;
  name: string;
  desk: number;
  home: number;
}

export const ALGERIA_69_WILAYAS_RATES: WilayaRateItem[] = [
  { code: "01", name: "Adrar", desk: 600, home: 900 },
  { code: "02", name: "Chlef", desk: 400, home: 650 },
  { code: "03", name: "Laghouat", desk: 500, home: 750 },
  { code: "04", name: "Oum El Bouaghi", desk: 450, home: 700 },
  { code: "05", name: "Batna", desk: 450, home: 700 },
  { code: "06", name: "Béjaïa", desk: 400, home: 650 },
  { code: "07", name: "Biskra", desk: 500, home: 750 },
  { code: "08", name: "Béchar", desk: 600, home: 900 },
  { code: "09", name: "Blida", desk: 350, home: 550 },
  { code: "10", name: "Bouira", desk: 350, home: 550 },
  { code: "11", name: "Tamanrasset", desk: 800, home: 1200 },
  { code: "12", name: "Tébessa", desk: 500, home: 750 },
  { code: "13", name: "Tlemcen", desk: 450, home: 700 },
  { code: "14", name: "Tiaret", desk: 450, home: 700 },
  { code: "15", name: "Tizi Ouzou", desk: 350, home: 550 },
  { code: "16", name: "Alger", desk: 300, home: 500 },
  { code: "17", name: "Djelfa", desk: 500, home: 750 },
  { code: "18", name: "Jijel", desk: 400, home: 650 },
  { code: "19", name: "Sétif", desk: 400, home: 650 },
  { code: "20", name: "Saïda", desk: 500, home: 750 },
  { code: "21", name: "Skikda", desk: 450, home: 700 },
  { code: "22", name: "Sidi Bel Abbès", desk: 450, home: 700 },
  { code: "23", name: "Annaba", desk: 450, home: 700 },
  { code: "24", name: "Guelma", desk: 450, home: 700 },
  { code: "25", name: "Constantine", desk: 400, home: 650 },
  { code: "26", name: "Médéa", desk: 350, home: 550 },
  { code: "27", name: "Mostaganem", desk: 450, home: 700 },
  { code: "28", name: "M'Sila", desk: 450, home: 700 },
  { code: "29", name: "Mascara", desk: 450, home: 700 },
  { code: "30", name: "Ouargla", desk: 600, home: 900 },
  { code: "31", name: "Oran", desk: 400, home: 650 },
  { code: "32", name: "El Bayadh", desk: 600, home: 900 },
  { code: "33", name: "Illizi", desk: 800, home: 1200 },
  { code: "34", name: "Bordj Bou Arréridj", desk: 400, home: 650 },
  { code: "35", name: "Boumerdès", desk: 300, home: 500 },
  { code: "36", name: "El Tarf", desk: 500, home: 750 },
  { code: "37", name: "Tindouf", desk: 900, home: 1300 },
  { code: "38", name: "Tissemsilt", desk: 450, home: 700 },
  { code: "39", name: "El Oued", desk: 600, home: 900 },
  { code: "40", name: "Khenchela", desk: 500, home: 750 },
  { code: "41", name: "Souk Ahras", desk: 500, home: 750 },
  { code: "42", name: "Tipaza", desk: 350, home: 550 },
  { code: "43", name: "Mila", desk: 400, home: 650 },
  { code: "44", name: "Aïn Defla", desk: 350, home: 550 },
  { code: "45", name: "Naâma", desk: 600, home: 900 },
  { code: "46", name: "Aïn Témouchent", desk: 450, home: 700 },
  { code: "47", name: "Ghardaïa", desk: 600, home: 900 },
  { code: "48", name: "Relizane", desk: 450, home: 700 },
  { code: "49", name: "Timimoun", desk: 700, home: 1000 },
  { code: "50", name: "Bordj Badji Mokhtar", desk: 1000, home: 1500 },
  { code: "51", name: "Ouled Djellal", desk: 550, home: 800 },
  { code: "52", name: "Béni Abbès", desk: 700, home: 1000 },
  { code: "53", name: "In Salah", desk: 800, home: 1200 },
  { code: "54", name: "In Guezzam", desk: 1000, home: 1500 },
  { code: "55", name: "Touggourt", desk: 600, home: 900 },
  { code: "56", name: "Djanet", desk: 900, home: 1300 },
  { code: "57", name: "El M'Ghair", desk: 600, home: 900 },
  { code: "58", name: "El Meniaa", desk: 650, home: 950 },
  { code: "59", name: "Aflou", desk: 450, home: 700 },
  { code: "60", name: "Barika", desk: 400, home: 650 },
  { code: "61", name: "El Kantara", desk: 450, home: 700 },
  { code: "62", name: "El Abiodh Sidi Cheikh", desk: 600, home: 900 },
  { code: "63", name: "Bou Saâda", desk: 450, home: 700 },
  { code: "64", name: "Messaad", desk: 450, home: 700 },
  { code: "65", name: "Aïn Oussara", desk: 400, home: 650 },
  { code: "66", name: "Bir El Ater", desk: 500, home: 750 },
  { code: "67", name: "Ksar Chellala", desk: 450, home: 700 },
  { code: "68", name: "Ksar El Boukhari", desk: 350, home: 550 },
  { code: "69", name: "El Aricha", desk: 500, home: 750 },
];

interface ShippingRateAndProfitSimulatorProps {
  selectedWilayaId: string;
  onWilayaChange: (wilayaId: string) => void;
}

export const ShippingRateAndProfitSimulator: React.FC<ShippingRateAndProfitSimulatorProps> = ({
  selectedWilayaId,
  onWilayaChange,
}) => {
  const { t } = useTranslation();
  const [productPrice, setProductPrice] = useState<number>(4500);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(10000);
  const [savingConfig, setSavingConfig] = useState(false);

  const currentWilaya =
    ALGERIA_69_WILAYAS_RATES.find((w) => w.code === selectedWilayaId) || ALGERIA_69_WILAYAS_RATES[15];

  const isFreeShipping = productPrice >= freeShippingThreshold && freeShippingThreshold > 0;
  const totalCodHome = productPrice + (isFreeShipping ? 0 : currentWilaya.home);
  const netSellerHome = isFreeShipping ? Math.max(0, productPrice - currentWilaya.home) : productPrice;

  const handleSaveShippingPolicy = async () => {
    setSavingConfig(true);
    try {
      await apiPut("/api/v1/seller/profile/shipping", {
        shippingConfig: {
          freeShippingThresholdDZD: freeShippingThreshold,
          defaultOriginWilaya: selectedWilayaId,
          updatedAt: new Date().toISOString(),
        },
      });
      toast.success(t("Politique de livraison boutique sauvegardée !"));
    } catch {
      toast.error(t("Impossible d'enregistrer la politique de livraison."));
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#E99856]/15 text-[#E99856] rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#1A1836]">{t("Grille Tarifaire (69 Wilayas)")}</h3>
            <p className="text-xs text-zinc-500">{t("Tarifs Stop Desk & Domicile en Algérie")}</p>
          </div>
        </div>

        <select
          value={selectedWilayaId}
          onChange={(e) => onWilayaChange(e.target.value)}
          aria-label={t("Sélectionner une wilaya")}
          className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-xs font-bold text-[#1A1836] focus:outline-none focus:border-[#A54055]"
        >
          {ALGERIA_69_WILAYAS_RATES.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} - {w.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-[#FAF7F8] rounded-2xl border border-[#E0B4B2]/40 text-center space-y-1">
            <p className="text-[11px] font-bold text-zinc-500 uppercase">{t("Stop Desk")}</p>
            <p className="text-lg font-extrabold text-[#1A1836] tabular-nums">{formatPrice(currentWilaya.desk)}</p>
            <p className="text-[10px] text-emerald-700 font-semibold">{t("Point Relais")}</p>
          </div>

          <div className="p-3.5 bg-[#E99856]/10 rounded-2xl border border-[#E99856]/30 text-center space-y-1">
            <p className="text-[11px] font-bold text-[#622347] uppercase">{t("À Domicile")}</p>
            <p className="text-lg font-extrabold text-[#1A1836] tabular-nums">{formatPrice(currentWilaya.home)}</p>
            <p className="text-[10px] text-[#A54055] font-semibold">{t("Livraison directe")}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#A54055]/10 text-[#A54055] rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#1A1836]">{t("Simulateur Net COD & Franco")}</h3>
            <p className="text-xs text-zinc-500">{t("Estimez le montant encaissé à la livraison")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
              {t("Prix de vente article (DZD)")}
            </label>
            <input
              type="number"
              min={0}
              value={productPrice}
              onChange={(e) => setProductPrice(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-xl text-xs font-bold text-[#1A1836] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
              {t("Seuil Livraison Gratuite (0 = Désactivé)")}
            </label>
            <input
              type="number"
              min={0}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-xl text-xs font-bold text-[#1A1836] outline-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1A1836] text-white space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#E0B4B2]">{t("Total COD Client (Domicile) :")}</span>
              <span className="font-extrabold text-[#E99856] tabular-nums">{formatPrice(totalCodHome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#E0B4B2]">{t("Net Vendeur après port :")}</span>
              <span className="font-extrabold text-emerald-400 tabular-nums">{formatPrice(netSellerHome)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveShippingPolicy}
            disabled={savingConfig}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1A1836] to-[#622347] text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer border-none"
          >
            <Save className="w-4 h-4 text-[#E99856]" />
            <span>{savingConfig ? t("Enregistrement...") : t("Sauvegarder le seuil Franco")}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-3xl p-5 space-y-2.5">
        <div className="flex items-center gap-2 text-[#1A1836] font-extrabold text-xs uppercase">
          <Info className="w-4 h-4 text-[#A54055]" />
          <span>{t("shipping_protocol_title")}</span>
        </div>
        <ul className="text-xs text-zinc-600 space-y-1.5 leading-relaxed list-disc ps-4">
          <li>{t("shipping_protocol_rule1")}</li>
          <li>{t("shipping_protocol_rule2")}</li>
          <li>{t("shipping_protocol_rule3")}</li>
        </ul>
      </div>
    </div>
  );
};
