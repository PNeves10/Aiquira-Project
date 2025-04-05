import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MatchScore } from '../types/asset';
import { getChartOptions, getChartColors, ChartContainer, ChartMetric } from '../utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MatchingScoreChartProps {
  matchScore: MatchScore;
}

export const MatchingScoreChart: React.FC<MatchingScoreChartProps> = ({ matchScore }) => {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const data = {
    labels: matchScore.factors.map((factor) => factor.name),
    datasets: [
      {
        label: 'Factor Score',
        data: matchScore.factors.map((factor) => factor.score * 100),
        ...getChartColors(0),
        borderWidth: 1,
        barThickness: 40,
      },
    ],
  };

  const options = {
    ...getChartOptions('bar'),
    plugins: {
      ...getChartOptions('bar').plugins,
      tooltip: {
        ...getChartOptions('bar').plugins?.tooltip,
        callbacks: {
          label: (context: any) => {
            const factor = matchScore.factors[context.dataIndex];
            return [
              `Score: ${(factor.score * 100).toFixed(1)}%`,
              `Explanation: ${factor.explanation}`,
            ];
          },
        },
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const factor = matchScore.factors[index];
        setSelectedFactor(factor.name);
      }
    },
  };

  return (
    <ChartContainer
      title="Match Score Analysis"
      description="Click on bars to see detailed factor information"
    >
      <div className="relative h-64">
        <Bar data={data} options={options} />
        <div className="absolute top-0 right-0 z-10 p-4 bg-white rounded-lg shadow-sm">
          <div className="space-y-2">
            <ChartMetric
              label="Overall Match"
              value={`${(matchScore.score * 100).toFixed(1)}%`}
              color="rgb(75, 192, 192)"
            />
            <ChartMetric
              label="Confidence"
              value={`${(matchScore.confidence * 100).toFixed(1)}%`}
              color="rgb(54, 162, 235)"
            />
          </div>
        </div>
      </div>

      {selectedFactor && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Factor: {selectedFactor}</h4>
          <p className="text-sm text-gray-600">
            {matchScore.factors.find((f) => f.name === selectedFactor)?.explanation}
          </p>
        </div>
      )}
    </ChartContainer>
  );
}; 