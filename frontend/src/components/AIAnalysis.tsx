import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portugueseMarketService } from '../services/portugueseMarket';
import { captureError } from '../utils/sentry';
import { type AIAnalysisResult } from '../schemas/portugueseMarket';
import { z } from 'zod';
import { Tooltip } from './Tooltip';
import { ExpandableSection } from './ExpandableSection';

/**
 * Props for the AIAnalysis component
 * @interface AIAnalysisProps
 * @property {string} assetId - The unique identifier of the asset to analyze
 */
interface AIAnalysisProps {
  assetId: string;
}

/**
 * Error state interface for handling API errors
 * @interface ErrorState
 * @property {string} message - The error message to display
 * @property {string} [code] - Optional error code
 * @property {string} [details] - Optional technical details
 */
interface ErrorState {
  message: string;
  code?: string;
  details?: string;
}

// Input validation schema for assetId
const assetIdSchema = z.string().min(1).regex(/^[a-zA-Z0-9-_]+$/);

/**
 * Displays a risk score with a circular progress indicator
 * @component
 * @param {Object} props - Component props
 * @param {number} props.score - The risk score value (0-100)
 * @returns {JSX.Element} The rendered risk score component
 */
const RiskScore: React.FC<{ score: number }> = ({ score }) => {
  const getColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Tooltip content={`Risk assessment based on market conditions and asset characteristics`}>
      <div 
        className="flex items-center space-x-2 group cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Risk Score: ${score} - ${score <= 30 ? 'Low Risk' : score <= 70 ? 'Medium Risk' : 'High Risk'}`}
      >
        <div className="relative w-24 h-24 transition-transform duration-300 group-hover:scale-110">
          <svg className="w-full h-full" viewBox="0 0 36 36" aria-hidden="true">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={score <= 30 ? '#059669' : score <= 70 ? '#D97706' : '#DC2626'}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getColor(score)} transition-colors duration-300`}>
              {score}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Risk Score</p>
          <p className={`text-lg font-semibold ${getColor(score)} transition-colors duration-300`}>
            {score <= 30 ? 'Low Risk' : score <= 70 ? 'Medium Risk' : 'High Risk'}
          </p>
        </div>
      </div>
    </Tooltip>
  );
};

/**
 * Displays market insights with trend analysis and confidence level
 * @component
 * @param {Object} props - Component props
 * @param {'positive' | 'neutral' | 'negative'} props.trend - The market trend direction
 * @param {number} props.confidence - The confidence level (0-1)
 * @param {string[]} props.factors - List of key market factors
 * @returns {JSX.Element} The rendered market insight component
 */
const MarketInsight: React.FC<{
  trend: 'positive' | 'neutral' | 'negative';
  confidence: number;
  factors: string[];
}> = ({ trend, confidence, factors }) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-600';
      case 'neutral': return 'text-yellow-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 transition-all duration-300 hover:shadow-lg"
      role="region"
      aria-label="Market Insights"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Market Insights</h3>
        <Tooltip content={`Market trend analysis based on current conditions`}>
          <span className={`font-semibold ${getTrendColor(trend)} transition-colors duration-300`}>
            {trend.charAt(0).toUpperCase() + trend.slice(1)} Trend
          </span>
        </Tooltip>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Confidence Level</p>
        <div 
          className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(confidence * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{Math.round(confidence * 100)}%</p>
      </div>
      <ExpandableSection
        title="Key Factors"
        defaultExpanded={false}
        className="mt-4"
      >
        <ul className="space-y-2">
          {factors.map((factor, index) => (
            <motion.li 
              key={index} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-sm text-gray-600 flex items-center group/item hover:text-blue-600 transition-colors duration-200"
            >
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 group-hover/item:bg-blue-400 transition-colors duration-200"></span>
              {factor}
            </motion.li>
          ))}
        </ul>
      </ExpandableSection>
    </div>
  );
};

/**
 * Displays an issue card with severity level and details
 * @component
 * @param {Object} props - Component props
 * @param {'high' | 'medium' | 'low'} props.severity - The issue severity level
 * @param {string} props.description - The issue description
 * @param {string} props.impact - The impact of the issue
 * @param {string} props.resolution - Recommended resolution steps
 * @returns {JSX.Element} The rendered issue card component
 */
const IssueCard: React.FC<{
  severity: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  resolution: string;
}> = ({ severity, description, impact, resolution }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow p-4 transition-all duration-300 hover:shadow-lg group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium group-hover:text-blue-600 transition-colors duration-200">{description}</h3>
        <Tooltip content={`Severity level: ${severity}`}>
          <span className={`px-2 py-1 rounded-full text-sm ${getSeverityColor(severity)} transition-colors duration-200`}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority
          </span>
        </Tooltip>
      </div>
      <ExpandableSection
        title="Details"
        defaultExpanded={false}
        className="mt-2"
      >
        <div className="space-y-2">
          <div className="group/item">
            <p className="text-sm font-medium text-gray-700 group-hover/item:text-blue-600 transition-colors duration-200">Impact</p>
            <p className="text-sm text-gray-600">{impact}</p>
          </div>
          <div className="group/item">
            <p className="text-sm font-medium text-gray-700 group-hover/item:text-blue-600 transition-colors duration-200">Recommended Resolution</p>
            <p className="text-sm text-gray-600">{resolution}</p>
          </div>
        </div>
      </ExpandableSection>
    </motion.div>
  );
};

/**
 * Loading skeleton component for the AI analysis
 * @component
 * @returns {JSX.Element} The rendered loading skeleton
 */
const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded"></div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="h-6 w-40 bg-gray-200 rounded"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <div className="h-6 w-40 bg-gray-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Main AI Analysis component that displays comprehensive analysis results
 * @component
 * @example
 * ```tsx
 * <AIAnalysis assetId="asset-123" />
 * ```
 * @param {AIAnalysisProps} props - The component props
 * @returns {JSX.Element} The rendered AI analysis component
 */
export const AIAnalysis: React.FC<AIAnalysisProps> = ({ assetId }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Validate assetId
        assetIdSchema.parse(assetId);

        setLoading(true);
        setError(null);
        const result = await portugueseMarketService.getAIAnalysis(assetId);
        setAnalysis(result);
      } catch (err) {
        const errorState: ErrorState = {
          message: err instanceof Error ? err.message : 'Failed to fetch AI analysis',
          code: err instanceof Error && 'code' in err ? (err as any).code : undefined,
          details: err instanceof Error ? err.stack : undefined,
        };
        setError(errorState);
        captureError(err instanceof Error ? err : new Error(errorState.message));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [assetId]);

  if (loading) {
    return (
      <div 
        className="p-8"
        role="status"
        aria-label="Loading AI analysis"
      >
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-4 bg-red-50 text-red-700 rounded-lg"
        role="alert"
        aria-live="polite"
      >
        <h3 className="font-semibold mb-2">Error Loading AI Analysis</h3>
        <p>{error.message}</p>
        {error.code && <p className="text-sm mt-1">Error Code: {error.code}</p>}
        {error.details && (
          <details className="mt-2 text-sm">
            <summary>Technical Details</summary>
            <pre className="mt-1 whitespace-pre-wrap">{error.details}</pre>
          </details>
        )}
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      role="region"
      aria-label="AI Analysis Results"
    >
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">AI-Powered Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RiskScore score={analysis.riskScore} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MarketInsight
              trend={analysis.marketInsights.trend}
              confidence={analysis.marketInsights.confidence}
              factors={analysis.marketInsights.factors}
            />
          </motion.div>
        </div>

        <ExpandableSection
          title="Recommendations"
          defaultExpanded={true}
          className="mt-6"
        >
          <motion.ul 
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {analysis.recommendations.map((recommendation, index) => (
              <motion.li 
                key={index} 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="flex items-start group"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 group-hover:bg-blue-400 transition-colors duration-200"></span>
                <span className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200">{recommendation}</span>
              </motion.li>
            ))}
          </motion.ul>
        </ExpandableSection>

        <ExpandableSection
          title="Identified Issues"
          defaultExpanded={true}
          className="mt-6"
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {analysis.issues.map((issue, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <IssueCard
                  severity={issue.severity}
                  description={issue.description}
                  impact={issue.impact}
                  resolution={issue.resolution}
                />
              </motion.div>
            ))}
          </motion.div>
        </ExpandableSection>
      </div>
    </motion.div>
  );
}; 