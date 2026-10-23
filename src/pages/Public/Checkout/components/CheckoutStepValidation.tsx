import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface CheckoutStepValidationProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    wilaya: string;
    daira?: string;
    commune: string;
    address: string;
  };
  deliveryMethod: "domicile" | "stopdesk";
  selectedAgency: string;
  isDeliveryInfoConfirmed: boolean;
  setIsDeliveryInfoConfirmed: (confirmed: boolean) => void;
  handleConfirmDeliveryInfo: () => Promise<void>;
  isSubmitting: boolean;
}

export const CheckoutStepValidation: React.FC<CheckoutStepValidationProps> = ({
  activeAccordion,
  setActiveAccordion,
  formData,
  deliveryMethod,
  selectedAgency,
  isDeliveryInfoConfirmed,
  setIsDeliveryInfoConfirmed,
  handleConfirmDeliveryInfo,
  isSubmitting,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <div
      className={`surface-card p-5 sm:p-8 ${
        activeAccordion === 3 ? "" : "opacity-80"
      } transition-opacity duration-300`}
      id="checkout-step-validation-card"
    >
      <button
        onClick={() => {
          if (formData.wilaya && formData.commune && formData.address) {
            setActiveAccordion(3);
          }
        }}
        className="w-full flex items-center justify-between text-start bg-transparent border-none outline-none cursor-pointer"
        type="button"
        id="btn-validation-accordion-trigger"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
              activeAccordion === 3
                ? "bg-zinc-950 text-white shadow-md scale-105 border border-zinc-950"
                : isDeliveryInfoConfirmed
                ? "bg-emerald-500 text-white border border-emerald-500"
                : "border-2 border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            }`}
          >
            {isDeliveryInfoConfirmed ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "3"
            )}
          </div>
          <h3 className="text-base sm:text-xl font-sans font-bold text-zinc-900">
            {t("checkout.review_and_pay", isAr ? "تأكيد ومراجعة المعلومات" : "Validation des informations")}
          </h3>
        </div>
      </button>

      <AnimatePresence>
        {activeAccordion === 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-5 overflow-hidden"
            id="validation-form-container"
          >
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-200/80 shadow-2xs space-y-3.5">
              <h4 className="font-bold text-xs font-sans text-zinc-900 tracking-wide">
                {t("checkout.delivery_info", isAr ? "بيانات ومعلومات التوصيل" : "Vos Informations de Livraison")}
              </h4>
              <div className="text-xs sm:text-sm font-medium text-zinc-600 space-y-2.5 divide-y divide-zinc-100">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 pt-1">
                  <span className="font-bold text-zinc-900 min-w-[85px] shrink-0">
                    {t("checkout.client", isAr ? "الزبون:" : "Client :")}
                  </span>
                  <span className="break-words font-semibold text-zinc-950">
                    {formData.fullName} <span className="text-zinc-500 font-normal">({formData.phone})</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 pt-2.5">
                  <span className="font-bold text-zinc-900 min-w-[85px] shrink-0">
                    {t("checkout.destination", isAr ? "الوجهة:" : "Destination :")}
                  </span>
                  <span className="break-words font-semibold text-zinc-950">
                    {formData.wilaya} {formData.daira ? `• ${formData.daira}` : ""} • {formData.commune}
                  </span>
                </div>

                {deliveryMethod === "stopdesk" ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 pt-2.5">
                      <span className="font-bold text-zinc-900 min-w-[85px] shrink-0">
                        {t("checkout.agency", isAr ? "مكتب الاستلام:" : "Bureau :")}
                      </span>
                      <span className="font-sans font-bold text-amber-900 break-words bg-amber-50 px-2 py-0.5 rounded-md text-xs border border-amber-200/80 w-fit">
                        {selectedAgency || (isAr ? "المكتب الرئيسي" : "Point Relais Principal")}
                      </span>
                    </div>
                    {formData.address && (
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 pt-2.5">
                        <span className="font-bold text-zinc-900 min-w-[85px] shrink-0">
                          {t("checkout.reference", isAr ? "ملاحظة الاستلام:" : "Consigne :")}
                        </span>
                        <span className="break-words text-zinc-600">
                          {formData.address}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 pt-2.5">
                    <span className="font-bold text-zinc-900 min-w-[85px] shrink-0">
                      {t("checkout.reference", isAr ? "العنوان والمعلم:" : "Repère :")}
                    </span>
                    <span className="break-words text-zinc-700 font-medium">
                      {formData.address}
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-2.5">
                  <span className="font-bold text-zinc-900 min-w-[85px] shrink-0">
                    {t("checkout.mode", isAr ? "نوع التوصيل:" : "Mode :")}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-bold tracking-wide w-fit ${
                      deliveryMethod === "stopdesk"
                        ? "bg-amber-100 text-amber-950 border border-amber-200"
                        : "bg-zinc-900 text-white"
                    }`}
                  >
                    {deliveryMethod === "stopdesk"
                      ? t("checkout.stopdesk", isAr ? "استلام من مكتب StopDesk 📦" : "Point Relais StopDesk 📦")
                      : t("checkout.door_delivery", isAr ? "توصيل لباب المنزل 🚚" : "Livraison À Domicile 🚚")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-6 border border-emerald-200/70 flex gap-3.5 items-start text-emerald-950">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-emerald-950">
                  {t("checkout.pay_on_delivery", isAr ? "دفع عند الاستلام مضمون 🤝" : "Paiement à la livraison garanti 🤝")}
                </h4>
                <p className="text-[11px] sm:text-xs font-medium text-emerald-800/90 leading-relaxed">
                  {t(
                    "checkout.pay_on_delivery_desc",
                    isAr
                      ? "لن تدفع أي شيء إلا بعد معاينة واستلام طردك نقداً (Cash on Delivery). تفقد الطرد مباشرة مع الموزع."
                      : "Vous ne payez qu'à la réception de votre commande en espèces (Cash on Delivery). Vérifiez le contenu du colis directement avec le livreur."
                  )}
                </p>

                <div className="mt-4 pt-3.5 border-t border-emerald-200/60">
                  {isDeliveryInfoConfirmed ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-emerald-100/70 border border-emerald-300/80 p-3 rounded-xl text-emerald-950 text-xs font-bold w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          {t(
                            "checkout.delivery_info_confirmed_status",
                            isAr ? "تم حفظ وتأكيد بيانات التوصيل بنجاح ✓" : "Informations de livraison enregistrées avec succès ✓"
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsDeliveryInfoConfirmed(false)}
                        className="text-[11px] text-zinc-600 hover:text-zinc-950 underline underline-offset-2 tracking-wide shrink-0 transition-colors bg-transparent border-none cursor-pointer font-bold"
                        type="button"
                        id="btn-modify-delivery-info"
                      >
                        {t("checkout.modify_info", isAr ? "تعديل" : "Modifier")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmDeliveryInfo}
                      disabled={isSubmitting}
                      className="w-full min-h-[48px] py-3 px-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-60 cursor-pointer shadow-sm active:scale-98 text-center"
                      type="button"
                      id="btn-confirm-personal-info"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>
                            {t("checkout.saving_info", isAr ? "جاري الحفظ والتأكيد..." : "Validation en cours...")}
                          </span>
                        </>
                      ) : (
                        <span>
                          {t(
                            "checkout.confirm_info_button_v2",
                            isAr ? "تأكيد معلومات التوصيل" : "Valider mes informations de livraison"
                          )}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
