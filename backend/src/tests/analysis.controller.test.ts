import { Request, Response } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';
import { PropertyData } from '../types/analysis';

describe('AnalysisController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('analyzeProperty', () => {
    it('should return analysis data when property data is valid', async () => {
      const validPropertyData: PropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      mockReq.body = validPropertyData;

      await AnalysisController.analyzeProperty(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object)
      });
    });

    it('should handle errors gracefully', async () => {
      mockReq.body = null;

      await AnalysisController.analyzeProperty(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to analyze property'
      });
    });
  });

  describe('getRiskScore', () => {
    it('should return risk score when property data is valid', async () => {
      const validPropertyData: PropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      mockReq.body = validPropertyData;

      await AnalysisController.getRiskScore(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object)
      });
    });

    it('should handle errors gracefully', async () => {
      mockReq.body = null;

      await AnalysisController.getRiskScore(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to calculate risk score'
      });
    });
  });

  describe('getIssues', () => {
    it('should return issues when property data is valid', async () => {
      const validPropertyData: PropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      mockReq.body = validPropertyData;

      await AnalysisController.getIssues(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array)
      });
    });

    it('should handle errors gracefully', async () => {
      mockReq.body = null;

      await AnalysisController.getIssues(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to identify issues'
      });
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations when property data is valid', async () => {
      const validPropertyData: PropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      mockReq.body = validPropertyData;

      await AnalysisController.getRecommendations(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array)
      });
    });

    it('should handle errors gracefully', async () => {
      mockReq.body = null;

      await AnalysisController.getRecommendations(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to generate recommendations'
      });
    });
  });
}); 