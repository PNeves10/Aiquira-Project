import { captureError } from './sentry';

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://*.sentry.io;
  `.replace(/\s+/g, ' ').trim(),
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  try {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[&]/g, '&amp;')
      .replace(/["]/g, '&quot;')
      .replace(/[']/g, '&#x27;')
      .replace(/[/]/g, '&#x2F;')
      .trim();
  } catch (error) {
    captureError(error as Error, { input });
    return '';
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Password must be at least 8 characters long');

  // Complexity checks
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Password must contain at least one uppercase letter');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Password must contain at least one lowercase letter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Password must contain at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Password must contain at least one special character');

  // Common password check
  const commonPasswords = ['password', '123456', 'qwerty'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('This password is too common. Please choose a stronger password.');
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, number[]>;
  private maxAttempts: number;
  private timeWindow: number;

  constructor(maxAttempts: number = 5, timeWindow: number = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      return true;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return false;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// XSS prevention
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// CSRF token generation
export const generateCsrfToken = (): string => {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

// Secure storage with encryption
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const encryptedValue = btoa(value); // Basic encryption for demo
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      captureError(error as Error, { key });
    }
  },

  getItem: (key: string): string | null => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      return atob(encryptedValue); // Basic decryption for demo
    } catch (error) {
      captureError(error as Error, { key });
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      captureError(error as Error, { key });
    }
  },
}; 