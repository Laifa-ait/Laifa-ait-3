import React, { useEffect, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import {
  CustomPageSection,
  HeroBannerSettings,
  HeroDeviceMeasureConfig,
  HeroLayoutModelId,
  HeroSubElement,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { ShowcaseVideoEditor } from "./ShowcaseVideoEditor";
import {
  HERO_LAYOUT_MODELS,
  buildSmartHeroFromCatalog,
} from "../../../constants/heroBannerModels";
import { HeroModelSpecificConfigPanel } from "../hero/HeroModelSpecificConfigPanel";
import { HeroStep1ShapePanel } from "../hero/HeroStep1ShapePanel";
import {
  buildAdaptedDeviceConfigFromDesktop,
  computeHeroContrastDiagnostics,
  computeHeroTextDensityDiagnostics,
  resolveHeroDeviceProfile,
} from "../../../../../../components/Store/sections/hero/heroResponsiveHelper";
import { useStudioStore } from "../../../store/useStudioStore";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";

interface HeroContentEditorProps {
  sectionId?: string;
  sectionType?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products?: Product[];
  inputClass: string;
  labelClass: string;
  activeSubElement?: HeroSubElement | null;
  onSelectSubElement?: (sub: HeroSubElement | null) => void;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
}

const HERO_STEP_DEFS: StepDefinition[] = [
  { id: 1, shortLabel: "1. Forme", title: "Modèle & Taille", subtitle: "Architecture de la bannière et coins." },
  { id: 2, shortLabel: "2. Couleurs", title: "Couleurs Bannière", subtitle: "Palette, couleurs texte & 4 coins." },
  { id: 3, shortLabel: "3. Photo", title: "Photo & Filtres", subtitle: "Image, cadrage, filtres et ombre." },
  { id: 4, shortLabel: "4. Bouton", title: "Texte & Bouton", subtitle: "Titre, phrase et bouton d'action." },
];

export const HeroContentEditor: React.FC<HeroContentEditorProps> = ({
  sectionId, sectionType, settings, products = [], inputClass, labelClass,
  activeSubElement, onSettingsChange, onSaveStep,
}) => {
  const storeSubElement = useStudioStore((s) => s.selectedSubElement);
  const effectiveSub = activeSubElement ?? storeSubElement;
  const [deviceTab, setDeviceTab] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [pendingAdaptation, setPendingAdaptation] = useState<HeroDeviceMeasureConfig | null>(null);

  const {
    activeStep, unlockedStep, completedSteps, isExpert, justSavedStep, isSavingStep, saveStepError,
    selectStep, goToPrevStep, saveAndAdvanceStep,
  } = useSectionStepProgress("hero", 4, sectionId);

  useEffect(() => {
    if (!effectiveSub) return;
    if (effectiveSub === "background") selectStep(3);
    else if (
      effectiveSub === "title" ||
      effectiveSub === "subtitle" ||
      effectiveSub === "badge" ||
      effectiveSub === "cta" ||
      effectiveSub === "ctaPrimary" ||
      effectiveSub === "ctaSecondary"
    ) {
      selectStep(4);
    }
  }, [effectiveSub, selectStep]);

  if (sectionType && sectionType !== "hero_banner" && sectionType !== "showcase_video") return null;

  if (sectionType === "showcase_video") {
    return (
      <ShowcaseVideoEditor
        settings={settings}
        products={products}
        inputClass={inputClass}
        labelClass={labelClass}
        onSettingsChange={onSettingsChange}
      />
    );
  }

  const typedSettings = settings as unknown as HeroBannerSettings;
  const profile = resolveHeroDeviceProfile(typedSettings, deviceTab);
  const activeModel = profile.heroLayout;
  const deviceConfigKey = deviceTab === "mobile" ? "heroMobileConfig" : deviceTab === "tablet" ? "heroTabletConfig" : "heroDesktopConfig";
  const currentDeviceConfig = (typedSettings[deviceConfigKey] as HeroDeviceMeasureConfig | undefined) || {};
  const hasCustomDeviceProfile =
    deviceTab !== "desktop" &&
    (Object.keys(currentDeviceConfig).length > 0 ||
      Boolean(deviceTab === "tablet" ? typedSettings.heroLayoutTablet : typedSettings.heroLayoutMobile));

  const updateDeviceConfig = (
    patch: Partial<HeroDeviceMeasureConfig>,
    rootSettingsPatch?: Record<string, unknown>
  ): void => {
    onSettingsChange({
      ...(rootSettingsPatch || {}),
      [deviceConfigKey]: { ...currentDeviceConfig, ...patch },
    });
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
      const nonDestructiveDefaults: Record<string, unknown> = {};
      if (preset?.defaultSettings) {
        for (const [k, v] of Object.entries(preset.defaultSettings)) {
          if (settings[k] === undefined) nonDestructiveDefaults[k] = v;
        }
      }
      onSettingsChange({
        ...nonDestructiveDefaults,
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

  const contrastDiag = computeHeroContrastDiagnostics(typedSettings);
  const densityDiag = computeHeroTextDensityDiagnostics(typedSettings);

  return (
    <div className="space-y-3.5 pt-1" data-testid="hero-content-editor">
      <div className="px-3 py-2 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-bold text-slate-200 flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">Auto-remplir depuis le catalogue</span>
        </span>
        <button
          type="button"
          data-testid="hero-magic-catalog-sync-btn"
          onClick={() => onSettingsChange(buildSmartHeroFromCatalog(products, "mode", "Alger", activeModel) as Record<string, unknown>)}
          className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Wand2 className="w-3 h-3" /> <span>Auto</span>
        </button>
      </div>

      <div data-testid="hero-step-navigator">
        <StepWizardBar
          steps={HERO_STEP_DEFS}
          activeStep={activeStep}
          unlockedStep={unlockedStep}
          completedSteps={completedSteps}
          isExpert={isExpert}
          testIdPrefix="hero-step"
          onSelectStep={selectStep}
        />
      </div>

      {activeStep === 1 && (
        <HeroStep1ShapePanel
          deviceTab={deviceTab}
          profile={profile}
          typedSettings={typedSettings}
          pendingAdaptation={pendingAdaptation}
          hasCustomDeviceProfile={hasCustomDeviceProfile}
          inputClass={inputClass}
          onChangeDeviceTab={(id) => { setDeviceTab(id); setPendingAdaptation(null); }}
          onRequestAdaptation={() => setPendingAdaptation(buildAdaptedDeviceConfigFromDesktop(typedSettings, deviceTab as "tablet" | "mobile"))}
          onConfirmAdaptation={handleConfirmAdaptation}
          onCancelAdaptation={() => setPendingAdaptation(null)}
          onResetDeviceProfile={handleResetDeviceProfile}
          onSelectModel={handleSelectModel}
          onSettingsChange={onSettingsChange}
          onDeviceConfigChange={updateDeviceConfig}
        />
      )}

      {contrastDiag.warningMessage && (
        <div data-testid="hero-contrast-warning-box" className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-amber-900">{contrastDiag.warningMessage}</span>
          <button type="button" data-testid="hero-contrast-fix-btn" onClick={() => onSettingsChange(contrastDiag.suggestedPatch as Record<string, unknown>)} className="px-2.5 py-1 rounded-lg bg-amber-900 text-white text-[10px] font-bold shrink-0 cursor-pointer">Corriger</button>
        </div>
      )}

      {densityDiag.isDense && (
        <div data-testid="hero-density-warning-box" className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[10px] font-medium text-sky-950">
          Recommandation éditoriale : {densityDiag.warnings.join(" · ")}. Votre texte est conservé intégralement.
        </div>
      )}

      <HeroModelSpecificConfigPanel
        activeStep={activeStep as 1 | 2 | 3 | 4}
        activeModel={activeModel}
        deviceTab={deviceTab}
        profile={profile}
        settings={settings}
        products={products}
        inputClass={inputClass}
        labelClass={labelClass}
        onSettingsChange={onSettingsChange}
        onDeviceConfigChange={updateDeviceConfig}
      />

      <StepWizardFooter
        activeStep={activeStep}
        totalSteps={4}
        justSavedStep={justSavedStep}
        isSavingStep={isSavingStep}
        saveStepError={saveStepError}
        saveTestId="hero-save-step-btn"
        onPrev={goToPrevStep}
        onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
      />
    </div>
  );
};
