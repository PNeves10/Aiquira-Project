import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import Dashboard from '../components/Dashboard';
import { RiskScore, MarketTrend, Issue, Recommendation } from '../types/analysis';
import { fetchAnalysisData } from '../services/analysisService';
import '../styles/Dashboard.css';

const DashboardContainer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [marketTrend, setMarketTrend] = useState<MarketTrend | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalysisData();
        
        setRiskScore(data.riskScore);
        setMarketTrend(data.marketTrend);
        setIssues(data.issues);
        setRecommendations(data.recommendations);
      } catch (error) {
        message.error('Failed to load dashboard data');
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!riskScore || !marketTrend) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load dashboard data</h2>
        <p>Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <Dashboard
      riskScore={riskScore}
      marketTrend={marketTrend}
      issues={issues}
      recommendations={recommendations}
    />
  );
};

export default DashboardContainer; 