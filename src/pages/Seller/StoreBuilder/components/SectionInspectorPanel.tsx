import React, { useState } from "react";
import { CustomPageSection, CustomPageSectionStyles } from "../../../../domains/seller/customPage.types";
import { Product } from "../../../../domains/product/product.types";

interface SectionInspectorPanelProps {
  section: CustomPageSection | null;
  products: Product[];
  onUpdateSection: (sectionId: string, updates: Partial<CustomPageSection>) => void;
}

export const SectionInspectorPanel: React.FC<SectionInspectorPanelProps> = ({
  section,
  products,
  onUpdateSection,
}) => {
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");

  if (!section) {
    return (
      <div className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 w-full lg:w-80 p-6 text-center text-gray-400 text-xs flex items-center justify-center h-full">
        Sélectionnez une section dans l'aperçu ou l'arborescence pour modifier ses propriétés.
      </div>
    );
  }

  const handleSettingsChange = (field: string, value: unknown) => {
    onUpdateSection(section.id, {
      settings: { ...section.settings, [field]: value },
    });
  };

  const handleStylesChange = (field: keyof CustomPageSectionStyles, value: unknown) => {
    onUpdateSection(section.id, {
      styles: { ...section.styles, [field]: value },
    });
  };

  const settings = (section.settings || {}) as Record<string, unknown>;
  const styles = section.styles || {};

  return (
    <div className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 w-full lg:w-80 flex flex-col h-full shadow-sm">
      {/* Inspector Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{section.title || section.type}</h2>
        <span className="text-[11px] text-purple-700 dark:text-purple-400 font-mono">Type: {section.type}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === "content" ? "border-b-2 border-purple-600 text-purple-700 dark:text-purple-400" : "text-gray-500"
          }`}
        >
          📝 Contenu
        </button>
        <button
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === "style" ? "border-b-2 border-purple-600 text-purple-700 dark:text-purple-400" : "text-gray-500"
          }`}
        >
          🎨 Styles
        </button>
      </div>

      {/* Inspector Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === "content" && (
          <div className="space-y-3">
            {/* Title / Heading */}
            {"title" in settings && (
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Titre de la section</label>
                <input
                  type="text"
                  value={settings.title || ""}
                  onChange={(e) => handleSettingsChange("title", e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            )}

            {/* Subtitle */}
            {"subtitle" in settings && (
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Sous-titre</label>
                <input
                  type="text"
                  value={settings.subtitle || ""}
                  onChange={(e) => handleSettingsChange("subtitle", e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            )}

            {/* Image URL */}
            {"imageUrl" in settings && (
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">URL de l'image (HTTPS)</label>
                <input
                  type="url"
                  value={settings.imageUrl || ""}
                  onChange={(e) => handleSettingsChange("imageUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            )}

            {/* Featured Products Multi Selector */}
            {"productIds" in settings && Array.isArray(settings.productIds) && (
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Produits sélectionnés</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  {products.length === 0 ? (
                    <span className="text-gray-400">Aucun produit actif disponible.</span>
                  ) : (
                    products.map((p) => {
                      const isChecked = (settings.productIds as string[]).includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center space-x-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const current = (settings.productIds as string[]) || [];
                              const updated = e.target.checked
                                ? [...current, p.id]
                                : current.filter((id) => id !== p.id);
                              handleSettingsChange("productIds", updated);
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="truncate">{p.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* CTA text & link */}
            {"ctaText" in settings && (
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Bouton CTA</label>
                <input
                  type="text"
                  value={settings.ctaText || ""}
                  onChange={(e) => handleSettingsChange("ctaText", e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mb-2"
                  placeholder="Texte du bouton"
                />
                <input
                  type="text"
                  value={settings.ctaLink || ""}
                  onChange={(e) => handleSettingsChange("ctaLink", e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Lien du bouton (#catalog)"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "style" && (
          <div className="space-y-3">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Couleur de fond (Hex)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={styles.backgroundColor || "#ffffff"}
                  onChange={(e) => handleStylesChange("backgroundColor", e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.backgroundColor || ""}
                  onChange={(e) => handleStylesChange("backgroundColor", e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Largeur du conteneur</label>
              <select
                value={styles.containerWidth || "contained"}
                onChange={(e) => handleStylesChange("containerWidth", e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="contained">Encadrée (Centré max 6XL)</option>
                <option value="full">Pleine largeur (100%)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Espacement vertical (Padding)</label>
              <select
                value={styles.paddingY || "md"}
                onChange={(e) => handleStylesChange("paddingY", e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="sm">Compact (Petit)</option>
                <option value="md">Standard (Moyen)</option>
                <option value="lg">Aéré (Grand)</option>
                <option value="xl">Très Aéré</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
