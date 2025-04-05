import { config } from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
config({ path: path.resolve(process.cwd(), envFile) });

interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  sentry: {
    dsn: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  frontend: {
    apiUrl: string;
    sentryDsn: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  logging: {
    level: string;
    filePath: string;
  };
  security: {
    corsOrigin: string;
    enableRateLimit: boolean;
    enableSecurityHeaders: boolean;
  };
}

const configuration: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-quira',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  frontend: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    sentryDsn: process.env.REACT_APP_SENTRY_DSN || '',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
  },
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    enableSecurityHeaders: process.env.ENABLE_SECURITY_HEADERS === 'true',
  },
};

// Validate required configuration
const validateConfig = () => {
  const requiredFields = [
    'mongodb.uri',
    'jwt.secret',
    'sentry.dsn',
    'aws.accessKeyId',
    'aws.secretAccessKey',
  ];

  const missingFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], configuration);
    return !value;
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
  }
};

validateConfig();

export default configuration; 