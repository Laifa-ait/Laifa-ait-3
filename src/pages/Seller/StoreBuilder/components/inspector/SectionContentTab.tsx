import React from "react";
import { Sparkles } from "lucide-react";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { HeroContentEditor } from "./content/HeroContentEditor";
import { ProductSelectionEditor } from "./content/ProductSelectionEditor";
import { ListContentEditor } from "./content/ListContentEditor";
import { InfoContentEditor } from "./content/InfoContentEditor";
import { CategoryContentEditor } from "./content/CategoryContentEditor";
import { KineticMarqueeContentEditor } from "./content/KineticMarqueeContentEditor";

interface SectionContentTabProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
}

const inputClass =
  "h-9 w-full rounded-lg border border-[#E4E7EC] bg-white px-3 text-[12px] text-[#17191C] focus:border-[#023859] focus:outline-none";
const labelClass = "block space-y-1 text-[12px] font-semibold text-[#475467]";

export const SectionContentTab: React.FC<SectionContentTabProps> = ({
  sectionType,
  settings,
  sections = [],
  products,
  onSettingsChange,
}) => {
  if (sectionType === "kinetic_marquee") {
    return (
      <KineticMarqueeContentEditor
        settings={settings}
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
        labelClass={labelClass}
      />
    );
  }

  const isCategorySection = sectionType === "featured_categories" || "categories" in settings;

  if (isCategorySection) {
    return (
      <CategoryContentEditor
        settings={settings}
        sections={sections}
        products={products}
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Astuce Typographie Éditoriale (Pilier 3) */}
      <div className="px-2.5 py-2 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between gap-2 text-[10.5px] text-amber-950">
        <span className="flex items-center gap-1.5 font-semibold leading-tight">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Astuce Titre : écrivez <strong>*mot*</strong> pour l'italique d'art ou{" "}
            <strong>&#123;mot&#125;</strong> pour le soulignement pinceau SVG.
          </span>
        </span>
      </div>

      <HeroContentEditor
        sectionType={sectionType}
        settings={settings}
        sections={sections}
        products={products}
        onSettingsChange={(f, v) => onSettingsChange(f, v)}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <ProductSelectionEditor
        sectionType={sectionType}
        settings={settings}
        products={products}
        onSettingsChange={(f, v) => onSettingsChange(f, v)}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <ListContentEditor
        sectionType={sectionType}
        settings={settings}
        sections={sections}
        products={products}
        onSettingsChange={(f, v) => onSettingsChange(f, v)}
        inputClass={inputClass}
      />

      <InfoContentEditor
        sectionType={sectionType}
        settings={settings}
        products={products}
        onSettingsChange={(f, v) => onSettingsChange(f, v)}
        inputClass={inputClass}
        labelClass={labelClass}
      />
    </div>
  );
};
