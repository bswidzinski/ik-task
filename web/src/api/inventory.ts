import { request } from './request';

export interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  deficit: number;
}

export interface LowStockStore {
  storeId: string;
  storeName: string;
  lowStockCount: number;
  products: LowStockProduct[];
}

export interface LowStockReport {
  threshold: number;
  totalLowStockProducts: number;
  totalRestockCost: number;
  stores: LowStockStore[];
}

export function getLowStockReport(threshold?: number): Promise<LowStockReport> {
  const params = threshold != null ? `?threshold=${threshold}` : '';
  return request<LowStockReport>(`/api/reports/low-stock${params}`);
}
