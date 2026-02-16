import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { ErrorBoundary } from '@/components/error-boundary';

function ThrowingComponent(): never {
  throw new Error('Test render error');
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>Hello world</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('catches render errors and displays fallback UI', () => {
    // Suppress React's console.error for expected error boundary logging
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try again.'),
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders a return home button', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: 'Return home' })).toBeInTheDocument();

    spy.mockRestore();
  });
});
