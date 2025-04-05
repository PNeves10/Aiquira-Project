import { Request, Response } from 'express';
import { AnalysisService } from '../services/analysis';
import { PropertyData } from '../types/analysis';

export class AnalysisController {
  static async analyzeProperty(req: Request, res: Response) {
    try {
      const propertyData: PropertyData = req.body;
      
      const analysis = AnalysisService.analyzeProperty(propertyData);
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing property:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze property'
      });
    }
  }

  static async getRiskScore(req: Request, res: Response) {
    try {
      const propertyData: PropertyData = req.body;
      
      const riskScore = AnalysisService.analyzeProperty(propertyData).riskScore;
      
      res.json({
        success: true,
        data: riskScore
      });
    } catch (error) {
      console.error('Error calculating risk score:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate risk score'
      });
    }
  }

  static async getIssues(req: Request, res: Response) {
    try {
      const propertyData: PropertyData = req.body;
      
      const issues = AnalysisService.analyzeProperty(propertyData).issues;
      
      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      console.error('Error identifying issues:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to identify issues'
      });
    }
  }

  static async getRecommendations(req: Request, res: Response) {
    try {
      const propertyData: PropertyData = req.body;
      
      const recommendations = AnalysisService.analyzeProperty(propertyData).recommendations;
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations'
      });
    }
  }
} 