import React from "react";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { HeroContentEditor } from "./content/HeroContentEditor";
import { ProductSelectionEditor } from "./content/ProductSelectionEditor";
import { ListContentEditor } from "./content/ListContentEditor";
import { InfoContentEditor } from "./content/InfoContentEditor";
import { CategoryContentEditor } from "./content/CategoryContentEditor";

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
  "h-9 w-full rounded-lg border border-[#E4E7EC] bg-white px-3 text-[12px] text-[#17191C] focus:border-[#F97316] focus:outline-none";
const labelClass = "block space-y-1 text-[12px] font-semibold text-[#475467]";

export const SectionContentTab: React.FC<SectionContentTabProps> = ({
  sectionType,
  settings,
  sections = [],
  products,
  onSettingsChange,
}) => {
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
