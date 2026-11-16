import React, { useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Product } from "../../../../../domains/product/product.types";
import {
  CategoryItem,
  CustomPageSection,
  CustomPageSectionType,
  FeaturedCategoriesSettings,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";
import {
  resolveCategoryAssignedProducts,
  slugifyCategoryValue,
} from "../../../../../domains/seller/studioCatalogResolver";
import { getSectorPresetCategories } from "../../constants/sectorCoherenceDefaults";
import {
  SectorPresetCategoriesBar,
  mergeSectorPresetCategories,
} from "./SectorPresetCategoriesBar";

interface CatalogCategoriesSubPanelProps {
  categoriesSection?: CustomPageSection;
  products?: Product[];
  activeSector?: StoreThemeSector;
  onUpdateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
}

export const CatalogCategoriesSubPanel: React.FC<CatalogCategoriesSubPanelProps> = ({
  categoriesSection,
  products = [],
  activeSector = "mode",
  onUpdateSection,
  onAddSection,
}) => {
  const [newCatName, setNewCatName] = useState("");
  const [newCatSubtitle, setNewCatSubtitle] = useState("");
  const [newCatImage, setNewCatImage] = useState("");

  const categoriesList: CategoryItem[] = Array.isArray(
    (categoriesSection?.settings as FeaturedCategoriesSettings | undefined)?.categories
  )
    ? (categoriesSection?.settings as FeaturedCategoriesSettings).categories
    : [];

  const applyCategoriesUpdate = (nextCategories: CategoryItem[], defaultTitle = "Nos Rayons & Collections") => {
    if (categoriesSection) {
      onUpdateSection(categoriesSection.id, {
        settings: {
          ...(categoriesSection.settings as FeaturedCategoriesSettings),
          categories: nextCategories,
        },
      });
    } else {
      onAddSection(
        "featured_categories",
        {
          title: defaultTitle,
          subtitle: "Sélection thématique adaptée à votre univers",
          layout: "bento",
          categories: nextCategories,
        },
        "Rayons & Catégories"
      );
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;

    const slug = slugifyCategoryValue(cleanName) || `cat-${Date.now()}`;
    const sectorDefaults = getSectorPresetCategories(activeSector);
    const fallbackImg =
      sectorDefaults[categoriesList.length % Math.max(1, sectorDefaults.length)]?.imageUrl;

    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      subtitle: newCatSubtitle.trim() || "Collection dédiée",
      slug,
      imageUrl: newCatImage.trim() || fallbackImg,
      selectionMode: "auto",
      categoryFilter: cleanName,
    };

    applyCategoriesUpdate([...categoriesList, newCat], "Nos Rayons & Catégories");
    setNewCatName("");
    setNewCatSubtitle("");
    setNewCatImage("");
  };

  const handleReplacePresets = () => {
    applyCategoriesUpdate(getSectorPresetCategories(activeSector));
  };

  const handleMergePresets = () => {
    const merged = mergeSectorPresetCategories(categoriesList, getSectorPresetCategories(activeSector));
    applyCategoriesUpdate(merged);
  };

  const handleRemoveCategory = (catId: string) => {
    if (!categoriesSection) return;
    applyCategoriesUpdate(categoriesList.filter((c) => c.id !== catId));
  };

  return (
    <div className="p-4 space-y-4">
      <SectorPresetCategoriesBar
        activeSector={activeSector}
        existingCount={categoriesList.length}
        onReplacePresets={handleReplacePresets}
        onMergePresets={handleMergePresets}
      />

      <form
        onSubmit={handleAddCategory}
        className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2.5"
      >
        <h4 className="text-xs font-extrabold text-[#17191C] flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-[#023859]" />
          <span>Nouvelle Catégorie / Rayon</span>
        </h4>
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="Nom du rayon (ex: Nouveautés)"
          className="w-full h-8 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#17191C] focus:outline-none focus:border-[#023859]"
          required
        />
        <input
          type="text"
          value={newCatSubtitle}
          onChange={(e) => setNewCatSubtitle(e.target.value)}
          placeholder="Sous-titre (ex: Édition limitée)"
          className="w-full h-8 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#17191C] focus:outline-none focus:border-[#023859]"
        />
        <input
          type="url"
          value={newCatImage}
          onChange={(e) => setNewCatImage(e.target.value)}
          placeholder="URL photo (optionnel — visuel auto sinon)"
          className="w-full h-8 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#17191C] focus:outline-none focus:border-[#023859]"
        />
        <button
          type="submit"
          className="w-full h-8 bg-[#023859] hover:bg-[#011C40] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          + Ajouter cette catégorie
        </button>
      </form>

      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
          Rayons actifs sur la vitrine ({categoriesList.length})
        </span>
        {categoriesList.map((cat) => {
          const resolved = products.length > 0 ? resolveCategoryAssignedProducts(cat, products) : null;
          const activeCount = resolved ? resolved.items.length : (cat.itemCount ?? 0);
          return (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-[#E5E7EB] bg-white"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-9 h-9 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#023859]/10 text-[#023859] flex items-center justify-center font-bold text-xs shrink-0">
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#17191C] truncate">{cat.name}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#667085] truncate">
                    <span>{cat.subtitle || `/${cat.slug}`}</span>
                    {products.length > 0 && (
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold ${
                          activeCount === 0 ? "text-amber-700" : "text-emerald-700"
                        }`}
                      >
                        {activeCount === 0 && <AlertTriangle className="w-2.5 h-2.5" />}
                        {activeCount} actif(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat.id)}
                className="p-1.5 rounded-lg text-[#98A2B3] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
