import { captureMessage } from './sentry';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export const measurePerformance = () => {
  if (typeof window === 'undefined') return;

  const metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
  };

  // Page Load Time
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    metrics.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
  });

  // First Contentful Paint
  const paint = performance.getEntriesByType('paint');
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
  if (fcp) {
    metrics.firstContentfulPaint = fcp.startTime;
  }

  // Largest Contentful Paint
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    metrics.largestContentfulPaint = lastEntry.startTime;
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.processingStart) continue;
      metrics.firstInputDelay = entry.processingStart - entry.startTime;
      break;
    }
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift
  let cls = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
    metrics.cumulativeLayoutShift = cls;
  }).observe({ entryTypes: ['layout-shift'] });

  // Report metrics to Sentry
  const reportMetrics = () => {
    captureMessage('Performance Metrics', {
      level: 'info',
      extra: metrics,
    });
  };

  // Report after 5 seconds to ensure all metrics are collected
  setTimeout(reportMetrics, 5000);
}; 