import winston from 'winston';
import { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request } from 'express';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Create the format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports to use based on environment
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // Error log file transport
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  
  // Combined log file transport
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: logFormat,
  transports,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Request logging middleware
export const logRequest = (req: Request) => {
  const { method, url, ip, userAgent } = req;
  const userId = req.user?.id || 'anonymous';
  
  logger.info(`Request: ${method} ${url}`, {
    ip,
    userAgent,
    userId,
    query: req.query,
    body: req.body,
  });
};

// Error logging function
export const logError = (error: Error, req?: Request) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
    }),
  };
  
  logger.error('Error occurred:', errorInfo);
};

// Performance logging function
export const logPerformance = (operation: string, duration: number, req?: Request) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...(req && {
      method: req.method,
      url: req.url,
      userId: req.user?.id || 'anonymous',
    }),
  });
};

// User analytics logging function
export const logUserAnalytics = (event: string, data: any, req?: Request) => {
  logger.info(`User Analytics: ${event}`, {
    event,
    data,
    ...(req && {
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      userAgent: req.userAgent,
    }),
  });
};

export default logger; 