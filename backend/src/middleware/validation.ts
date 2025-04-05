import { Request, Response, NextFunction } from 'express';
import { PropertyData } from '../types/analysis';

export const validatePropertyData = (req: Request, res: Response, next: NextFunction) => {
  const propertyData: PropertyData = req.body;

  // Check if required fields are present
  if (!propertyData.location || !propertyData.propertyCondition || !propertyData.financial) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  // Validate location data
  if (!propertyData.location.address || !propertyData.location.coordinates) {
    return res.status(400).json({
      success: false,
      error: 'Invalid location data'
    });
  }

  // Validate property condition data
  if (!propertyData.propertyCondition.age || !propertyData.propertyCondition.maintenanceHistory) {
    return res.status(400).json({
      success: false,
      error: 'Invalid property condition data'
    });
  }

  // Validate financial data
  if (!propertyData.financial.marketValue || !propertyData.financial.rentalIncome) {
    return res.status(400).json({
      success: false,
      error: 'Invalid financial data'
    });
  }

  next();
}; 