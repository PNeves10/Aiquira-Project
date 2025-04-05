import React from 'react';
import { Card, Row, Col, Progress, Statistic, Tag, List, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { RiskScore, MarketTrend, Issue, Recommendation } from '../types/analysis';

const { Title, Text } = Typography;

interface DashboardProps {
  riskScore: RiskScore;
  marketTrend: MarketTrend;
  issues: Issue[];
  recommendations: Recommendation[];
}

const Dashboard: React.FC<DashboardProps> = ({
  riskScore,
  marketTrend,
  issues,
  recommendations
}) => {
  const getRiskColor = (score: number) => {
    if (score <= 30) return '#52c41a';
    if (score <= 70) return '#faad14';
    return '#f5222d';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#f5222d';
      case 'medium':
        return '#faad14';
      case 'low':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        {/* Risk Score Card */}
        <Col span={8}>
          <Card title="Risk Score" bordered={false}>
            <Progress
              type="circle"
              percent={riskScore.score}
              strokeColor={getRiskColor(riskScore.score)}
              format={percent => (
                <div style={{ textAlign: 'center' }}>
                  <Title level={3}>{percent}%</Title>
                  <Text type="secondary">{riskScore.level}</Text>
                </div>
              )}
            />
            <div style={{ marginTop: 24 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Location"
                    value={riskScore.factors.location}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Property"
                    value={riskScore.factors.propertyCondition}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Financial"
                    value={riskScore.factors.financial}
                    suffix="%"
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Market Trends Card */}
        <Col span={8}>
          <Card title="Market Trends" bordered={false}>
            <div style={{ marginBottom: 16 }}>
              <Statistic
                title="Market Direction"
                value={marketTrend.direction}
                prefix={marketTrend.direction === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                valueStyle={{ color: marketTrend.direction === 'up' ? '#52c41a' : '#f5222d' }}
              />
            </div>
            <Progress
              percent={marketTrend.confidence * 100}
              format={percent => `${percent}% Confidence`}
            />
            <div style={{ marginTop: 16 }}>
              <Text strong>Economic Indicators:</Text>
              <List
                size="small"
                dataSource={[
                  `GDP Growth: ${marketTrend.factors.economicIndicators.gdpGrowth}%`,
                  `Unemployment: ${marketTrend.factors.economicIndicators.unemploymentRate}%`,
                  `Inflation: ${marketTrend.factors.economicIndicators.inflationRate}%`,
                  `Interest Rate: ${marketTrend.factors.economicIndicators.interestRate}%`
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </div>
          </Card>
        </Col>

        {/* Issues Card */}
        <Col span={8}>
          <Card title="Issues" bordered={false}>
            <List
              dataSource={issues}
              renderItem={issue => (
                <List.Item
                  actions={[
                    <Tag color={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Tag>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<WarningOutlined style={{ color: getSeverityColor(issue.severity) }} />}
                    title={issue.description}
                    description={
                      <div>
                        <Text type="secondary">{issue.impact}</Text>
                        <br />
                        <Text strong>Resolution:</Text> {issue.resolution}
                        {issue.estimatedCost && (
                          <div>
                            <Text strong>Estimated Cost:</Text> ${issue.estimatedCost}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recommendations Card */}
        <Col span={24}>
          <Card title="Recommendations" bordered={false}>
            <List
              dataSource={recommendations}
              renderItem={recommendation => (
                <List.Item
                  actions={[
                    <Tag color={recommendation.priority === 'high' ? '#f5222d' : recommendation.priority === 'medium' ? '#faad14' : '#52c41a'}>
                      {recommendation.priority}
                    </Tag>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    title={recommendation.description}
                    description={
                      <div>
                        <Text strong>Rationale:</Text> {recommendation.rationale}
                        <br />
                        <Text strong>Timeline:</Text> {recommendation.timeline}
                        {recommendation.estimatedCost && (
                          <div>
                            <Text strong>Estimated Cost:</Text> ${recommendation.estimatedCost}
                          </div>
                        )}
                        {recommendation.expectedROI && (
                          <div>
                            <Text strong>Expected ROI:</Text> ${recommendation.expectedROI}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 