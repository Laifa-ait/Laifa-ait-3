import React from "react";
import {
  Layers,
  FileText,
  Palette,
  Image as ImageIcon,
  Settings,
  Store,
} from "lucide-react";
import { StudioNavMode } from "./SectionTreePanel";

interface StudioSidebarProps {
  navMode: StudioNavMode | "identity";
  onSelectNavMode: (mode: StudioNavMode | "identity") => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  navMode,
  onSelectNavMode,
}) => {
  return (
    <aside className="w-full bg-[#FFFFFF] flex flex-col shrink-0 select-none">
      <div className="p-2 sm:p-3 space-y-2">
        <div>
          <span className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#667085] tracking-wider mb-1 px-1">
            Création
          </span>
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-col sm:space-y-1">
            <button
              type="button"
              onClick={() => onSelectNavMode("sections")}
              className={`h-[36px] sm:h-[40px] px-2 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center justify-center sm:justify-start gap-1 transition-colors cursor-pointer truncate ${
                navMode === "sections"
                  ? "bg-[#FFF1E7] text-[#F97316] border border-[#FDBA74]"
                  : "bg-[#F9FAFB] sm:bg-transparent text-[#344054] hover:bg-[#F7F8FA] border border-[#E5E7EB] sm:border-transparent"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span className="truncate">Structure</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNavMode("pages")}
              className={`h-[36px] sm:h-[40px] px-2 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center justify-center sm:justify-start gap-1 transition-colors cursor-pointer truncate ${
                navMode === "pages"
                  ? "bg-[#FFF1E7] text-[#F97316] border border-[#FDBA74]"
                  : "bg-[#F9FAFB] sm:bg-transparent text-[#344054] hover:bg-[#F7F8FA] border border-[#E5E7EB] sm:border-transparent"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span className="truncate">Pages</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNavMode("theme")}
              className={`h-[36px] sm:h-[40px] px-2 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center justify-center sm:justify-start gap-1 transition-colors cursor-pointer truncate ${
                navMode === "theme"
                  ? "bg-[#FFF1E7] text-[#F97316] border border-[#FDBA74]"
                  : "bg-[#F9FAFB] sm:bg-transparent text-[#344054] hover:bg-[#F7F8FA] border border-[#E5E7EB] sm:border-transparent"
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span className="truncate">Thèmes</span>
            </button>
          </div>
        </div>

        <div>
          <span className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#667085] tracking-wider mb-1 px-1">
            Gestion
          </span>
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-col sm:space-y-1">
            <button
              type="button"
              onClick={() => onSelectNavMode("media")}
              className={`h-[36px] sm:h-[40px] px-2 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center justify-center sm:justify-start gap-1 transition-colors cursor-pointer truncate ${
                navMode === "media"
                  ? "bg-[#FFF1E7] text-[#F97316] border border-[#FDBA74]"
                  : "bg-[#F9FAFB] sm:bg-transparent text-[#344054] hover:bg-[#F7F8FA] border border-[#E5E7EB] sm:border-transparent"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span className="truncate">Médias</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNavMode("identity")}
              className={`h-[36px] sm:h-[40px] px-2 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center justify-center sm:justify-start gap-1 transition-colors cursor-pointer truncate ${
                navMode === "identity"
                  ? "bg-[#FFF1E7] text-[#F97316] border border-[#FDBA74]"
                  : "bg-[#F9FAFB] sm:bg-transparent text-[#344054] hover:bg-[#F7F8FA] border border-[#E5E7EB] sm:border-transparent"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span className="truncate">Identité</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNavMode("settings")}
              className={`h-[36px] sm:h-[40px] px-2 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center justify-center sm:justify-start gap-1 transition-colors cursor-pointer truncate ${
                navMode === "settings"
                  ? "bg-[#FFF1E7] text-[#F97316] border border-[#FDBA74]"
                  : "bg-[#F9FAFB] sm:bg-transparent text-[#344054] hover:bg-[#F7F8FA] border border-[#E5E7EB] sm:border-transparent"
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span className="truncate">Réglages</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};


