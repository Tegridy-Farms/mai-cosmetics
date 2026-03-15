/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SummaryCards } from "@/components/dashboard/SummaryCards";

const mockMonthData = {
  gross_income: 1500.0,
  total_expenses: 300.0,
  net_income: 1200.0,
  net_per_hour: 25.0,
  by_service_type: [],
};

const mockAllData = {
  gross_income: 5000.0,
  total_expenses: 1000.0,
  net_income: 4000.0,
  net_per_hour: 20.0,
  by_service_type: [],
};

describe("SummaryCards", () => {
  it("renders all 4 card labels", () => {
    render(
      <SummaryCards initialMonthData={mockMonthData} initialAllData={mockAllData} />
    );
    expect(screen.getByText(/gross income/i)).toBeInTheDocument();
    expect(screen.getByText(/total expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/net income \/ hr/i)).toBeInTheDocument();
    // net income label (not the /hr one)
    const netIncomeLabels = screen.getAllByText(/net income/i);
    expect(netIncomeLabels.length).toBeGreaterThanOrEqual(2);
  });

  it("shows 'This Month' toggle active by default", () => {
    render(
      <SummaryCards initialMonthData={mockMonthData} initialAllData={mockAllData} />
    );
    const thisMonthBtn = screen.getByRole("button", { name: /this month/i });
    expect(thisMonthBtn).toHaveClass("bg-[#EBF5FB]");
  });

  it("switching to 'All Time' shows all-time data", () => {
    render(
      <SummaryCards initialMonthData={mockMonthData} initialAllData={mockAllData} />
    );
    const allTimeBtn = screen.getByRole("button", { name: /all time/i });
    fireEvent.click(allTimeBtn);
    expect(screen.getByText("$5000.00")).toBeInTheDocument();
  });

  it("positive net income has green color class text-[#057A55]", () => {
    render(
      <SummaryCards initialMonthData={mockMonthData} initialAllData={mockAllData} />
    );
    // net_income is 1200, positive → green
    const netValue = screen.getByTestId("net-income-value");
    expect(netValue).toHaveClass("text-[#057A55]");
  });

  it("negative net income has red color class text-[#C81E1E]", () => {
    const negativeMonthData = { ...mockMonthData, net_income: -50.0 };
    render(
      <SummaryCards initialMonthData={negativeMonthData} initialAllData={mockAllData} />
    );
    const netValue = screen.getByTestId("net-income-value");
    expect(netValue).toHaveClass("text-[#C81E1E]");
  });

  it("net income per hour card has aria-label containing 'per hour'", () => {
    render(
      <SummaryCards initialMonthData={mockMonthData} initialAllData={mockAllData} />
    );
    const netHrEl = screen.getByLabelText(/per hour/i);
    expect(netHrEl).toBeInTheDocument();
  });

  it("all amounts formatted as '$X.XX'", () => {
    render(
      <SummaryCards initialMonthData={mockMonthData} initialAllData={mockAllData} />
    );
    expect(screen.getByText("$1500.00")).toBeInTheDocument();
    expect(screen.getByText("$300.00")).toBeInTheDocument();
    expect(screen.getByText("$1200.00")).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });
});
