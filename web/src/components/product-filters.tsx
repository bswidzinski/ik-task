import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ProductQuery } from '@/types/product';
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/types/product';

interface ProductFiltersProps {
  query: ProductQuery;
  setFilter: (updates: Partial<ProductQuery>) => void;
  clearFilters: () => void;
  hasFilters: boolean;
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'quantity', label: 'Quantity' },
];

export function ProductFilters({
  query,
  setFilter,
  clearFilters,
  hasFilters,
}: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(query.search ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter({ search: searchInput || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setFilter]);

  // Sync search input when query changes externally (e.g. clear filters)
  useEffect(() => {
    setSearchInput(query.search ?? '');
  }, [query.search]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="w-[150px] space-y-1">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={query.category ?? 'all'}
            onValueChange={(val) =>
              setFilter({
                category:
                  val === 'all'
                    ? undefined
                    : (val as ProductQuery['category']),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[100px] space-y-1">
          <Label className="text-xs text-muted-foreground">Min price</Label>
          <Input
            type="number"
            placeholder="$0"
            min="0"
            step="0.01"
            value={query.minPrice ?? ''}
            onChange={(e) =>
              setFilter({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="w-[100px] space-y-1">
          <Label className="text-xs text-muted-foreground">Max price</Label>
          <Input
            type="number"
            placeholder="$999"
            min="0"
            step="0.01"
            value={query.maxPrice ?? ''}
            onChange={(e) =>
              setFilter({
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="w-[130px] space-y-1">
          <Label className="text-xs text-muted-foreground">Stock</Label>
          <Select
            value={
              query.inStock === true
                ? 'true'
                : query.inStock === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(val) =>
              setFilter({
                inStock:
                  val === 'true' ? true : val === 'false' ? false : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">In stock</SelectItem>
              <SelectItem value="false">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[150px] space-y-1">
          <Label className="text-xs text-muted-foreground">Sort by</Label>
          <Select
            value={query.sortBy ?? 'createdAt'}
            onValueChange={(val) =>
              setFilter({ sortBy: val as ProductQuery['sortBy'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[120px] space-y-1">
          <Label className="text-xs text-muted-foreground">Order</Label>
          <Select
            value={query.sortOrder ?? 'desc'}
            onValueChange={(val) =>
              setFilter({ sortOrder: val as ProductQuery['sortOrder'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput('');
              clearFilters();
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
