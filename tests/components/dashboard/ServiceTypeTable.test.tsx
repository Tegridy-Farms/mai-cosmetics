/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ServiceTypeTable } from "@/components/dashboard/ServiceTypeTable";
import type { ServiceTypeMetric } from "@/types";

const mockData: ServiceTypeMetric[] = [
  {
    name: "Manicure",
    total_sessions: 10,
    total_hours: 5,
    gross_income: 500,
    expense_share: 100,
    net_income: 400,
  },
  {
    name: "Pedicure",
    total_sessions: 5,
    total_hours: 3,
    gross_income: 300,
    expense_share: 50,
    net_income: 250,
  },
  {
    name: "Gel Nails",
    total_sessions: 8,
    total_hours: 12,
    gross_income: 800,
    expense_share: 900,
    net_income: -100,
  },
];

describe("ServiceTypeTable", () => {
  it("renders table with correct column headers in Hebrew", () => {
    render(<ServiceTypeTable data={mockData} />);
    expect(screen.getByText(/סוג שירות/)).toBeInTheDocument();
    expect(screen.getByText(/סה״כ טיפולים/)).toBeInTheDocument();
    expect(screen.getByText(/סה״כ שעות/)).toBeInTheDocument();
    expect(screen.getByText(/הכנסות ברוטו/)).toBeInTheDocument();
    expect(screen.getByText(/חלק הוצאות/)).toBeInTheDocument();
    expect(screen.getByText(/הכנסה נטו/)).toBeInTheDocument();
  });

  it("renders one row per service type metric", () => {
    render(<ServiceTypeTable data={mockData} />);
    expect(screen.getByText("Manicure")).toBeInTheDocument();
    expect(screen.getByText("Pedicure")).toBeInTheDocument();
    expect(screen.getByText("Gel Nails")).toBeInTheDocument();
  });

  it("default sort is net_income descending (highest first)", () => {
    render(<ServiceTypeTable data={mockData} />);
    const rows = screen.getAllByRole("row");
    // rows[0] is the header row, rows[1] is first data row
    expect(rows[1]).toHaveTextContent("Manicure"); // net_income: 400 (highest)
    expect(rows[2]).toHaveTextContent("Pedicure"); // net_income: 250
    expect(rows[3]).toHaveTextContent("Gel Nails"); // net_income: -100 (lowest)
  });

  it("clicking 'Net Income' header toggles sort to ascending", () => {
    render(<ServiceTypeTable data={mockData} />);
    const netIncomeHeader = screen.getByRole("columnheader", { name: /הכנסה נטו/ });
    fireEvent.click(netIncomeHeader);
    const rows = screen.getAllByRole("row");
    // Now ascending: Gel Nails (-100), Pedicure (250), Manicure (400)
    expect(rows[1]).toHaveTextContent("Gel Nails");
    expect(rows[3]).toHaveTextContent("Manicure");
  });

  it("positive net income row has green text class", () => {
    render(<ServiceTypeTable data={mockData} />);
    const manicureNetIncome = screen.getByTestId("net-income-Manicure");
    expect(manicureNetIncome).toHaveClass("text-[#057A55]");
  });

  it("negative net income row has red text class", () => {
    render(<ServiceTypeTable data={mockData} />);
    const gelNailsNetIncome = screen.getByTestId("net-income-Gel Nails");
    expect(gelNailsNetIncome).toHaveClass("text-[#C81E1E]");
  });

  it("uses proper table markup", () => {
    const { container } = render(<ServiceTypeTable data={mockData} />);
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(container.querySelector("tbody")).toBeInTheDocument();
    const ths = container.querySelectorAll('th[scope="col"]');
    expect(ths.length).toBeGreaterThan(0);
  });

  it("sorted column has aria-sort attribute", () => {
    render(<ServiceTypeTable data={mockData} />);
    const netIncomeHeader = screen.getByRole("columnheader", { name: /הכנסה נטו/ });
    expect(netIncomeHeader).toHaveAttribute("aria-sort", "descending");
  });
});
