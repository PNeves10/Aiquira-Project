import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarketTrendsChart } from '../MarketTrendsChart';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Chart Component</div>,
}));

describe('MarketTrendsChart', () => {
  const mockTrends = [
    {
      price: 1000000,
      timestamp: '2024-01-01',
      confidence: 0.9,
    },
    {
      price: 1050000,
      timestamp: '2024-01-02',
      confidence: 0.85,
    },
    {
      price: 1100000,
      timestamp: '2024-01-03',
      confidence: 0.8,
    },
  ];

  const mockCurrentValue = 1100000;
  const mockPredictedValue = 1150000;

  it('renders the chart component', () => {
    render(
      <MarketTrendsChart
        trends={mockTrends}
        currentValue={mockCurrentValue}
        predictedValue={mockPredictedValue}
      />
    );

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('renders the legend', () => {
    render(
      <MarketTrendsChart
        trends={mockTrends}
        currentValue={mockCurrentValue}
        predictedValue={mockPredictedValue}
      />
    );

    expect(screen.getByText('Historical')).toBeInTheDocument();
    expect(screen.getByText('Predicted')).toBeInTheDocument();
  });

  it('renders with empty trends array', () => {
    render(
      <MarketTrendsChart
        trends={[]}
        currentValue={mockCurrentValue}
        predictedValue={mockPredictedValue}
      />
    );

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('renders with single trend', () => {
    const singleTrend = [mockTrends[0]];
    render(
      <MarketTrendsChart
        trends={singleTrend}
        currentValue={mockCurrentValue}
        predictedValue={mockPredictedValue}
      />
    );

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('renders with different price ranges', () => {
    const highValueTrends = mockTrends.map((trend) => ({
      ...trend,
      price: trend.price * 10,
    }));

    render(
      <MarketTrendsChart
        trends={highValueTrends}
        currentValue={mockCurrentValue * 10}
        predictedValue={mockPredictedValue * 10}
      />
    );

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });
}); 