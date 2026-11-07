import { apiDelete, apiGet, apiPost, apiPut } from "../../lib/api";
import type { SubcategoryMap, UpsertCategoryPayload } from "../../types/category.types";

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  order?: number;
  isActive?: boolean;
  icon?: string;
  image?: string;
  banner?: string;
  title?: string;
  subtitle?: string;
  parentId?: string | null;
  commissionRate?: number;
  subcategories?: SubcategoryMap;
  translations?: {
    fr?: { name?: string };
    ar?: { name?: string };
    en?: { name?: string };
  };
}

export interface AdminCategoriesResponse {
  categories: CategoryItem[];
}

export const adminApi = {
  getAdminCategories: async (): Promise<AdminCategoriesResponse> => {
    return apiGet<AdminCategoriesResponse>("/api/v1/admin/categories");
  },
  createAdminCategory: async (payload: UpsertCategoryPayload): Promise<AdminCategoriesResponse> => {
    return apiPost<AdminCategoriesResponse>("/api/v1/admin/categories", payload);
  },
  updateAdminCategory: async (id: string, payload: Partial<UpsertCategoryPayload>): Promise<AdminCategoriesResponse> => {
    return apiPut<AdminCategoriesResponse>(`/api/v1/admin/categories/${encodeURIComponent(id)}`, payload);
  },
  deleteAdminCategory: async (id: string): Promise<AdminCategoriesResponse> => {
    return apiDelete<AdminCategoriesResponse>(`/api/v1/admin/categories/${encodeURIComponent(id)}`);
  },
  harmonizeAdminCategories: async (): Promise<AdminCategoriesResponse> => {
    return apiPost<AdminCategoriesResponse>("/api/v1/admin/categories/harmonize", {});
  },
};
