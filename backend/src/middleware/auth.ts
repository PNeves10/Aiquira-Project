import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { User } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify JWT token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    req.token = token;

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Check if token is expired
    if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
      throw new AppError('Token expired', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('User not authorized', 403));
    }

    next();
  };
};

// Check if user is accessing their own data
export const checkOwnership = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const resourceId = req.params.id || req.body.userId;
  if (req.user.id !== resourceId && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this resource', 403));
  }

  next();
};

// Refresh token middleware
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: string };
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Generate new access token
    const newToken = generateToken(user.id, user.role);
    
    // Update user's token expiration
    user.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    res.json({
      token: newToken,
      refreshToken,
    });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
};

// Logout middleware
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      // Clear user's token expiration
      req.user.tokenExpiresAt = new Date();
      await req.user.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(new AppError('Error logging out', 500));
  }
}; 