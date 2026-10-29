import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, CategoryItem } from '../../services/api/admin.api';

const EMPTY_CATEGORIES: CategoryItem[] = [];

export function useCategories() {
  const queryClient = useQueryClient();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getAdminCategories,
  });

  const mutate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
  }, [queryClient]);

  return {
    categories: data?.categories ?? EMPTY_CATEGORIES,
    isLoading,
    isError: error,
    mutate,
    refetch,
  };
}

