import { Request, Response, NextFunction } from 'express';
import { validatePropertyData } from '../middleware/validation';
import { PropertyData } from '../types/analysis';

describe('validatePropertyData', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should call next() when property data is valid', () => {
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

    validatePropertyData(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should return 400 when location data is missing', () => {
    const invalidPropertyData = {
      propertyCondition: {
        age: 10,
        maintenanceHistory: []
      },
      financial: {
        marketValue: 500000,
        rentalIncome: 3000
      }
    };

    mockReq.body = invalidPropertyData;

    validatePropertyData(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Missing required fields'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when property condition data is missing', () => {
    const invalidPropertyData = {
      location: {
        address: '123 Main St',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      },
      financial: {
        marketValue: 500000,
        rentalIncome: 3000
      }
    };

    mockReq.body = invalidPropertyData;

    validatePropertyData(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Missing required fields'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 when financial data is missing', () => {
    const invalidPropertyData = {
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
      }
    };

    mockReq.body = invalidPropertyData;

    validatePropertyData(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Missing required fields'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 