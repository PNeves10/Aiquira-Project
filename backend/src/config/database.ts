import { Pool } from 'pg';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// MongoDB connection
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new AppError('Failed to connect to MongoDB', 500);
  }
};

// Test PostgreSQL connection
const testPostgresConnection = async () => {
  try {
    const client = await pgPool.connect();
    console.log('PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw new AppError('Failed to connect to PostgreSQL', 500);
  }
};

export const setupDatabase = async () => {
  try {
    await Promise.all([
      testPostgresConnection(),
      connectMongoDB(),
    ]);
    console.log('All database connections established successfully');
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
};

export { pgPool }; 