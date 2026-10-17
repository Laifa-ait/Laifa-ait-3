import React, { useState } from "react";
import { StoreConfig, CustomPageTheme } from "../../../../domains/seller/customPage.types";

interface StoreIdentityEditorProps {
  storeConfig: StoreConfig | null;
  onSaveConfig: (updated: Partial<StoreConfig>) => Promise<void>;
}

export const StoreIdentityEditor: React.FC<StoreIdentityEditorProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  const [shopName, setShopName] = useState(storeConfig?.shopName || "");
  const [shopSlug, setShopSlug] = useState(storeConfig?.shopSlug || "");
  const [shopDescription, setShopDescription] = useState(storeConfig?.shopDescription || "");
  const [wilaya, setWilaya] = useState(storeConfig?.wilaya || "Alger");
  const [commune, setCommune] = useState(storeConfig?.commune || "");
  const [primaryColor, setPrimaryColor] = useState(storeConfig?.theme?.primaryColor || "#5B3765");
  const [secondaryColor, setSecondaryColor] = useState(storeConfig?.theme?.secondaryColor || "#D4AF37");
  const [fontFamily, setFontFamily] = useState(storeConfig?.theme?.fontFamily || "Inter, sans-serif");
  const [sector, setSector] = useState(storeConfig?.theme?.sector || "mode");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedTheme: CustomPageTheme = {
        sector,
        primaryColor,
        secondaryColor,
        fontFamily,
      };

      await onSaveConfig({
        shopName,
        shopSlug,
        shopDescription,
        wilaya,
        commune,
        theme: updatedTheme,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-md border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">🎨 Identité Visuelle & Thème de la Boutique</h2>
        <p className="text-xs text-gray-500 mb-6">Personnalisez votre nom, lien d'accès, couleurs et typographie.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Nom de la boutique</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Lien personnalisé (Slug)</label>
            <div className="flex items-center">
              <span className="bg-gray-100 dark:bg-gray-800 px-3 py-2.5 border border-r-0 rounded-l-xl text-gray-500 font-mono text-xs">
                olmart.dz/store/
              </span>
              <input
                type="text"
                value={shopSlug}
                onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="flex-1 p-2.5 border rounded-r-xl dark:bg-gray-800 dark:border-gray-700 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Description de la boutique</label>
            <textarea
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={2}
              className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Secteur d'activité</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as StoreThemeSector)}
              className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="mode">Mode & Habillement</option>
              <option value="beaute">Beauté & Cosmétique</option>
              <option value="artisanat">Artisanat & Tradition</option>
              <option value="tech">High-Tech & Électronique</option>
              <option value="maison">Maison & Décoration</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Couleur Principale</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 p-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Couleur Secondaire</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 p-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Typographie</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="Inter, sans-serif">Inter (Moderne & Épuré)</option>
              <option value="'Playfair Display', serif">Playfair Display (Luxe & Élégance)</option>
              <option value="Cairo, sans-serif">Cairo (Standard & Arabe)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Wilaya d'attachement</label>
              <input
                type="text"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Commune</label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-xl shadow-md transition-transform active:scale-98 mt-6"
          >
            {saving ? "Enregistrement..." : "Enregistrer l'identité visuelle"}
          </button>
        </form>
      </div>
    </div>
  );
};
