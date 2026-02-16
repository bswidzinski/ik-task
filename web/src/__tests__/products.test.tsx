import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";
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
