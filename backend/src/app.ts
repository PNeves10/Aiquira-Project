import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import morgan from 'morgan';
import { securityHeaders, rateLimitHeaders, cacheControlHeaders, securityErrorHandler } from './middleware/securityHeaders';
import { apiLimiter, authLimiter, analysisLimiter, rateLimitErrorHandler } from './middleware/rateLimiter';
import { sanitizeBody, sanitizeQuery, sanitizeParams, sanitizeFile, sanitizeArray } from './middleware/sanitizer';
import { verifyToken, authorize } from './middleware/auth';
import { performanceMonitor } from './middleware/performance';
import { errorHandler } from './middleware/errorHandler';
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './utils/sentry';
import { stream } from './utils/logger';
import { setupRoutes } from './routes';
import cors from 'cors';
import helmet from 'helmet';
import analysisRoutes from './routes/analysis.routes';

// Load environment variables
config();

// Initialize Sentry
initSentry();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-quira')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Apply security headers
app.use(securityHeaders);
app.use(rateLimitHeaders);
app.use(cacheControlHeaders);

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/analysis/', analysisLimiter);

// Apply input sanitization
app.use(sanitizeBody);
app.use(sanitizeQuery);
app.use(sanitizeParams);
app.use(sanitizeFile);
app.use(sanitizeArray);

// Parse JSON bodies
app.use(express.json());

// Apply monitoring and logging
app.use(morgan('combined', { stream }));
app.use(performanceMonitor);

// Apply Sentry request handler and tracing
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);

// Apply authentication to protected routes
app.use('/api/protected', verifyToken);
app.use('/api/admin', verifyToken, authorize('admin'));

// Setup routes
setupRoutes(app);

// Routes
app.use('/api/analysis', analysisRoutes);

// Error handling
app.use(rateLimitErrorHandler);
app.use(securityErrorHandler);
app.use(sentryErrorHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 