import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { setupRoutes } from './routes';
import { setupDatabase } from './config/database';
import { setupSwagger } from './config/swagger';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Setup Swagger documentation
setupSwagger(app);

// Setup routes
setupRoutes(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Setup database connections
    await setupDatabase();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 