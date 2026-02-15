import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";
import { ProductFilters } from "@/components/product-filters";

describe("ProductFilters", () => {
  it("renders all category options", async () => {
    const user = userEvent.setup();
    const setFilter = vi.fn();

    renderWithProviders(
      <ProductFilters
        query={{}}
        setFilter={setFilter}
        clearFilters={vi.fn()}
        hasFilters={false}
      />,
    );

    // Open the category select
    const categoryTrigger = screen.getAllByRole("combobox")[0];
    await user.click(categoryTrigger);

    // "All categories" appears in both the trigger and the dropdown
    expect(screen.getAllByText("All categories").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("shows clear filters button when filters are active", () => {
    renderWithProviders(
      <ProductFilters
        query={{ category: "electronics" }}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        hasFilters={true}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
  });

  it("does not show clear filters button when no filters", () => {
    renderWithProviders(
      <ProductFilters
        query={{}}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        hasFilters={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();
  });

  it("calls clearFilters when clear button is clicked", async () => {
    const user = userEvent.setup();
    const clearFilters = vi.fn();

    renderWithProviders(
      <ProductFilters
        query={{ search: "test" }}
        setFilter={vi.fn()}
        clearFilters={clearFilters}
        hasFilters={true}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(clearFilters).toHaveBeenCalled();
  });
});
