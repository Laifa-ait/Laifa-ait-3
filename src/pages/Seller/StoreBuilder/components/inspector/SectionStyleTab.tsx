import React from "react";
import { RotateCcw } from "lucide-react";
import {
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";
import { ColorSchemePicker } from "./controls/ColorSchemePicker";
import { SectionElementColorMatrix } from "./controls/SectionElementColorMatrix";
import { SectionMaterialSubPanel } from "./controls/SectionMaterialSubPanel";
import { EditorialTypographyControlBox } from "./controls/EditorialTypographyControlBox";
import { SectionVisualEffectsSubPanel } from "./controls/SectionVisualEffectsSubPanel";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "./controls/StepWizardControls";
import { useSectionStepProgress } from "../../hooks/useSectionStepProgress";

interface SectionStyleTabProps {
  sectionId?: string;
  sectionType?: string;
  styles: CustomPageSectionStyles;
  settings?: Record<string, unknown>;
  theme?: CustomPageTheme;
  onStylesChange: (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => void;
  onSettingsChange?: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSaveStep?: () => void;
}

const STYLE_STEP_DEFS: StepDefinition[] = [
  { id: 1, shortLabel: "1. Couleurs", title: "Couleurs de la section", subtitle: "Palette globale, couleurs par élément et opacité." },
  { id: 2, shortLabel: "2. Coins", title: "Coins & Ombres", subtitle: "Arrondis par coin et profondeur des ombres." },
  { id: 3, shortLabel: "3. Matières", title: "Filtres & Matières", subtitle: "Rendu photo, textures et silhouettes." },
  { id: 4, shortLabel: "4. Bouton", title: "Bouton & Typographie", subtitle: "Style des boutons d'action et espacements." },
];

export const SectionStyleTab: React.FC<SectionStyleTabProps> = ({
  sectionId,
  sectionType,
  styles,
  settings = {},
  theme,
  onStylesChange,
  onSettingsChange,
  onSaveStep,
}) => {
  const {
    activeStep,
    unlockedStep,
    completedSteps,
    isExpert,
    justSavedStep,
    selectStep,
    goToPrevStep,
    saveAndAdvanceStep,
  } = useSectionStepProgress("style", 4, sectionId);

  const sectionOpacity = typeof settings.sectionOpacity === "number" ? settings.sectionOpacity : 100;

  const handleResetSectionStyles = () => {
    onStylesChange({
      backgroundColor: undefined, textColor: undefined, headingColor: undefined,
      subtitleColor: undefined, kickerColor: undefined, cardBgColor: undefined,
      cardTextColor: undefined, cardBorderColor: undefined, priceColor: undefined,
      badgeBgColor: undefined, badgeTextColor: undefined, iconColor: undefined,
      overlayColor: undefined, dividerColor: undefined, sectionBorderColor: undefined,
      colorScheme: undefined, borderRadius: undefined, usePerCornerRadius: false,
      useCornerColors: false, shadow: undefined, cardShadow: undefined,
      imageFilterPreset: undefined, imageBrightness: undefined, imageContrast: undefined,
      imageSaturation: undefined, buttonStyle: undefined, buttonShadow: undefined,
      buttonBgColor: undefined, buttonTextColor: undefined, buttonBorderColor: undefined,
      surfaceTexture: undefined, cardMaterial: undefined, frameShape: undefined,
      letterSpacing: undefined, lineHeight: undefined,
    });
    if (onSettingsChange) {
      onSettingsChange({
        sectionOpacity: 100,
        backgroundGradient: undefined,
        ...(sectionType === "hero_banner"
          ? {
              bannerBgColor: undefined, bannerBgGradient: undefined, bannerBorderColor: undefined,
              titleColor: undefined, subtitleColor: undefined, badgeBgColor: undefined,
              badgeTextColor: undefined, ctaBgColor: undefined, ctaTextColor: undefined,
              ctaBorderColor: undefined, useCornerColors: false, bannerShadow: "none",
              usePerCornerRadius: false,
            }
          : {}),
      });
    }
  };

  return (
    <div className="space-y-3.5 select-none" data-testid="section-style-tab">
      <div data-testid="section-style-stepper">
        <StepWizardBar
          steps={STYLE_STEP_DEFS}
          activeStep={activeStep}
          unlockedStep={unlockedStep}
          completedSteps={completedSteps}
          isExpert={isExpert}
          testIdPrefix="style-step"
          onSelectStep={selectStep}
        />
      </div>

      {activeStep === 1 && (
        <div className="space-y-3" data-testid="style-step-panel-1">
          <ColorSchemePicker
            styles={styles}
            theme={theme}
            onStylesChange={(fieldOrPatch, val) => {
              onStylesChange(fieldOrPatch, val);
              if (sectionType === "hero_banner" && onSettingsChange && typeof fieldOrPatch === "string") {
                if (fieldOrPatch === "backgroundColor" && typeof val === "string") {
                  onSettingsChange("bannerBgColor", val);
                } else if (fieldOrPatch === "textColor" && typeof val === "string") {
                  onSettingsChange("titleColor", val);
                }
              }
            }}
          />
          <SectionElementColorMatrix
            sectionType={sectionType}
            styles={styles}
            theme={theme}
            onStylesChange={onStylesChange}
            onSettingsChange={onSettingsChange}
          />
          {onSettingsChange && (
            <div className="space-y-1.5 pt-3 border-t border-slate-200">
              <div className="flex justify-between items-center text-xs tabular-nums">
                <span className="font-medium text-slate-800">Opacité de la section</span>
                <span className="font-mono text-slate-900 font-semibold">{sectionOpacity}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={sectionOpacity}
                onChange={(e) => onSettingsChange("sectionOpacity", Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      <SectionVisualEffectsSubPanel
        sectionType={sectionType}
        activeStep={activeStep as 1 | 2 | 3 | 4}
        styles={styles}
        onStylesChange={onStylesChange}
        onSettingsChange={onSettingsChange}
      />

      {activeStep === 3 && (
        <SectionMaterialSubPanel
          sectionType={sectionType}
          styles={styles}
          theme={theme}
          onStylesChange={onStylesChange}
        />
      )}

      {activeStep === 4 && (
        <div className="pt-1" data-testid="style-step-panel-4">
          <EditorialTypographyControlBox
            letterSpacing={styles.letterSpacing ?? theme?.letterSpacing ?? 0}
            lineHeight={styles.lineHeight ?? theme?.lineHeight ?? 1.15}
            headingAccentStyle={styles.headingAccentStyle || theme?.headingAccentStyle || "metallic-gold"}
            headingUnderlineStyle={styles.headingUnderlineStyle || theme?.headingUnderlineStyle || "brush-stroke"}
            accentColor={styles.kickerColor || theme?.accentColor || theme?.primaryColor}
            onChange={(patch) => onStylesChange(patch)}
          />
        </div>
      )}

      <StepWizardFooter
        activeStep={activeStep}
        totalSteps={4}
        justSavedStep={justSavedStep}
        saveTestId="style-save-step-btn"
        onPrev={goToPrevStep}
        onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
      />

      <button
        type="button"
        data-testid="reset-section-styles-btn"
        onClick={handleResetSectionStyles}
        className="w-full h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Hériter du Thème Global</span>
      </button>
    </div>
  );
};
