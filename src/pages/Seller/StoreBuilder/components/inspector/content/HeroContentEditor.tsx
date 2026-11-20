import React, { useEffect, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import {
  CustomPageSection, CustomPageTheme, HeroBannerSettings, HeroDeviceMeasureConfig, HeroLayoutModelId, HeroSubElement, SellerStoreConfig, StoreThemeSector,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { ShowcaseVideoEditor } from "./ShowcaseVideoEditor";
import { HERO_LAYOUT_MODELS, buildSmartHeroFromCatalog } from "../../../constants/heroBannerModels";
import { HeroModelSpecificConfigPanel } from "../hero/HeroModelSpecificConfigPanel";
import { HeroStep1ShapePanel } from "../hero/HeroStep1ShapePanel";
import {
  buildAdaptedDeviceConfigFromDesktop, computeHeroContrastDiagnostics, computeHeroTextDensityDiagnostics, resolveHeroDeviceProfile,
} from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import { useStudioStore } from "../../../store/useStudioStore";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";
import { DEFAULT_MODERN_SECTOR } from "../../../constants/studioThemeDefaults";

interface HeroContentEditorProps {
  sectionId?: string;
  sectionType?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  storeTheme?: CustomPageTheme;
  inputClass: string;
  labelClass: string;
  activeSubElement?: HeroSubElement | null;
  onSelectSubElement?: (sub: HeroSubElement | null) => void;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
}

const HERO_STEP_DEFS: StepDefinition[] = [
  { id: 1, shortLabel: "1. Format", title: "Modèle & taille", subtitle: "Choisissez la forme et les dimensions de votre bannière." },
  { id: 2, shortLabel: "2. Couleurs", title: "Couleurs & lisibilité", subtitle: "Adaptez les couleurs et le contraste du texte." },
  { id: 3, shortLabel: "3. Photos", title: "Photos & cadrage", subtitle: "Choisissez vos images, le zoom et les retouches." },
  { id: 4, shortLabel: "4. Texte", title: "Texte & bouton", subtitle: "Modifiez le titre, la position et le lien du bouton." },
];

export const HeroContentEditor: React.FC<HeroContentEditorProps> = ({
  sectionId, sectionType, settings, products = [], storeConfig, storeTheme, inputClass, labelClass,
  activeSubElement, onSettingsChange, onSaveStep,
}) => {
  const storeSubElement = useStudioStore((s) => s.selectedSubElement);
  const storeViewport = useStudioStore((s) => s.viewport);
  const setStoreViewport = useStudioStore((s) => s.setViewport);
  const effectiveSub = activeSubElement ?? storeSubElement;
  const [deviceTab, setDeviceTab] = useState<"desktop" | "tablet" | "mobile">(storeViewport);
  const [pendingAdaptation, setPendingAdaptation] = useState<HeroDeviceMeasureConfig | null>(null);

  useEffect(() => {
    setDeviceTab(storeViewport);
  }, [storeViewport]);

  const handleSelectDeviceTab = (dev: "desktop" | "tablet" | "mobile") => {
    setDeviceTab(dev);
    setStoreViewport(dev);
    setPendingAdaptation(null);
  };

  const {
    activeStep, unlockedStep, completedSteps, isExpert, justSavedStep, isSavingStep, saveStepError,
    selectStep, goToPrevStep, saveAndAdvanceStep,
  } = useSectionStepProgress("hero", 4, sectionId);

  useEffect(() => {
    if (!effectiveSub) return;
    if (effectiveSub === "background") selectStep(3, true);
    else if (
      effectiveSub === "title" || effectiveSub === "subtitle" || effectiveSub === "badge" ||
      effectiveSub === "cta" || effectiveSub === "ctaPrimary" || effectiveSub === "ctaSecondary"
    ) {
      selectStep(4, true);
    }
  }, [effectiveSub, selectStep]);

  if (sectionType && sectionType !== "hero_banner" && sectionType !== "showcase_video") return null;

  if (sectionType === "showcase_video") {
    return (
      <ShowcaseVideoEditor
        settings={settings} products={products} inputClass={inputClass}
        labelClass={labelClass} onSettingsChange={onSettingsChange}
      />
    );
  }

  const resolvedTheme = storeTheme || storeConfig?.theme;
  const typedSettings = settings as unknown as HeroBannerSettings;
  const profile = resolveHeroDeviceProfile(typedSettings, deviceTab);
  const activeModel = profile.heroLayout;
  const deviceConfigKey = deviceTab === "mobile" ? "heroMobileConfig" : deviceTab === "tablet" ? "heroTabletConfig" : "heroDesktopConfig";
  const currentDeviceConfig = (typedSettings[deviceConfigKey] as HeroDeviceMeasureConfig | undefined) || {};
  const hasCustomDeviceProfile =
    deviceTab !== "desktop" &&
    (Object.keys(currentDeviceConfig).length > 0 ||
      Boolean(deviceTab === "tablet" ? typedSettings.heroLayoutTablet : typedSettings.heroLayoutMobile));

  const updateDeviceConfig = (patch: Partial<HeroDeviceMeasureConfig>, rootSettingsPatch?: Record<string, unknown>): void => {
    onSettingsChange({ ...(rootSettingsPatch || {}), [deviceConfigKey]: { ...currentDeviceConfig, ...patch } });
  };

  const handleResetDeviceProfile = (): void => {
    if (deviceTab === "desktop") return;
    onSettingsChange({
      [deviceConfigKey]: undefined,
      ...(deviceTab === "tablet"
        ? { heroLayoutTablet: undefined, imagePositionTablet: undefined, imageZoomTablet: undefined, titleSizeTablet: undefined }
        : { heroLayoutMobile: undefined, imagePositionMobile: undefined, imageZoomMobile: undefined, titleSizeMobile: undefined }),
    });
  };

  const handleSelectModel = (modelId: HeroLayoutModelId): void => {
    const preset = HERO_LAYOUT_MODELS.find((m) => m.id === modelId);
    if (deviceTab === "desktop") {
      const modelDefaults: Record<string, unknown> = {};
      if (preset?.defaultSettings) {
        if (settings.containerMode === undefined) modelDefaults.containerMode = preset.defaultSettings.containerMode;
        if (settings.overlayOpacity === undefined) modelDefaults.overlayOpacity = preset.defaultSettings.overlayOpacity;
        if (modelId === "cinema-full" && !settings.titleColor) {
          modelDefaults.titleColor = "#FFFFFF";
          modelDefaults.subtitleColor = "#F4F4F5";
        }
        for (const [k, v] of Object.entries(preset.defaultSettings)) {
          if (settings[k] === undefined && modelDefaults[k] === undefined) modelDefaults[k] = v;
        }
      }
      onSettingsChange({
        ...modelDefaults,
        heroLayout: modelId,
        heroDesktopConfig: { ...(typedSettings.heroDesktopConfig || {}), styleId: modelId },
      });
    } else {
      onSettingsChange({
        [deviceTab === "tablet" ? "heroLayoutTablet" : "heroLayoutMobile"]: modelId,
        [deviceConfigKey]: { ...currentDeviceConfig, styleId: modelId },
      });
    }
  };

  const handleConfirmAdaptation = (): void => {
    if (!pendingAdaptation || deviceTab === "desktop") return;
    onSettingsChange(deviceConfigKey, pendingAdaptation);
    setPendingAdaptation(null);
  };

  const storeSector: StoreThemeSector = resolvedTheme?.sector || DEFAULT_MODERN_SECTOR;
  const contrastDiag = computeHeroContrastDiagnostics(typedSettings);
  const densityDiag = computeHeroTextDensityDiagnostics(typedSettings);
  const hasProducts = products.length > 0;

  return (
    <div className="space-y-3.5 pt-1" data-testid="hero-content-editor">
      <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-medium text-slate-700 flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">
            {hasProducts ? "Remplir avec un produit du catalogue" : "Ajoutez un produit pour le remplissage auto"}
          </span>
        </span>
        <button
          type="button"
          data-testid="hero-magic-catalog-sync-btn"
          disabled={!hasProducts}
          onClick={() => hasProducts && onSettingsChange(buildSmartHeroFromCatalog(products, storeSector, "", activeModel) as Record<string, unknown>)}
          className="h-7 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[11px] font-medium flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
        >
          <Wand2 className="w-3 h-3" /> <span>Remplir</span>
        </button>
      </div>

      <div data-testid="hero-step-navigator">
        <StepWizardBar
          steps={HERO_STEP_DEFS} activeStep={activeStep} unlockedStep={unlockedStep}
          completedSteps={completedSteps} isExpert={isExpert} testIdPrefix="hero-step" onSelectStep={selectStep}
        />
      </div>

      {(activeStep === 3 || activeStep === 4) && (
        <div
          data-testid="hero-step-device-bar"
          className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg"
        >
          {(
            [
              { id: "desktop", label: "Ordinateur" },
              { id: "tablet", label: "Tablette" },
              { id: "mobile", label: "Mobile" },
            ] as const
          ).map((d) => (
            <button
              key={d.id}
              type="button"
              data-testid={`hero-step-device-${d.id}`}
              onClick={() => handleSelectDeviceTab(d.id)}
              className={`h-7 rounded-md text-[11.5px] cursor-pointer ${
                deviceTab === d.id
                  ? "bg-white text-slate-900 font-semibold shadow-2xs"
                  : "text-slate-600 font-medium hover:text-slate-900"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {activeStep === 1 && (
        <HeroStep1ShapePanel
          deviceTab={deviceTab} profile={profile} typedSettings={typedSettings}
          pendingAdaptation={pendingAdaptation} hasCustomDeviceProfile={hasCustomDeviceProfile} inputClass={inputClass}
          onChangeDeviceTab={handleSelectDeviceTab}
          onRequestAdaptation={() => setPendingAdaptation(buildAdaptedDeviceConfigFromDesktop(typedSettings, deviceTab as "tablet" | "mobile"))}
          onConfirmAdaptation={handleConfirmAdaptation} onCancelAdaptation={() => setPendingAdaptation(null)}
          onResetDeviceProfile={handleResetDeviceProfile} onSelectModel={handleSelectModel}
          onSettingsChange={onSettingsChange} onDeviceConfigChange={updateDeviceConfig}
        />
      )}

      {contrastDiag.warningMessage && (
        <div data-testid="hero-contrast-warning-box" className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-amber-900">{contrastDiag.warningMessage}</span>
          <button type="button" data-testid="hero-contrast-fix-btn" onClick={() => onSettingsChange(contrastDiag.suggestedPatch as Record<string, unknown>)} className="h-7 px-2.5 rounded-md bg-amber-900 text-white text-[11px] font-medium shrink-0 cursor-pointer whitespace-nowrap">Améliorer</button>
        </div>
      )}

      {densityDiag.isDense && (
        <div data-testid="hero-density-warning-box" className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          Conseil de lecture : {densityDiag.warnings.join(" · ")}.
        </div>
      )}

      <HeroModelSpecificConfigPanel
        activeStep={activeStep as 1 | 2 | 3 | 4} activeModel={activeModel} deviceTab={deviceTab}
        profile={profile} settings={settings} products={products} storeTheme={resolvedTheme}
        inputClass={inputClass} labelClass={labelClass}
        onSettingsChange={onSettingsChange} onDeviceConfigChange={updateDeviceConfig}
      />

      <StepWizardFooter
        activeStep={activeStep} totalSteps={4} justSavedStep={justSavedStep}
        isSavingStep={isSavingStep} saveStepError={saveStepError} saveTestId="hero-save-step-btn"
        onPrev={goToPrevStep} onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
      />
    </div>
  );
};
