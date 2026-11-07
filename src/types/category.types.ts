export type SubcategoryMap = Record<string, string[]>;

export type CategoryHierarchyMap = Record<string, SubcategoryMap>;

export interface CategoryTranslations {
  fr?: { name?: string; description?: string };
  ar?: { name?: string; description?: string };
  en?: { name?: string; description?: string };
}

export interface MarketplaceCategoryDTO {
  id: string;
  name: string;
  slug: string;
  order: number;
  commissionRate: number;
  isActive: boolean;
  icon?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  subcategories: SubcategoryMap;
  translations?: CategoryTranslations;
  updatedAt?: string;
}

export interface CategoriesSettingsDoc {
  hierarchy: CategoryHierarchyMap;
  sortOrder: string[];
  disabledCategories?: string[];
  commissions?: Record<string, number>;
  isCustomized?: boolean;
  updatedAt?: unknown;
}

export interface UpsertCategoryPayload {
  id?: string;
  name: string;
  commissionRate?: number;
  isActive?: boolean;
  order?: number;
  icon?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  subcategories?: SubcategoryMap;
  translations?: CategoryTranslations;
}
