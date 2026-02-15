import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";
import { ProductsListPage } from "@/pages/products-list";
import { ProductFormDialog } from "@/components/product-form-dialog";

const mockStores = [
  {
    id: "s1",
    name: "Test Store",
    address: "123 Main St",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const mockProducts = {
  data: [
    {
      id: "p1",
      name: "MacBook Pro",
      category: "electronics",
      price: "2499.99",
      quantity: 8,
      storeId: "s1",
      store: { id: "s1", name: "Test Store" },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "p2",
      name: "Running Shoes",
      category: "sports",
      price: "129.99",
      quantity: 0,
      storeId: "s1",
      store: { id: "s1", name: "Test Store" },
      createdAt: "2026-01-02T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    },
  ],
  meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
};

vi.mock("@/hooks/use-products", () => ({
  useProducts: vi.fn(),
  useStoreProducts: vi.fn(),
  useCreateProduct: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateProduct: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteProduct: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/use-stores", () => ({
  useStores: () => ({ data: mockStores, isLoading: false, error: null }),
  useCreateStore: () => ({ mutate: vi.fn(), isPending: false }),
  useStore: vi.fn(),
  useUpdateStore: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteStore: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/use-product-filters", () => ({
  useProductFilters: () => ({
    query: {},
    setFilter: vi.fn(),
    clearFilters: vi.fn(),
    hasFilters: false,
  }),
}));

import { useProducts } from "@/hooks/use-products";
const mockUseProducts = vi.mocked(useProducts);

describe("ProductsListPage", () => {
  it("renders product table with data", () => {
    mockUseProducts.mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useProducts>);

    renderWithProviders(<ProductsListPage />);

    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("Running Shoes")).toBeInTheDocument();
    expect(screen.getByText("$2499.99")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useProducts>);

    const { container } = renderWithProviders(<ProductsListPage />);

    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state message", () => {
    mockUseProducts.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useProducts>);

    renderWithProviders(<ProductsListPage />);

    expect(screen.getByText("No products yet")).toBeInTheDocument();
  });
});

describe("ProductFormDialog", () => {
  it("validates required fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(
      <ProductFormDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        isPending={false}
        stores={mockStores}
        title="Add Product"
      />,
    );

    // Clear the default quantity value
    const qtyInput = screen.getByLabelText("Quantity");
    await user.clear(qtyInput);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("Name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Category is required")).toBeInTheDocument();
    expect(
      screen.getByText("Price must be greater than 0"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("validates price > 0 and quantity >= 0", () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <ProductFormDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        isPending={false}
        stores={mockStores}
        initialData={{
          name: "Test Product",
          category: "electronics",
          price: 0,
          quantity: -5,
          storeId: "s1",
        }}
        title="Edit Product"
      />,
    );

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    expect(
      screen.getByText("Price must be greater than 0"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Quantity must be a non-negative integer"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
