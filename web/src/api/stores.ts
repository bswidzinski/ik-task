import type { Store, CreateStoreInput, UpdateStoreInput } from '@/types/store';

const BASE = '/api/stores';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.message ??
      `Request failed with status ${res.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

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
