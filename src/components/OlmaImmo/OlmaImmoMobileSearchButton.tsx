import React from "react";
import { Search } from "lucide-react";

export const OlmaImmoMobileSearchButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="sm:hidden w-full h-[58px] px-5 rounded-full bg-white border border-[var(--olma-border-default)] shadow-[var(--olma-shadow-card)] inline-flex items-center justify-center gap-3 text-[15px] font-semibold text-[var(--olma-text-primary)] active:scale-[0.99] transition-transform"
    aria-label="Commencer ma recherche immobilière"
  >
    <Search className="w-5 h-5 text-[var(--olma-brand-primary)]" />
    Commencer ma recherche
  </button>
);
