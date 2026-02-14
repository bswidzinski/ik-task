import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/products';
import type {
  ProductQuery,
  CreateProductInput,
  UpdateProductInput,
} from '@/types/product';

const PRODUCTS_KEY = ['products'] as const;
const productKey = (id: string) => ['products', id] as const;
const storeProductsKey = (storeId: string) =>
  ['stores', storeId, 'products'] as const;

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, query],
    queryFn: () => api.getProducts(query),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKey(id),
    queryFn: () => api.getProduct(id),
  });
}

export function useStoreProducts(storeId: string, query: ProductQuery = {}) {
  return useQuery({
    queryKey: [...storeProductsKey(storeId), query],
    queryFn: () => api.getStoreProducts(storeId, query),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: string;
      data: CreateProductInput;
    }) => api.createProduct(storeId, data),
    onSuccess: (_result, { storeId }) => {
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: storeProductsKey(storeId) });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      api.updateProduct(id, data),
    onSuccess: (result, { id }) => {
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: productKey(id) });
      void qc.invalidateQueries({
        queryKey: storeProductsKey(result.storeId),
      });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: ['stores'], exact: false });
    },
  });
}
