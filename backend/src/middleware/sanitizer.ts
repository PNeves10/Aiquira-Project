import { Request, Response, NextFunction } from 'express';
import xss from 'xss';
import sanitizeHtml from 'sanitize-html';
import { AppError } from './errorHandler';

// XSS sanitization options
const xssOptions = {
  whiteList: {
    a: ['href', 'title', 'target'],
    b: [],
    i: [],
    em: [],
    strong: [],
    p: [],
    br: [],
    ul: [],
    ol: [],
    li: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
};

// Sanitize HTML options
const sanitizeOptions = {
  allowedTags: [
    'a', 'b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
  },
  disallowedTagsMode: 'escape',
};

// Sanitize request body
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // First sanitize HTML
        req.body[key] = sanitizeHtml(req.body[key], sanitizeOptions);
        // Then apply XSS protection
        req.body[key] = xss(req.body[key], xssOptions);
      }
    });
  }
  next();
};

// Sanitize query parameters
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // First sanitize HTML
        req.query[key] = sanitizeHtml(req.query[key] as string, sanitizeOptions);
        // Then apply XSS protection
        req.query[key] = xss(req.query[key] as string, xssOptions);
      }
    });
  }
  next();
};

// Sanitize URL parameters
export const sanitizeParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        // First sanitize HTML
        req.params[key] = sanitizeHtml(req.params[key], sanitizeOptions);
        // Then apply XSS protection
        req.params[key] = xss(req.params[key], xssOptions);
      }
    });
  }
  next();
};

// Validate and sanitize file uploads
export const sanitizeFile = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(new AppError('Invalid file type', 400));
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.file.size > maxSize) {
      return next(new AppError('File too large', 400));
    }

    // Sanitize filename
    req.file.originalname = sanitizeHtml(req.file.originalname, sanitizeOptions);
  }
  next();
};

// Validate and sanitize array inputs
export const sanitizeArray = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && Array.isArray(req.body)) {
    req.body = req.body.map(item => {
      if (typeof item === 'string') {
        return xss(sanitizeHtml(item, sanitizeOptions), xssOptions);
      }
      return item;
    });
  }
  next();
}; 