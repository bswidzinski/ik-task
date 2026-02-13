import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreFormDialog } from '@/components/store-form-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  ProductFormDialog,
  type ProductFormData,
} from '@/components/product-form-dialog';
import { ProductsTable } from '@/components/products-table';
import { useStore, useStores, useUpdateStore, useDeleteStore } from '@/hooks/use-stores';
import { useStoreProducts, useCreateProduct } from '@/hooks/use-products';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: store, isLoading, error, refetch } = useStore(id!);
  const { data: stores } = useStores();
  const {
    data: products,
    isLoading: productsLoading,
  } = useStoreProducts(id!);
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const createProduct = useCreateProduct();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);

  function handleUpdate(data: { name: string; address: string }) {
    updateStore.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success('Store updated');
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDelete() {
    deleteStore.mutate(id!, {
      onSuccess: () => {
        toast.success('Store deleted');
        void navigate('/stores');
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleCreateProduct(data: ProductFormData) {
    const { storeId, ...productData } = data;
    createProduct.mutate(
      { storeId, data: productData },
      {
        onSuccess: () => {
          setAddProductOpen(false);
          toast.success('Product created');
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error) {
    const is404 = error.message.includes('not found');
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">
          {is404 ? 'Store not found' : `Failed to load store: ${error.message}`}
        </p>
        {is404 ? (
          <Button variant="outline" onClick={() => void navigate('/stores')}>
            Back to Stores
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{store.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p>{store.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p>{store.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p>{new Date(store.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <Button
            variant="outline"
            onClick={() => setAddProductOpen(true)}
          >
            Add Product
          </Button>
        </div>
        <ProductsTable
          products={products}
          isLoading={productsLoading}
          showStore={false}
          emptyMessage="No products in this store yet"
        />
      </div>

      <StoreFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        isPending={updateStore.isPending}
        initialData={store}
        title="Edit Store"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isPending={deleteStore.isPending}
        title="Delete Store"
        description={`Are you sure you want to delete "${store.name}"? This will also delete all its products. This action cannot be undone.`}
      />

      <ProductFormDialog
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onSubmit={handleCreateProduct}
        isPending={createProduct.isPending}
        stores={stores ?? []}
        fixedStoreId={id}
        title="Add Product"
      />
    </div>
  );
}
