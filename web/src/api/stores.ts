import type { Store, CreateStoreInput, UpdateStoreInput } from '@/types/store';
import { request } from './request';

const BASE = '/api/stores';

export function getStores(): Promise<Store[]> {
  return request<Store[]>(BASE);
}

export function getStore(id: string): Promise<Store> {
  return request<Store>(`${BASE}/${id}`);
}

export function createStore(data: CreateStoreInput): Promise<Store> {
  return request<Store>(BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateStore(
  id: string,
  data: UpdateStoreInput,
): Promise<Store> {
  return request<Store>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteStore(id: string): Promise<void> {
  return request<void>(`${BASE}/${id}`, { method: 'DELETE' });
}
