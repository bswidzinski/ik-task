import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '@/components/products-table';
import { ProductFilters } from '@/components/product-filters';
import { Pagination } from '@/components/pagination';
import {
  ProductFormDialog,
  type ProductFormData,
} from '@/components/product-form-dialog';
import { useProducts, useCreateProduct } from '@/hooks/use-products';
import { useProductFilters } from '@/hooks/use-product-filters';
import { useStores } from '@/hooks/use-stores';

export function ProductsListPage() {
  const { query, setFilter, clearFilters, hasFilters } = useProductFilters();
  const { data: result, isLoading, error, refetch } = useProducts(query);
  const { data: stores } = useStores();
  const createProduct = useCreateProduct();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCreate(data: ProductFormData) {
    const { storeId, ...productData } = data;
    createProduct.mutate(
      { storeId, data: productData },
      {
        onSuccess: () => {
          setDialogOpen(false);
          toast.success('Product created');
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">
          Failed to load products: {error.message}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setDialogOpen(true)}>Add Product</Button>
      </div>

      <ProductFilters
        query={query}
        setFilter={setFilter}
        clearFilters={clearFilters}
        hasFilters={hasFilters}
      />

      <ProductsTable
        products={result?.data}
        isLoading={isLoading}
        emptyMessage={
          hasFilters
            ? 'No products match your filters'
            : 'No products yet'
        }
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : undefined
        }
      />

      {result?.meta && (
        <Pagination
          page={result.meta.page}
          totalPages={result.meta.totalPages}
          total={result.meta.total}
          limit={result.meta.limit}
          onPageChange={(page) => setFilter({ page })}
          onLimitChange={(limit) => setFilter({ limit, page: undefined })}
        />
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createProduct.isPending}
        stores={stores ?? []}
        title="Add Product"
      />
    </div>
  );
}
