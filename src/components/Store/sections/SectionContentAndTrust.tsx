import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";

interface SectionContentAndTrustProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SectionContentAndTrust: React.FC<SectionContentAndTrustProps> = ({
  section,
  theme,
  isEditable,
  isSelected,
  onSelect,
}) => {
  const styles = section.styles;

  const containerClasses = `py-8 px-4 transition-all cursor-pointer rounded-2xl ${
    isEditable && isSelected ? "ring-4 ring-emerald-500 shadow-2xl z-10" : ""
  }`;

  const containerStyle: React.CSSProperties = {
    backgroundColor: styles.backgroundColor || "transparent",
    color: styles.textColor || "#1F2937",
  };

  if (section.type === "brand_story") {
    const settings = section.settings as { heading: string; bodyText: string; imageUrl?: string; signature?: string };
    return (
      <div onClick={isEditable ? onSelect : undefined} className={containerClasses} style={containerStyle}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {settings.imageUrl && (
            <img src={settings.imageUrl} alt={settings.heading} className="w-full md:w-1/2 rounded-2xl object-cover h-64 shadow-md" />
          )}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: theme.primaryColor }}>
              {settings.heading}
            </h2>
            <p className="text-sm md:text-base opacity-90 leading-relaxed whitespace-pre-line">{settings.bodyText}</p>
            {settings.signature && <p className="mt-4 font-semibold italic text-emerald-600">{settings.signature}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "delivery_info") {
    const settings = section.settings as { title?: string; defaultTimeframe?: string; freeShippingAbove?: number };
    return (
      <div onClick={isEditable ? onSelect : undefined} className={containerClasses} style={containerStyle}>
        <div className="max-w-4xl mx-auto text-center bg-purple-50 dark:bg-purple-950/30 p-6 md:p-8 rounded-2xl border border-purple-100 dark:border-purple-900">
          <h2 className="text-lg md:text-2xl font-bold text-purple-900 dark:text-purple-200 mb-2">
            {settings.title || "Livraison sur les 69 Wilayas"}
          </h2>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Délai d'expédition moyen : <span className="font-bold">{settings.defaultTimeframe || "24h - 48h"}</span>
          </p>
          {settings.freeShippingAbove && (
            <span className="inline-block mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Livraison offerte dès {settings.freeShippingAbove.toLocaleString("fr-DZ")} DZD d'achats
            </span>
          )}
        </div>
      </div>
    );
  }

  if (section.type === "faq_accordion") {
    const settings = section.settings as { title?: string; items?: Array<{ question: string; answer: string }> };
    const items = settings.items || [];
    return (
      <div onClick={isEditable ? onSelect : undefined} className={containerClasses} style={containerStyle}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6" style={{ color: theme.primaryColor }}>
            {settings.title || "Questions Fréquentes"}
          </h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <details key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <summary className="font-bold text-sm md:text-base cursor-pointer text-gray-900 dark:text-gray-100">{item.question}</summary>
                <p className="mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "contact_footer") {
    const settings = section.settings as { shopPhone?: string; shopEmail?: string; wilaya?: string; workingHours?: string };
    return (
      <div onClick={isEditable ? onSelect : undefined} className={containerClasses} style={containerStyle}>
        <div className="max-w-4xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm">
          <div>
            <span className="font-bold block text-base" style={{ color: theme.primaryColor }}>Contact Boutique</span>
            {settings.wilaya && <p>Wilaya: {settings.wilaya}</p>}
            {settings.workingHours && <p>{settings.workingHours}</p>}
          </div>
          <div className="text-right">
            {settings.shopPhone && <p className="font-semibold">Tél: {settings.shopPhone}</p>}
            {settings.shopEmail && <p>Email: {settings.shopEmail}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for remaining sections (verified_reviews, return_policy, showcase_video)
  return (
    <div onClick={isEditable ? onSelect : undefined} className={containerClasses} style={containerStyle}>
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
        <h3 className="font-bold text-base md:text-lg mb-1">{section.title || section.type}</h3>
        <p className="text-xs text-gray-500">Section {section.type} active</p>
      </div>
    </div>
  );
};
