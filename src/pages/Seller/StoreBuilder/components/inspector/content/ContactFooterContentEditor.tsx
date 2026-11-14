import React from "react";
import { AlertTriangle, Download } from "lucide-react";
import { SellerStoreConfig } from "../../../../../../domains/seller/customPage.types";
import { StepWizardFooter } from "../controls/StepWizardControls";

interface ContactFooterContentEditorProps {
  settings: Record<string, unknown>;
  storeConfig?: SellerStoreConfig | null;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  justSavedStep: number | null;
  isSavingStep: boolean;
  saveStepError: string | null;
  onPrev: () => void;
  onSaveAndNext: () => void;
  inputClass: string;
  labelClass: string;
}

export const ContactFooterContentEditor: React.FC<ContactFooterContentEditorProps> = ({
  settings,
  storeConfig,
  onSettingsChange,
  justSavedStep,
  isSavingStep,
  saveStepError,
  onPrev,
  onSaveAndNext,
  inputClass,
  labelClass,
}) => {
  const phone = String(settings.shopPhone || "").trim();
  const email = String(settings.shopEmail || "").trim();
  const missingContacts = !phone && !email;

  const hasProfileContacts = Boolean(
    storeConfig?.contacts?.phone ||
      storeConfig?.commerceConfig?.whatsappNumber ||
      storeConfig?.contacts?.email ||
      storeConfig?.wilaya ||
      storeConfig?.commune
  );

  const handleImportFromProfile = () => {
    if (!storeConfig) return;
    const wilaya = storeConfig.wilaya || "";
    const commune = storeConfig.commune ? `${storeConfig.commune}, ` : "";
    onSettingsChange({
      shopPhone: storeConfig.contacts?.phone || storeConfig.commerceConfig?.whatsappNumber || "",
      shopEmail: storeConfig.contacts?.email || "",
      wilaya,
      address: wilaya ? `${commune}${wilaya}, Algérie` : "",
      socialInstagram: storeConfig.socialLinks?.instagram || "",
    });
  };

  const renderField = (field: string, label: string, placeholder = "") => (
    <label key={field} className={labelClass}>
      <span>{label}</span>
      <input
        type="text"
        value={typeof settings[field] === "string" ? (settings[field] as string) : ""}
        placeholder={placeholder}
        onChange={(e) => onSettingsChange(field, e.target.value)}
        className={inputClass}
      />
    </label>
  );

  return (
    <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none" data-testid="contact-footer-editor">
      {missingContacts && (
        <div
          role="status"
          data-testid="contact-footer-missing-warning"
          className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-900 flex items-start gap-2"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>
            Renseignez au moins votre téléphone ou votre e-mail commercial. Aucune coordonnée fictive n&apos;est affichée.
          </span>
        </div>
      )}

      {hasProfileContacts && (
        <button
          type="button"
          data-testid="contact-footer-import-profile-btn"
          onClick={handleImportFromProfile}
          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11.5px] font-medium text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Importer depuis mon profil boutique</span>
        </button>
      )}

      {renderField("title", "Titre du bloc contact", "Service Client & Contact")}
      {renderField("shopPhone", "Téléphone commercial", "Ex: +213 550 XX XX XX")}
      {renderField("shopEmail", "E-mail commercial", "Ex: contact@votre-boutique.dz")}
      {renderField("wilaya", "Wilaya", "Ex: Alger")}
      {renderField("address", "Adresse", "Ex: Rue Didouche Mourad, Alger")}
      {renderField("workingHours", "Horaires", "Sam - Jeu : 09h00 - 18h00")}
      {renderField("socialInstagram", "Instagram (optionnel)", "Ex: @votre_boutique")}

      <StepWizardFooter
        activeStep={1}
        totalSteps={1}
        justSavedStep={justSavedStep}
        isSavingStep={isSavingStep}
        saveStepError={saveStepError}
        saveTestId="info-save-step-btn"
        onPrev={onPrev}
        onSaveAndNext={onSaveAndNext}
      />
    </div>
  );
};
