import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Request } from 'express';
import { logError } from './logger';

// Initialize Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: require('../app') }),
      new Sentry.Integrations.Mongo(),
      new Sentry.Integrations.Postgres(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Set profilesSampleRate to 1.0 to profile all transactions
    // We recommend adjusting this value in production
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
};

// Error tracking middleware
export const sentryErrorHandler = Sentry.Handlers.errorHandler();

// Request handler middleware
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

// Performance monitoring middleware
export const sentryTracingHandler = Sentry.Handlers.tracingHandler();

// Track error with Sentry
export const trackError = (error: Error, req?: Request) => {
  // Log error locally
  logError(error, req);
  
  // Track error in Sentry
  Sentry.withScope((scope) => {
    if (req) {
      scope.setUser({
        id: req.user?.id,
        ip: req.ip,
        userAgent: req.userAgent,
      });
      
      scope.setExtras({
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
      });
    }
    
    Sentry.captureException(error);
  });
};

// Track message with Sentry
export const trackMessage = (message: string, level: Sentry.SeverityLevel = 'info', req?: Request) => {
  Sentry.withScope((scope) => {
    if (req) {
      scope.setUser({
        id: req.user?.id,
        ip: req.ip,
        userAgent: req.userAgent,
      });
      
      scope.setExtras({
        method: req.method,
        url: req.url,
      });
    }
    
    Sentry.captureMessage(message, level);
  });
};

// Start a transaction
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

// Add breadcrumb
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Set user context
export const setUser = (user: Sentry.User) => {
  Sentry.setUser(user);
};

// Set tag
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

// Set extra context
export const setExtra = (key: string, value: any) => {
  Sentry.setExtra(key, value);
};

// Flush events
export const flush = async (timeout?: number) => {
  await Sentry.flush(timeout);
}; 