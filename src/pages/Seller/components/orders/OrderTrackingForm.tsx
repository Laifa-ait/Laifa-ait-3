import React, { useState } from "react";
import { Truck, Store, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OrderTrackingFormProps {
  carrier: string;
  setCarrier: (val: string) => void;
  trackingNumber: string;
  setTrackingNumber: (val: string) => void;
  trackingLink: string;
  setTrackingLink: (val: string) => void;
  savingTracking: boolean;
  onSaveTracking: (overrideData?: { deliveryMethod: "self_delivery" | "carrier"; carrierName?: string; note?: string }) => void;
}

export const OrderTrackingForm: React.FC<OrderTrackingFormProps> = ({
  carrier,
  setCarrier,
  trackingNumber,
  setTrackingNumber,
  trackingLink,
  setTrackingLink,
  savingTracking,
  onSaveTracking,
}) => {
  const { t } = useTranslation();
  const [deliveryMode, setDeliveryMode] = useState<"self_delivery" | "carrier">(
    carrier === "LIVRAISON DIRECTE / PROPRE" || carrier === "self_delivery" ? "self_delivery" : "carrier"
  );
  const [courierNote, setCourierNote] = useState("");

  const handleModeChange = (mode: "self_delivery" | "carrier") => {
    setDeliveryMode(mode);
    if (mode === "self_delivery") {
      setCarrier("LIVRAISON DIRECTE / PROPRE");
    } else if (carrier === "LIVRAISON DIRECTE / PROPRE") {
      setCarrier("");
    }
  };

  const handleSubmit = () => {
    if (deliveryMode === "self_delivery") {
      onSaveTracking({
        deliveryMethod: "self_delivery",
        carrierName: "LIVRAISON DIRECTE / PROPRE",
        note: courierNote,
      });
    } else {
      onSaveTracking({
        deliveryMethod: "carrier",
        carrierName: carrier,
      });
    }
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 space-y-4 text-start">
      <div className="text-start">
        <h4 className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-widest rtl:tracking-normal flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-600 shrink-0" />
          {t("Mode de Livraison & Suivi Commandes")}
        </h4>
        <p className="text-[10px] text-zinc-500 font-medium mt-1">
          {t("Choisissez entre la livraison directe par votre propre livreur (sans tracking requis) ou un transporteur national.")}
        </p>
      </div>

      {/* Delivery Mode Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200/60 rounded-xl">
        <button
          type="button"
          onClick={() => handleModeChange("self_delivery")}
          className={`py-2 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            deliveryMode === "self_delivery"
              ? "bg-white text-orange-600 shadow-sm font-black"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Store className="w-3.5 h-3.5 shrink-0" />
          <span>{t("Livraison Directe Boutique")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("carrier")}
          className={`py-2 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            deliveryMode === "carrier"
              ? "bg-white text-orange-600 shadow-sm font-black"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>{t("Transporteur National")}</span>
        </button>
      </div>

      {deliveryMode === "self_delivery" ? (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-orange-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
            <UserCheck className="w-4 h-4 text-orange-600" />
            <span>{t("Livraison en propre par votre boutique (Self-Delivery)")}</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            {t("Aucun numéro de suivi n'est obligatoire pour la livraison directe. Vous pouvez indiquer les coordonnées de votre livreur pour le client.")}
          </p>

          <div>
            <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
              {t("Numéro ou Code interne de reçu (Optionnel)")}
            </label>
            <input
              type="text"
              placeholder="Ex: LIV-31082"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
              {t("Note / Téléphone du Livreur (Optionnel)")}
            </label>
            <input
              type="text"
              placeholder="Ex: Livreur Ahmed: 0550123456"
              value={courierNote}
              onChange={(e) => setCourierNote(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
              {t("Nom du Transporteur")} *
            </label>
            <input
              type="text"
              placeholder="Ex: Yassir, ZR Express, Mayestro, Kazitour..."
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
              {t("Numéro d'expédition")} *
            </label>
            <input
              type="text"
              placeholder="Ex: YS-23194B"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
              {t("Lien Web de Suivi (Optionnel)")}
            </label>
            <input
              type="url"
              placeholder="Ex: https://tracking.yassir.com/shipment/YS-23194B"
              value={trackingLink}
              onChange={(e) => setTrackingLink(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={savingTracking}
        onClick={handleSubmit}
        className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 text-white font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
      >
        {savingTracking ? (
          <>
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{t("Enregistrement...")}</span>
          </>
        ) : (
          <span>{t("Enregistrer les Détails de Livraison")}</span>
        )}
      </button>
    </div>
  );
};
