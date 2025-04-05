import axios from 'axios';
import { ValuationResult, WebsiteMetrics } from '../types/analysis';

export class ValuationService {
  private static readonly GOOGLE_ANALYTICS_API_URL = 'https://analyticsdata.googleapis.com/v1beta/properties';
  private static readonly SEMRUSH_API_URL = 'https://api.semrush.com';

  static async calculateWebsiteValuation(
    googleAnalyticsId: string,
    semrushApiKey: string,
    domain: string
  ): Promise<ValuationResult> {
    try {
      // Fetch metrics from both APIs in parallel
      const [analyticsMetrics, semrushMetrics] = await Promise.all([
        this.fetchGoogleAnalyticsMetrics(googleAnalyticsId),
        this.fetchSEMrushMetrics(semrushApiKey, domain)
      ]);

      // Combine and analyze metrics
      const combinedMetrics = this.combineMetrics(analyticsMetrics, semrushMetrics);
      
      // Calculate valuation
      const valuation = this.calculateValuation(combinedMetrics);

      return {
        domain,
        valuation,
        metrics: combinedMetrics,
        confidence: this.calculateConfidence(combinedMetrics),
        timestamp: new Date(),
        recommendations: this.generateRecommendations(combinedMetrics)
      };
    } catch (error) {
      console.error('Error calculating website valuation:', error);
      throw new Error('Failed to calculate website valuation');
    }
  }

  private static async fetchGoogleAnalyticsMetrics(propertyId: string): Promise<Partial<WebsiteMetrics>> {
    try {
      const response = await axios.get(`${this.GOOGLE_ANALYTICS_API_URL}/${propertyId}:runReport`, {
        params: {
          metrics: [
            'activeUsers',
            'screenPageViews',
            'averageSessionDuration',
            'bounceRate',
            'conversions'
          ],
          dateRanges: {
            startDate: '30daysAgo',
            endDate: 'today'
          }
        }
      });

      return {
        traffic: {
          monthlyVisitors: response.data.rows[0].metricValues[0].value,
          pageViews: response.data.rows[0].metricValues[1].value,
          averageTimeOnSite: response.data.rows[0].metricValues[2].value,
          bounceRate: response.data.rows[0].metricValues[3].value
        },
        conversions: {
          rate: response.data.rows[0].metricValues[4].value,
          value: 0 // This would come from e-commerce data
        }
      };
    } catch (error) {
      console.error('Error fetching Google Analytics metrics:', error);
      throw new Error('Failed to fetch Google Analytics metrics');
    }
  }

  private static async fetchSEMrushMetrics(apiKey: string, domain: string): Promise<Partial<WebsiteMetrics>> {
    try {
      const response = await axios.get(`${this.SEMRUSH_API_URL}/analytics/v1`, {
        params: {
          type: 'domain_ranks',
          key: apiKey,
          domain,
          database: 'us'
        }
      });

      return {
        seo: {
          domainAuthority: response.data.authority,
          backlinks: response.data.backlinks,
          organicKeywords: response.data.keywords,
          rankingKeywords: response.data.ranking_keywords
        },
        competition: {
          score: response.data.competition_level,
          topCompetitors: response.data.competitors
        }
      };
    } catch (error) {
      console.error('Error fetching SEMrush metrics:', error);
      throw new Error('Failed to fetch SEMrush metrics');
    }
  }

  private static combineMetrics(
    analyticsMetrics: Partial<WebsiteMetrics>,
    semrushMetrics: Partial<WebsiteMetrics>
  ): WebsiteMetrics {
    return {
      traffic: analyticsMetrics.traffic || {
        monthlyVisitors: 0,
        pageViews: 0,
        averageTimeOnSite: 0,
        bounceRate: 0
      },
      seo: semrushMetrics.seo || {
        domainAuthority: 0,
        backlinks: 0,
        organicKeywords: 0,
        rankingKeywords: 0
      },
      conversions: analyticsMetrics.conversions || {
        rate: 0,
        value: 0
      },
      competition: semrushMetrics.competition || {
        score: 0,
        topCompetitors: []
      }
    };
  }

  private static calculateValuation(metrics: WebsiteMetrics): number {
    // Base valuation factors
    const trafficValue = metrics.traffic.monthlyVisitors * 2; // $2 per visitor
    const seoValue = metrics.seo.domainAuthority * 1000; // $1000 per authority point
    const conversionValue = metrics.conversions.value * 0.1; // 10% of conversion value
    
    // Competition adjustment
    const competitionFactor = 1 - (metrics.competition.score / 100);
    
    // Calculate final valuation
    const baseValuation = (trafficValue + seoValue + conversionValue) * competitionFactor;
    
    return Math.round(baseValuation);
  }

  private static calculateConfidence(metrics: WebsiteMetrics): number {
    // Calculate confidence based on data completeness and quality
    const factors = [
      metrics.traffic.monthlyVisitors > 0 ? 1 : 0,
      metrics.seo.domainAuthority > 0 ? 1 : 0,
      metrics.conversions.value > 0 ? 1 : 0,
      metrics.competition.score > 0 ? 1 : 0
    ];

    return (factors.reduce((a, b) => a + b, 0) / factors.length) * 100;
  }

  private static generateRecommendations(metrics: WebsiteMetrics): string[] {
    const recommendations: string[] = [];

    // Traffic recommendations
    if (metrics.traffic.monthlyVisitors < 1000) {
      recommendations.push('Consider increasing marketing efforts to drive more traffic');
    }

    // SEO recommendations
    if (metrics.seo.domainAuthority < 30) {
      recommendations.push('Focus on building high-quality backlinks to improve domain authority');
    }

    // Conversion recommendations
    if (metrics.conversions.rate < 2) {
      recommendations.push('Optimize landing pages to improve conversion rates');
    }

    // Competition recommendations
    if (metrics.competition.score > 70) {
      recommendations.push('Develop unique value propositions to stand out from competitors');
    }

    return recommendations;
  }
} 