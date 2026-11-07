import React from "react";
import { Image as ImageIcon, Type, Sparkles, MousePointerClick, AlignLeft } from "lucide-react";
import type { HeroSubElement } from "../../../domains/seller/customPage.types";

interface HeroCanvasSubToolbarProps {
  activeSubElement: HeroSubElement | null;
  activeObjectPosition: string;
  onSelectSubElement: (el: HeroSubElement, e: React.MouseEvent) => void;
}

const SUB_TOOLBAR_ITEMS = [
  { id: "background" as const, label: "Image & Ombre", icon: ImageIcon },
  { id: "badge" as const, label: "Badge", icon: Sparkles },
  { id: "title" as const, label: "Titre", icon: Type },
  { id: "subtitle" as const, label: "Sous-titre", icon: AlignLeft },
  { id: "ctaPrimary" as const, label: "Bouton 1", icon: MousePointerClick },
  { id: "ctaSecondary" as const, label: "Bouton 2", icon: MousePointerClick },
];

export const HeroCanvasSubToolbar: React.FC<HeroCanvasSubToolbarProps> = ({
  activeSubElement,
  activeObjectPosition,
  onSelectSubElement,
}) => {
  return (
    <div
      className="bg-[#F8FBFC] border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] font-bold text-slate-500 pr-1">Éditer :</span>
        {SUB_TOOLBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isAct =
            activeSubElement === item.id ||
            (item.id === "ctaPrimary" && activeSubElement === "cta");
          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => onSelectSubElement(item.id, e)}
              className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                isAct
                  ? "bg-[#023859] text-white border-[#023859] shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-[#011C40]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0 whitespace-nowrap">
        Cadrage : {activeObjectPosition}
      </span>
    </div>
  );
};
