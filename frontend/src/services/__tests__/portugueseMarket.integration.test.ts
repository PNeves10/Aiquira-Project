import { portugueseMarketService } from '../portugueseMarket';
import { complianceDataSchema, marketRequirementsSchema, aiAnalysisSchema } from '../../schemas/portugueseMarket';

describe('PortugueseMarketService Integration Tests', () => {
  const validAssetId = 'test-asset-123';
  const invalidAssetId = 'invalid@id';

  beforeAll(() => {
    // Ensure we're using the test environment
    process.env.REACT_APP_PORTUGUESE_MARKET_API_URL = 'http://localhost:3001/api';
  });

  describe('getComplianceData', () => {
    it('should fetch and validate compliance data successfully', async () => {
      const data = await portugueseMarketService.getComplianceData(validAssetId);
      expect(complianceDataSchema.safeParse(data).success).toBe(true);
    });

    it('should handle invalid asset ID', async () => {
      await expect(portugueseMarketService.getComplianceData(invalidAssetId))
        .rejects
        .toThrow('Invalid response data format');
    });

    it('should handle network errors', async () => {
      // Temporarily change the API URL to trigger a network error
      process.env.REACT_APP_PORTUGUESE_MARKET_API_URL = 'http://invalid-url';
      
      await expect(portugueseMarketService.getComplianceData(validAssetId))
        .rejects
        .toThrow();

      // Restore the original URL
      process.env.REACT_APP_PORTUGUESE_MARKET_API_URL = 'http://localhost:3001/api';
    });
  });

  describe('getMarketRequirements', () => {
    it('should fetch and validate market requirements successfully', async () => {
      const data = await portugueseMarketService.getMarketRequirements();
      expect(marketRequirementsSchema.safeParse(data).success).toBe(true);
    });

    it('should handle server errors', async () => {
      // Mock a server error response
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(portugueseMarketService.getMarketRequirements())
        .rejects
        .toThrow('API request failed with status 500');

      global.fetch = originalFetch;
    });
  });

  describe('getAIAnalysis', () => {
    it('should fetch and validate AI analysis successfully', async () => {
      const data = await portugueseMarketService.getAIAnalysis(validAssetId);
      expect(aiAnalysisSchema.safeParse(data).success).toBe(true);
    });

    it('should validate risk score range', async () => {
      const data = await portugueseMarketService.getAIAnalysis(validAssetId);
      expect(data.riskScore).toBeGreaterThanOrEqual(0);
      expect(data.riskScore).toBeLessThanOrEqual(100);
    });

    it('should validate market insights confidence', async () => {
      const data = await portugueseMarketService.getAIAnalysis(validAssetId);
      expect(data.marketInsights.confidence).toBeGreaterThanOrEqual(0);
      expect(data.marketInsights.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle timeout errors', async () => {
      // Mock a timeout
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(portugueseMarketService.getAIAnalysis(validAssetId))
        .rejects
        .toThrow();

      global.fetch = originalFetch;
    });
  });

  describe('validateRegistryData', () => {
    it('should validate registry data successfully', async () => {
      const isValid = await portugueseMarketService.validateRegistryData('REG123');
      expect(typeof isValid).toBe('boolean');
    });

    it('should handle invalid registry numbers', async () => {
      await expect(portugueseMarketService.validateRegistryData(''))
        .rejects
        .toThrow();
    });
  });

  describe('getNotaryDocuments', () => {
    it('should fetch notary documents successfully', async () => {
      const documents = await portugueseMarketService.getNotaryDocuments(validAssetId);
      expect(Array.isArray(documents)).toBe(true);
      documents.forEach(doc => {
        expect(doc.documentType).toMatch(/^(escritura|certidão|procuração)$/);
      });
    });
  });

  describe('checkTaxCompliance', () => {
    it('should check tax compliance successfully', async () => {
      const isCompliant = await portugueseMarketService.checkTaxCompliance(validAssetId);
      expect(typeof isCompliant).toBe('boolean');
    });
  });

  describe('getCadastralData', () => {
    it('should fetch cadastral data successfully', async () => {
      const data = await portugueseMarketService.getCadastralData(validAssetId);
      expect(data).toHaveProperty('cadastralNumber');
      expect(data).toHaveProperty('area');
      expect(typeof data.area).toBe('number');
    });
  });

  describe('getEnergyCertificate', () => {
    it('should fetch energy certificate successfully', async () => {
      const certificate = await portugueseMarketService.getEnergyCertificate(validAssetId);
      expect(certificate.energyClass).toMatch(/^[A-F][+]?$/);
      expect(certificate.energyEfficiency).toBeGreaterThanOrEqual(0);
      expect(certificate.energyEfficiency).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateIMT', () => {
    it('should calculate IMT successfully', async () => {
      const imt = await portugueseMarketService.calculateIMT(200000);
      expect(typeof imt).toBe('number');
      expect(imt).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid asset values', async () => {
      await expect(portugueseMarketService.calculateIMT(-1000))
        .rejects
        .toThrow();
    });
  });
}); 