import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';
import { validatePropertyData } from '../middleware/validation';

const router = Router();

// Analysis endpoints
router.post('/analyze', validatePropertyData, AnalysisController.analyzeProperty);
router.post('/risk-score', validatePropertyData, AnalysisController.getRiskScore);
router.post('/issues', validatePropertyData, AnalysisController.getIssues);
router.post('/recommendations', validatePropertyData, AnalysisController.getRecommendations);

export default router; 