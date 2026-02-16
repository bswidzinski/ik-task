import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from './msw/server';
import { renderWithProviders } from './test-utils';
import { LowStockReportPage } from '@/pages/low-stock-report';

describe('LowStockReportPage integration', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders summary stats and store sections', async () => {
    renderWithProviders(<LowStockReportPage />);

    // Advance past the 300ms debounce timer
    vi.advanceTimersByTime(350);

    await waitFor(() => {
      expect(screen.getByText('$6509.86')).toBeInTheDocument();
    });

    // Store sections with per-store restock costs
    expect(screen.getByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Restock cost: $5559.91')).toBeInTheDocument();
    expect(screen.getByText('2 low')).toBeInTheDocument();
    expect(screen.getByText('iPhone')).toBeInTheDocument();
    expect(screen.getByText('Kindle')).toBeInTheDocument();

    expect(screen.getByText('Fashion Store')).toBeInTheDocument();
    expect(screen.getByText('Restock cost: $949.95')).toBeInTheDocument();
    expect(screen.getByText('1 low')).toBeInTheDocument();
    expect(screen.getByText('Winter Parka')).toBeInTheDocument();
  });

  it('shows positive empty state when no low stock items', async () => {
    server.use(
      http.get('/api/reports/low-stock', () => {
        return HttpResponse.json({
          threshold: 5,
          totalLowStockProducts: 0,
          totalRestockCost: 0,
          stores: [],
        });
      }),
    );

    renderWithProviders(<LowStockReportPage />);

    vi.advanceTimersByTime(350);

    await waitFor(() => {
      expect(
        screen.getByText('All products are well stocked!'),
      ).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    server.use(
      http.get('/api/reports/low-stock', () => {
        return HttpResponse.json(
          { statusCode: 500, message: 'Internal server error' },
          { status: 500 },
        );
      }),
    );

    renderWithProviders(<LowStockReportPage />);

    vi.advanceTimersByTime(350);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load report/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
