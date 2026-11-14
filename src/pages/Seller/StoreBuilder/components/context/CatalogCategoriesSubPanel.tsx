import React, { useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import {
  CategoryItem,
  CustomPageSection,
  CustomPageSectionType,
  FeaturedCategoriesSettings,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";
import { getSectorPresetCategories } from "../../constants/sectorCoherenceDefaults";

interface CatalogCategoriesSubPanelProps {
  categoriesSection?: CustomPageSection;
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

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;

    const slug =
      cleanName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`;

    const sectorDefaults = getSectorPresetCategories(activeSector);
    const fallbackImg =
      sectorDefaults[categoriesList.length % Math.max(1, sectorDefaults.length)]?.imageUrl;

    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      subtitle: newCatSubtitle.trim() || "Collection dédiée",
      slug,
      imageUrl: newCatImage.trim() || fallbackImg,
    };

    const nextCategories = [...categoriesList, newCat];

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
          title: "Nos Rayons & Catégories",
          subtitle: "Explorez nos collections thématiques",
          layout: "bento",
          categories: nextCategories,
        },
        "Rayons & Catégories"
      );
    }

    setNewCatName("");
    setNewCatSubtitle("");
    setNewCatImage("");
  };

  const handleInjectSectorCategories = () => {
    const presetCats = getSectorPresetCategories(activeSector);
    if (categoriesSection) {
      onUpdateSection(categoriesSection.id, {
        settings: {
          ...(categoriesSection.settings as FeaturedCategoriesSettings),
          categories: presetCats,
        },
      });
    } else {
      onAddSection(
        "featured_categories",
        {
          title: "Nos Rayons & Collections",
          subtitle: "Sélection thématique adaptée à votre univers",
          layout: "bento",
          categories: presetCats,
        },
        "Rayons & Catégories"
      );
    }
  };

  const handleRemoveCategory = (catId: string) => {
    if (!categoriesSection) return;
    const nextCategories = categoriesList.filter((c) => c.id !== catId);
    onUpdateSection(categoriesSection.id, {
      settings: {
        ...(categoriesSection.settings as FeaturedCategoriesSettings),
        categories: nextCategories,
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F0F7FA] border border-[#54ACBF]/40">
        <div className="min-w-0">
          <span className="text-[11px] font-extrabold text-[#011C40] block">
            Rayons cohérents ({activeSector})
          </span>
          <span className="text-[10px] text-[#475467] block truncate">
            Pré-remplir avec les visuels du secteur
          </span>
        </div>
        <button
          type="button"
          data-testid="inject-sector-categories-btn"
          onClick={handleInjectSectorCategories}
          className="px-2.5 py-1.5 rounded-lg bg-[#023859] text-white text-[10.5px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Générer ({activeSector})</span>
        </button>
      </div>

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
        {categoriesList.map((cat) => (
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
                <p className="text-[10px] text-[#667085] truncate">{cat.subtitle || `/${cat.slug}`}</p>
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
        ))}
      </div>
    </div>
  );
};
