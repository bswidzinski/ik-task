import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from './msw/server';
import { renderWithProviders } from './test-utils';
import { StoresListPage } from '@/pages/stores-list';
import { mockStores } from './msw/handlers';
import type { Store } from '@/types/store';

describe('StoresListPage integration', () => {
  it('fetches and renders store cards', async () => {
    renderWithProviders(<StoresListPage />);

    await waitFor(() => {
      expect(screen.getByText('Tech Store')).toBeInTheDocument();
    });

    expect(screen.getByText('1 Main St')).toBeInTheDocument();
    expect(screen.getByText('Fashion Outlet')).toBeInTheDocument();
    expect(screen.getByText('2 Oak Ave')).toBeInTheDocument();
  });

  it('shows loading skeletons while fetching', async () => {
    server.use(
      http.get('/api/stores', async () => {
        await delay('infinite');
        return HttpResponse.json(mockStores);
      }),
    );

    const { container } = renderWithProviders(<StoresListPage />);

    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error state when API fails', async () => {
    server.use(
      http.get('/api/stores', () => {
        return HttpResponse.json(
          { statusCode: 500, message: 'Internal server error' },
          { status: 500 },
        );
      }),
    );

    renderWithProviders(<StoresListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load stores/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('shows empty state when no stores exist', async () => {
    server.use(
      http.get('/api/stores', () => {
        return HttpResponse.json([]);
      }),
    );

    renderWithProviders(<StoresListPage />);

    await waitFor(() => {
      expect(screen.getByText('No stores yet')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Create your first store to get started.'),
    ).toBeInTheDocument();
  });

  it('creating a store adds it to the list', async () => {
    const user = userEvent.setup();

    const newStore: Store = {
      id: 's-new',
      name: 'New Warehouse',
      address: '77 Industrial Rd',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    };

    let created = false;

    server.use(
      http.get('/api/stores', () => {
        const stores = created ? [...mockStores, newStore] : mockStores;
        return HttpResponse.json(stores);
      }),
      http.post('/api/stores', async () => {
        created = true;
        return HttpResponse.json(newStore, { status: 201 });
      }),
    );

    renderWithProviders(<StoresListPage />);

    await waitFor(() => {
      expect(screen.getByText('Tech Store')).toBeInTheDocument();
    });

    // Open create dialog
    await user.click(screen.getByRole('button', { name: 'Add Store' }));

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'New Warehouse');
    await user.type(screen.getByLabelText('Address'), '77 Industrial Rd');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // After cache invalidation, new store appears
    await waitFor(() => {
      expect(screen.getByText('New Warehouse')).toBeInTheDocument();
    });
    expect(screen.getByText('77 Industrial Rd')).toBeInTheDocument();

    // Original stores still present
    expect(screen.getByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Fashion Outlet')).toBeInTheDocument();
  });

  it('opens and cancels create store dialog without side effects', async () => {
    const user = userEvent.setup();

    renderWithProviders(<StoresListPage />);

    await waitFor(() => {
      expect(screen.getByText('Tech Store')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add Store' }));

    // Dialog is open
    expect(screen.getByText('Add Store', { selector: '[data-slot="dialog-title"]' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Data unchanged
    expect(screen.getByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Fashion Outlet')).toBeInTheDocument();
  });
});
