import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";
import { StoreFormDialog } from "@/components/store-form-dialog";

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
