import React from "react";
import { Product } from "../../../../../domains/product/product.types";
import { HeroContentEditor } from "./content/HeroContentEditor";
import { ProductSelectionEditor } from "./content/ProductSelectionEditor";
import { ListContentEditor } from "./content/ListContentEditor";
import { InfoContentEditor } from "./content/InfoContentEditor";
import { CategoryContentEditor } from "./content/CategoryContentEditor";

interface SectionContentTabProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#17191C] focus:border-[#F97316] focus:outline-none";
const labelClass = "block space-y-1.5 text-[12px] font-medium text-[#475467]";

export const SectionContentTab: React.FC<SectionContentTabProps> = ({
  sectionType,
  settings,
  products,
  onSettingsChange,
}) => {
  const isCategorySection = sectionType === "featured_categories" || "categories" in settings;

  if (isCategorySection) {
    return (
      <CategoryContentEditor
        settings={settings}
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
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <ProductSelectionEditor
        settings={settings}
        products={products}
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <ListContentEditor
        settings={settings}
        products={products}
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
      />

      <InfoContentEditor
        sectionType={sectionType}
        settings={settings}
        onSettingsChange={onSettingsChange}
        inputClass={inputClass}
        labelClass={labelClass}
      />
    </div>
  );
};
