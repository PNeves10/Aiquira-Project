import { Request, Response, NextFunction } from 'express';
import { logPerformance } from '../utils/logger';
import { performance } from 'perf_hooks';

// Performance metrics storage
const metrics = {
  requests: 0,
  errors: 0,
  averageResponseTime: 0,
  totalResponseTime: 0,
  endpoints: new Map<string, { count: number; totalTime: number }>(),
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  
  // Increment request counter
  metrics.requests++;
  
  // Track endpoint usage
  const endpoint = `${req.method} ${req.path}`;
  const endpointMetrics = metrics.endpoints.get(endpoint) || { count: 0, totalTime: 0 };
  endpointMetrics.count++;
  metrics.endpoints.set(endpoint, endpointMetrics);
  
  // Track response time
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    // Update metrics
    metrics.totalResponseTime += duration;
    metrics.averageResponseTime = metrics.totalResponseTime / metrics.requests;
    
    // Update endpoint metrics
    endpointMetrics.totalTime += duration;
    metrics.endpoints.set(endpoint, endpointMetrics);
    
    // Log performance data
    logPerformance(endpoint, duration, req);
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${Math.round(duration)}ms`);
    res.setHeader('X-Request-Count', metrics.requests.toString());
  });
  
  // Track errors
  res.on('error', () => {
    metrics.errors++;
  });
  
  next();
};

// Get performance metrics
export const getPerformanceMetrics = () => {
  const endpointStats = Array.from(metrics.endpoints.entries()).map(([endpoint, stats]) => ({
    endpoint,
    count: stats.count,
    averageTime: stats.totalTime / stats.count,
  }));
  
  return {
    requests: metrics.requests,
    errors: metrics.errors,
    averageResponseTime: metrics.averageResponseTime,
    endpoints: endpointStats,
  };
};

// Reset performance metrics
export const resetPerformanceMetrics = () => {
  metrics.requests = 0;
  metrics.errors = 0;
  metrics.totalResponseTime = 0;
  metrics.averageResponseTime = 0;
  metrics.endpoints.clear();
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  const used = process.memoryUsage();
  const memoryMetrics = {
    heapUsed: used.heapUsed,
    heapTotal: used.heapTotal,
    external: used.external,
    rss: used.rss,
  };
  
  logPerformance('Memory Usage', 0, undefined);
  return memoryMetrics;
};

// CPU usage monitoring
export const monitorCPUUsage = () => {
  const startUsage = process.cpuUsage();
  
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    const cpuMetrics = {
      user: endUsage.user / 1000000, // Convert to milliseconds
      system: endUsage.system / 1000000,
    };
    
    logPerformance('CPU Usage', cpuMetrics.user + cpuMetrics.system, undefined);
    return cpuMetrics;
  }, 100);
}; 