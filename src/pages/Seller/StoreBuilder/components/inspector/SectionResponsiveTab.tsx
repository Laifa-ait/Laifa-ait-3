import React, { useState } from "react";
import { Monitor, Tablet, Smartphone, RotateCcw, EyeOff, CheckCircle2 } from "lucide-react";
import type {
  CustomPageSection, CustomPageSectionStyles, CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";
import {
  resolveResponsiveSectionValues,
  StudioViewportDevice,
  SectionResponsiveConfig,
  DeviceResponsiveOverride,
  ResolvedSectionResponsiveValues,
} from "../../../../../components/Store/sections/responsiveInheritanceHelper";
import { useStudioStore } from "../../store/useStudioStore";

interface SectionResponsiveTabProps {
  section?: CustomPageSection;
  settings: Record<string, unknown>;
  styles?: CustomPageSectionStyles;
  theme?: CustomPageTheme;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onStylesChange?: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
}

const DEVICE_TABS: Array<{
  id: StudioViewportDevice;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "desktop", label: "Ordinateur", sub: "Par défaut", icon: Monitor },
  { id: "tablet", label: "Tablette", sub: "Personnalisé", icon: Tablet },
  { id: "mobile", label: "Mobile", sub: "Personnalisé", icon: Smartphone },
];

export const SectionResponsiveTab: React.FC<SectionResponsiveTabProps> = ({
  section, settings, styles = {}, theme, onSettingsChange, onStylesChange,
}) => {
  const studioViewport = useStudioStore((s) => s.viewport);
  const setStudioViewport = useStudioStore((s) => s.setViewport);
  const [activeDevice, setActiveDevice] = useState<StudioViewportDevice>(studioViewport || "desktop");
  React.useEffect(() => { if (studioViewport) setActiveDevice(studioViewport); }, [studioViewport]);

  const handleSelectDevice = (dev: StudioViewportDevice) => {
    setActiveDevice(dev);
    setStudioViewport(dev);
  };

  const syntheticSection: CustomPageSection = section || {
    id: "preview", type: "hero_banner", title: "", isVisible: true, order: 0,
    settings: settings as CustomPageSection["settings"], styles,
  };
  const isHero = syntheticSection.type === "hero_banner";

  const resolved = resolveResponsiveSectionValues(syntheticSection, theme, activeDevice);
  const responsiveConfig = ((settings.responsive || {}) as SectionResponsiveConfig);
  const currentDeviceOverrides: DeviceResponsiveOverride =
    activeDevice === "tablet" ? responsiveConfig.tablet || {}
    : activeDevice === "mobile" ? responsiveConfig.mobile || {} : {};

  const updateDeviceOverride = (patch: Partial<DeviceResponsiveOverride>) => {
    if (activeDevice === "desktop") {
      const desktopPatch: Record<string, unknown> = {};
      if ("titleFontSizePx" in patch) desktopPatch.titleFontSizePx = patch.titleFontSizePx;
      if ("bodyFontSizePx" in patch) desktopPatch.bodyFontSizePx = patch.bodyFontSizePx;
      if ("textAlignment" in patch) {
        desktopPatch.textAlignment = patch.textAlignment;
        if (isHero) {
          const prevDesk = (settings.heroDesktopConfig as Record<string, unknown> | undefined) || {};
          desktopPatch.heroDesktopConfig = { ...prevDesk, textAlign: patch.textAlignment };
        }
      }
      if ("columns" in patch) desktopPatch.columnsDesktop = patch.columns;
      if ("hidden" in patch) desktopPatch.hideOnDesktop = patch.hidden;
      if (Object.keys(desktopPatch).length > 0) onSettingsChange(desktopPatch);
      if ("paddingY" in patch && onStylesChange) onStylesChange("paddingY", patch.paddingY);
      if ("paddingX" in patch && onStylesChange) onStylesChange("paddingX", patch.paddingX);
      return;
    }

    const nextDeviceObj: DeviceResponsiveOverride = { ...currentDeviceOverrides, ...patch };
    Object.keys(nextDeviceObj).forEach((k) => {
      const key = k as keyof DeviceResponsiveOverride;
      if (nextDeviceObj[key] === undefined) delete nextDeviceObj[key];
    });

    const legacySync: Record<string, unknown> = {};
    if (activeDevice === "mobile" && "hidden" in patch) legacySync.hideOnMobile = Boolean(patch.hidden);
    if (activeDevice === "tablet" && "hidden" in patch) legacySync.hideOnTablet = Boolean(patch.hidden);
    if (isHero && "textAlignment" in patch) {
      const devKey = activeDevice === "mobile" ? "heroMobileConfig" : "heroTabletConfig";
      const prevCfg = (settings[devKey] as Record<string, unknown> | undefined) || {};
      legacySync[devKey] = { ...prevCfg, textAlign: patch.textAlignment };
    }

    onSettingsChange({
      ...legacySync,
      responsive: { ...responsiveConfig, [activeDevice]: nextDeviceObj },
    });
  };

  const clearDeviceOverrides = (device: "tablet" | "mobile") => {
    const nextResponsive: SectionResponsiveConfig = { ...responsiveConfig };
    delete nextResponsive[device];
    const patch: Record<string, unknown> = { responsive: nextResponsive };
    if (device === "mobile") patch.hideOnMobile = false;
    if (device === "tablet") patch.hideOnTablet = false;
    onSettingsChange(patch);
  };

  const hasAnyOverride = activeDevice !== "desktop" && Object.keys(currentDeviceOverrides).length > 0;

  const renderSourceBadge = (field: keyof ResolvedSectionResponsiveValues["inheritanceSource"]) => {
    const src = resolved.inheritanceSource[field];
    if (activeDevice === "desktop") {
      return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Par défaut</span>;
    }
    if (src === activeDevice) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-white">
          <CheckCircle2 className="w-2.5 h-2.5" /> Propre à {activeDevice === "mobile" ? "Mobile" : "Tablette"}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
        Copié ({src === "tablet" ? "Tablette" : "Ordinateur"})
      </span>
    );
  };

  return (
    <div className="space-y-4 select-none" data-testid="section-responsive-tab">
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
        {DEVICE_TABS.map((dev) => {
          const Icon = dev.icon;
          const isAct = activeDevice === dev.id;
          return (
            <button key={dev.id} type="button" data-testid={`responsive-device-${dev.id}`} onClick={() => handleSelectDevice(dev.id)} className={`py-2 px-2 rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${isAct ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900 font-medium"}`}>
              <Icon className="w-4 h-4" />
              <span className="text-[11px] leading-tight">{dev.label}</span>
              <span className="text-[9.5px] opacity-70">{dev.sub}</span>
            </button>
          );
        })}
      </div>

      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-600">
        <span>
          {activeDevice === "desktop"
            ? "Les réglages Ordinateur s'appliquent partout par défaut."
            : `Ajustez ${activeDevice === "mobile" ? "Mobile" : "Tablette"} sans toucher à l'ordinateur.`}
        </span>
        {activeDevice !== "desktop" && hasAnyOverride && (
          <button type="button" data-testid={`reset-overrides-${activeDevice}`} onClick={() => clearDeviceOverrides(activeDevice)} className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium hover:bg-slate-100 cursor-pointer">
            <RotateCcw className="w-3 h-3" /><span>Réinitialiser</span>
          </button>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-200 tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-slate-900">Taille du titre</span>
          <div className="flex items-center gap-1.5">
            {renderSourceBadge("titleFontSizePx")}
            <span className="font-mono text-xs font-semibold text-slate-900" data-testid="resolved-title-size">{resolved.titleFontSizePx}px</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="range" min={18} max={64} step={1} data-testid="responsive-title-size-slider" value={resolved.titleFontSizePx} onChange={(e) => updateDeviceOverride({ titleFontSizePx: Number(e.target.value) })} className="flex-1 accent-slate-900 cursor-pointer" />
          {activeDevice !== "desktop" && currentDeviceOverrides.titleFontSizePx !== undefined && (
            <button type="button" title="Revenir au réglage par défaut" onClick={() => updateDeviceOverride({ titleFontSizePx: undefined })} className="p-1 rounded border border-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer">
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-200 tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-slate-900">Taille du texte</span>
          <div className="flex items-center gap-1.5">
            {renderSourceBadge("bodyFontSizePx")}
            <span className="font-mono text-xs font-semibold text-slate-900">{resolved.bodyFontSizePx}px</span>
          </div>
        </div>
        <input type="range" min={12} max={22} step={1} value={resolved.bodyFontSizePx} onChange={(e) => updateDeviceOverride({ bodyFontSizePx: Number(e.target.value) })} className="w-full accent-slate-900 cursor-pointer" />
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-200 tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-slate-900">Espace haut et bas</span>
          <div className="flex items-center gap-1.5">
            {renderSourceBadge("paddingY")}
            <span className="font-mono text-xs font-semibold text-slate-900">{resolved.paddingY}px</span>
          </div>
        </div>
        <input type="range" min={8} max={120} step={4} data-testid="responsive-padding-y-slider" value={resolved.paddingY} onChange={(e) => updateDeviceOverride({ paddingY: Number(e.target.value) })} className="w-full accent-slate-900 cursor-pointer" />
      </div>

      {["featured_products", "new_arrivals", "best_sellers", "product_grid", "featured_categories", "curated_collections", "verified_reviews"].includes(syntheticSection.type) && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200" data-testid="responsive-columns-control">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-slate-900">Colonnes ({activeDevice === "desktop" ? "Ordinateur" : activeDevice === "tablet" ? "Tablette" : "Mobile"})</span>
            {renderSourceBadge("columns")}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {([1, 2, 3, 4] as const).map((cols) => (
              <button key={cols} type="button" data-testid={`responsive-col-btn-${cols}`} onClick={() => updateDeviceOverride({ columns: cols })} className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer ${resolved.columns === cols ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                {cols} col.
              </button>
            ))}
          </div>
        </div>
      )}

      {syntheticSection.type !== "kinetic_marquee" && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-slate-900">Alignement du texte</span>
            {renderSourceBadge("textAlignment")}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {([{ id: "left", label: "Gauche" }, { id: "center", label: "Centre" }, { id: "right", label: "Droite" }] as const).map((al) => (
              <button key={al.id} type="button" onClick={() => updateDeviceOverride({ textAlignment: al.id })} className={`h-8 rounded-lg border text-[11px] font-medium cursor-pointer ${resolved.textAlignment === al.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{al.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-200 space-y-2">
        <label className="flex items-center justify-between gap-2 cursor-pointer text-[11.5px] text-slate-900 p-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200">
          <span className="flex items-center gap-2 font-medium">
            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            <span>Masquer sur {activeDevice === "desktop" ? "Ordinateur" : activeDevice === "tablet" ? "Tablette" : "Mobile"}</span>
          </span>
          <input type="checkbox" data-testid={`hide-on-${activeDevice}`} checked={resolved.isHiddenOnViewport} onChange={(e) => updateDeviceOverride({ hidden: e.target.checked })} className="rounded border-slate-300 accent-slate-900 cursor-pointer" />
        </label>
      </div>
    </div>
  );
};
