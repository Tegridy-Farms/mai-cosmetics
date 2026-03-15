/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/dynamic so TrendChartInner is not loaded in tests
jest.mock('next/dynamic', () => {
  return function mockDynamic(
    _loader: unknown,
    options: { loading?: () => React.ReactElement }
  ) {
    // Return a simple stub component
    function MockDynamicChart({ data }: { data: unknown[] }) {
      return React.createElement(
        'div',
        { 'data-testid': 'recharts-chart', 'data-count': data.length },
        `Chart with ${data.length} data points`
      );
    }
    MockDynamicChart.displayName = 'MockDynamicChart';
    return MockDynamicChart;
  };
});

import { TrendChart } from '@/components/dashboard/TrendChart';

const mockTrendData = [
  { month: '2026-01', gross: 500, expenses: 100, net: 400 },
  { month: '2026-02', gross: 650, expenses: 120, net: 530 },
  { month: '2026-03', gross: 800, expenses: 150, net: 650 },
];

describe('TrendChart', () => {
  describe('structure', () => {
    it('renders a <figure> element', () => {
      const { container } = render(<TrendChart data={mockTrendData} />);
      expect(container.querySelector('figure')).toBeInTheDocument();
    });

    it('renders a <figcaption> element', () => {
      const { container } = render(<TrendChart data={mockTrendData} />);
      expect(container.querySelector('figcaption')).toBeInTheDocument();
    });

    it('figcaption contains date range description', () => {
      const { container } = render(<TrendChart data={mockTrendData} />);
      const figcaption = container.querySelector('figcaption');
      expect(figcaption?.textContent).toMatch(/monthly gross income/i);
    });

    it('figcaption includes start and end month', () => {
      const { container } = render(<TrendChart data={mockTrendData} />);
      const figcaption = container.querySelector('figcaption');
      // Should mention some month from start to end
      expect(figcaption?.textContent).toMatch(/jan|feb|mar/i);
    });
  });

  describe('with data', () => {
    it('renders the chart component when data is provided', () => {
      render(<TrendChart data={mockTrendData} />);
      expect(screen.getByTestId('recharts-chart')).toBeInTheDocument();
    });

    it('does not show empty state when data is provided', () => {
      render(<TrendChart data={mockTrendData} />);
      expect(screen.queryByTestId('trend-chart-empty')).not.toBeInTheDocument();
    });

    it('does not show skeleton when not loading', () => {
      render(<TrendChart data={mockTrendData} />);
      expect(screen.queryByTestId('trend-chart-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state message when data is empty array', () => {
      render(<TrendChart data={[]} />);
      expect(screen.getByTestId('trend-chart-empty')).toBeInTheDocument();
    });

    it('shows "No monthly data available yet." when empty', () => {
      render(<TrendChart data={[]} />);
      expect(screen.getByText(/no monthly data available yet/i)).toBeInTheDocument();
    });

    it('does not show recharts chart when data is empty', () => {
      render(<TrendChart data={[]} />);
      expect(screen.queryByTestId('recharts-chart')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading skeleton when isLoading=true', () => {
      render(<TrendChart data={[]} isLoading={true} />);
      expect(screen.getByTestId('trend-chart-skeleton')).toBeInTheDocument();
    });

    it('does not show chart when isLoading=true', () => {
      render(<TrendChart data={mockTrendData} isLoading={true} />);
      expect(screen.queryByTestId('recharts-chart')).not.toBeInTheDocument();
    });

    it('skeleton has aria-label "Loading trend chart"', () => {
      render(<TrendChart data={[]} isLoading={true} />);
      expect(screen.getByLabelText(/loading trend chart/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('figcaption has class sr-only for screen reader only', () => {
      const { container } = render(<TrendChart data={mockTrendData} />);
      const figcaption = container.querySelector('figcaption');
      expect(figcaption).toHaveClass('sr-only');
    });
  });
});
