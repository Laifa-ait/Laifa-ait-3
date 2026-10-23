import React from "react";
import { Check, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { User } from "firebase/auth";

interface CheckoutStepIdentityProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  isStep1Completed: boolean;
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
  currentUser: User | null;
}

export const CheckoutStepIdentity: React.FC<CheckoutStepIdentityProps> = ({
  activeAccordion,
  setActiveAccordion,
  isStep1Completed,
  isValidPhone,
  formData,
  setFormData,
  currentUser,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <div className="surface-card p-5 sm:p-8" id="checkout-step-identity-card">
      <button
        onClick={() => setActiveAccordion(1)}
        className="w-full flex items-center justify-between text-start bg-transparent border-none outline-none cursor-pointer"
        type="button"
        id="btn-identity-accordion-trigger"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
              activeAccordion === 1
                ? "bg-zinc-950 text-white shadow-md scale-105 border border-zinc-950"
                : isStep1Completed
                ? "bg-emerald-500 text-white border border-emerald-500"
                : "border-2 border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            }`}
          >
            {isStep1Completed && activeAccordion !== 1 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "1"
            )}
          </div>
          <h3 className="text-base sm:text-xl font-sans font-bold text-zinc-900">
            {t("checkout.identity", isAr ? "معلومات الهوية والاتصال" : "Identité (Qui ?)")}
          </h3>
        </div>
      </button>

      <AnimatePresence>
        {activeAccordion === 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            id="identity-form-container"
          >
            <div className="pt-6 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-xs font-sans font-bold text-zinc-700 ms-1 block"
                >
                  {t("full_name", isAr ? "الاسم واللقب" : "Nom & Prénom")} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder={t("full_name_placeholder", isAr ? "مثال: محمد بن علي" : "Ex: Mohamed Benali")}
                  className="w-full h-12 sm:h-13 px-4 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl outline-none font-semibold text-sm sm:text-base text-zinc-900 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-xs font-sans font-bold text-zinc-700 ms-1 block"
                >
                  {t("phone_number", isAr ? "رقم الهاتف" : "Numéro de téléphone")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder={t("phone_placeholder", isAr ? "مثال: 56 34 12 0550" : "Ex: 0550 12 34 56")}
                    className={`w-full h-12 sm:h-13 px-4 pe-11 rtl:ps-4 rtl:pe-11 bg-zinc-50/70 border rounded-xl outline-none font-semibold text-sm sm:text-base text-zinc-900 transition-all tabular-nums text-start ${
                      isValidPhone
                        ? "border-emerald-500 bg-emerald-50/20 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15"
                        : "border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
                    }`}
                  />
                  {isValidPhone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </motion.div>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 font-medium ms-1">
                  {t(
                    "checkout.phone_helper",
                    isAr
                      ? "سيتصل بك مسؤول التوصيل على هذا الرقم للتأكيد والتسليم."
                      : "Le livreur vous contactera sur ce numéro avant la livraison."
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-sans font-bold text-zinc-700 ms-1 block"
                >
                  {t("email_address", isAr ? "البريد الإلكتروني" : "Adresse E-mail")}{" "}
                  <span className="text-zinc-400 font-normal">
                    ({t("checkout.optional", isAr ? "اختياري" : "facultatif")})
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  disabled={!!currentUser}
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={t("email_placeholder", isAr ? "example@domaine.dz" : "votre@email.com")}
                  className="w-full h-12 sm:h-13 px-4 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl outline-none font-semibold text-sm sm:text-base text-zinc-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <button
                onClick={() => {
                  if (!formData.fullName.trim()) {
                    toast.error(
                      t(
                        "checkout.invalid_name_phone",
                        isAr
                          ? "يرجى كتابة الاسم الكامل ورقم هاتف صالح."
                          : "Veuillez renseigner votre nom complet et un numéro de téléphone valide."
                      )
                    );
                    return;
                  }
                  if (!isValidPhone) {
                    toast.error(
                      t(
                        "invalid_phone_error",
                        isAr
                          ? "رقم هاتف جزائري غير صالح (مثال: 05 أو 06 أو 07)."
                          : "Numéro de téléphone algérien invalide (ex: 05, 06, 07)."
                      )
                    );
                    return;
                  }
                  setActiveAccordion(2);
                }}
                className="btn-ghost-teal w-full sm:w-auto mt-2"
                type="button"
                id="btn-identity-continue"
              >
                {t("checkout.continue_to_shipping", isAr ? "متابعة نحو الشحن" : "Continuer vers la livraison")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
