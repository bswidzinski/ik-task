import type { Store } from './store';

export const PRODUCT_CATEGORIES = [
  'electronics',
  'clothing',
  'food',
  'home',
  'sports',
  'other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  food: 'Food',
  home: 'Home',
  sports: 'Sports',
  other: 'Other',
};

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number | string;
  quantity: number;
  storeId: string;
  store: Store;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
}

export interface UpdateProductInput {
  name?: string;
  category?: ProductCategory;
  price?: number;
  quantity?: number;
}
