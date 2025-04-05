import { ChartOptions } from 'chart.js';
import { motion } from 'framer-motion';

export const getChartAnimation = (delay: number = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, delay },
});

export const getChartHoverAnimation = () => ({
  scale: 1.02,
  transition: { duration: 0.2 },
});

export const getChartOptions = (type: 'line' | 'bar' | 'radar'): ChartOptions => {
  const baseOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1a1a1a',
        bodyColor: '#4a4a4a',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  switch (type) {
    case 'line':
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      };
    case 'bar':
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      };
    case 'radar':
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      };
    default:
      return baseOptions;
  }
};

export const getChartColors = (index: number) => {
  const colors = [
    'rgb(75, 192, 192)',
    'rgb(255, 99, 132)',
    'rgb(54, 162, 235)',
    'rgb(255, 206, 86)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(75, 192, 192)',
    'rgb(255, 99, 132)',
  ];
  return {
    backgroundColor: colors[index] + '40',
    borderColor: colors[index],
    pointBackgroundColor: colors[index],
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: colors[index],
  };
};

export const ChartContainer: React.FC<{
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}> = ({ children, title, description, className = '' }) => (
  <motion.div
    className={`bg-white rounded-lg shadow p-4 ${className}`}
    {...getChartAnimation()}
    whileHover={getChartHoverAnimation()}
  >
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
    {children}
  </motion.div>
);

export const ChartMetric: React.FC<{
  label: string;
  value: string | number;
  color: string;
  className?: string;
}> = ({ label, value, color, className = '' }) => (
  <div className={`flex items-center ${className}`}>
    <div className={`w-4 h-4 rounded-full mr-2`} style={{ backgroundColor: color }} />
    <span className="text-sm">
      {label}: {value}
    </span>
  </div>
); 