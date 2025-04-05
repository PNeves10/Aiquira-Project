import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DueDiligenceChart } from '../DueDiligenceChart';
import { DueDiligenceReport } from '../../types/asset';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  RadialLinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Filler: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Radar: ({ options }: any) => (
    <div data-testid="mock-chart" onClick={() => options.onClick({}, [{ index: 0 }])}>
      Chart Component
    </div>
  ),
}));

describe('DueDiligenceChart', () => {
  const mockReport: DueDiligenceReport = {
    riskScore: 0.2,
    complianceScore: 0.9,
    financialHealth: {
      score: 0.85,
      metrics: {},
      analysis: 'Strong financial position',
    },
    legalStatus: {
      score: 0.9,
      issues: [
        {
          type: 'Compliance',
          severity: 'low',
          description: 'Minor compliance issue',
          recommendation: 'Update documentation',
        },
      ],
    },
    marketPosition: {
      score: 0.8,
      analysis: 'Strong market position',
      competitors: [
        {
          name: 'Competitor 1',
          marketShare: 0.3,
          strengths: ['Brand'],
          weaknesses: ['Price'],
        },
      ],
    },
    recommendations: [
      {
        action: 'Proceed',
        reason: 'Low risk',
        priority: 'high',
        timeline: 'Immediate',
      },
    ],
    documents: [
      {
        type: 'Financial',
        status: 'verified',
        issues: [],
        recommendations: [],
      },
    ],
  };

  it('renders the chart component', () => {
    render(<DueDiligenceChart report={mockReport} />);
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('displays the overall health score', () => {
    render(<DueDiligenceChart report={mockReport} />);
    expect(screen.getByText('Overall Health: 80.0%')).toBeInTheDocument();
  });

  it('displays the number of issues', () => {
    render(<DueDiligenceChart report={mockReport} />);
    expect(screen.getByText('Issues: 1')).toBeInTheDocument();
  });

  it('renders with no issues', () => {
    const noIssuesReport = {
      ...mockReport,
      legalStatus: {
        ...mockReport.legalStatus,
        issues: [],
      },
    };
    render(<DueDiligenceChart report={noIssuesReport} />);
    expect(screen.getByText('Issues: 0')).toBeInTheDocument();
  });

  it('renders with high risk score', () => {
    const highRiskReport = {
      ...mockReport,
      riskScore: 0.8,
    };
    render(<DueDiligenceChart report={highRiskReport} />);
    expect(screen.getByText('Overall Health: 20.0%')).toBeInTheDocument();
  });

  it('renders with perfect scores', () => {
    const perfectReport = {
      ...mockReport,
      riskScore: 0,
      complianceScore: 1,
      financialHealth: {
        ...mockReport.financialHealth,
        score: 1,
      },
      legalStatus: {
        ...mockReport.legalStatus,
        score: 1,
      },
      marketPosition: {
        ...mockReport.marketPosition,
        score: 1,
      },
    };
    render(<DueDiligenceChart report={perfectReport} />);
    expect(screen.getByText('Overall Health: 100.0%')).toBeInTheDocument();
  });

  it('displays metric details when clicking on a point', () => {
    render(<DueDiligenceChart report={mockReport} />);
    fireEvent.click(screen.getByTestId('mock-chart'));
    expect(screen.getByText('Selected Metric: Risk Assessment')).toBeInTheDocument();
    expect(screen.getByText('Overall risk assessment score')).toBeInTheDocument();
    expect(screen.getByText('Risk Score: 20.0%')).toBeInTheDocument();
  });

  it('updates selected metric when clicking different points', () => {
    render(<DueDiligenceChart report={mockReport} />);
    
    // Click first point
    fireEvent.click(screen.getByTestId('mock-chart'));
    expect(screen.getByText('Selected Metric: Risk Assessment')).toBeInTheDocument();
    
    // Click second point (simulated by changing the index in the mock)
    const chart = screen.getByTestId('mock-chart');
    chart.onClick({}, [{ index: 1 }]);
    expect(screen.getByText('Selected Metric: Compliance')).toBeInTheDocument();
    expect(screen.getByText('Compliance and regulatory score')).toBeInTheDocument();
  });

  it('displays chart title and description', () => {
    render(<DueDiligenceChart report={mockReport} />);
    expect(screen.getByText('Due Diligence Assessment')).toBeInTheDocument();
    expect(screen.getByText('Click on points to see detailed metric information')).toBeInTheDocument();
  });

  it('handles chart hover interactions', () => {
    render(<DueDiligenceChart report={mockReport} />);
    const chart = screen.getByTestId('mock-chart');
    expect(chart).toHaveStyle({ transform: 'scale(1)' });
  });

  it('displays all metrics with correct values', () => {
    render(<DueDiligenceChart report={mockReport} />);
    expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Financial Health')).toBeInTheDocument();
    expect(screen.getByText('Legal Status')).toBeInTheDocument();
    expect(screen.getByText('Market Position')).toBeInTheDocument();
  });
}); 