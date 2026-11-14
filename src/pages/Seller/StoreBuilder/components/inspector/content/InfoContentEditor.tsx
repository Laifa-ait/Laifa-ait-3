import React, { useEffect } from "react";
import { Plus, Trash2, Type } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { DeliveryInfoItem, SellerStoreConfig } from "../../../../../../domains/seller/customPage.types";
import { StudioImagePicker } from "./StudioImagePicker";
import { AlgeriaEcommercePresets } from "../controls/AlgeriaEcommercePresets";
import { useStudioStore } from "../../../store/useStudioStore";
import { useSectionStepProgress } from "../../../hooks/useSectionStepProgress";
import { StepWizardBar, StepWizardFooter, StepDefinition } from "../controls/StepWizardControls";
import { ContactFooterContentEditor } from "./ContactFooterContentEditor";

interface InfoContentEditorProps {
  sectionId?: string;
  sectionType?: string;
  settings: Record<string, unknown>;
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
  inputClass: string;
  labelClass: string;
}

const STEP_MAP: Record<string, StepDefinition[]> = {
  brand_story: [
    { id: 1, shortLabel: "1. Photo", title: "Photo & Disposition" },
    { id: 2, shortLabel: "2. Récit", title: "Récit & Signature" },
  ],
  verified_reviews: [
    { id: 1, shortLabel: "1. En-tête", title: "Titre & Limite d'avis" },
    { id: 2, shortLabel: "2. Avis", title: "Témoignages Clients" },
  ],
  delivery_info: [
    { id: 1, shortLabel: "1. Tarifs", title: "Tarifs Globaux 69 Wilayas" },
    { id: 2, shortLabel: "2. Zones", title: "Zones & Délais Détaillés" },
  ],
};

export const InfoContentEditor: React.FC<InfoContentEditorProps> = ({
  sectionId, sectionType, settings, products = [], storeConfig, onSettingsChange, onSaveStep, inputClass, labelClass,
}) => {
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const stepDefs = sectionType ? STEP_MAP[sectionType] : undefined;
  const totalSteps = stepDefs ? stepDefs.length : 1;
  const {
    activeStep, unlockedStep, completedSteps, isExpert, justSavedStep, isSavingStep, saveStepError,
    selectStep, goToPrevStep, saveAndAdvanceStep,
  } = useSectionStepProgress("info", totalSteps, sectionId);

  useEffect(() => {
    if (!selectedSubElement || totalSteps < 2) return;
    if (sectionType === "brand_story") {
      selectStep(selectedSubElement === "background" ? 1 : 2);
    } else if (sectionType === "verified_reviews") {
      selectStep(selectedSubElement.startsWith("review-") ? 2 : 1);
    } else if (sectionType === "delivery_info") {
      selectStep(selectedSubElement === "tarifs" ? 2 : 1);
    }
  }, [selectedSubElement, sectionType, totalSteps, selectStep]);

  const renderText = (field: string, label: string, placeholder = "") => (
    <label key={field} className={labelClass}>
      <span>{label}</span>
      <input
        type="text"
        value={typeof settings[field] === "string" ? (settings[field] as string) : ""}
        placeholder={placeholder}
        onChange={(event) => onSettingsChange(field, event.target.value)}
        className={inputClass}
      />
    </label>
  );

  const renderNumber = (field: string, label: string, min: number, max: number, step = 1) => (
    <label key={field} className={labelClass}>
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={typeof settings[field] === "number" ? (settings[field] as number) : ""}
        onChange={(event) => onSettingsChange(field, event.target.value === "" ? undefined : Number(event.target.value))}
        className={inputClass}
      />
    </label>
  );

  if (sectionType === "brand_story") {
    const dropCapEnabled = Boolean(settings.dropCap);
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none" data-testid="info-content-stepper">
        <StepWizardBar steps={STEP_MAP.brand_story} activeStep={activeStep} unlockedStep={unlockedStep} completedSteps={completedSteps} isExpert={isExpert} testIdPrefix="info-step" onSelectStep={selectStep} />
        {activeStep === 1 && (
          <div className="space-y-3">
            <AlgeriaEcommercePresets sectionType="brand_story" onApplyPreset={(patch) => onSettingsChange(patch)} />
            <StudioImagePicker label="Photo de votre atelier" value={typeof settings.imageUrl === "string" ? settings.imageUrl : ""} onChange={(newUrl) => onSettingsChange("imageUrl", newUrl)} products={products} />
            <div className="grid grid-cols-2 gap-2">
              {(["left", "right"] as const).map((pos) => (
                <button key={pos} type="button" onClick={() => onSettingsChange("imagePosition", pos)} className={`h-8 rounded-lg border text-xs font-semibold cursor-pointer ${(settings.imagePosition || "left") === pos ? "border-[#023859] bg-[#F0F7FA] text-[#023859] font-bold" : "border-slate-200 bg-white text-slate-600"}`}>
                  {pos === "left" ? "Image à gauche" : "Image à droite"}
                </button>
              ))}
            </div>
          </div>
        )}
        {activeStep === 2 && (
          <div className="space-y-3">
            {renderText("heading", "Titre de votre histoire", "Notre *Passion* & Notre {Atelier}")}
            <label className={labelClass}>
              <span>Récit / Manifeste</span>
              <textarea rows={4} maxLength={2000} value={typeof settings.bodyText === "string" ? settings.bodyText : ""} onChange={(e) => onSettingsChange("bodyText", e.target.value)} className="w-full rounded-lg border border-[#E4E7EC] bg-white p-2.5 text-xs text-[#17191C] focus:border-[#023859] focus:outline-none" />
            </label>
            <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center"><Type className="w-3.5 h-3.5" /></span>
                <span className="text-[11px] font-bold text-[#011C40]">Lettrine Éditoriale (Drop Cap)</span>
              </div>
              <input type="checkbox" checked={dropCapEnabled} onChange={(e) => onSettingsChange("dropCap", e.target.checked)} className="w-4 h-4 accent-[#023859] cursor-pointer" />
            </label>
            {renderText("signature", "Signature", "Maison Olmart")}
            {renderNumber("yearsOfExperience", "Années d'expérience", 0, 120)}
          </div>
        )}
        <StepWizardFooter activeStep={activeStep} totalSteps={2} justSavedStep={justSavedStep} isSavingStep={isSavingStep} saveStepError={saveStepError} saveTestId="info-save-step-btn" onPrev={goToPrevStep} onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)} />
      </div>
    );
  }

  if (sectionType === "verified_reviews") {
    const customReviews = Array.isArray(settings.customReviews) ? (settings.customReviews as Array<{ author: string; rating: number; comment: string }>) : [];
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none" data-testid="info-content-stepper">
        <StepWizardBar steps={STEP_MAP.verified_reviews} activeStep={activeStep} unlockedStep={unlockedStep} completedSteps={completedSteps} isExpert={isExpert} testIdPrefix="info-step" onSelectStep={selectStep} />
        {activeStep === 1 && (
          <div className="space-y-2.5">
            {renderText("title", "Titre de la section", "Ils nous font *confiance*")}
            {renderText("subtitle", "Sous-titre", "Retours vérifiés en Algérie")}
            {renderNumber("maxReviews", "Nombre d'avis affichés", 1, 24)}
          </div>
        )}
        {activeStep === 2 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#011C40]">Témoignages ({customReviews.length})</span>
              <button type="button" onClick={() => onSettingsChange("customReviews", [...customReviews, { author: "Client Vérifié (Alger)", rating: 5, comment: "Excellent produit et livraison rapide !" }])} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#023859] text-white text-[11px] font-bold cursor-pointer">
                <Plus className="w-3 h-3" /><span>Ajouter</span>
              </button>
            </div>
            {customReviews.map((rev, idx) => (
              <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex gap-1.5">
                  <input value={rev.author} onChange={(e) => { const next = [...customReviews]; next[idx] = { ...next[idx], author: e.target.value }; onSettingsChange("customReviews", next); }} placeholder="Nom & Wilaya" className={inputClass} />
                  <select value={rev.rating || 5} onChange={(e) => { const next = [...customReviews]; next[idx] = { ...next[idx], rating: Number(e.target.value) }; onSettingsChange("customReviews", next); }} className="h-9 rounded-lg border border-[#E4E7EC] px-2 text-xs font-bold text-amber-600 bg-white">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                  <button type="button" onClick={() => onSettingsChange("customReviews", customReviews.filter((_, i) => i !== idx))} className="px-2 rounded border border-rose-200 text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <textarea rows={2} value={rev.comment} onChange={(e) => { const next = [...customReviews]; next[idx] = { ...next[idx], comment: e.target.value }; onSettingsChange("customReviews", next); }} placeholder="Commentaire du client" className="w-full rounded-lg border border-[#E4E7EC] p-2 text-xs focus:border-[#023859] focus:outline-none" />
              </div>
            ))}
          </div>
        )}
        <StepWizardFooter activeStep={activeStep} totalSteps={2} justSavedStep={justSavedStep} isSavingStep={isSavingStep} saveStepError={saveStepError} saveTestId="info-save-step-btn" onPrev={goToPrevStep} onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)} />
      </div>
    );
  }

  if (sectionType === "delivery_info") {
    const customTariffs = Array.isArray(settings.customTariffs) ? (settings.customTariffs as DeliveryInfoItem[]) : [];
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none" data-testid="info-content-stepper">
        <StepWizardBar steps={STEP_MAP.delivery_info} activeStep={activeStep} unlockedStep={unlockedStep} completedSteps={completedSteps} isExpert={isExpert} testIdPrefix="info-step" onSelectStep={selectStep} />
        {activeStep === 1 && (
          <div className="space-y-2.5">
            <AlgeriaEcommercePresets sectionType="delivery_info" onApplyPreset={(patch) => onSettingsChange(patch)} />
            {renderText("title", "Titre de la section", "Expédition Rapide sur les {69 Wilayas}")}
            {renderText("defaultTimeframe", "Délai moyen", "24h - 48h")}
            <div className="grid grid-cols-2 gap-2">
              {renderNumber("stopDeskPrice", "Stop-Desk (DA)", 0, 5000, 50)}
              {renderNumber("homeDeliveryPrice", "Domicile (DA)", 0, 5000, 50)}
            </div>
            {renderNumber("freeShippingAbove", "Gratuit dès (DA)", 0, 1000000, 500)}
          </div>
        )}
        {activeStep === 2 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#011C40]">Zones &amp; Wilayas ({customTariffs.length})</span>
              <button type="button" onClick={() => onSettingsChange("customTariffs", [...customTariffs, { wilayaName: "Nouvelle Zone", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true }])} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#023859] text-white text-[10px] font-bold cursor-pointer">
                <Plus className="w-3 h-3" /><span>Ajouter</span>
              </button>
            </div>
            {customTariffs.map((t, i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center bg-white p-1.5 rounded-lg border border-slate-200">
                <input value={t.wilayaName} onChange={(e) => { const n = [...customTariffs]; n[i] = { ...n[i], wilayaName: e.target.value }; onSettingsChange("customTariffs", n); }} placeholder="Wilaya" className="col-span-5 h-7 px-2 text-[11px] border border-slate-200 rounded" />
                <input value={t.estimatedDays} onChange={(e) => { const n = [...customTariffs]; n[i] = { ...n[i], estimatedDays: e.target.value }; onSettingsChange("customTariffs", n); }} placeholder="24-48h" className="col-span-3 h-7 px-1.5 text-[11px] border border-slate-200 rounded" />
                <input type="number" value={t.priceDZD} onChange={(e) => { const n = [...customTariffs]; n[i] = { ...n[i], priceDZD: Number(e.target.value) }; onSettingsChange("customTariffs", n); }} className="col-span-3 h-7 px-1.5 text-[11px] border border-slate-200 rounded" />
                <button type="button" onClick={() => onSettingsChange("customTariffs", customTariffs.filter((_, idx) => idx !== i))} className="col-span-1 text-rose-600 flex justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
        <StepWizardFooter activeStep={activeStep} totalSteps={2} justSavedStep={justSavedStep} isSavingStep={isSavingStep} saveStepError={saveStepError} saveTestId="info-save-step-btn" onPrev={goToPrevStep} onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)} />
      </div>
    );
  }

  if (sectionType === "return_policy") {
    const feeBy = (settings.returnShippingFeeBy as string) || "buyer";
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
        <AlgeriaEcommercePresets sectionType="return_policy" onApplyPreset={(patch) => onSettingsChange(patch)} />
        {renderText("title", "Titre de la section", "Retours & *Échanges*")}
        {renderNumber("delayDays", "Délai accepté (jours)", 1, 90)}
        <label className={labelClass}>
          <span>Frais de retour</span>
          <select value={feeBy} onChange={(e) => onSettingsChange("returnShippingFeeBy", e.target.value)} data-testid="return-shipping-fee-select" className={inputClass}>
            <option value="buyer">À la charge de l&apos;acheteur</option>
            <option value="seller">Pris en charge par la boutique</option>
            <option value="free">Gratuit selon conditions</option>
          </select>
        </label>
        <label className={labelClass}>
          <span>Conditions</span>
          <textarea rows={3} value={String(settings.conditions || "")} onChange={(e) => onSettingsChange("conditions", e.target.value)} className="w-full rounded-lg border border-[#E4E7EC] bg-white p-2.5 text-xs focus:border-[#023859] focus:outline-none" />
        </label>
        <StepWizardFooter activeStep={1} totalSteps={1} justSavedStep={justSavedStep} isSavingStep={isSavingStep} saveStepError={saveStepError} saveTestId="info-save-step-btn" onPrev={goToPrevStep} onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)} />
      </div>
    );
  }

  if (sectionType === "contact_footer") {
    return (
      <ContactFooterContentEditor
        settings={settings}
        storeConfig={storeConfig}
        onSettingsChange={onSettingsChange}
        justSavedStep={justSavedStep}
        isSavingStep={isSavingStep}
        saveStepError={saveStepError}
        onPrev={goToPrevStep}
        onSaveAndNext={() => void saveAndAdvanceStep(onSaveStep)}
        inputClass={inputClass}
        labelClass={labelClass}
      />
    );
  }

  return null;
};
