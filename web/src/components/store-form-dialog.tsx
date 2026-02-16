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
import { FormField } from '@/components/form-field';
import type { Store } from '@/types/store';
import { extractErrors } from '@/lib/validation';

const storeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  address: z
    .string()
    .trim()
    .min(2, 'Address must be at least 2 characters'),
});

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; address: string }) => void;
  isPending: boolean;
  initialData?: Pick<Store, 'name' | 'address'>;
  title: string;
}

interface FormState {
  name: string;
  address: string;
}

function StoreForm({
  onCancel,
  onSubmit,
  isPending,
  initialData,
  title,
}: {
  onCancel: () => void;
  onSubmit: (data: { name: string; address: string }) => void;
  isPending: boolean;
  initialData?: Pick<Store, 'name' | 'address'>;
  title: string;
}) {
  const [formData, setFormData] = useState<FormState>({
    name: initialData?.name ?? '',
    address: initialData?.address ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function handleChange(field: keyof FormState, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = storeSchema.safeParse(formData);
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
        <FormField label="Name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Store name"
          />
        </FormField>

        <FormField label="Address" htmlFor="address" error={errors.address}>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Store address"
          />
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

export function StoreFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  initialData,
  title,
}: StoreFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <StoreForm
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            isPending={isPending}
            initialData={initialData}
            title={title}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
