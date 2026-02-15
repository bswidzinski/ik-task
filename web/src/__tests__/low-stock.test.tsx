import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { LowStockReportPage } from "@/pages/low-stock-report";

const mockReport = {
  threshold: 5,
  totalLowStockProducts: 3,
  totalRestockCost: 2500.5,
  stores: [
    {
      storeId: "s1",
      storeName: "Test Store",
      lowStockCount: 2,
      products: [
        {
          id: "p1",
          name: "iPhone",
          category: "electronics",
          price: 999.99,
          quantity: 0,
          deficit: 5,
        },
        {
          id: "p2",
          name: "Kindle",
          category: "electronics",
          price: 139.99,
          quantity: 1,
          deficit: 4,
        },
      ],
    },
    {
      storeId: "s2",
      storeName: "Fashion Store",
      lowStockCount: 1,
      products: [
        {
          id: "p3",
          name: "Winter Parka",
          category: "clothing",
          price: 189.99,
          quantity: 0,
          deficit: 5,
        },
      ],
    },
  ],
};

const emptyReport = {
  threshold: 5,
  totalLowStockProducts: 0,
  totalRestockCost: 0,
  stores: [],
};

vi.mock("@/hooks/use-inventory", () => ({
  useLowStockReport: vi.fn(),
}));

import { useLowStockReport } from "@/hooks/use-inventory";
const mockUseLowStockReport = vi.mocked(useLowStockReport);

describe("LowStockReportPage", () => {
  it("renders summary stats", () => {
    mockUseLowStockReport.mockReturnValue({
      data: mockReport,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useLowStockReport>);

    renderWithProviders(<LowStockReportPage />);

    expect(screen.getByText("Low Stock Report")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("$2500.50")).toBeInTheDocument();
  });

  it("renders store sections with products", () => {
    mockUseLowStockReport.mockReturnValue({
      data: mockReport,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useLowStockReport>);

    renderWithProviders(<LowStockReportPage />);

    expect(screen.getByText("Test Store")).toBeInTheDocument();
    expect(screen.getByText("2 low")).toBeInTheDocument();
    expect(screen.getByText("iPhone")).toBeInTheDocument();
    expect(screen.getByText("Kindle")).toBeInTheDocument();

    expect(screen.getByText("Fashion Store")).toBeInTheDocument();
    expect(screen.getByText("1 low")).toBeInTheDocument();
    expect(screen.getByText("Winter Parka")).toBeInTheDocument();
  });

  it("shows positive empty state when no low stock items", () => {
    mockUseLowStockReport.mockReturnValue({
      data: emptyReport,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useLowStockReport>);

    renderWithProviders(<LowStockReportPage />);

    expect(
      screen.getByText("All products are well stocked!"),
    ).toBeInTheDocument();
  });
});
