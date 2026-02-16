import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from './msw/server';
import { renderWithProviders } from './test-utils';
import { StoreDetailPage } from '@/pages/store-detail';
import { StoresListPage } from '@/pages/stores-list';
import { mockStores } from './msw/handlers';
import type { Store } from '@/types/store';

describe('StoreDetailPage integration', () => {
  it('fetches and renders store info and products', async () => {
    renderWithProviders(<StoreDetailPage />, {
      route: '/stores/s1',
      path: '/stores/:id',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    });

    expect(screen.getByText('1 Main St')).toBeInTheDocument();
    expect(screen.getByText('Store Details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

    // Store products section
    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });
  });

  it('shows "Store not found" for 404', async () => {
    renderWithProviders(<StoreDetailPage />, {
      route: '/stores/nonexistent',
      path: '/stores/:id',
    });

    await waitFor(() => {
      expect(screen.getByText('Store not found')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: 'Back to Stores' }),
    ).toBeInTheDocument();
  });

  it('shows error state for server errors', async () => {
    server.use(
      http.get('/api/stores/:id', () => {
        return HttpResponse.json(
          { statusCode: 500, message: 'Internal server error' },
          { status: 500 },
        );
      }),
    );

    renderWithProviders(<StoreDetailPage />, {
      route: '/stores/s1',
      path: '/stores/:id',
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load store/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('editing a store updates the detail view', async () => {
    const user = userEvent.setup();

    let currentStore: Store = { ...mockStores[0] };

    server.use(
      http.get('/api/stores/:id', ({ params }) => {
        if (params.id === 's1') return HttpResponse.json(currentStore);
        return HttpResponse.json(
          { message: `Store with id "${params.id}" not found` },
          { status: 404 },
        );
      }),
      http.patch('/api/stores/:id', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        currentStore = {
          ...currentStore,
          ...body,
          updatedAt: '2026-02-01T00:00:00Z',
        } as Store;
        return HttpResponse.json(currentStore);
      }),
    );

    renderWithProviders(<StoreDetailPage />, {
      route: '/stores/s1',
      path: '/stores/:id',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    });

    // Open edit dialog
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    // Change name
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Mega Tech Store');

    // Change address
    const addressInput = screen.getByLabelText('Address');
    await user.clear(addressInput);
    await user.type(addressInput, '99 Broadway');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // After cache invalidation, updated values render
    await waitFor(() => {
      expect(screen.getAllByText('Mega Tech Store')).toHaveLength(2);
    });
    expect(screen.getByText('99 Broadway')).toBeInTheDocument();
  });

  it('deleting a store redirects to the stores list', async () => {
    const user = userEvent.setup();

    let stores = [...mockStores];

    server.use(
      http.get('/api/stores', () => {
        return HttpResponse.json(stores);
      }),
      http.delete('/api/stores/:id', ({ params }) => {
        stores = stores.filter((s) => s.id !== params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/stores/:id" element={<StoreDetailPage />} />
        <Route path="/stores" element={<StoresListPage />} />
      </Routes>,
      { route: '/stores/s1' },
    );

    await waitFor(() => {
      expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    });

    // Click Delete
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to delete "Tech Store"/),
      ).toBeInTheDocument();
    });

    // Confirm
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Navigates to /stores, Tech Store is gone
    await waitFor(() => {
      expect(screen.getByText('Fashion Outlet')).toBeInTheDocument();
    });
    expect(screen.queryByText('Tech Store')).not.toBeInTheDocument();
  });

  it('cancelling edit dialog keeps original data', async () => {
    const user = userEvent.setup();

    renderWithProviders(<StoreDetailPage />, {
      route: '/stores/s1',
      path: '/stores/:id',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    });

    // Open edit dialog
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    // Type something
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');

    // Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Original data still shown
    expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    expect(screen.getByText('1 Main St')).toBeInTheDocument();
  });

  it('cancelling delete confirmation keeps the store', async () => {
    const user = userEvent.setup();

    renderWithProviders(<StoreDetailPage />, {
      route: '/stores/s1',
      path: '/stores/:id',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    });

    // Open delete confirmation
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to delete "Tech Store"/),
      ).toBeInTheDocument();
    });

    // Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Store is still displayed
    expect(screen.getAllByText('Tech Store')).toHaveLength(2);
    expect(screen.getByText('1 Main St')).toBeInTheDocument();
  });
});
