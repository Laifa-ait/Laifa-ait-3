import React from "react";
import { Image as ImageIcon, Sparkles, Type, MousePointerClick } from "lucide-react";
import { HeroSubElement } from "../../../../../../domains/seller/customPage.types";
import { useStudioStore } from "../../../store/useStudioStore";

interface HeroSubPanelSelectorProps {
  activeSubPanel: HeroSubElement;
  onSelectSubPanel: (panel: HeroSubElement) => void;
}

const SUB_PANELS: Array<{
  id: HeroSubElement;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "background", label: "Fond", icon: ImageIcon },
  { id: "badge", label: "Badge", icon: Sparkles },
  { id: "title", label: "Titre", icon: Type },
  { id: "subtitle", label: "Sous-titre", icon: Type },
  { id: "ctaPrimary", label: "Bouton 1", icon: MousePointerClick },
  { id: "ctaSecondary", label: "Bouton 2", icon: MousePointerClick },
];

export const HeroSubPanelSelector: React.FC<HeroSubPanelSelectorProps> = ({
  activeSubPanel,
  onSelectSubPanel,
}) => {
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectSection = useStudioStore((s) => s.selectSection);

  const normalizedActive = activeSubPanel === "cta" ? "ctaPrimary" : activeSubPanel;

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 mb-3 overflow-x-auto scrollbar-hide">
      {SUB_PANELS.map((sp) => {
        const Icon = sp.icon;
        const isActive = normalizedActive === sp.id;
        return (
          <button
            key={sp.id}
            type="button"
            onClick={() => {
              onSelectSubPanel(sp.id);
              if (selectedSectionId) {
                selectSection(selectedSectionId, sp.id);
              }
            }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
              isActive
                ? "bg-[#F97316] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Icon className="w-3 h-3" />
            <span>{sp.label}</span>
          </button>
        );
      })}
    </div>
  );
};
