import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/form-field';
import type { Store } from '@/types/store';
import type { Product, ProductCategory } from '@/types/product';
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/types/product';
import { extractErrors } from '@/lib/validation';

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  category: z.enum(PRODUCT_CATEGORIES, {
    message: 'Category is required',
  }),
  price: z.coerce
    .number({ message: 'Price must be greater than 0' })
    .gt(0, 'Price must be greater than 0'),
  quantity: z.coerce
    .number({ message: 'Quantity must be a non-negative integer' })
    .int('Quantity must be a non-negative integer')
    .min(0, 'Quantity must be a non-negative integer'),
  storeId: z.string().min(1, 'Store is required'),
});

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
  initialData?: Pick<
    Product,
    'name' | 'category' | 'price' | 'quantity' | 'storeId'
  >;
  fixedStoreId?: string;
  title: string;
}

interface FormState {
  name: string;
  category: string;
  price: string;
  quantity: string;
  storeId: string;
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
  const [formData, setFormData] = useState<FormState>({
    name: initialData?.name ?? '',
    category: initialData?.category ?? '',
    price:
      initialData?.price != null ? String(Number(initialData.price)) : '',
    quantity:
      initialData?.quantity != null ? String(initialData.quantity) : '0',
    storeId: fixedStoreId ?? initialData?.storeId ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function handleChange(field: keyof FormState, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = productSchema.safeParse({
      name: formData.name,
      category: formData.category || undefined,
      price: formData.price || undefined,
      quantity: formData.quantity,
      storeId: formData.storeId,
    });
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    onSubmit(result.data);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name" htmlFor="product-name" error={errors.name}>
          <Input
            id="product-name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Product name"
          />
        </FormField>

        <FormField label="Category" error={errors.category}>
          <Select
            value={formData.category}
            onValueChange={(val) => handleChange('category', val)}
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
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Price ($)"
            htmlFor="product-price"
            error={errors.price}
          >
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
            />
          </FormField>

          <FormField
            label="Quantity"
            htmlFor="product-quantity"
            error={errors.quantity}
          >
            <Input
              id="product-quantity"
              type="number"
              step="1"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              placeholder="0"
            />
          </FormField>
        </div>

        <FormField label="Store" error={errors.storeId}>
          <Select
            value={formData.storeId}
            onValueChange={(val) => handleChange('storeId', val)}
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
        </FormField>

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
