import React from "react";
import { Phone, MessageSquare } from "lucide-react";
import { formatPriceDZD, formatPriceMillions } from "../../domains/auto/auto.utils";

export interface StickyContactBarProps {
  price: number;
  priceTypeLabel: string;
  onOpenContact: () => void;
}

export const StickyContactBar: React.FC<StickyContactBarProps> = ({
  price,
  priceTypeLabel,
  onOpenContact,
}) => {
  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="min-w-0 tabular-nums">
          <div className="text-base font-black text-slate-900 truncate">
            {formatPriceMillions(price)}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 block truncate">
            {formatPriceDZD(price)} · {priceTypeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenContact}
            className="h-11 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none"
          >
            <Phone className="w-4 h-4 text-white" />
            <span>Appeler</span>
          </button>
          <button
            type="button"
            onClick={onOpenContact}
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
