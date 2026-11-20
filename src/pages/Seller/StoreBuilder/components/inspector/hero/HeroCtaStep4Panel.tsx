import React, { useRef } from "react";
import { Grid } from "lucide-react";
import {
  CustomPageTheme,
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
  HeroTextPosition9,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { ResolvedHeroDeviceProfile } from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import { DEFAULT_MODERN_THEME } from "../../../constants/studioThemeDefaults";
import { HeroCtaButtonControls } from "./HeroCtaButtonControls";
import { HeroTextFrameControls } from "./HeroTextFrameControls";
import { HeroWordTypographyControl } from "./HeroWordTypographyControl";

interface HeroCtaStep4PanelProps {
  activeModel: HeroLayoutModelId;
  deviceTab: "desktop" | "tablet" | "mobile";
  profile: ResolvedHeroDeviceProfile;
  settings: Record<string, unknown>;
  products: Product[];
  storeTheme?: CustomPageTheme;
  inputClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onDeviceConfigChange: (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>) => void;
}

const POSITION_9_GRID: Array<{ id: HeroTextPosition9; label: string; autoAlign: "left" | "center" | "right" }> = [
  { id: "top-left", label: "Haut G", autoAlign: "left" },
  { id: "top-center", label: "Haut C", autoAlign: "center" },
  { id: "top-right", label: "Haut D", autoAlign: "right" },
  { id: "center-left", label: "Milieu G", autoAlign: "left" },
  { id: "center", label: "Centre", autoAlign: "center" },
  { id: "center-right", label: "Milieu D", autoAlign: "right" },
  { id: "bottom-left", label: "Bas G", autoAlign: "left" },
  { id: "bottom-center", label: "Bas C", autoAlign: "center" },
  { id: "bottom-right", label: "Bas D", autoAlign: "right" },
];

export const HeroCtaStep4Panel: React.FC<HeroCtaStep4PanelProps> = ({
  activeModel, deviceTab, profile, settings, products, storeTheme, inputClass, onSettingsChange, onDeviceConfigChange,
}) => {
  const s = settings as Partial<HeroBannerSettings>;
  const theme = storeTheme || DEFAULT_MODERN_THEME;
  const isDesktop = deviceTab === "desktop";
  const supportsBadgeAndSecondaryCta = activeModel !== "cinema-full";
  const isPhotoOnly = Boolean(s.hideAllText);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-4 select-none" data-testid="hero-step-panel-4">
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
        <span className="text-[12px] font-semibold text-slate-900">Afficher le texte et les boutons</span>
        <label className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-700 cursor-pointer shrink-0">
          <input
            type="checkbox"
            data-testid="hero-hide-all-text-toggle"
            checked={!isPhotoOnly}
            onChange={(e) => onSettingsChange("hideAllText", !e.target.checked)}
            className="accent-slate-900"
          />
          <span>{isPhotoOnly ? "Masqué" : "Affiché"}</span>
        </label>
      </div>

      {isPhotoOnly ? (
        <p className="text-[11.5px] text-slate-500 px-1 leading-relaxed">
          Mode photo seule actif : la bannière met uniquement vos visuels en valeur, sans titre ni bouton.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-900">Position du texte</span>
              <button
                type="button" data-testid="hero-toggle-guides-btn"
                onClick={() => onSettingsChange("showCompositionGuides", !s.showCompositionGuides)}
                className={`h-7 px-2.5 rounded-md text-[11px] font-medium border flex items-center gap-1 cursor-pointer ${
                  s.showCompositionGuides ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Grid className="w-3 h-3" /> <span>Repères</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {POSITION_9_GRID.map((pos) => (
                <button
                  key={pos.id} type="button" data-testid={`hero-pos9-${pos.id}`}
                  onClick={() =>
                    onDeviceConfigChange(
                      { textPosition9: pos.id, textAlign: pos.autoAlign },
                      isDesktop ? { textPosition9: pos.id, textAlignment: pos.autoAlign } : undefined
                    )
                  }
                  className={`h-7 rounded-md text-[11px] font-medium border cursor-pointer ${
                    profile.textPosition9 === pos.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200">
            <span className="block text-[12px] font-semibold text-slate-900">Textes affichés</span>
            {supportsBadgeAndSecondaryCta && (
              <input
                data-testid="hero-badge-input"
                value={s.badgeText || ""}
                onChange={(e) => onSettingsChange({ badgeText: e.target.value, showBadge: Boolean(e.target.value.trim()) })}
                placeholder="Petit badge au-dessus du titre (optionnel)"
                className={inputClass}
              />
            )}
            <input
              ref={titleInputRef}
              data-testid="hero-title-input"
              value={s.title || ""}
              onChange={(e) => onSettingsChange("title", e.target.value)}
              placeholder="Titre principal de la bannière"
              className={inputClass}
            />
            <textarea
              data-testid="hero-subtitle-input" rows={2}
              value={s.subtitle || ""}
              onChange={(e) => onSettingsChange({ subtitle: e.target.value, showSubtitle: Boolean(e.target.value.trim()) })}
              placeholder="Courte phrase sous le titre..."
              className="w-full rounded-lg border border-[var(--studio-border)] bg-white px-3 py-2 text-[12px] text-[var(--studio-black)] focus:border-[var(--studio-primary)] focus:outline-none"
            />

            <HeroWordTypographyControl
              deviceTab={deviceTab}
              profile={profile}
              settings={s}
              theme={theme}
              titleInputRef={titleInputRef}
              onSettingsChange={onSettingsChange}
              onDeviceConfigChange={onDeviceConfigChange}
            />

            <p className="text-[10.5px] text-slate-500 px-0.5 leading-snug">
              Surlignez un mot du titre puis cliquez sur <span className="italic font-serif font-semibold text-slate-700">I</span> ou <span className="underline font-semibold text-slate-700">S</span> pour le styliser séparément.
            </p>
          </div>

          {(activeModel === "atelier-collage" || activeModel === "cinema-full") && (
            <HeroTextFrameControls
              activeModel={activeModel}
              settings={s}
              theme={theme}
              profile={profile}
              onSettingsChange={onSettingsChange}
            />
          )}

          <HeroCtaButtonControls
            settings={s} theme={theme} products={products}
            supportsBadgeAndSecondaryCta={supportsBadgeAndSecondaryCta}
            inputClass={inputClass} onSettingsChange={onSettingsChange}
          />
        </>
      )}
    </div>
  );
};
