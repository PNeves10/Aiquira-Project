import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pgPool } from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const userExists = await pgPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pgPool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Store refresh token
    await pgPool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [user.id, refreshToken]
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pgPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Store refresh token
    await pgPool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [user.id, refreshToken]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    // Remove refresh token
    await pgPool.query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [token]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<{}, {}, RefreshTokenBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };

    // Check if token exists in database
    const result = await pgPool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Get user
    const userResult = await pgPool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    const user = userResult.rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401));
      return;
    }
    next(error);
  }
}; 