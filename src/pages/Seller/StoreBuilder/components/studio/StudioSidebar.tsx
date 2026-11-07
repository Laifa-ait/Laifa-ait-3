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
  Rocket,
  PanelTop,
  Sparkles,
} from "lucide-react";
import { StudioNavMode } from "./studio.types";

interface StudioSidebarProps {
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
}

const CREATION_ITEMS: Array<{ id: StudioNavMode; label: string; icon: React.ElementType }> = [
  { id: "sections", label: "Sections OS 2.0", icon: Layers },
  { id: "atelier", label: "✨ Atelier & Matières", icon: Sparkles },
  { id: "theme", label: "Thème & Styles", icon: Palette },
  { id: "header", label: "En-tête & Menus", icon: PanelTop },
  { id: "identity", label: "Identité", icon: Store },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "media", label: "Médias", icon: ImageIcon },
];

const MANAGEMENT_ITEMS: Array<{ id: StudioNavMode; label: string; icon: React.ElementType }> = [
  { id: "catalog", label: "Catalogue", icon: ShoppingBag },
  { id: "orders", label: "Commandes", icon: ClipboardList },
  { id: "settings", label: "Commerce & Pixels", icon: Settings },
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
        className={`h-8.5 px-2.5 rounded-lg text-[11.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer truncate ${
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

  const isLaunchpad = navMode === "launchpad";

  return (
    <aside className="w-full bg-[#FFFFFF] flex flex-col shrink-0 select-none">
      <div className="p-2.5 space-y-2.5">
        <button
          type="button"
          onClick={() => onSelectNavMode("launchpad")}
          className={`w-full h-9 px-3 rounded-xl text-[12px] font-bold flex items-center justify-between transition-all cursor-pointer border ${
            isLaunchpad
              ? "bg-[#011C40] text-white border-[#011C40] shadow-xs"
              : "bg-gradient-to-r from-[#F0F7FA] to-[#E6F3F8] text-[#011C40] border-[#B8DCE8] hover:border-[#023859]"
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            <Rocket className={`w-3.5 h-3.5 shrink-0 ${isLaunchpad ? "text-[#54ACBF]" : "text-[#023859]"}`} />
            <span className="truncate">Guide Création 3.0</span>
          </span>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
              isLaunchpad ? "bg-[#54ACBF]/25 text-[#A7EBF2]" : "bg-[#023859] text-white"
            }`}
          >
            Setup
          </span>
        </button>

        <div>
          <span className="block text-[10px] font-bold uppercase text-[#667085] tracking-wider mb-1.5 px-0.5">
            Design & Vitrine (OS 2.0)
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {CREATION_ITEMS.map(renderButton)}
          </div>
        </div>

        <div>
          <span className="block text-[10px] font-bold uppercase text-[#667085] tracking-wider mb-1.5 px-0.5">
            Commerce & Exploitation
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {MANAGEMENT_ITEMS.map(renderButton)}
          </div>
        </div>
      </div>
    </aside>
  );
};
