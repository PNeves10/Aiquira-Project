import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Create different rate limiters for different endpoints
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:auth:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed login attempts per hour
  message: 'Too many failed login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const analysisLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:analysis:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 analysis requests per hour
  message: 'Analysis limit reached, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter for specific routes
export const createCustomLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:custom:',
    }),
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Error handler for rate limit errors
export const rateLimitErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.status === 429) {
    res.status(429).json({
      error: err.message,
      retryAfter: Math.ceil(err.resetTime / 1000),
    });
    return;
  }
  next(err);
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  handler: (req: Request, res: Response, next: NextFunction) => {
    next(new AppError('Too many requests from this IP, please try again later.', 429));
  },
});

export const rateLimiter = limiter; 