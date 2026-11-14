import React from "react";
import { Monitor, Tablet, Smartphone, RotateCcw } from "lucide-react";
import { CATEGORY_LAYOUT_OPTIONS } from "../../../constants/categoryCanvaOptions";
import { CategoryDeviceViewport, CategoryDeviceProfile } from "../../../constants/categoryPresetTypes";

interface CategoryDeviceSelectorBarProps {
  activeDevice: CategoryDeviceViewport;
  desktopLayout: string;
  tabletProfile: CategoryDeviceProfile;
  mobileProfile: CategoryDeviceProfile;
  activeProfile: CategoryDeviceProfile;
  onSelectDevice: (device: CategoryDeviceViewport) => void;
  onResetToPc: () => void;
}

const DEVICE_TABS: Array<{ id: CategoryDeviceViewport; label: string; icon: typeof Monitor }> = [
  { id: "desktop", label: "PC", icon: Monitor },
  { id: "tablet", label: "Tablette", icon: Tablet },
  { id: "mobile", label: "Téléphone", icon: Smartphone },
];

export const CategoryDeviceSelectorBar: React.FC<CategoryDeviceSelectorBarProps> = ({
  activeDevice,
  desktopLayout,
  tabletProfile,
  mobileProfile,
  activeProfile,
  onSelectDevice,
  onResetToPc,
}) => {
  const canReset =
    activeDevice !== "desktop" &&
    (activeProfile.hasCustomLayout || activeProfile.hasCustomCardSize || activeProfile.hasCustomAspectRatio);

  return (
    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
          Design par Appareil (PC, Tablette, Mobile)
        </span>
        {canReset && (
          <button
            type="button"
            onClick={onResetToPc}
            className="text-[9.5px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Hériter du PC</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {DEVICE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeDevice === tab.id;
          const isCustom =
            tab.id === "tablet"
              ? tabletProfile.hasCustomLayout || tabletProfile.hasCustomCardSize
              : tab.id === "mobile"
              ? mobileProfile.hasCustomLayout || mobileProfile.hasCustomCardSize
              : false;
          const resolvedLayoutId =
            tab.id === "desktop"
              ? desktopLayout
              : tab.id === "tablet"
              ? tabletProfile.layout
              : mobileProfile.layout;
          const layoutName =
            CATEGORY_LAYOUT_OPTIONS.find((o) => o.id === resolvedLayoutId)?.label || "Grille";

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectDevice(tab.id)}
              className={`py-2 px-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                isSelected
                  ? "border-[#023859] bg-[#023859] text-white shadow-2xs"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-1 text-[10px] font-extrabold">
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </span>
                {tab.id !== "desktop" && (
                  <span
                    className={`text-[8px] font-bold px-1 rounded ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : isCustom
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isCustom ? "Dédié" : "Auto"}
                  </span>
                )}
              </div>
              <span className={`text-[9px] truncate ${isSelected ? "text-white/85" : "text-slate-500"}`}>
                {layoutName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
