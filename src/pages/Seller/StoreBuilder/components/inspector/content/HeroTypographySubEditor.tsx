import React from "react";
import {
  CustomPageSection,
  HeroSubElement,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { SmartLinkPicker } from "../controls/SmartLinkPicker";

interface HeroTypographySubEditorProps {
  activeSubPanel: HeroSubElement;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products?: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
  labelClass: string;
}

export const HeroTypographySubEditor: React.FC<HeroTypographySubEditorProps> = ({
  activeSubPanel,
  settings,
  sections = [],
  products = [],
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  if (activeSubPanel === "badge") {
    return (
      <div className="space-y-3 p-3 rounded-xl border border-orange-200 bg-orange-50/30">
        <label className={labelClass}>
          <span>Texte du Badge Sur-titre</span>
          <input
            type="text"
            value={typeof settings.badgeText === "string" ? settings.badgeText : ""}
            onChange={(e) => onSettingsChange("badgeText", e.target.value)}
            placeholder="ex: 🔥 NOUVELLE COLLECTION"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span>Couleur du Badge</span>
          <input
            type="color"
            value={typeof settings.badgeBgColor === "string" ? settings.badgeBgColor : "#F97316"}
            onChange={(e) => onSettingsChange("badgeBgColor", e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer p-1 bg-white"
          />
        </label>
      </div>
    );
  }

  if (activeSubPanel === "title") {
    return (
      <div className="space-y-3 p-3 rounded-xl border border-orange-200 bg-orange-50/30">
        <label className={labelClass}>
          <span>En-tête & Titre Principal</span>
          <textarea
            rows={2}
            value={typeof settings.title === "string" ? settings.title : ""}
            onChange={(e) => onSettingsChange("title", e.target.value)}
            placeholder="ex: L'Élégance de l'Artisanat Algérien"
            className="w-full rounded-lg border border-[#E4E7EC] bg-white p-2.5 text-xs text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
        </label>
        <label className={labelClass}>
          <span>Taille du Titre (Mobile)</span>
          <select
            value={typeof settings.titleSizeMobile === "string" ? settings.titleSizeMobile : "lg"}
            onChange={(e) => onSettingsChange("titleSizeMobile", e.target.value)}
            className={inputClass}
          >
            <option value="sm">Compact (20px)</option>
            <option value="md">Standard (24px)</option>
            <option value="lg">Grand (28px)</option>
            <option value="xl">Impactant (32px)</option>
          </select>
        </label>
      </div>
    );
  }

  if (activeSubPanel === "subtitle") {
    return (
      <div className="space-y-3 p-3 rounded-xl border border-orange-200 bg-orange-50/30">
        <label className={labelClass}>
          <span>Sous-titre Descriptif</span>
          <textarea
            rows={3}
            value={typeof settings.subtitle === "string" ? settings.subtitle : ""}
            onChange={(e) => onSettingsChange("subtitle", e.target.value)}
            placeholder="ex: Découvrez nos créations uniques façonnées par nos maîtres artisans..."
            className="w-full rounded-lg border border-[#E4E7EC] bg-white p-2.5 text-xs text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
        </label>
      </div>
    );
  }

  if (activeSubPanel === "cta" || activeSubPanel === "ctaPrimary") {
    return (
      <div className="space-y-3 p-3 rounded-xl border border-orange-200 bg-orange-50/30">
        <label className={labelClass}>
          <span>Texte du Bouton Principal</span>
          <input
            type="text"
            value={typeof settings.ctaText === "string" ? settings.ctaText : ""}
            onChange={(e) => onSettingsChange("ctaText", e.target.value)}
            placeholder="ex: Découvrir la Sélection →"
            className={inputClass}
          />
        </label>

        <SmartLinkPicker
          label="Destination du Bouton Principal"
          value={typeof settings.ctaLink === "string" ? settings.ctaLink : "#catalog"}
          onChange={(href) => onSettingsChange("ctaLink", href)}
          products={products}
          sections={sections}
        />

        <label className={labelClass}>
          <span>Style du Bouton Principal</span>
          <select
            value={typeof settings.ctaStyle === "string" ? settings.ctaStyle : "solid"}
            onChange={(e) => onSettingsChange("ctaStyle", e.target.value)}
            className={inputClass}
          >
            <option value="solid">Plein avec ombre</option>
            <option value="pill">Capsule arrondie (Pill)</option>
            <option value="outline">Contour élégant</option>
            <option value="glass">Verre translucide</option>
          </select>
        </label>
      </div>
    );
  }

  if (activeSubPanel === "ctaSecondary") {
    return (
      <div className="space-y-3 p-3 rounded-xl border border-orange-200 bg-orange-50/30">
        <label className={labelClass}>
          <span>Texte du Bouton Secondaire (Optionnel)</span>
          <input
            type="text"
            value={typeof settings.secondaryCtaText === "string" ? settings.secondaryCtaText : ""}
            onChange={(e) => onSettingsChange("secondaryCtaText", e.target.value)}
            placeholder="ex: En savoir plus sur notre atelier"
            className={inputClass}
          />
        </label>

        <SmartLinkPicker
          label="Destination du Bouton Secondaire"
          value={typeof settings.secondaryCtaLink === "string" ? settings.secondaryCtaLink : "#catalog"}
          onChange={(href) => onSettingsChange("secondaryCtaLink", href)}
          products={products}
          sections={sections}
        />
      </div>
    );
  }

  return null;
};
