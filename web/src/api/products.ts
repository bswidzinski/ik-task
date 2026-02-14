import type {
  Product,
  PaginatedProducts,
  ProductQuery,
  CreateProductInput,
  UpdateProductInput,
} from '@/types/product';
import { request } from './request';

function buildQueryString(params: ProductQuery): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v != null && v !== '',
  );
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export function getProducts(query: ProductQuery = {}): Promise<PaginatedProducts> {
  return request<PaginatedProducts>(`/api/products${buildQueryString(query)}`);
}

export function getProduct(id: string): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

export function getStoreProducts(
  storeId: string,
  query: ProductQuery = {},
): Promise<PaginatedProducts> {
  return request<PaginatedProducts>(
    `/api/stores/${storeId}/products${buildQueryString(query)}`,
  );
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
