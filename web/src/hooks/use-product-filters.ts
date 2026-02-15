import { useCallback, useMemo } from 'react';
import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsStringLiteral,
} from 'nuqs';
import type { ProductQuery, ProductCategory } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/types/product';

const sortByValues = ['name', 'price', 'quantity', 'createdAt'] as const;
const sortOrderValues = ['asc', 'desc'] as const;

const filtersParsers = {
  search: parseAsString,
  category: parseAsStringLiteral(PRODUCT_CATEGORIES),
  minPrice: parseAsFloat,
  maxPrice: parseAsFloat,
  inStock: parseAsBoolean,
  sortBy: parseAsStringLiteral(sortByValues),
  sortOrder: parseAsStringLiteral(sortOrderValues),
  page: parseAsInteger,
  limit: parseAsInteger,
};

export function useProductFilters() {
  const [params, setParams] = useQueryStates(filtersParsers, {
    history: 'replace',
  });

  const query: ProductQuery = useMemo(() => {
    const q: ProductQuery = {};
    if (params.search) q.search = params.search;
    if (params.category) q.category = params.category as ProductCategory;
    if (params.minPrice != null) q.minPrice = params.minPrice;
    if (params.maxPrice != null) q.maxPrice = params.maxPrice;
    if (params.inStock != null) q.inStock = params.inStock;
    if (params.sortBy) q.sortBy = params.sortBy;
    if (params.sortOrder) q.sortOrder = params.sortOrder;
    if (params.page != null) q.page = params.page;
    if (params.limit != null) q.limit = params.limit;
    return q;
  }, [params]);

  const setFilter = useCallback(
    (updates: Partial<ProductQuery>) => {
      const nuqsUpdates: Partial<typeof params> = {};
      for (const [key, value] of Object.entries(updates)) {
        (nuqsUpdates as Record<string, unknown>)[key] =
          value === undefined || value === '' ? null : value;
      }
      // Reset page when non-page filters change
      if (!('page' in updates)) {
        nuqsUpdates.page = null;
      }
      void setParams(nuqsUpdates);
    },
    [setParams],
  );

  const clearFilters = useCallback(() => {
    void setParams({
      search: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
      sortBy: null,
      sortOrder: null,
      page: null,
      limit: null,
    });
  }, [setParams]);

  const hasFilters = useMemo(() => {
    return !!(
      params.search ||
      params.category ||
      params.minPrice != null ||
      params.maxPrice != null ||
      params.inStock != null ||
      params.sortBy ||
      params.sortOrder
    );
  }, [params]);

  return { query, setFilter, clearFilters, hasFilters };
}
