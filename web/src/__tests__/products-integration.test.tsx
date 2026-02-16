import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './msw/server';
import { renderWithProviders } from './test-utils';
import { ProductsListPage } from '@/pages/products-list';
import { ProductDetailPage } from '@/pages/product-detail';
import { mockProducts, mockStores } from './msw/handlers';
import type { Product } from '@/types/product';

describe('ProductsListPage integration', () => {
  it('fetches and renders products from the API', async () => {
    renderWithProviders(<ProductsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Fashion Outlet')).toBeInTheDocument();
  });

  it('shows empty state when no products', async () => {
    server.use(
      http.get('/api/products', () => {
        return HttpResponse.json({
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        });
      }),
    );

    renderWithProviders(<ProductsListPage />);

    await waitFor(() => {
      expect(screen.getByText('No products yet')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    server.use(
      http.get('/api/products', () => {
        return HttpResponse.json(
          { statusCode: 500, message: 'Internal server error' },
          { status: 500 },
        );
      }),
    );

    renderWithProviders(<ProductsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load products/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders pagination info when products are present', async () => {
    renderWithProviders(<ProductsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('opens and cancels create product dialog without side effects', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ProductsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add Product' }));

    // Dialog is open
    expect(screen.getByText('Add Product', { selector: '[data-slot="dialog-title"]' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Dialog closed, data unchanged
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
  });
});

describe('ProductDetailPage integration', () => {
  it('fetches and renders product details', async () => {
    renderWithProviders(<ProductDetailPage />, {
      route: '/products/p1',
      path: '/products/:id',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Wireless Mouse')).toHaveLength(2);
    });

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows "Product not found" for 404', async () => {
    renderWithProviders(<ProductDetailPage />, {
      route: '/products/nonexistent',
      path: '/products/:id',
    });

    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: 'Back to Products' }),
    ).toBeInTheDocument();
  });

  it('shows error state for server errors', async () => {
    server.use(
      http.get('/api/products/:id', () => {
        return HttpResponse.json(
          { statusCode: 500, message: 'Internal server error' },
          { status: 500 },
        );
      }),
    );

    renderWithProviders(<ProductDetailPage />, {
      route: `/products/${mockProducts[0].id}`,
      path: '/products/:id',
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load product/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('editing a product updates the detail view', { timeout: 15_000 }, async () => {
    const user = userEvent.setup();

    let currentProduct: Product = { ...mockProducts[0] };

    server.use(
      http.get('/api/products/:id', ({ params }) => {
        if (params.id === 'p1') return HttpResponse.json(currentProduct);
        return HttpResponse.json(
          { message: `Product with id "${params.id}" not found` },
          { status: 404 },
        );
      }),
      http.patch('/api/products/:id', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        currentProduct = {
          ...currentProduct,
          ...body,
          updatedAt: '2026-02-01T00:00:00Z',
        } as Product;
        return HttpResponse.json(currentProduct);
      }),
    );

    renderWithProviders(<ProductDetailPage />, {
      route: '/products/p1',
      path: '/products/:id',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Wireless Mouse')).toHaveLength(2);
    });

    // Open edit dialog
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    // Change name
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Gaming Mouse');

    // Change price
    const priceInput = screen.getByLabelText('Price ($)');
    await user.clear(priceInput);
    await user.type(priceInput, '39.99');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // After cache invalidation, updated values render
    await waitFor(() => {
      expect(screen.getAllByText('Gaming Mouse')).toHaveLength(2);
    });
    expect(screen.getByText('$39.99')).toBeInTheDocument();
  });

  it('cancelling delete confirmation keeps the product', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ProductDetailPage />, {
      route: '/products/p1',
      path: '/products/:id',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Wireless Mouse')).toHaveLength(2);
    });

    // Open delete confirmation
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to delete "Wireless Mouse"/),
      ).toBeInTheDocument();
    });

    // Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Product is still displayed
    expect(screen.getAllByText('Wireless Mouse')).toHaveLength(2);
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
