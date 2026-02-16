import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from './msw/server';
import { renderWithProviders } from './test-utils';
import { ProductDetailPage } from '@/pages/product-detail';
import { ProductsListPage } from '@/pages/products-list';
import { StoreDetailPage } from '@/pages/store-detail';
import { mockProducts, mockStores } from './msw/handlers';
import type { Product, PaginatedProducts } from '@/types/product';

describe('Mutation integration', () => {
  it('deleting a product removes it from the list', async () => {
    const user = userEvent.setup();

    // Stateful handler: DELETE removes product from subsequent GET responses
    let products = [...mockProducts];

    server.use(
      http.get('/api/products', () => {
        return HttpResponse.json({
          data: products,
          meta: {
            total: products.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        } satisfies PaginatedProducts);
      }),
      http.delete('/api/products/:id', ({ params }) => {
        products = products.filter((p) => p.id !== params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    // Render both routes so navigation after delete works
    renderWithProviders(
      <Routes>
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products" element={<ProductsListPage />} />
      </Routes>,
      { route: '/products/p1' },
    );

    // Wait for product detail to load
    await waitFor(() => {
      expect(screen.getAllByText('Wireless Mouse')).toHaveLength(2);
    });

    // Click the page's Delete button
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Confirm dialog opens — click its Delete button
    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to delete "Wireless Mouse"/),
      ).toBeInTheDocument();
    });

    // The page's Delete button is now aria-hidden behind the dialog,
    // so getByRole finds only the dialog's Delete button
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // After mutation: navigates to /products, refetches with updated data
    await waitFor(() => {
      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    });

    // Wireless Mouse is gone from the list
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('creating a product adds it to the store products list', { timeout: 15_000 }, async () => {
    const user = userEvent.setup();

    const newProduct: Product = {
      id: 'p-new',
      name: 'USB Keyboard',
      category: 'electronics',
      price: 49.99,
      quantity: 25,
      storeId: 's1',
      store: mockStores[0],
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    };

    // Stateful handler: POST adds product to subsequent GET responses
    let created = false;
    const baseProducts = mockProducts.filter((p) => p.storeId === 's1');

    server.use(
      http.get('/api/stores/:id/products', () => {
        const data = created ? [...baseProducts, newProduct] : baseProducts;
        return HttpResponse.json({
          data,
          meta: {
            total: data.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        } satisfies PaginatedProducts);
      }),
      http.post('/api/stores/:id/products', async () => {
        created = true;
        return HttpResponse.json(newProduct, { status: 201 });
      }),
    );

    renderWithProviders(<StoreDetailPage />, {
      route: '/stores/s1',
      path: '/stores/:id',
    });

    // Wait for store detail + products to load
    await waitFor(() => {
      expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    });
    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    // Open Add Product dialog
    await user.click(screen.getByRole('button', { name: 'Add Product' }));

    // Fill in the form
    await user.type(screen.getByLabelText('Name'), 'USB Keyboard');

    // Select category via Radix Select (first combobox in the dialog)
    const categoryTrigger = screen.getAllByRole('combobox')[0];
    await user.click(categoryTrigger);
    await user.click(screen.getByRole('option', { name: 'Electronics' }));

    // Fill price and quantity
    await user.type(screen.getByLabelText('Price ($)'), '49.99');
    const qtyInput = screen.getByLabelText('Quantity');
    await user.clear(qtyInput);
    await user.type(qtyInput, '25');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // After mutation: cache invalidates, refetch returns new product in table
    await waitFor(() => {
      expect(screen.getByText('USB Keyboard')).toBeInTheDocument();
    });

    // Original product is still there
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
  });
});
