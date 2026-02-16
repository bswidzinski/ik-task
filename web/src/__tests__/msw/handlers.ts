import { http, HttpResponse } from 'msw';
import type { Store } from '@/types/store';
import type { Product, PaginatedProducts } from '@/types/product';
import type { LowStockReport } from '@/api/inventory';

export const mockStores: Store[] = [
  {
    id: 's1',
    name: 'Tech Store',
    address: '1 Main St',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 's2',
    name: 'Fashion Outlet',
    address: '2 Oak Ave',
    createdAt: '2026-01-16T00:00:00Z',
    updatedAt: '2026-01-16T00:00:00Z',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Mouse',
    category: 'electronics',
    price: 29.99,
    quantity: 50,
    storeId: 's1',
    store: mockStores[0],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'p2',
    name: 'Cotton T-Shirt',
    category: 'clothing',
    price: 19.99,
    quantity: 100,
    storeId: 's2',
    store: mockStores[1],
    createdAt: '2026-01-16T00:00:00Z',
    updatedAt: '2026-01-16T00:00:00Z',
  },
];

export const mockPaginatedProducts: PaginatedProducts = {
  data: mockProducts,
  meta: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const mockLowStockReport: LowStockReport = {
  threshold: 5,
  totalLowStockProducts: 3,
  totalRestockCost: 2500.5,
  stores: [
    {
      storeId: 's1',
      storeName: 'Tech Store',
      lowStockCount: 2,
      products: [
        {
          id: 'p1',
          name: 'iPhone',
          category: 'electronics',
          price: 999.99,
          quantity: 0,
          deficit: 5,
        },
        {
          id: 'p2',
          name: 'Kindle',
          category: 'electronics',
          price: 139.99,
          quantity: 1,
          deficit: 4,
        },
      ],
    },
    {
      storeId: 's2',
      storeName: 'Fashion Store',
      lowStockCount: 1,
      products: [
        {
          id: 'p3',
          name: 'Winter Parka',
          category: 'clothing',
          price: 189.99,
          quantity: 0,
          deficit: 5,
        },
      ],
    },
  ],
};

export const handlers = [
  http.get('/api/stores', () => {
    return HttpResponse.json(mockStores);
  }),

  http.get('/api/stores/:id', ({ params }) => {
    const store = mockStores.find((s) => s.id === params.id);
    if (!store) {
      return HttpResponse.json(
        { message: `Store with id "${params.id}" not found` },
        { status: 404 },
      );
    }
    return HttpResponse.json(store);
  }),

  http.get('/api/stores/:id/products', ({ params }) => {
    const storeProducts = mockProducts.filter(
      (p) => p.storeId === params.id,
    );
    return HttpResponse.json({
      data: storeProducts,
      meta: {
        total: storeProducts.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    } satisfies PaginatedProducts);
  }),

  http.get('/api/products', () => {
    return HttpResponse.json(mockPaginatedProducts);
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return HttpResponse.json(
        { message: `Product with id "${params.id}" not found` },
        { status: 404 },
      );
    }
    return HttpResponse.json(product);
  }),

  http.post('/api/stores', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 's-new',
        ...body,
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      },
      { status: 201 },
    );
  }),

  http.patch('/api/stores/:id', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const store = mockStores.find((s) => s.id === params.id);
    if (!store) {
      return HttpResponse.json(
        { message: `Store with id "${params.id}" not found` },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      ...store,
      ...body,
      updatedAt: '2026-02-01T00:00:00Z',
    });
  }),

  http.delete('/api/stores/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('/api/products/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/products/:id', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return HttpResponse.json(
        { message: `Product with id "${params.id}" not found` },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      ...product,
      ...body,
      updatedAt: '2026-02-01T00:00:00Z',
    });
  }),

  http.post('/api/stores/:id/products', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const store = mockStores.find((s) => s.id === params.id);
    return HttpResponse.json(
      {
        id: 'p-new',
        ...body,
        storeId: params.id,
        store: store ?? mockStores[0],
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      },
      { status: 201 },
    );
  }),

  http.get('/api/reports/low-stock', () => {
    return HttpResponse.json(mockLowStockReport);
  }),
];
