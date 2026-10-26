import React from "react";
import { BookOpen, Truck, RotateCcw, ShieldCheck, Phone, Plus, Trash2 } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";
import { StudioImagePicker } from "./StudioImagePicker";
import { AlgeriaEcommercePresets } from "../controls/AlgeriaEcommercePresets";

interface InfoContentEditorProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  products?: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

export const InfoContentEditor: React.FC<InfoContentEditorProps> = ({
  sectionType,
  settings,
  products = [],
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

  // 1. BRAND STORY
  if (sectionType === "brand_story") {
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Histoire & Savoir-Faire de la Marque</span>
        </div>

        <AlgeriaEcommercePresets
          sectionType="brand_story"
          onApplyPreset={(patch) => onSettingsChange(patch)}
        />

        <StudioImagePicker
          label="Photo de votre atelier ou boutique"
          value={typeof settings.imageUrl === "string" ? settings.imageUrl : ""}
          onChange={(newUrl) => onSettingsChange("imageUrl", newUrl)}
          products={products}
        />

        {renderText("heading", "Titre de votre histoire", "À Propos de Notre Maison")}
        <label className={labelClass}>
          <span>Récit de votre boutique</span>
          <textarea
            rows={4}
            maxLength={2000}
            value={typeof settings.bodyText === "string" ? settings.bodyText : ""}
            onChange={(e) => onSettingsChange("bodyText", e.target.value)}
            className="w-full rounded-lg border border-[#E4E7EC] bg-white p-2.5 text-xs text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["left", "right"] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onSettingsChange("imagePosition", pos)}
              className={`h-8 rounded-lg border text-xs font-semibold cursor-pointer ${
                (settings.imagePosition || "left") === pos
                  ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {pos === "left" ? "Image à gauche" : "Image à droite"}
            </button>
          ))}
        </div>
        {renderText("signature", "Signature du fondateur / artisan", "Maison Olmart")}
        {renderNumber("yearsOfExperience", "Badge années d'expérience", 0, 120)}
      </div>
    );
  }

  // 2. VERIFIED REVIEWS
  if (sectionType === "verified_reviews") {
    const customReviews = Array.isArray(settings.customReviews)
      ? (settings.customReviews as Array<{ author: string; rating: number; comment: string }>)
      : [];
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Avis Clients Vérifiés</span>
        </div>
        {renderText("title", "Titre de la section", "Ils nous font confiance")}
        {renderText("subtitle", "Sous-titre", "Retours vérifiés de nos clients en Algérie")}
        {renderNumber("maxReviews", "Nombre d'avis affichés", 1, 24)}

        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Témoignages personnalisés ({customReviews.length})
            </span>
            <button
              type="button"
              onClick={() =>
                onSettingsChange("customReviews", [
                  ...customReviews,
                  { author: "Client Vérifié (Alger)", rating: 5, comment: "Excellent produit et livraison rapide !" },
                ])
              }
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F97316] text-white text-[11px] font-bold cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Ajouter</span>
            </button>
          </div>
          {customReviews.map((rev, idx) => (
            <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  value={rev.author}
                  onChange={(e) => {
                    const next = [...customReviews];
                    next[idx] = { ...next[idx], author: e.target.value };
                    onSettingsChange("customReviews", next);
                  }}
                  placeholder="Nom & Wilaya"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange("customReviews", customReviews.filter((_, i) => i !== idx))
                  }
                  className="px-2 rounded border border-rose-200 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={rev.comment}
                onChange={(e) => {
                  const next = [...customReviews];
                  next[idx] = { ...next[idx], comment: e.target.value };
                  onSettingsChange("customReviews", next);
                }}
                placeholder="Commentaire du client"
                className="w-full rounded-lg border border-[#E4E7EC] p-2 text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. DELIVERY INFO (58/69 WILAYAS)
  if (sectionType === "delivery_info") {
    const customTariffs = Array.isArray(settings.customTariffs)
      ? (settings.customTariffs as Array<{
          wilayaName: string;
          estimatedDays: string;
          priceDZD: number;
          homeDeliveryAvailable: boolean;
        }>)
      : [];

    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <Truck className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Livraison & Tarifs Wilayas</span>
        </div>

        <AlgeriaEcommercePresets
          sectionType="delivery_info"
          onApplyPreset={(patch) => onSettingsChange(patch)}
        />

        {renderText("title", "Titre de la section", "Expédition Rapide sur les 58 Wilayas")}
        {renderText("defaultTimeframe", "Délai moyen d'expédition", "24h - 48h")}
        <div className="grid grid-cols-2 gap-2">
          {renderNumber("stopDeskPrice", "Tarif Stop-Desk (DA)", 0, 5000, 50)}
          {renderNumber("homeDeliveryPrice", "Tarif Domicile (DA)", 0, 5000, 50)}
        </div>
        {renderNumber("freeShippingAbove", "Livraison offerte dès (DA)", 0, 1000000, 500)}

        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Wilayas mises en avant ({customTariffs.length})
            </span>
            <button
              type="button"
              onClick={() =>
                onSettingsChange("customTariffs", [
                  ...customTariffs,
                  { wilayaName: "16 - Alger", estimatedDays: "24h", priceDZD: 400, homeDeliveryAvailable: true },
                ])
              }
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F97316] text-white text-[11px] font-bold cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Ajouter Wilaya</span>
            </button>
          </div>
          {customTariffs.map((t, idx) => (
            <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  value={t.wilayaName}
                  onChange={(e) => {
                    const next = [...customTariffs];
                    next[idx] = { ...next[idx], wilayaName: e.target.value };
                    onSettingsChange("customTariffs", next);
                  }}
                  placeholder="Ex: 31 - Oran"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange("customTariffs", customTariffs.filter((_, i) => i !== idx))
                  }
                  className="px-2 rounded border border-rose-200 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  value={t.estimatedDays}
                  onChange={(e) => {
                    const next = [...customTariffs];
                    next[idx] = { ...next[idx], estimatedDays: e.target.value };
                    onSettingsChange("customTariffs", next);
                  }}
                  placeholder="Délai (ex: 24h)"
                  className={inputClass}
                />
                <input
                  type="number"
                  min={0}
                  value={t.priceDZD}
                  onChange={(e) => {
                    const next = [...customTariffs];
                    next[idx] = { ...next[idx], priceDZD: Number(e.target.value) };
                    onSettingsChange("customTariffs", next);
                  }}
                  placeholder="Prix DA"
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. RETURN POLICY
  if (sectionType === "return_policy") {
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <RotateCcw className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Politique de Retours & Échanges</span>
        </div>

        <AlgeriaEcommercePresets
          sectionType="return_policy"
          onApplyPreset={(patch) => onSettingsChange(patch)}
        />

        {renderText("title", "Titre de la section", "Retours & Échanges")}
        {renderNumber("delayDays", "Délai de retour accepté (jours)", 1, 90)}
        <label className={labelClass}>
          <span>Prise en charge des frais de retour</span>
          <select
            value={String(settings.returnShippingFeeBy || "buyer")}
            onChange={(e) => onSettingsChange("returnShippingFeeBy", e.target.value)}
            className={inputClass}
          >
            <option value="buyer">À la charge du client</option>
            <option value="seller">À la charge de la boutique</option>
            <option value="free">Retours 100% gratuits</option>
          </select>
        </label>
        <label className={labelClass}>
          <span>Conditions détaillées</span>
          <textarea
            rows={4}
            value={String(settings.conditions || "")}
            onChange={(e) => onSettingsChange("conditions", e.target.value)}
            className="w-full rounded-lg border border-[#E4E7EC] bg-white p-2.5 text-xs focus:border-[#F97316] focus:outline-none"
          />
        </label>
      </div>
    );
  }

  // 5. CONTACT FOOTER
  if (sectionType === "contact_footer") {
    return (
      <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <Phone className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Coordonnées & Support Boutique</span>
        </div>
        {renderText("title", "Titre du bloc contact", "Service Client & Contact")}
        {renderText("shopPhone", "Téléphone service client", "0550 00 00 00")}
        {renderText("shopEmail", "Adresse e-mail", "contact@boutique.dz")}
        {renderText("wilaya", "Wilaya", "Alger")}
        {renderText("address", "Adresse physique / Point de retrait")}
        {renderText("workingHours", "Horaires d'ouverture", "Samedi - Jeudi : 09h00 - 18h00")}
        {renderText("socialInstagram", "Lien ou @ Instagram")}
        {renderText("socialFacebook", "Page Facebook")}
        {renderText("socialTiktok", "Compte TikTok")}
      </div>
    );
  }

  return null;
};
