import React from 'react';
import { ValuationResult } from '../../backend/src/types/analysis';

interface ValuationReportProps {
  result: ValuationResult;
}

export const ValuationReport: React.FC<ValuationReportProps> = ({ result }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="valuation-report">
      <div className="valuation-header">
        <h2>Website Valuation Report</h2>
        <p className="timestamp">Generated on: {new Date(result.timestamp).toLocaleString()}</p>
      </div>

      <div className="valuation-summary">
        <div className="valuation-amount">
          <h3>Estimated Value</h3>
          <p className="amount">{formatCurrency(result.valuation)}</p>
          <p className="confidence">Confidence: {result.confidence}%</p>
        </div>
      </div>

      <div className="metrics-section">
        <h3>Traffic Metrics</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Monthly Visitors</span>
            <span className="value">{formatNumber(result.metrics.traffic.monthlyVisitors)}</span>
          </div>
          <div className="metric">
            <span className="label">Page Views</span>
            <span className="value">{formatNumber(result.metrics.traffic.pageViews)}</span>
          </div>
          <div className="metric">
            <span className="label">Avg. Time on Site</span>
            <span className="value">{result.metrics.traffic.averageTimeOnSite}s</span>
          </div>
          <div className="metric">
            <span className="label">Bounce Rate</span>
            <span className="value">{result.metrics.traffic.bounceRate}%</span>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>SEO Metrics</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Domain Authority</span>
            <span className="value">{result.metrics.seo.domainAuthority}/100</span>
          </div>
          <div className="metric">
            <span className="label">Backlinks</span>
            <span className="value">{formatNumber(result.metrics.seo.backlinks)}</span>
          </div>
          <div className="metric">
            <span className="label">Organic Keywords</span>
            <span className="value">{formatNumber(result.metrics.seo.organicKeywords)}</span>
          </div>
          <div className="metric">
            <span className="label">Ranking Keywords</span>
            <span className="value">{formatNumber(result.metrics.seo.rankingKeywords)}</span>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>Conversion Metrics</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Conversion Rate</span>
            <span className="value">{result.metrics.conversions.rate}%</span>
          </div>
          <div className="metric">
            <span className="label">Conversion Value</span>
            <span className="value">{formatCurrency(result.metrics.conversions.value)}</span>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>Competition Analysis</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Competition Score</span>
            <span className="value">{result.metrics.competition.score}/100</span>
          </div>
          <div className="metric">
            <span className="label">Top Competitors</span>
            <ul className="competitors-list">
              {result.metrics.competition.topCompetitors.map((competitor, index) => (
                <li key={index}>{competitor}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="recommendations-section">
        <h3>Recommendations</h3>
        <ul className="recommendations-list">
          {result.recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .valuation-report {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .valuation-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .valuation-header h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .timestamp {
          color: #666;
          font-size: 0.9rem;
        }

        .valuation-summary {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .valuation-amount .amount {
          font-size: 2.5rem;
          font-weight: bold;
          color: #28a745;
          margin: 0.5rem 0;
        }

        .confidence {
          color: #666;
          font-size: 0.9rem;
        }

        .metrics-section {
          margin-bottom: 2rem;
        }

        .metrics-section h3 {
          color: #333;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #eee;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
        }

        .metric .label {
          display: block;
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .metric .value {
          display: block;
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
        }

        .competitors-list,
        .recommendations-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .competitors-list li,
        .recommendations-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .competitors-list li:last-child,
        .recommendations-list li:last-child {
          border-bottom: none;
        }

        .recommendations-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .recommendations-section h3 {
          color: #333;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}; 