import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '@/types/product';
import { request } from './request';

export function getProducts(): Promise<Product[]> {
  return request<Product[]>('/api/products');
}

export function getProduct(id: string): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

export function getStoreProducts(storeId: string): Promise<Product[]> {
  return request<Product[]>(`/api/stores/${storeId}/products`);
}

export function createProduct(
  storeId: string,
  data: CreateProductInput,
): Promise<Product> {
  return request<Product>(`/api/stores/${storeId}/products`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduct(
  id: string,
  data: UpdateProductInput,
): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return request<void>(`/api/products/${id}`, { method: 'DELETE' });
}
