import axios from 'axios';
import { MarketData, EconomicIndicators } from '../types/analysis';

export class MarketDataService {
  private static readonly API_KEYS = {
    zillow: process.env.ZILLOW_API_KEY,
    fred: process.env.FRED_API_KEY,
    census: process.env.CENSUS_API_KEY
  };

  private static readonly BASE_URLS = {
    zillow: 'https://api.zillow.com/v1',
    fred: 'https://api.stlouisfed.org/fred',
    census: 'https://api.census.gov/data'
  };

  static async getMarketData(zipCode: string): Promise<MarketData> {
    try {
      const [zillowData, fredData, censusData] = await Promise.all([
        this.getZillowData(zipCode),
        this.getFredData(),
        this.getCensusData(zipCode)
      ]);

      return {
        priceHistory: zillowData.priceHistory,
        demandSupplyRatio: this.calculateDemandSupplyRatio(zillowData, censusData),
        economicIndicators: {
          gdpGrowth: fredData.gdpGrowth,
          unemploymentRate: fredData.unemploymentRate,
          inflationRate: fredData.inflationRate,
          interestRate: fredData.interestRate
        }
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw new Error('Failed to fetch market data');
    }
  }

  private static async getZillowData(zipCode: string) {
    const response = await axios.get(`${this.BASE_URLS.zillow}/GetRegionChildren`, {
      params: {
        'zws-id': this.API_KEYS.zillow,
        regionId: zipCode,
        childtype: 'zip'
      }
    });

    return {
      priceHistory: response.data.priceHistory,
      medianPrice: response.data.medianPrice,
      inventory: response.data.inventory
    };
  }

  private static async getFredData() {
    const response = await axios.get(`${this.BASE_URLS.fred}/series/observations`, {
      params: {
        api_key: this.API_KEYS.fred,
        series_id: ['GDP', 'UNRATE', 'CPIAUCSL', 'DFF']
      }
    });

    return {
      gdpGrowth: this.calculateGDPGrowth(response.data.GDP),
      unemploymentRate: this.calculateUnemploymentRate(response.data.UNRATE),
      inflationRate: this.calculateInflationRate(response.data.CPIAUCSL),
      interestRate: this.calculateInterestRate(response.data.DFF)
    };
  }

  private static async getCensusData(zipCode: string) {
    const response = await axios.get(`${this.BASE_URLS.census}/acs/acs5`, {
      params: {
        key: this.API_KEYS.census,
        get: ['B25001_001E', 'B25002_002E', 'B25002_003E'],
        for: `zip code tabulation area:${zipCode}`
      }
    });

    return {
      totalHousingUnits: response.data[0][0],
      occupiedUnits: response.data[0][1],
      vacantUnits: response.data[0][2]
    };
  }

  private static calculateDemandSupplyRatio(zillowData: any, censusData: any): number {
    const demand = censusData.occupiedUnits;
    const supply = censusData.vacantUnits + zillowData.inventory;
    return demand / supply;
  }

  private static calculateGDPGrowth(gdpData: any[]): number {
    const recentGDP = gdpData[gdpData.length - 1];
    const previousGDP = gdpData[gdpData.length - 2];
    return ((recentGDP - previousGDP) / previousGDP) * 100;
  }

  private static calculateUnemploymentRate(unemploymentData: any[]): number {
    return unemploymentData[unemploymentData.length - 1];
  }

  private static calculateInflationRate(inflationData: any[]): number {
    const recentCPI = inflationData[inflationData.length - 1];
    const previousCPI = inflationData[inflationData.length - 2];
    return ((recentCPI - previousCPI) / previousCPI) * 100;
  }

  private static calculateInterestRate(interestData: any[]): number {
    return interestData[interestData.length - 1];
  }
} 