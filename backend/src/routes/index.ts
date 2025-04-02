import { Express } from 'express';
import authRoutes from './auth.routes';
import assetRoutes from './asset.routes';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import aiRoutes from './ai.routes';

export const setupRoutes = (app: Express) => {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/ai', aiRoutes);
}; 