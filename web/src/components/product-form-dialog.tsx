import { useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Store } from '@/types/store';
import type { Product, ProductCategory } from '@/types/product';
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/types/product';

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  storeId: string;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => void;
  isPending: boolean;
  stores: Store[];
  initialData?: Pick<Product, 'name' | 'category' | 'price' | 'quantity' | 'storeId'>;
  fixedStoreId?: string;
  title: string;
}

interface FormErrors {
  name?: string;
  category?: string;
  price?: string;
  quantity?: string;
  storeId?: string;
}

function ProductForm({
  onCancel,
  onSubmit,
  isPending,
  stores,
  initialData,
  fixedStoreId,
  title,
}: Omit<ProductFormDialogProps, 'open' | 'onOpenChange'> & {
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [category, setCategory] = useState<string>(
    initialData?.category ?? '',
  );
  const [price, setPrice] = useState(
    initialData?.price != null ? String(Number(initialData.price)) : '',
  );
  const [quantity, setQuantity] = useState(
    initialData?.quantity != null ? String(initialData.quantity) : '0',
  );
  const [storeId, setStoreId] = useState(
    fixedStoreId ?? initialData?.storeId ?? '',
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!category) errs.category = 'Category is required';
    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0)
      errs.price = 'Price must be greater than 0';
    const qtyNum = Number(quantity);
    if (quantity === '' || isNaN(qtyNum) || qtyNum < 0 || !Number.isInteger(qtyNum))
      errs.quantity = 'Quantity must be a non-negative integer';
    if (!storeId) errs.storeId = 'Store is required';
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      name: name.trim(),
      category: category as ProductCategory,
      price: Number(price),
      quantity: Number(quantity),
      storeId,
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Name</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
            placeholder="Product name"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              clearError('category');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-price">Price ($)</Label>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                clearError('price');
              }}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-quantity">Quantity</Label>
            <Input
              id="product-quantity"
              type="number"
              step="1"
              min="0"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                clearError('quantity');
              }}
              placeholder="0"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Store</Label>
          <Select
            value={storeId}
            onValueChange={(val) => {
              setStoreId(val);
              clearError('storeId');
            }}
            disabled={!!fixedStoreId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.storeId && (
            <p className="text-sm text-destructive">{errors.storeId}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </>
  );
}

export function ProductFormDialog({
  open,
  onOpenChange,
  ...rest
}: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <ProductForm onCancel={() => onOpenChange(false)} {...rest} />
        )}
      </DialogContent>
    </Dialog>
  );
}
