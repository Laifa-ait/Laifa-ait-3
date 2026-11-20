import React from "react";
import { Sparkles } from "lucide-react";
import { CustomPageSection, CustomPageTheme, SellerStoreConfig } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { HeroContentEditor } from "./content/HeroContentEditor";
import { ProductSelectionEditor } from "./content/ProductSelectionEditor";
import { ListContentEditor } from "./content/ListContentEditor";
import { InfoContentEditor } from "./content/InfoContentEditor";
import { CategoryContentEditor } from "./content/CategoryContentEditor";
import { KineticMarqueeContentEditor } from "./content/KineticMarqueeContentEditor";

interface SectionContentTabProps {
  sectionId?: string;
  sectionType?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products: Product[];
  storeConfig?: SellerStoreConfig | null;
  theme?: CustomPageTheme;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSaveStep?: () => unknown | Promise<unknown>;
}

const inputClass =
  "h-9 w-full rounded-lg border border-[var(--studio-border)] bg-white px-3 text-[12px] text-[var(--studio-black)] focus:border-[var(--studio-primary)] focus:outline-none";
const labelClass = "block space-y-1 text-[12px] font-semibold text-[var(--studio-muted)]";

export const SectionContentTab: React.FC<SectionContentTabProps> = ({
  sectionId,
  sectionType,
  settings,
  sections = [],
  products,
  storeConfig,
  theme,
  onSettingsChange,
  onSaveStep,
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

  const isCategorySection =
    sectionType === "featured_categories" || (!sectionType && "categories" in settings);

  if (isCategorySection) {
    return (
      <CategoryContentEditor
        sectionId={sectionId}
        settings={settings}
        sections={sections}
        products={products}
        onSettingsChange={onSettingsChange}
        onSaveStep={onSaveStep}
        inputClass={inputClass}
      />
    );
  }

  const isHeroOrVideo =
    sectionType === "hero_banner" ||
    sectionType === "showcase_video" ||
    (!sectionType && ("heroLayout" in settings || "videoUrl" in settings));

  const isProductSection =
    sectionType === "featured_products" ||
    sectionType === "new_arrivals" ||
    sectionType === "best_sellers" ||
    sectionType === "product_grid" ||
    (!sectionType && ("productIds" in settings || "maxItems" in settings));

  const isListSection =
    sectionType === "promo_carousel" ||
    sectionType === "curated_collections" ||
    sectionType === "faq_accordion" ||
    (!sectionType && ("slides" in settings || "collections" in settings || "items" in settings));

  const isInfoSection =
    sectionType === "brand_story" ||
    sectionType === "verified_reviews" ||
    sectionType === "delivery_info" ||
    sectionType === "return_policy" ||
    sectionType === "contact_footer";

  return (
    <div className="space-y-3" data-testid={`section-content-tab-${sectionType || "generic"}`}>
      {isHeroOrVideo && (
        <HeroContentEditor
          sectionId={sectionId}
          sectionType={sectionType}
          settings={settings}
          sections={sections}
          products={products}
          storeConfig={storeConfig}
          storeTheme={theme || storeConfig?.theme}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
          onSaveStep={onSaveStep}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}

      {isProductSection && (
        <ProductSelectionEditor
          sectionId={sectionId}
          sectionType={sectionType}
          settings={settings}
          products={products}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
          onSaveStep={onSaveStep}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}

      {isListSection && (
        <ListContentEditor
          sectionId={sectionId}
          sectionType={sectionType}
          settings={settings}
          sections={sections}
          products={products}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
          onSaveStep={onSaveStep}
          inputClass={inputClass}
        />
      )}

      {isInfoSection && (
        <InfoContentEditor
          sectionId={sectionId}
          sectionType={sectionType}
          settings={settings}
          products={products}
          storeConfig={storeConfig}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
          onSaveStep={onSaveStep}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}

      <p className="text-[10px] text-slate-400 px-1 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Astuce : utilisez *mot* (italique) ou &#123;mot&#125; (souligné) dans vos titres.</span>
      </p>
    </div>
  );
};
