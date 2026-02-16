import { type ReactNode, type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProviderOptions extends RenderOptions {
  route?: string;
  path?: string;
}

export function renderWithProviders(
  ui: ReactNode,
  { route = "/", path, ...renderOptions }: ProviderOptions = {},
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  // When `path` is provided, wrap ui in <Routes><Route> so useParams works
  const element = path ? (
    <Routes>
      <Route path={path} element={ui as ReactElement} />
    </Routes>
  ) : (
    ui
  );

  return render(element, { wrapper: Wrapper, ...renderOptions });
}
