import { MarketDataService } from '../services/marketDataService';
import axios from 'axios';
import { MarketData } from '../types/analysis';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MarketDataService', () => {
  const mockZipCode = '10001';
  const mockZillowResponse = {
    data: {
      priceHistory: [450000, 460000, 470000, 480000, 500000],
      medianPrice: 500000,
      inventory: 50
    }
  };

  const mockFredResponse = {
    data: {
      GDP: [20000, 21000],
      UNRATE: [4.5],
      CPIAUCSL: [250, 255],
      DFF: [3.5]
    }
  };

  const mockCensusResponse = {
    data: [
      [1000, 800, 200]
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ZILLOW_API_KEY = 'test-zillow-key';
    process.env.FRED_API_KEY = 'test-fred-key';
    process.env.CENSUS_API_KEY = 'test-census-key';
  });

  describe('getMarketData', () => {
    it('fetches and processes market data correctly', async () => {
      mockedAxios.get
        .mockImplementationOnce(() => Promise.resolve(mockZillowResponse))
        .mockImplementationOnce(() => Promise.resolve(mockFredResponse))
        .mockImplementationOnce(() => Promise.resolve(mockCensusResponse));

      const result = await MarketDataService.getMarketData(mockZipCode);

      expect(result).toBeDefined();
      expect(result.priceHistory).toEqual(mockZillowResponse.data.priceHistory);
      expect(result.demandSupplyRatio).toBe(4); // 800 / (200 + 50)
      expect(result.economicIndicators).toEqual({
        gdpGrowth: 5, // ((21000 - 20000) / 20000) * 100
        unemploymentRate: 4.5,
        inflationRate: 2, // ((255 - 250) / 250) * 100
        interestRate: 3.5
      });
    });

    it('handles API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(MarketDataService.getMarketData(mockZipCode))
        .rejects
        .toThrow('Failed to fetch market data');
    });
  });

  describe('getZillowData', () => {
    it('fetches Zillow data correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockZillowResponse);

      const result = await MarketDataService['getZillowData'](mockZipCode);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.zillow.com/v1/GetRegionChildren',
        {
          params: {
            'zws-id': 'test-zillow-key',
            regionId: mockZipCode,
            childtype: 'zip'
          }
        }
      );

      expect(result).toEqual(mockZillowResponse.data);
    });
  });

  describe('getFredData', () => {
    it('fetches FRED data correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockFredResponse);

      const result = await MarketDataService['getFredData']();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.stlouisfed.org/fred/series/observations',
        {
          params: {
            api_key: 'test-fred-key',
            series_id: ['GDP', 'UNRATE', 'CPIAUCSL', 'DFF']
          }
        }
      );

      expect(result).toEqual({
        gdpGrowth: 5,
        unemploymentRate: 4.5,
        inflationRate: 2,
        interestRate: 3.5
      });
    });
  });

  describe('getCensusData', () => {
    it('fetches Census data correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockCensusResponse);

      const result = await MarketDataService['getCensusData'](mockZipCode);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.census.gov/data/acs/acs5',
        {
          params: {
            key: 'test-census-key',
            get: ['B25001_001E', 'B25002_002E', 'B25002_003E'],
            for: `zip code tabulation area:${mockZipCode}`
          }
        }
      );

      expect(result).toEqual({
        totalHousingUnits: 1000,
        occupiedUnits: 800,
        vacantUnits: 200
      });
    });
  });

  describe('calculateDemandSupplyRatio', () => {
    it('calculates demand-supply ratio correctly', () => {
      const zillowData = { inventory: 50 };
      const censusData = { occupiedUnits: 800, vacantUnits: 200 };

      const ratio = MarketDataService['calculateDemandSupplyRatio'](zillowData, censusData);

      expect(ratio).toBe(4); // 800 / (200 + 50)
    });

    it('handles zero supply', () => {
      const zillowData = { inventory: 0 };
      const censusData = { occupiedUnits: 800, vacantUnits: 0 };

      const ratio = MarketDataService['calculateDemandSupplyRatio'](zillowData, censusData);

      expect(ratio).toBe(Infinity);
    });
  });

  describe('calculateGDPGrowth', () => {
    it('calculates GDP growth correctly', () => {
      const gdpData = [20000, 21000];
      const growth = MarketDataService['calculateGDPGrowth'](gdpData);

      expect(growth).toBe(5); // ((21000 - 20000) / 20000) * 100
    });

    it('handles negative growth', () => {
      const gdpData = [21000, 20000];
      const growth = MarketDataService['calculateGDPGrowth'](gdpData);

      expect(growth).toBe(-4.76); // ((20000 - 21000) / 21000) * 100
    });
  });

  describe('calculateInflationRate', () => {
    it('calculates inflation rate correctly', () => {
      const cpiData = [250, 255];
      const inflation = MarketDataService['calculateInflationRate'](cpiData);

      expect(inflation).toBe(2); // ((255 - 250) / 250) * 100
    });

    it('handles deflation', () => {
      const cpiData = [255, 250];
      const inflation = MarketDataService['calculateInflationRate'](cpiData);

      expect(inflation).toBe(-1.96); // ((250 - 255) / 255) * 100
    });
  });
}); 