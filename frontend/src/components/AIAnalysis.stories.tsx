import type { Meta, StoryObj } from '@storybook/react';
import { AIAnalysis } from './AIAnalysis';

const meta: Meta<typeof AIAnalysis> = {
  title: 'Components/AIAnalysis',
  component: AIAnalysis,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive AI analysis component that displays risk scores, market insights, and identified issues for a given asset.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AIAnalysis>;

// Mock data for the stories
const mockAnalysisData = {
  riskScore: 45,
  marketInsights: {
    trend: 'positive' as const,
    confidence: 0.85,
    factors: [
      'Strong market demand',
      'Favorable economic conditions',
      'Positive industry trends',
    ],
  },
  recommendations: [
    'Consider increasing investment',
    'Monitor market volatility',
    'Review risk management strategies',
  ],
  issues: [
    {
      severity: 'high' as const,
      description: 'Regulatory compliance risk',
      impact: 'Potential legal consequences and fines',
      resolution: 'Review and update compliance procedures',
    },
    {
      severity: 'medium' as const,
      description: 'Market competition',
      impact: 'Decreased market share',
      resolution: 'Develop competitive advantages',
    },
  ],
};

export const Default: Story = {
  args: {
    assetId: 'asset-123',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-123',
        method: 'GET',
        status: 200,
        response: mockAnalysisData,
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    assetId: 'asset-456',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-456',
        method: 'GET',
        status: 200,
        delay: 2000,
        response: mockAnalysisData,
      },
    ],
  },
};

export const Error: Story = {
  args: {
    assetId: 'asset-789',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-789',
        method: 'GET',
        status: 500,
        response: {
          message: 'Failed to fetch analysis',
          code: 'ANALYSIS_ERROR',
          details: 'Internal server error occurred while processing the request',
        },
      },
    ],
  },
};

export const HighRisk: Story = {
  args: {
    assetId: 'asset-high-risk',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-high-risk',
        method: 'GET',
        status: 200,
        response: {
          ...mockAnalysisData,
          riskScore: 85,
          marketInsights: {
            ...mockAnalysisData.marketInsights,
            trend: 'negative' as const,
            confidence: 0.92,
            factors: [
              'Market volatility',
              'Economic uncertainty',
              'Regulatory changes',
            ],
          },
        },
      },
    ],
  },
};

export const LowRisk: Story = {
  args: {
    assetId: 'asset-low-risk',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-low-risk',
        method: 'GET',
        status: 200,
        response: {
          ...mockAnalysisData,
          riskScore: 25,
          marketInsights: {
            ...mockAnalysisData.marketInsights,
            trend: 'positive' as const,
            confidence: 0.95,
            factors: [
              'Stable market conditions',
              'Strong fundamentals',
              'Low volatility',
            ],
          },
        },
      },
    ],
  },
};

export const MediumRisk: Story = {
  args: {
    assetId: 'asset-medium-risk',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-medium-risk',
        method: 'GET',
        status: 200,
        response: {
          ...mockAnalysisData,
          riskScore: 55,
          marketInsights: {
            ...mockAnalysisData.marketInsights,
            trend: 'neutral' as const,
            confidence: 0.75,
            factors: [
              'Mixed market signals',
              'Moderate competition',
              'Average volatility',
            ],
          },
        },
      },
    ],
  },
};

export const WithManyIssues: Story = {
  args: {
    assetId: 'asset-many-issues',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-many-issues',
        method: 'GET',
        status: 200,
        response: {
          ...mockAnalysisData,
          issues: [
            ...mockAnalysisData.issues,
            {
              severity: 'high' as const,
              description: 'Environmental concerns',
              impact: 'Potential regulatory restrictions',
              resolution: 'Conduct environmental assessment',
            },
            {
              severity: 'medium' as const,
              description: 'Supply chain disruption',
              impact: 'Delayed project timelines',
              resolution: 'Diversify suppliers',
            },
            {
              severity: 'low' as const,
              description: 'Documentation gaps',
              impact: 'Minor compliance issues',
              resolution: 'Update documentation',
            },
          ],
        },
      },
    ],
  },
};

export const WithDetailedRecommendations: Story = {
  args: {
    assetId: 'asset-detailed-recommendations',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-detailed-recommendations',
        method: 'GET',
        status: 200,
        response: {
          ...mockAnalysisData,
          recommendations: [
            'Consider increasing investment by 15% based on market growth',
            'Monitor market volatility using the new risk assessment tools',
            'Review risk management strategies quarterly',
            'Implement automated compliance monitoring system',
            'Diversify portfolio across different asset classes',
            'Establish contingency plans for supply chain disruptions',
            'Regularly update market analysis reports',
            'Conduct stakeholder meetings monthly',
          ],
        },
      },
    ],
  },
};

export const WithCustomStyling: Story = {
  args: {
    assetId: 'asset-custom-styling',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-custom-styling',
        method: 'GET',
        status: 200,
        response: mockAnalysisData,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl mx-auto p-4 bg-gray-50 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const WithDarkMode: Story = {
  args: {
    assetId: 'asset-dark-mode',
  },
  parameters: {
    mockData: [
      {
        url: '/api/analysis/asset-dark-mode',
        method: 'GET',
        status: 200,
        response: mockAnalysisData,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-4 rounded-lg">
        <Story />
      </div>
    ),
  ],
}; 