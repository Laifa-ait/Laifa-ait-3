import React from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { SellerStoreConfig } from "../../../../../../domains/seller/customPage.types";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";

interface ContactFooterContentEditorProps {
  sectionId?: string;
  settings: Record<string, unknown>;
  storeConfig?: SellerStoreConfig | null;
  inputClass: string;
  labelClass: string;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
  justSavedStep?: number | null;
  isSavingStep?: boolean;
  saveStepError?: string | null;
  onPrev?: () => void;
  onSaveAndNext?: () => void;
}

const CONTACT_FOOTER_STEPS: StepDefinition[] = [
  { id: 1, shortLabel: "1. Horaires", title: "1. Accueil & Horaires", subtitle: "Titre d'assistance et plages de préparation." },
  { id: 2, shortLabel: "2. Localisation", title: "2. Wilaya & Expédition", subtitle: "Localisation de l'atelier ou point de départ." },
];

export const ContactFooterContentEditor: React.FC<ContactFooterContentEditorProps> = ({
  sectionId,
  settings,
  storeConfig,
  inputClass,
  labelClass,
  onSettingsChange,
  onSaveStep,
}) => {
  const {
    activeStep, unlockedStep, completedSteps, isExpert, justSavedStep, isSavingStep, saveStepError,
    selectStep, goToPrevStep, saveAndAdvanceStep,
  } = useSectionStepProgress("contact_footer", 2, sectionId);

  const handleImportFromStoreProfile = () => {
    const wilaya = storeConfig?.wilaya || "";
    const commune = storeConfig?.commune ? `${storeConfig.commune}, ` : "";
    const defaultAddress = wilaya ? `${commune}${wilaya}, Algérie` : "";
    onSettingsChange({
      wilaya: wilaya || (settings.wilaya as string) || "",
      address: (settings.address as string) || defaultAddress,
      workingHours: (settings.workingHours as string) || "Samedi au Jeudi : 09h00 - 18h00",
      shopPhone: "",
      shopEmail: "",
      socialInstagram: "",
    });
  };

  const renderField = (field: string, label: string, placeholder: string) => (
    <div key={field}>
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        value={(settings[field] as string) || ""}
        onChange={(e) => onSettingsChange(field, e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div
        data-testid="contact-footer-internal-policy-banner"
        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-start"
      >
        <ShieldCheck className="w-4 h-4 text-[#023859] shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium text-slate-700 leading-snug">
          Conformité Olmart : Toutes les interactions clients passent par les notifications internes sécurisées. Aucun téléphone, WhatsApp ou e-mail externe n&apos;est requis ni publié.
        </p>
      </div>

      <button
        type="button"
        data-testid="contact-footer-import-profile-btn"
        onClick={handleImportFromStoreProfile}
        className="w-full py-2 px-3 rounded-xl bg-[#023859]/10 hover:bg-[#023859]/15 text-[#023859] border border-[#023859]/20 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Synchroniser ma Wilaya &amp; mes horaires</span>
      </button>

      <StepWizardBar
        steps={CONTACT_FOOTER_STEPS}
        activeStep={activeStep}
        unlockedStep={unlockedStep}
        completedSteps={completedSteps}
        isExpert={isExpert}
        testIdPrefix="contact-footer-step"
        onSelectStep={selectStep}
      />

      {activeStep === 1 && (
        <div className="space-y-3" data-testid="contact-footer-step-panel-1">
          {renderField("title", "Titre du bloc d'assistance", "Ex: Service Client & Horaires")}
          {renderField("subtitle", "Engagement service", "Ex: Suivi de commande en temps réel via votre espace Olmart")}
          {renderField("workingHours", "Horaires de préparation & réponse", "Ex: Sam - Jeu, 9h00 - 18h00")}
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-3" data-testid="contact-footer-step-panel-2">
          {renderField("wilaya", "Wilaya d'expédition", "Ex: Alger (16)")}
          {renderField("address", "Zone / Atelier (sans numéro externe)", "Ex: Hydra, Alger, Algérie")}
        </div>
      )}

      <StepWizardFooter
        activeStep={activeStep}
        totalSteps={2}
        justSavedStep={justSavedStep}
        isSavingStep={isSavingStep}
        saveStepError={saveStepError}
        saveTestId="contact-footer-save-step-btn"
        onPrev={goToPrevStep}
        onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
      />
    </div>
  );
};
