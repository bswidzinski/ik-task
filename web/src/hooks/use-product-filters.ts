import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductQuery, ProductCategory } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/types/product';

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const query: ProductQuery = useMemo(() => {
    const q: ProductQuery = {};
    const search = searchParams.get('search');
    if (search) q.search = search;
    const category = searchParams.get('category');
    if (category && PRODUCT_CATEGORIES.includes(category as ProductCategory))
      q.category = category as ProductCategory;
    const minPrice = searchParams.get('minPrice');
    if (minPrice && !isNaN(Number(minPrice))) q.minPrice = Number(minPrice);
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice && !isNaN(Number(maxPrice))) q.maxPrice = Number(maxPrice);
    const inStock = searchParams.get('inStock');
    if (inStock === 'true') q.inStock = true;
    if (inStock === 'false') q.inStock = false;
    const sortBy = searchParams.get('sortBy') as ProductQuery['sortBy'];
    if (sortBy && ['name', 'price', 'quantity', 'createdAt'].includes(sortBy))
      q.sortBy = sortBy;
    const sortOrder = searchParams.get('sortOrder') as ProductQuery['sortOrder'];
    if (sortOrder && ['asc', 'desc'].includes(sortOrder))
      q.sortOrder = sortOrder;
    const page = searchParams.get('page');
    if (page && Number(page) >= 1) q.page = Number(page);
    const limit = searchParams.get('limit');
    if (limit && Number(limit) >= 1) q.limit = Number(limit);
    return q;
  }, [searchParams]);

  const setFilter = useCallback(
    (updates: Partial<ProductQuery>, debounceMs?: number) => {
      const apply = () => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            // Reset page when filters change (unless page itself is being set)
            if (!('page' in updates)) {
              next.delete('page');
            }
            for (const [key, value] of Object.entries(updates)) {
              if (value == null || value === '' || value === undefined) {
                next.delete(key);
              } else {
                next.set(key, String(value));
              }
            }
            return next;
          },
          { replace: true },
        );
      };

      if (debounceMs) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(apply, debounceMs);
      } else {
        apply();
      }
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const hasFilters = useMemo(() => {
    const filterKeys = [
      'search',
      'category',
      'minPrice',
      'maxPrice',
      'inStock',
      'sortBy',
      'sortOrder',
    ];
    return filterKeys.some((k) => searchParams.has(k));
  }, [searchParams]);

  return { query, setFilter, clearFilters, hasFilters };
}
