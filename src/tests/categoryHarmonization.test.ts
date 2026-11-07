import { describe, it, expect } from "vitest";
import { PRODUCT_HIERARCHY, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_IMAGES } from "../constants";
import { CATEGORY_ICONES8_DATA, getCategoryIcon8Info } from "../constants/categoryIcons8";
import { DYNAMIC_CATEGORIES } from "../config/dynamicFilters";
import { CATEGORY_KEYS } from "../pages/Admin/CategoryPhotos/types";
import {
  resolveCanonicalCategoryKey,
  deduplicateCategoryHierarchy,
  deduplicateCategoryOrder,
} from "../utils/categoryCanonical";
import { getCategoryTheme } from "../components/Home/categoryThemes";

describe("Harmonisation des Catégories Marketplace Olmart", () => {
  const canonicalCategories = Object.keys(PRODUCT_HIERARCHY);

  it("possède exactement les 13 rayons officiels harmonisés dans PRODUCT_HIERARCHY", () => {
    expect(canonicalCategories).toEqual([
      "Maison & Déco",
      "Électronique",
      "Électroménager",
      "Mode",
      "Artisanat & Tradition",
      "Beauté & Santé",
      "Auto & Moto",
      "Sport & Loisirs",
      "Bébé & Puériculture",
      "Bricolage & Outillage",
      "Jeux & Jouets",
      "Supermarché",
      "Scolaire & Bureau",
    ]);
  });

  it("synchronise chaque rayon officiel dans CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_IMAGES, CATEGORY_KEYS et DYNAMIC_CATEGORIES", () => {
    const photoKeys = CATEGORY_KEYS.map((k) => k.key);

    for (const category of canonicalCategories) {
      expect(CATEGORY_ICONS[category], `Icône manquante pour ${category}`).toBeDefined();
      expect(CATEGORY_COLORS[category], `Couleur manquante pour ${category}`).toBeDefined();
      expect(CATEGORY_IMAGES[category], `Image par défaut manquante pour ${category}`).toBeDefined();
      expect(CATEGORY_ICONES8_DATA[category], `Icons8 manquant pour ${category}`).toBeDefined();
      expect(DYNAMIC_CATEGORIES[category], `Filtres dynamiques manquants pour ${category}`).toBeDefined();
      expect(photoKeys).toContain(category);
    }
  });

  it("corrige les incohérences historiques de libellés et maintient les alias de rétrocompatibilité", () => {
    expect(CATEGORY_ICONES8_DATA["Électroménager"].label).toBe("Électroménager");
    expect(getCategoryIcon8Info("Artisanat Algérien")?.label).toBe("Artisanat & Tradition");
    expect(getCategoryIcon8Info("Mode & Vêtements")?.label).toBe("Mode");
    expect(getCategoryIcon8Info("Auto & Moto - Accessoires")?.label).toBe("Auto & Moto");

    const modeSubcategories = Object.keys(PRODUCT_HIERARCHY["Mode"]);
    expect(modeSubcategories).toContain("Mode Homme");
    expect(modeSubcategories).toContain("Mode Femme");
    expect(modeSubcategories).toContain("Mode Enfant & Bébé");
    expect(modeSubcategories).not.toContain("Homme");
    expect(modeSubcategories).not.toContain("Femme");
    expect(modeSubcategories).not.toContain("Enfant");
  });

  it("élimine tous les doublons de catégories historiques (Supermarché & Terroir, Maison & Décoration, Tech & Performance, etc.)", () => {
    expect(resolveCanonicalCategoryKey("Supermarché & Terroir")).toBe("Supermarché");
    expect(resolveCanonicalCategoryKey("Maison & Décoration")).toBe("Maison & Déco");
    expect(resolveCanonicalCategoryKey("Tech & Performance")).toBe("Électronique");
    expect(resolveCanonicalCategoryKey("Mode & Élégance")).toBe("Mode");
    expect(resolveCanonicalCategoryKey("Mode & Vêtements")).toBe("Mode");
    expect(resolveCanonicalCategoryKey("Artisanat Algérien")).toBe("Artisanat & Tradition");
    expect(resolveCanonicalCategoryKey("Home Appliances")).toBe("Électroménager");
    expect(resolveCanonicalCategoryKey("Outillage & Travaux")).toBe("Bricolage & Outillage");

    const dirtyHierarchy = {
      "Supermarché": { "Épicerie": ["Dattes"] },
      "Supermarché & Terroir": { "Épicerie": ["Huile d'olive"], "Boissons": ["Café"] },
      "Maison & Déco": { "Salon": ["Canapé"] },
      "Maison & Décoration": { "Chambre": ["Lit"] },
    };

    const cleanHierarchy = deduplicateCategoryHierarchy(dirtyHierarchy);
    expect(Object.keys(cleanHierarchy)).toEqual(["Supermarché", "Maison & Déco"]);
    expect(cleanHierarchy["Supermarché"]["Épicerie"]).toEqual(["Dattes", "Huile d'olive"]);
    expect(cleanHierarchy["Supermarché"]["Boissons"]).toEqual(["Café"]);
    expect(Object.keys(cleanHierarchy["Maison & Déco"])).toEqual(["Salon", "Chambre"]);

    const cleanOrder = deduplicateCategoryOrder(
      ["Supermarché & Terroir", "Supermarché", "Maison & Décoration", "Maison & Déco"],
      Object.keys(cleanHierarchy),
    );
    expect(cleanOrder).toEqual(["Supermarché", "Maison & Déco"]);
  });

  it("fournit un thème éditorial architectural complet avec photographie HD et sous-catégories pour chaque rayon", () => {
    for (const category of canonicalCategories) {
      const theme = getCategoryTheme(category);
      expect(theme.editionTag.length).toBeGreaterThan(3);
      expect(theme.defaultImage).toMatch(/^https:\/\/images\.unsplash\.com\//);
      expect(theme.defaultSubcategories.length).toBeGreaterThanOrEqual(2);
    }
    expect(getCategoryTheme("Supermarché & Terroir").defaultImage).toBe(
      getCategoryTheme("Supermarché").defaultImage,
    );
  });
});

