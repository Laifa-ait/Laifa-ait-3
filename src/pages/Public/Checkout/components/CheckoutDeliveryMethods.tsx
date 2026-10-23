import React from "react";
import { Check, Truck, Package, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface CheckoutDeliveryMethodsProps {
  deliveryMethod: "domicile" | "stopdesk";
  setDeliveryMethod: (method: "domicile" | "stopdesk") => void;
  selectedAgency: string;
  setSelectedAgency: (agency: string) => void;
  wilaya: string;
  availableCenters: string[];
}

export const CheckoutDeliveryMethods: React.FC<CheckoutDeliveryMethodsProps> = ({
  deliveryMethod,
  setDeliveryMethod,
  selectedAgency,
  setSelectedAgency,
  wilaya: _wilaya,
  availableCenters,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  const fallbackCenters = [
    "Bureau Principal Chef-lieu",
    "Hub Logistique Express",
    "Point Relais Colis StopDesk",
  ];
  const centersToDisplay =
    availableCenters && availableCenters.length > 0
      ? availableCenters
      : fallbackCenters;

  const getAgencyLabel = (agency: string) => {
    if (agency === "Bureau Principal Chef-lieu") {
      return t("checkout.agency_hub_main", isAr ? "المكتب الرئيسي (مقر الولاية)" : "Bureau Principal Chef-lieu");
    }
    if (agency === "Hub Logistique Express") {
      return t("checkout.agency_hub_express", isAr ? "مركز التوزيع السريع" : "Hub Logistique Express");
    }
    if (agency === "Point Relais Colis StopDesk") {
      return t("checkout.agency_hub_relais", isAr ? "نقطة استلام الطرود (Stop-Desk)" : "Point Relais Colis StopDesk");
    }
    return agency;
  };

  return (
    <div className="space-y-4" id="checkout-delivery-methods">
      <div className="space-y-2 pt-1">
        <label className="text-xs font-sans font-bold text-zinc-600 tracking-wider ms-1 block">
          {t("checkout.delivery_mode", isAr ? "طريقة التوصيل" : "Mode de livraison")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeliveryMethod("domicile")}
            className={`p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden active:scale-[0.99] ${
              deliveryMethod === "domicile"
                ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs"
                : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50"
            }`}
          >
            <div className="flex justify-between items-start w-full mb-2">
              <span
                className={`p-2 rounded-xl ${
                  deliveryMethod === "domicile"
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                <Truck className="w-5 h-5" />
              </span>
              {deliveryMethod === "domicile" && (
                <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-950">
                {t("checkout.domicile_title", isAr ? "إلى باب المنزل" : "À Domicile")} 🚚
              </h4>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5 leading-snug">
                {t("checkout.domicile_sub", isAr ? "تسليم باليد في عنوانكم مباشرة" : "Remise en main propre à votre adresse")}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryMethod("stopdesk")}
            className={`p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden active:scale-[0.99] ${
              deliveryMethod === "stopdesk"
                ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs"
                : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50"
            }`}
          >
            <div className="flex justify-between items-start w-full mb-2">
              <span
                className={`p-2 rounded-xl ${
                  deliveryMethod === "stopdesk"
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                <Package className="w-5 h-5" />
              </span>
              {deliveryMethod === "stopdesk" && (
                <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-950">
                {t("checkout.stopdesk_title", isAr ? "نقطة استلام (Stop-Desk)" : "Point Relais (Stop-Desk)")} 📦
              </h4>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5 leading-snug">
                {t("checkout.stopdesk_sub", isAr ? "سعر اقتصادي، استلام من أقرب مكتب وكالة" : "Tarif économique, retrait en agence relais")}
              </p>
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {deliveryMethod === "stopdesk" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3 p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60"
          >
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900 tracking-wider">
                  {t("checkout.agency_selection", isAr ? "اختيار مكتب الاستلام" : "Sélection du Bureau de Retrait")}
                </h4>
                <p className="text-[11px] text-zinc-600 leading-normal mt-0.5">
                  {t(
                    "checkout.agency_desc",
                    isAr
                      ? "اختر مكتب الاستلام الأقرب إليك. ستصلك رسالة SMS فور وصول الطرد."
                      : "Choisissez votre bureau de retrait. Vous recevrez un SMS dès l'arrivée du colis."
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <select
                id="selectedAgency"
                value={selectedAgency || centersToDisplay[0]}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-zinc-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl outline-none font-semibold text-xs sm:text-sm text-zinc-900 cursor-pointer transition-all"
              >
                {centersToDisplay.map((agency) => (
                  <option key={agency} value={agency}>
                    {getAgencyLabel(agency)}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
