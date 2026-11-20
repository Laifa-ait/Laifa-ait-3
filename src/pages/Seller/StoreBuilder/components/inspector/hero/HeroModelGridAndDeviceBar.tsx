import React from "react";
import { Check, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import {
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
} from "../../../../../../domains/seller/customPage.types";
import { HERO_LAYOUT_MODELS } from "../../../constants/heroBannerModels";
import { HeroModelWireframe } from "./HeroModelWireframes";

interface HeroModelGridAndDeviceBarProps {
  deviceTab: "desktop" | "tablet" | "mobile";
  activeModel: HeroLayoutModelId;
  pendingAdaptation: HeroDeviceMeasureConfig | null;
  hasCustomDeviceProfile?: boolean;
  onChangeDeviceTab: (dev: "desktop" | "tablet" | "mobile") => void;
  onRequestAdaptation: () => void;
  onConfirmAdaptation: () => void;
  onCancelAdaptation: () => void;
  onResetDeviceProfile?: () => void;
  onSelectModel: (id: HeroLayoutModelId) => void;
}

export const HeroModelGridAndDeviceBar: React.FC<HeroModelGridAndDeviceBarProps> = ({
  deviceTab,
  activeModel,
  pendingAdaptation,
  hasCustomDeviceProfile = false,
  onChangeDeviceTab,
  onRequestAdaptation,
  onConfirmAdaptation,
  onCancelAdaptation,
  onResetDeviceProfile,
  onSelectModel,
}) => {
  const isDesktop = deviceTab === "desktop";
  const deviceLabel = isDesktop ? "Ordinateur" : deviceTab === "tablet" ? "Tablette" : "Mobile";
  const activeModelMeta = HERO_LAYOUT_MODELS.find((m) => m.id === activeModel);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-slate-900">Écran modifié</span>
          {!isDesktop && (
            <span data-testid="hero-device-inheritance-badge" className="text-[11px] font-medium text-slate-500">
              {hasCustomDeviceProfile ? `Réglage propre à ${deviceLabel}` : "Identique à l'ordinateur"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
          {([
            { id: "desktop" as const, label: "Ordinateur", icon: Monitor },
            { id: "tablet" as const, label: "Tablette", icon: Tablet },
            { id: "mobile" as const, label: "Mobile", icon: Smartphone },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              data-testid={`hero-device-tab-${id}`}
              onClick={() => onChangeDeviceTab(id)}
              className={`h-8 px-2 rounded-md text-[11.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                deviceTab === id ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {!isDesktop && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="hero-suggest-pc-adaptation-btn"
                onClick={onRequestAdaptation}
                className="flex-1 h-8 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-[11.5px] font-medium flex items-center justify-center cursor-pointer"
              >
                Adapter la taille pour {deviceLabel.toLowerCase()}
              </button>
              {hasCustomDeviceProfile && onResetDeviceProfile && (
                <button
                  type="button"
                  data-testid="hero-reset-device-profile-btn"
                  onClick={onResetDeviceProfile}
                  className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
            {pendingAdaptation && (
              <div data-testid="hero-adaptation-preview-box" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[11.5px] font-medium text-slate-800 tabular-nums">
                  Nouvelle hauteur conseillée : {pendingAdaptation.heightPx}px · Marge : {pendingAdaptation.innerPaddingPx}px
                </p>
                <div className="flex items-center gap-2">
                  <button type="button" data-testid="hero-confirm-pc-adaptation-btn" onClick={onConfirmAdaptation} className="h-7 px-3 rounded-md bg-slate-900 text-white text-[11px] font-medium cursor-pointer">Appliquer</button>
                  <button type="button" onClick={onCancelAdaptation} className="h-7 px-3 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium cursor-pointer">Annuler</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-200">
        <span className="block text-[12px] font-semibold text-slate-900">Type de bannière</span>
        <div className="grid grid-cols-1 gap-1.5">
          {HERO_LAYOUT_MODELS.map((m) => {
            const isSelected = activeModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                data-testid={`hero-model-card-${m.id}`}
                onClick={() => onSelectModel(m.id)}
                className={`p-2 rounded-lg border text-start transition-colors flex items-center gap-2.5 cursor-pointer ${
                  isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="w-20 shrink-0">
                  <HeroModelWireframe modelId={m.id} active={isSelected} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold leading-tight flex items-center justify-between gap-1">
                    <span className="truncate">{m.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </div>
                  <div className={`text-[11px] mt-0.5 leading-snug ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                    {m.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {activeModelMeta && (
          <p className="text-[11px] text-slate-500 leading-snug px-0.5">{activeModelMeta.description}</p>
        )}
      </div>
    </>
  );
};
