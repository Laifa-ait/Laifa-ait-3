import React from "react";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/format";

interface CartDrawerFooterProps {
  totalPrice: number;
  onClose: () => void;
}

export const CartDrawerFooter: React.FC<CartDrawerFooterProps> = ({
  totalPrice,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div className="p-4 sm:p-5 border-t border-[#EFE6E6] bg-white space-y-3.5 shadow-[0_-10px_25px_rgba(26,24,54,0.06)] shrink-0 z-30">
      {/* Summary Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-[#6E5A6F] uppercase tracking-wider block">
            {t("Total du panier")}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#622347] mt-0.5">
            <Truck className="w-3.5 h-3.5 text-[#E99856]" />
            <span>{t("Livraison 69 Wilayas")}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-sans font-extrabold text-[#1A1836] tracking-tight tabular-nums block">
            {formatPrice(totalPrice)}
          </span>
          <span className="text-[10px] text-[#9B879C] font-medium block">
            {t("TVA & frais calculés à l'étape suivante")}
          </span>
        </div>
      </div>

      {/* Big Action Checkout Button */}
      <button
        type="button"
        onClick={handleCheckout}
        className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#42164B] via-[#622347] to-[#A54055] hover:from-[#622347] hover:via-[#A54055] hover:to-[#E99856] text-white font-extrabold text-base sm:text-lg shadow-lg shadow-[#622347]/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-between cursor-pointer border-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#E99856]" />
          </div>
          <span className="tracking-tight text-white font-extrabold">
            {t("Commander maintenant")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#E99856] text-[#1A1836] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold tabular-nums shadow-xs">
          <span>{formatPrice(totalPrice)}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
        </div>
      </button>

      {/* Reassurance and Continue Shopping */}
      <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-[#6E5A6F] font-medium">
        <span className="flex items-center gap-1 text-[#42164B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A54055]" />
          <span>{t("Paiement sécurisé à la livraison")}</span>
        </span>

        <button
          type="button"
          onClick={onClose}
          className="text-[#622347] hover:text-[#1A1836] font-semibold underline underline-offset-2 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          {t("Continuer mes achats")}
        </button>
      </div>
    </div>
  );
};
