import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset, AssetValuation, MatchScore, DueDiligenceReport } from '../types/asset';
import { AIAnalysisService } from '../services/aiAnalysis';
import { captureError } from '../utils/sentry';
import { MarketTrendsChart } from './MarketTrendsChart';
import { MatchingScoreChart } from './MatchingScoreChart';
import { DueDiligenceChart } from './DueDiligenceChart';

interface AIAnalysisDisplayProps {
  asset: Asset;
  type: 'valuation' | 'matching' | 'dueDiligence';
  buyerPreferences?: Record<string, any>;
  documents?: File[];
}

export const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({
  asset,
  type,
  buyerPreferences,
  documents,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AssetValuation | MatchScore | DueDiligenceReport | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const service = AIAnalysisService.getInstance();
      let result;
      switch (type) {
        case 'valuation':
          result = await service.getPredictiveValuation({ asset });
          break;
        case 'matching':
          if (!buyerPreferences) throw new Error('Buyer preferences required for matching');
          result = await service.getMatchingScore({ asset, buyerPreferences });
          break;
        case 'dueDiligence':
          if (!documents) throw new Error('Documents required for due diligence');
          result = await service.getDueDiligenceReport({ asset, documents });
          break;
      }
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
      captureError(err instanceof Error ? err : new Error('Failed to fetch analysis'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalysis();
  }, [asset.id, type, buyerPreferences, documents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchAnalysis}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  const renderValuationContent = () => {
    const valuation = analysis as AssetValuation;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Current Value</h3>
            <p className="text-2xl font-bold text-primary">${valuation.currentValue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Predicted Value</h3>
            <p className="text-2xl font-bold text-primary">${valuation.predictedValue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Confidence: {(valuation.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Market Trends</h3>
          <div className="h-64">
            <MarketTrendsChart
              trends={valuation.marketTrends}
              currentValue={valuation.currentValue}
              predictedValue={valuation.predictedValue}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Key Factors</h3>
          <div className="space-y-4">
            {valuation.factors.map((factor, index) => (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span>{factor.name}</span>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${factor.impact * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMatchingContent = () => {
    const matching = analysis as MatchScore;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Match Score Analysis</h3>
          <div className="h-64">
            <MatchingScoreChart matchScore={matching} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Similar Assets</h3>
          <div className="space-y-4">
            {matching.similarAssets.map((similar, index) => (
              <motion.div
                key={similar.asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{similar.asset.name}</h4>
                  <p className="text-sm text-gray-600">
                    Similarity: {(similar.similarity * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${similar.asset.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{similar.asset.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDueDiligenceContent = () => {
    const report = analysis as DueDiligenceReport;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Due Diligence Assessment</h3>
          <div className="h-64">
            <DueDiligenceChart report={report} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Risk Score</h3>
            <p className="text-2xl font-bold text-red-600">
              {(report.riskScore * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Compliance Score</h3>
            <p className="text-2xl font-bold text-green-600">
              {(report.complianceScore * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Financial Health</h3>
            <p className="text-2xl font-bold text-blue-600">
              {(report.financialHealth.score * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Legal Status</h3>
          <div className="space-y-4">
            {report.legalStatus.issues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${
                  issue.severity === 'high'
                    ? 'bg-red-50 text-red-700'
                    : issue.severity === 'medium'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                <h4 className="font-medium">{issue.type}</h4>
                <p className="text-sm mt-1">{issue.description}</p>
                <p className="text-sm mt-2">Recommendation: {issue.recommendation}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Market Position</h3>
          <div className="space-y-4">
            <p className="text-gray-700">{report.marketPosition.analysis}</p>
            <div className="grid grid-cols-2 gap-4">
              {report.marketPosition.competitors.map((competitor, index) => (
                <motion.div
                  key={competitor.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <h4 className="font-medium">{competitor.name}</h4>
                  <p className="text-sm text-gray-600">
                    Market Share: {(competitor.marketShare * 100).toFixed(1)}%
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-600">Strengths:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {competitor.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">Weaknesses:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {competitor.weaknesses.map((weakness, i) => (
                        <li key={i}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 px-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recommendations
          </button>
        </nav>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {type === 'valuation' && renderValuationContent()}
              {type === 'matching' && renderMatchingContent()}
              {type === 'dueDiligence' && renderDueDiligenceContent()}
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                {type === 'valuation' && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-4">Detailed Factors</h3>
                    <div className="space-y-4">
                      {(analysis as AssetValuation).factors.map((factor, index) => (
                        <div key={factor.name} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{factor.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{factor.explanation}</p>
                          <div className="mt-2 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${factor.impact * 100}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {(factor.impact * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {type === 'matching' && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-4">Matching Factors</h3>
                    <div className="space-y-4">
                      {(analysis as MatchScore).factors.map((factor, index) => (
                        <div key={factor.name} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{factor.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{factor.explanation}</p>
                          <div className="mt-2 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${factor.score * 100}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {(factor.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {type === 'dueDiligence' && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-4">Document Analysis</h3>
                    <div className="space-y-4">
                      {(analysis as DueDiligenceReport).documents.map((doc, index) => (
                        <div
                          key={doc.type}
                          className={`p-4 rounded-lg ${
                            doc.status === 'verified'
                              ? 'bg-green-50 text-green-700'
                              : doc.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          <h4 className="font-medium">{doc.type}</h4>
                          <p className="text-sm mt-1 capitalize">{doc.status}</p>
                          {doc.issues.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Issues:</p>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {doc.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {doc.recommendations.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Recommendations:</p>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {doc.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg ${
                          rec.priority === 'high'
                            ? 'bg-red-50 text-red-700'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium capitalize">{rec.priority} Priority</h4>
                          {type === 'dueDiligence' && (
                            <span className="text-sm text-gray-600">
                              Timeline: {(analysis as DueDiligenceReport).recommendations[index].timeline}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1">{rec.action}</p>
                        <p className="text-sm mt-2">Reason: {rec.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 