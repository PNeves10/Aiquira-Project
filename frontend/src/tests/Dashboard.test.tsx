import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { RiskScore, MarketTrend, Issue, Recommendation } from '../types/analysis';

describe('Dashboard Component', () => {
  const mockRiskScore: RiskScore = {
    score: 75,
    level: 'medium',
    factors: {
      location: 80,
      propertyCondition: 70,
      financial: 60
    }
  };

  const mockMarketTrend: MarketTrend = {
    score: 80,
    direction: 'up',
    confidence: 0.8,
    factors: {
      priceTrend: 'up',
      demandSupplyRatio: 1.2,
      economicIndicators: {
        gdpGrowth: 2.5,
        unemploymentRate: 4.5,
        inflationRate: 2.0,
        interestRate: 3.5
      }
    }
  };

  const mockIssues: Issue[] = [
    {
      id: '1',
      type: 'structural',
      severity: 'high',
      description: 'Foundation cracks',
      impact: 'Structural integrity compromised',
      resolution: 'Professional inspection required',
      estimatedCost: 5000,
      priority: 'high',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      type: 'maintenance',
      severity: 'medium',
      description: 'Roof leaks',
      impact: 'Water damage risk',
      resolution: 'Roof repair needed',
      estimatedCost: 2000,
      priority: 'medium',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockRecommendations: Recommendation[] = [
    {
      id: '1',
      type: 'maintenance',
      priority: 'high',
      description: 'Immediate foundation repair',
      rationale: 'Prevent further structural damage',
      estimatedCost: 5000,
      expectedROI: 10000,
      timeline: '1 month',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  it('renders risk score with correct level and color', () => {
    render(
      <Dashboard
        riskScore={mockRiskScore}
        marketTrend={mockMarketTrend}
        issues={mockIssues}
        recommendations={mockRecommendations}
      />
    );

    // Check risk score display
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    
    // Check risk factors
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('Financial')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('displays market trends correctly', () => {
    render(
      <Dashboard
        riskScore={mockRiskScore}
        marketTrend={mockMarketTrend}
        issues={mockIssues}
        recommendations={mockRecommendations}
      />
    );

    // Check market direction
    expect(screen.getByText('up')).toBeInTheDocument();
    expect(screen.getByText('80% Confidence')).toBeInTheDocument();

    // Check economic indicators
    expect(screen.getByText('GDP Growth: 2.5%')).toBeInTheDocument();
    expect(screen.getByText('Unemployment: 4.5%')).toBeInTheDocument();
    expect(screen.getByText('Inflation: 2%')).toBeInTheDocument();
    expect(screen.getByText('Interest Rate: 3.5%')).toBeInTheDocument();
  });

  it('shows issues with correct severity levels', () => {
    render(
      <Dashboard
        riskScore={mockRiskScore}
        marketTrend={mockMarketTrend}
        issues={mockIssues}
        recommendations={mockRecommendations}
      />
    );

    // Check high severity issue
    expect(screen.getByText('Foundation cracks')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Structural integrity compromised')).toBeInTheDocument();
    expect(screen.getByText('$5000')).toBeInTheDocument();

    // Check medium severity issue
    expect(screen.getByText('Roof leaks')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('Water damage risk')).toBeInTheDocument();
    expect(screen.getByText('$2000')).toBeInTheDocument();
  });

  it('displays recommendations with priority levels', () => {
    render(
      <Dashboard
        riskScore={mockRiskScore}
        marketTrend={mockMarketTrend}
        issues={mockIssues}
        recommendations={mockRecommendations}
      />
    );

    // Check recommendation details
    expect(screen.getByText('Immediate foundation repair')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Prevent further structural damage')).toBeInTheDocument();
    expect(screen.getByText('$5000')).toBeInTheDocument();
    expect(screen.getByText('$10000')).toBeInTheDocument();
    expect(screen.getByText('1 month')).toBeInTheDocument();
  });

  it('handles different risk levels correctly', () => {
    const lowRiskScore: RiskScore = {
      ...mockRiskScore,
      score: 25,
      level: 'low'
    };

    const highRiskScore: RiskScore = {
      ...mockRiskScore,
      score: 85,
      level: 'high'
    };

    const { rerender } = render(
      <Dashboard
        riskScore={lowRiskScore}
        marketTrend={mockMarketTrend}
        issues={mockIssues}
        recommendations={mockRecommendations}
      />
    );

    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();

    rerender(
      <Dashboard
        riskScore={highRiskScore}
        marketTrend={mockMarketTrend}
        issues={mockIssues}
        recommendations={mockRecommendations}
      />
    );

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('handles different market trends correctly', () => {
    const downTrend: MarketTrend = {
      ...mockMarketTrend,
      direction: 'down',
      confidence: 0.6
    };

    const { rerender } = render(
      <Dashboard
        riskScore={mockRiskScore}
        marketTrend={downTrend}
        issues={mockIssues}
        recommendations={mockRecommendations}
      />
    );

    expect(screen.getByText('down')).toBeInTheDocument();
    expect(screen.getByText('60% Confidence')).toBeInTheDocument();
  });
}); 