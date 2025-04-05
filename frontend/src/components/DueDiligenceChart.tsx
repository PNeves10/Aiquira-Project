import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { DueDiligenceReport } from '../types/asset';
import { getChartOptions, getChartColors, ChartContainer, ChartMetric } from '../utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface DueDiligenceChartProps {
  report: DueDiligenceReport;
}

export const DueDiligenceChart: React.FC<DueDiligenceChartProps> = ({ report }) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const metrics = [
    {
      name: 'Risk Assessment',
      value: (1 - report.riskScore) * 100,
      description: 'Overall risk assessment score',
      details: `Risk Score: ${(report.riskScore * 100).toFixed(1)}%`,
    },
    {
      name: 'Compliance',
      value: report.complianceScore * 100,
      description: 'Compliance and regulatory score',
      details: 'Based on regulatory requirements and standards',
    },
    {
      name: 'Financial Health',
      value: report.financialHealth.score * 100,
      description: 'Financial health and stability',
      details: report.financialHealth.analysis,
    },
    {
      name: 'Legal Status',
      value: report.legalStatus.score * 100,
      description: 'Legal and contractual status',
      details: `${report.legalStatus.issues.length} issues identified`,
    },
    {
      name: 'Market Position',
      value: report.marketPosition.score * 100,
      description: 'Market position and competitiveness',
      details: report.marketPosition.analysis,
    },
  ];

  const data = {
    labels: metrics.map((m) => m.name),
    datasets: [
      {
        label: 'Scores',
        data: metrics.map((m) => m.value),
        ...getChartColors(0),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...getChartOptions('radar'),
    plugins: {
      ...getChartOptions('radar').plugins,
      tooltip: {
        ...getChartOptions('radar').plugins?.tooltip,
        callbacks: {
          label: (context: any) => {
            const metric = metrics[context.dataIndex];
            return [
              `Score: ${metric.value.toFixed(1)}%`,
              `Description: ${metric.description}`,
            ];
          },
        },
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const metric = metrics[index];
        setSelectedMetric(metric.name);
      }
    },
  };

  return (
    <ChartContainer
      title="Due Diligence Assessment"
      description="Click on points to see detailed metric information"
    >
      <div className="relative h-64">
        <Radar data={data} options={options} />
        <div className="absolute top-0 right-0 z-10 p-4 bg-white rounded-lg shadow-sm">
          <div className="space-y-2">
            <ChartMetric
              label="Overall Health"
              value={`${((1 - report.riskScore) * 100).toFixed(1)}%`}
              color="rgb(75, 192, 192)"
            />
            <ChartMetric
              label="Issues"
              value={report.legalStatus.issues.length}
              color="rgb(255, 99, 132)"
            />
          </div>
        </div>
      </div>

      {selectedMetric && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Metric: {selectedMetric}</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {metrics.find((m) => m.name === selectedMetric)?.description}
            </p>
            <p className="text-sm text-gray-600">
              {metrics.find((m) => m.name === selectedMetric)?.details}
            </p>
          </div>
        </div>
      )}
    </ChartContainer>
  );
}; 
}; 