import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ProductFormDialog,
  type ProductFormData,
} from '@/components/product-form-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/use-products';
import { useStores } from '@/hooks/use-stores';
import { CATEGORY_LABELS } from '@/types/product';
import { formatPrice } from '@/lib/format';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error, refetch } = useProduct(id!);
  const { data: stores } = useStores();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleUpdate(data: ProductFormData) {
    updateProduct.mutate(
      {
        id: id!,
        data: {
          name: data.name,
          category: data.category,
          price: data.price,
          quantity: data.quantity,
        },
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success('Product updated');
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDelete() {
    deleteProduct.mutate(id!, {
      onSuccess: () => {
        toast.success('Product deleted');
        void navigate('/products');
      },
      onError: (err) => toast.error(err.message),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    const is404 = error.message.includes('not found');
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">
          {is404
            ? 'Product not found'
            : `Failed to load product: ${error.message}`}
        </p>
        {is404 ? (
          <Button variant="outline" onClick={() => void navigate('/products')}>
            Back to Products
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
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
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p>{product.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Category
            </p>
            <Badge variant="secondary">
              {CATEGORY_LABELS[product.category]}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Price</p>
            <p>{formatPrice(product.price)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Quantity
            </p>
            <p>{product.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Store</p>
            <Link
              to={`/stores/${product.storeId}`}
              className="text-sm hover:underline"
            >
              {product.store?.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Created
            </p>
            <p>{new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        isPending={updateProduct.isPending}
        stores={stores ?? []}
        initialData={product}
        fixedStoreId={product.storeId}
        title="Edit Product"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isPending={deleteProduct.isPending}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
