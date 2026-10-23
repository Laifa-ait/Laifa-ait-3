import React from "react";

interface InfoContentEditorProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
  labelClass: string;
}

export const InfoContentEditor: React.FC<InfoContentEditorProps> = ({
  sectionType,
  settings,
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
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
        onChange={(event) =>
          onSettingsChange(field, event.target.value === "" ? undefined : Number(event.target.value))
        }
        className={inputClass}
      />
    </label>
  );

  return (
    <div className="space-y-4">
      {"heading" in settings && renderText("heading", "Titre de votre histoire")}
      {"bodyText" in settings && (
        <label className={labelClass}>
          <span>Votre histoire</span>
          <textarea
            rows={5}
            maxLength={2000}
            value={typeof settings.bodyText === "string" ? settings.bodyText : ""}
            onChange={(event) => onSettingsChange("bodyText", event.target.value)}
            className="w-full rounded-lg border border-[#E4E7EC] bg-white p-3 text-[13px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
        </label>
      )}
      {"signature" in settings && renderText("signature", "Signature ou nom de l'artisan")}
      {"yearsOfExperience" in settings && renderNumber("yearsOfExperience", "Années d'expérience", 0, 100)}

      {"maxReviews" in settings && renderNumber("maxReviews", "Nombre d'avis à afficher", 1, 12)}
      {"filterMinRating" in settings && renderNumber("filterMinRating", "Note minimale des avis", 1, 5, 0.5)}

      {"defaultTimeframe" in settings && renderText("defaultTimeframe", "Délai habituel", "24 h à 72 h")}
      {"freeShippingAbove" in settings &&
        renderNumber("freeShippingAbove", "Livraison offerte dès (DZD)", 1, 10000000, 500)}

      {"delayDays" in settings && renderNumber("delayDays", "Délai de retour (jours)", 1, 90)}
      {"conditions" in settings && (
        <label className={labelClass}>
          <span>Conditions de retour</span>
          <textarea
            rows={4}
            value={String(settings.conditions || "")}
            onChange={(event) => onSettingsChange("conditions", event.target.value)}
            className="w-full rounded-lg border border-[#E4E7EC] p-3 text-[13px] focus:border-[#F97316] focus:outline-none"
          />
        </label>
      )}
      {"returnShippingFeeBy" in settings && (
        <label className={labelClass}>
          <span>Frais de retour</span>
          <select
            value={String(settings.returnShippingFeeBy)}
            onChange={(event) => onSettingsChange("returnShippingFeeBy", event.target.value)}
            className={inputClass}
          >
            <option value="buyer">À la charge du client</option>
            <option value="seller">À ma charge</option>
            <option value="free">Offerts</option>
          </select>
        </label>
      )}

      {sectionType === "contact_footer" && (
        <div className="space-y-3 border-t border-[#E4E7EC] pt-4">
          <h3 className="text-[12px] font-semibold text-[#17191C]">Coordonnées et réseaux</h3>
          {renderText("shopPhone", "Téléphone")}
          {renderText("shopEmail", "Adresse e-mail")}
          {renderText("address", "Adresse")}
          {renderText("wilaya", "Wilaya")}
          {renderText("workingHours", "Horaires d'ouverture")}
          {renderText("socialInstagram", "Instagram")}
          {renderText("socialFacebook", "Facebook")}
          {renderText("socialTiktok", "TikTok")}
        </div>
      )}
    </div>
  );
};
