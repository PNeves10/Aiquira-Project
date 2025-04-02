import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  handler: (req: Request, res: Response, next: NextFunction) => {
    next(new AppError('Too many requests from this IP, please try again later.', 429));
  },
});

export const rateLimiter = limiter; 