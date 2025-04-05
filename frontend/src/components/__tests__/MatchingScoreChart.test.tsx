import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchingScoreChart } from '../MatchingScoreChart';
import { MatchScore } from '../../types/asset';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: ({ options }: any) => (
    <div data-testid="mock-chart" onClick={() => options.onClick({}, [{ index: 0 }])}>
      Chart Component
    </div>
  ),
}));

describe('MatchingScoreChart', () => {
  const mockMatchScore: MatchScore = {
    score: 0.85,
    confidence: 0.9,
    factors: [
      {
        name: 'Price Match',
        score: 0.8,
        explanation: 'Price within range',
      },
      {
        name: 'Location Match',
        score: 0.9,
        explanation: 'Location matches preferences',
      },
    ],
    recommendations: [
      {
        action: 'Consider',
        reason: 'Good match',
        priority: 'high',
      },
    ],
    similarAssets: [],
  };

  it('renders the chart component', () => {
    render(<MatchingScoreChart matchScore={mockMatchScore} />);
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('displays the overall match score', () => {
    render(<MatchingScoreChart matchScore={mockMatchScore} />);
    expect(screen.getByText('Overall Match: 85.0%')).toBeInTheDocument();
  });

  it('displays the confidence score', () => {
    render(<MatchingScoreChart matchScore={mockMatchScore} />);
    expect(screen.getByText('Confidence: 90.0%')).toBeInTheDocument();
  });

  it('renders with empty factors array', () => {
    const emptyMatchScore = {
      ...mockMatchScore,
      factors: [],
    };
    render(<MatchingScoreChart matchScore={emptyMatchScore} />);
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('renders with different score ranges', () => {
    const highScoreMatch = {
      ...mockMatchScore,
      score: 0.95,
      confidence: 0.98,
    };
    render(<MatchingScoreChart matchScore={highScoreMatch} />);
    expect(screen.getByText('Overall Match: 95.0%')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 98.0%')).toBeInTheDocument();
  });

  it('displays factor details when clicking on a bar', () => {
    render(<MatchingScoreChart matchScore={mockMatchScore} />);
    fireEvent.click(screen.getByTestId('mock-chart'));
    expect(screen.getByText('Selected Factor: Price Match')).toBeInTheDocument();
    expect(screen.getByText('Price within range')).toBeInTheDocument();
  });

  it('updates selected factor when clicking different bars', () => {
    render(<MatchingScoreChart matchScore={mockMatchScore} />);
    
    // Click first bar
    fireEvent.click(screen.getByTestId('mock-chart'));
    expect(screen.getByText('Selected Factor: Price Match')).toBeInTheDocument();
    
    // Click second bar (simulated by changing the index in the mock)
    const chart = screen.getByTestId('mock-chart');
    chart.onClick({}, [{ index: 1 }]);
    expect(screen.getByText('Selected Factor: Location Match')).toBeInTheDocument();
    expect(screen.getByText('Location matches preferences')).toBeInTheDocument();
  });

  it('displays chart title and description', () => {
    render(<MatchingScoreChart matchScore={mockMatchScore} />);
    expect(screen.getByText('Match Score Analysis')).toBeInTheDocument();
    expect(screen.getByText('Click on bars to see detailed factor information')).toBeInTheDocument();
  });

  it('handles chart hover interactions', () => {
    render(<MatchingScoreChart matchScore={mockMatchScore} />);
    const chart = screen.getByTestId('mock-chart');
    expect(chart).toHaveStyle({ transform: 'scale(1)' });
  });
}); 