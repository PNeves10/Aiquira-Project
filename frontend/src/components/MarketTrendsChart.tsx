import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MarketTrend {
  price: number;
  timestamp: string;
  confidence: number;
}

interface MarketTrendsChartProps {
  trends: MarketTrend[];
  currentValue: number;
  predictedValue: number;
}

export const MarketTrendsChart: React.FC<MarketTrendsChartProps> = ({
  trends,
  currentValue,
  predictedValue,
}) => {
  const data = {
    labels: trends.map((trend) => new Date(trend.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Historical Prices',
        data: trends.map((trend) => trend.price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Predicted Trend',
        data: [
          ...trends.map((trend) => trend.price),
          predictedValue,
        ],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Market Price Trends',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const confidence = context.datasetIndex === 0
              ? trends[context.dataIndex]?.confidence
              : trends[trends.length - 1]?.confidence;
            return `${context.dataset.label}: $${value.toLocaleString()} (${(confidence * 100).toFixed(1)}% confidence)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `$${(value as number).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 z-10 p-4 bg-white rounded-lg shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[rgb(75,192,192)] rounded-full mr-2" />
            <span className="text-sm">Historical</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[rgb(255,99,132)] rounded-full mr-2" />
            <span className="text-sm">Predicted</span>
          </div>
        </div>
      </div>
      <Line data={data} options={options} />
    </div>
  );
}; 