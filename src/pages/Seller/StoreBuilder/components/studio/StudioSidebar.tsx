import React from "react";
import {
  Layers,
  FileText,
  Palette,
  Image as ImageIcon,
  Settings,
  Store,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import { StudioNavMode } from "./studio.types";

interface StudioSidebarProps {
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
}

const CREATION_ITEMS: Array<{ id: StudioNavMode; label: string; icon: React.ElementType }> = [
  { id: "sections", label: "Sections", icon: Layers },
  { id: "theme", label: "Thème", icon: Palette },
  { id: "identity", label: "Identité", icon: Store },
  { id: "pages", label: "Pages", icon: FileText },
];

const MANAGEMENT_ITEMS: Array<{ id: StudioNavMode; label: string; icon: React.ElementType }> = [
  { id: "catalog", label: "Catalogue", icon: ShoppingBag },
  { id: "orders", label: "Commandes", icon: ClipboardList },
  { id: "media", label: "Médias", icon: ImageIcon },
  { id: "settings", label: "Réglages", icon: Settings },
];

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  navMode,
  onSelectNavMode,
}) => {
  const renderButton = (item: { id: StudioNavMode; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = navMode === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelectNavMode(item.id)}
        className={`h-9 px-2.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer truncate ${
          isActive
            ? "bg-[#023859] text-white border border-[#023859] shadow-2xs font-bold"
            : "bg-[#F9FAFB] text-[#344054] hover:bg-[#F0F7FA] hover:text-[#023859] border border-[#E5E7EB]"
        }`}
      >
        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-[#023859]"}`} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-full bg-[#FFFFFF] flex flex-col shrink-0 select-none">
      <div className="p-3 space-y-2.5">
        <div>
          <span className="block text-[10px] font-bold uppercase text-[#667085] tracking-wider mb-1.5 px-0.5">
            Design & Vitrine
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {CREATION_ITEMS.map(renderButton)}
          </div>
        </div>

        <div>
          <span className="block text-[10px] font-bold uppercase text-[#667085] tracking-wider mb-1.5 px-0.5">
            Boutique & Activité
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {MANAGEMENT_ITEMS.map(renderButton)}
          </div>
        </div>
      </div>
    </aside>
  );
};
