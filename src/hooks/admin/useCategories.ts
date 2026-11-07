import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, CategoryItem } from "../../services/api/admin.api";
import { PRODUCT_HIERARCHY } from "../../constants";

const FALLBACK_CATEGORIES: CategoryItem[] = Object.entries(PRODUCT_HIERARCHY).map(([name, subcategories], index) => ({
  id: name,
  name,
  order: index,
  isActive: true,
  commissionRate: 5,
  subcategories,
}));

export function useCategories() {
  const queryClient = useQueryClient();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: adminApi.getAdminCategories,
  });

  const categories = useMemo<CategoryItem[]>(() => {
    if (data?.categories && data.categories.length > 0) {
      return data.categories;
    }
    return FALLBACK_CATEGORIES;
  }, [data]);

  const mutate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
    ]);
  }, [queryClient]);

  return {
    categories,
    isLoading,
    isError: error,
    mutate,
    refetch,
  };
}
