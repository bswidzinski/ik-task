import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreFormDialog } from '@/components/store-form-dialog';
import { useStores, useCreateStore } from '@/hooks/use-stores';

export function StoresListPage() {
  const { data: stores, isLoading, error, refetch } = useStores();
  const createStore = useCreateStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCreate(data: { name: string; address: string }) {
    createStore.mutate(data, {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success('Store created');
      },
      onError: (err) => toast.error(err.message),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">Failed to load stores: {error.message}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stores</h1>
        <Button onClick={() => setDialogOpen(true)}>Add Store</Button>
      </div>

      {stores?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <p className="text-lg">No stores yet</p>
          <p className="text-sm">Create your first store to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores?.map((store) => (
            <Link key={store.id} to={`/stores/${store.id}`}>
              <Card className="transition-colors hover:border-foreground/20">
                <CardHeader>
                  <CardTitle className="text-base">{store.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {store.address}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <StoreFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createStore.isPending}
        title="Add Store"
      />
    </div>
  );
}
