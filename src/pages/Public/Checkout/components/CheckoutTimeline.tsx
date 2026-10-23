import React from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface CheckoutTimelineProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  isStep1Completed: boolean;
  isStep2Completed: boolean;
  onNavigateToCart: () => void;
}

export const CheckoutTimeline: React.FC<CheckoutTimelineProps> = ({
  activeAccordion,
  setActiveAccordion,
  isStep1Completed,
  isStep2Completed,
  onNavigateToCart,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const progressPercentage =
    activeAccordion === 1 ? "33%" : activeAccordion === 2 ? "66%" : "100%";

  return (
    <div className="mt-6 mb-6 max-w-2xl mx-auto px-2 sm:px-4" id="checkout-timeline">
      <div className="flex items-start justify-between relative">
        {/* Progress Line Connector aligned with circle center (top-4 sm:top-5) */}
        <div className="absolute left-6 right-6 sm:left-8 sm:right-8 top-4.5 sm:top-5 -translate-y-1/2 h-0.5 bg-stone-200 z-0">
          <motion.div
            className="h-full bg-amber-500 origin-left rtl:origin-right"
            initial={{ width: "0%" }}
            animate={{ width: progressPercentage }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        </div>

        {/* Step 1: Cart */}
        <button
          onClick={onNavigateToCart}
          className="z-10 flex flex-col items-center group cursor-pointer bg-transparent border-none outline-none max-w-[75px] sm:max-w-none"
          type="button"
          id="timeline-step-cart"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white border-2 sm:border-4 border-white shadow-sm flex items-center justify-center font-bold text-xs sm:text-sm group-hover:scale-105 transition-transform shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 mt-2 text-center truncate w-full">
            {t("checkout.timeline_cart", isAr ? "السلة" : "Panier")}
          </span>
        </button>

        {/* Step 2: Identity */}
        <button
          onClick={() => {
            if (isStep1Completed) setActiveAccordion(1);
          }}
          disabled={!isStep1Completed}
          className="z-10 flex flex-col items-center group disabled:cursor-not-allowed bg-transparent border-none outline-none max-w-[75px] sm:max-w-none"
          type="button"
          id="timeline-step-identity"
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white shadow-sm flex items-center justify-center font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeAccordion === 1
                ? "bg-zinc-950 text-white scale-105 sm:scale-110 ring-2 ring-zinc-950/20"
                : isStep1Completed
                ? "bg-emerald-500 text-white"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {isStep1Completed && activeAccordion !== 1 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "1"
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs font-semibold mt-2 text-center truncate w-full ${
              activeAccordion === 1
                ? "text-zinc-950 font-bold"
                : isStep1Completed
                ? "text-emerald-700"
                : "text-stone-400"
            }`}
          >
            {t("checkout.timeline_identity", isAr ? "الهوية" : "Coordonnées")}
          </span>
        </button>

        {/* Step 3: Shipping */}
        <button
          onClick={() => {
            if (isStep1Completed && isStep2Completed) setActiveAccordion(2);
          }}
          disabled={!isStep1Completed}
          className="z-10 flex flex-col items-center group disabled:cursor-not-allowed bg-transparent border-none outline-none max-w-[75px] sm:max-w-none"
          type="button"
          id="timeline-step-shipping"
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white shadow-sm flex items-center justify-center font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeAccordion === 2
                ? "bg-zinc-950 text-white scale-105 sm:scale-110 ring-2 ring-zinc-950/20"
                : isStep2Completed && isStep1Completed
                ? "bg-emerald-500 text-white"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {isStep2Completed && isStep1Completed && activeAccordion !== 2 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "2"
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs font-semibold mt-2 text-center truncate w-full ${
              activeAccordion === 2
                ? "text-zinc-950 font-bold"
                : isStep2Completed
                ? "text-emerald-700"
                : "text-stone-400"
            }`}
          >
            {t("checkout.timeline_shipping", isAr ? "الشحن" : "Livraison")}
          </span>
        </button>

        {/* Step 4: Review & Pay */}
        <button
          onClick={() => {
            if (isStep1Completed && isStep2Completed) setActiveAccordion(3);
          }}
          disabled={!isStep1Completed || !isStep2Completed}
          className="z-10 flex flex-col items-center group disabled:cursor-not-allowed bg-transparent border-none outline-none max-w-[75px] sm:max-w-none"
          type="button"
          id="timeline-step-validation"
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white shadow-sm flex items-center justify-center font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeAccordion === 3
                ? "bg-zinc-950 text-white scale-105 sm:scale-110 ring-2 ring-zinc-950/20"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            3
          </div>
          <span
            className={`text-[10px] sm:text-xs font-semibold mt-2 text-center truncate w-full ${
              activeAccordion === 3
                ? "text-zinc-950 font-bold"
                : "text-stone-400"
            }`}
          >
            {t("checkout.timeline_validation", isAr ? "التأكيد" : "Validation")}
          </span>
        </button>
      </div>
    </div>
  );
};
