import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/stores';
import type { CreateStoreInput, UpdateStoreInput } from '@/types/store';

const STORES_KEY = ['stores'] as const;
const storeKey = (id: string) => ['stores', id] as const;

export function useStores() {
  return useQuery({
    queryKey: STORES_KEY,
    queryFn: api.getStores,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: storeKey(id),
    queryFn: () => api.getStore(id),
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreInput) => api.createStore(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STORES_KEY }),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreInput }) =>
      api.updateStore(id, data),
    onSuccess: (_result, { id }) => {
      void qc.invalidateQueries({ queryKey: STORES_KEY });
      void qc.invalidateQueries({ queryKey: storeKey(id) });
    },
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteStore(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STORES_KEY });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
