import React from "react";
import { Phone, MessageSquare } from "lucide-react";
import { formatPriceDZD } from "../../domains/auto/auto.utils";

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-950 tabular-nums truncate">
            {formatPriceDZD(price)}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            {priceTypeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenContact}
            className="py-2.5 px-3.5 bg-[#D9F66F] hover:bg-[#C5E94F] active:bg-[#B3DA3B] text-[#0B1730] text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Phone className="w-4 h-4 text-[#0B1730]" />
            <span>Contacter</span>
          </button>
          <button
            type="button"
            onClick={onOpenContact}
            className="py-2.5 px-3.5 bg-[#172B4D] hover:bg-[#23416A] active:bg-[#0B1730] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4 text-[#D9F66F]" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
