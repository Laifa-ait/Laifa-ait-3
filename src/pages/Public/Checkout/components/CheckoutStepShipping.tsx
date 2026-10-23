import React from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { CheckoutDeliveryMethods } from "./CheckoutDeliveryMethods";
import { CheckoutLocationSelector } from "./CheckoutLocationSelector";
import { ShippingLocation } from "../../../../services/shippingClient";

interface CheckoutStepShippingProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  isStep1Completed: boolean;
  isStep2Completed: boolean;
  isValidPhone: boolean;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    wilaya: string;
    daira?: string;
    commune: string;
    address: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
      wilaya: string;
      daira?: string;
      commune: string;
      address: string;
    }>
  >;
  deliveryMethod: "domicile" | "stopdesk";
  setDeliveryMethod: (method: "domicile" | "stopdesk") => void;
  selectedAgency: string;
  setSelectedAgency: (agency: string) => void;
  availableCommunes?: string[];
  availableCenters: string[];
  shippingData?: { wilayas: ShippingLocation[] };
}

export const CheckoutStepShipping: React.FC<CheckoutStepShippingProps> = ({
  activeAccordion,
  setActiveAccordion,
  isStep1Completed,
  isStep2Completed,
  isValidPhone,
  formData,
  setFormData,
  deliveryMethod,
  setDeliveryMethod,
  selectedAgency,
  setSelectedAgency,
  availableCommunes,
  availableCenters,
  shippingData,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <div
      className={`surface-card p-5 sm:p-8 ${
        activeAccordion === 2 ? "" : "opacity-80"
      } transition-opacity duration-300`}
      id="checkout-step-shipping-card"
    >
      <button
        onClick={() => {
          if (isValidPhone && formData.fullName.trim()) setActiveAccordion(2);
        }}
        className="w-full flex items-center justify-between text-start bg-transparent border-none outline-none cursor-pointer"
        type="button"
        id="btn-shipping-accordion-trigger"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
              activeAccordion === 2
                ? "bg-zinc-950 text-white shadow-md scale-105 border border-zinc-950"
                : isStep2Completed && isStep1Completed
                ? "bg-emerald-500 text-white border border-emerald-500"
                : "border-2 border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            }`}
          >
            {isStep2Completed && isStep1Completed && activeAccordion !== 2 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "2"
            )}
          </div>
          <h3 className="text-base sm:text-xl font-sans font-bold text-zinc-900">
            {t("checkout.shipping", isAr ? "معلومات الشحن (الوجهة)" : "Expédition (Où ?)")}
          </h3>
        </div>
      </button>

      <AnimatePresence>
        {activeAccordion === 2 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            id="shipping-form-container"
          >
            <div className="pt-6 space-y-6">
              <CheckoutLocationSelector
                wilaya={formData.wilaya}
                daira={formData.daira}
                commune={formData.commune}
                setFormData={setFormData}
                availableCommunes={availableCommunes}
                shippingData={shippingData}
              />

              <CheckoutDeliveryMethods
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
                selectedAgency={selectedAgency}
                setSelectedAgency={setSelectedAgency}
                wilaya={formData.wilaya}
                availableCenters={availableCenters}
              />

              <div className="space-y-2">
                <label
                  htmlFor="landmark"
                  className="text-xs font-sans font-bold text-zinc-700 ms-1 block"
                >
                  {deliveryMethod === "stopdesk"
                    ? t(
                        "checkout.landmark_stopdesk",
                        isAr ? "تعليمات إضافية لمكتب الاستلام (اختياري)" : "Consignes complémentaires (facultatif)"
                      )
                    : t(
                        "checkout.landmark_home",
                        isAr ? "العنوان الدقيق ومعلم قريب" : "Adresse exacte & Repères"
                      )} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="landmark"
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder={
                    deliveryMethod === "stopdesk"
                      ? t(
                          "checkout.placeholder_stopdesk",
                          isAr
                            ? "ملاحظات إضافية لتسهيل استلام الطرد في المكتب..."
                            : "Consignes utiles pour l'agence ou la récupération du colis..."
                        )
                      : t(
                          "checkout.placeholder_home",
                          isAr
                            ? "رقم المنزل/العمارة، اسم الشارع، الحي، أو معلم معروف (مثال: مقابل الصيدلية)..."
                            : "N° de maison/bâtiment, nom de rue, quartier, repère connu (ex: face à la pharmacie)..."
                        )
                  }
                  className="w-full px-4 py-3 bg-zinc-50/70 border border-zinc-200 rounded-xl outline-none font-semibold text-xs sm:text-sm text-zinc-900 resize-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  if (!formData.wilaya) {
                    toast.error(
                      t("checkout.select_wilaya", isAr ? "يرجى اختيار الولاية." : "Veuillez sélectionner votre wilaya.")
                    );
                    return;
                  }
                  if (!formData.commune || formData.commune === "Autre") {
                    toast.error(
                      t("checkout.select_commune", isAr ? "يرجى تحديد البلدية." : "Veuillez choisir votre commune.")
                    );
                    return;
                  }
                  if (deliveryMethod === "stopdesk" && !selectedAgency) {
                    toast.error(
                      t(
                        "checkout.select_agency_error",
                        isAr
                          ? "يرجى اختيار مكتب الاستلام (StopDesk)."
                          : "Veuillez sélectionner un bureau de retrait pour la livraison en agence."
                      )
                    );
                    return;
                  }
                  if (!formData.address.trim()) {
                    toast.error(
                      t(
                        "checkout.invalid_commune_landmark",
                        isAr ? "يرجى كتابة العنوان أو معلم قريب للتسليم." : "Veuillez préciser votre adresse ou un repère connu."
                      )
                    );
                    return;
                  }
                  setActiveAccordion(3);
                }}
                className="btn-ghost-teal w-full sm:w-auto mt-2"
                type="button"
                id="btn-shipping-continue"
              >
                {t("checkout.continue_validation", isAr ? "متابعة لتأكيد المعلومات" : "Passer à la validation")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
