import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '@/components/products-table';
import {
  ProductFormDialog,
  type ProductFormData,
} from '@/components/product-form-dialog';
import { useProducts, useCreateProduct } from '@/hooks/use-products';
import { useStores } from '@/hooks/use-stores';

export function ProductsListPage() {
  const { data: products, isLoading, error, refetch } = useProducts();
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

      <ProductsTable products={products} isLoading={isLoading} />

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
