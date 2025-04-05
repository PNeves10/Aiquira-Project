import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/error';

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should handle errors and return 500 status', () => {
    const error = new Error('Test error');

    errorHandler(
      error,
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error'
    });
  });

  it('should log error stack', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const error = new Error('Test error');

    errorHandler(
      error,
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(consoleSpy).toHaveBeenCalledWith(error.stack);
  });
}); 