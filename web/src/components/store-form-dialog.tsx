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
import type { Store } from '@/types/store';

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; address: string }) => void;
  isPending: boolean;
  initialData?: Pick<Store, 'name' | 'address'>;
  title: string;
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
  const [name, setName] = useState(initialData?.name ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});

  function validate() {
    const errs: { name?: string; address?: string } = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (address.trim().length < 2)
      errs.address = 'Address must be at least 2 characters';
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({ name: name.trim(), address: address.trim() });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Store name"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setErrors((prev) => ({ ...prev, address: undefined }));
            }}
            placeholder="Store address"
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
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
