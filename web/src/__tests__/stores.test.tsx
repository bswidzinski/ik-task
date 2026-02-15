import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";
import { StoresListPage } from "@/pages/stores-list";
import { StoreFormDialog } from "@/components/store-form-dialog";

const mockStores = [
  {
    id: "1",
    name: "Downtown Electronics",
    address: "123 Main St",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Fashion Outlet",
    address: "456 Oak Ave",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

vi.mock("@/hooks/use-stores", () => ({
  useStores: vi.fn(),
  useCreateStore: () => ({ mutate: vi.fn(), isPending: false }),
  useStore: vi.fn(),
  useUpdateStore: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteStore: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { useStores } from "@/hooks/use-stores";
const mockUseStores = vi.mocked(useStores);

describe("StoresListPage", () => {
  it("renders store cards when data is loaded", () => {
    mockUseStores.mockReturnValue({
      data: mockStores,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useStores>);

    renderWithProviders(<StoresListPage />);

    expect(screen.getByText("Downtown Electronics")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Fashion Outlet")).toBeInTheDocument();
    expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseStores.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useStores>);

    const { container } = renderWithProviders(<StoresListPage />);

    // Skeleton elements are rendered during loading
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no stores", () => {
    mockUseStores.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useStores>);

    renderWithProviders(<StoresListPage />);

    expect(screen.getByText("No stores yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first store to get started."),
    ).toBeInTheDocument();
  });
});

describe("StoreFormDialog", () => {
  it("shows validation errors for invalid input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(
      <StoreFormDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        isPending={false}
        title="Add Store"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("Name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Address must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders store info when editing", () => {
    renderWithProviders(
      <StoreFormDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        isPending={false}
        initialData={{ name: "My Store", address: "123 Main St" }}
        title="Edit Store"
      />,
    );

    expect(screen.getByDisplayValue("My Store")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Edit Store")).toBeInTheDocument();
  });
});
