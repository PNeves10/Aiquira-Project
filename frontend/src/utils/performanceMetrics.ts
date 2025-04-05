import { PerformanceThresholds } from '../../performance/metrics.config';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  threshold: number;
  status: 'pass' | 'fail';
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageResponseTime: number;
    memoryUsage: number;
  };
}

class PerformanceMetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private startTime: number = 0;
  private memoryUsage: number = 0;

  constructor() {
    this.startTime = performance.now();
    this.memoryUsage = (window.performance as any).memory?.usedJSHeapSize || 0;
  }

  measureComponentLoad(componentName: string, loadTime: number): void {
    const threshold = PerformanceThresholds.componentLoad[componentName as keyof typeof PerformanceThresholds.componentLoad];
    this.addMetric({
      name: `component-load-${componentName}`,
      value: loadTime,
      timestamp: performance.now(),
      threshold,
      status: loadTime <= threshold ? 'pass' : 'fail',
    });
  }

  measureAnimation(animationName: string, duration: number): void {
    const threshold = PerformanceThresholds.animations[animationName as keyof typeof PerformanceThresholds.animations];
    this.addMetric({
      name: `animation-${animationName}`,
      value: duration,
      timestamp: performance.now(),
      threshold,
      status: duration <= threshold ? 'pass' : 'fail',
    });
  }

  measureUserInteraction(interactionName: string, duration: number): void {
    const threshold = PerformanceThresholds.interactions[interactionName as keyof typeof PerformanceThresholds.interactions];
    this.addMetric({
      name: `interaction-${interactionName}`,
      value: duration,
      timestamp: performance.now(),
      threshold,
      status: duration <= threshold ? 'pass' : 'fail',
    });
  }

  measureDataOperation(operationName: string, duration: number, dataSize: number): void {
    let threshold: number;
    if (dataSize < 1000) {
      threshold = PerformanceThresholds.dataOperations.smallDataset;
    } else if (dataSize < 5000) {
      threshold = PerformanceThresholds.dataOperations.mediumDataset;
    } else {
      threshold = PerformanceThresholds.dataOperations.largeDataset;
    }

    this.addMetric({
      name: `data-operation-${operationName}`,
      value: duration,
      timestamp: performance.now(),
      threshold,
      status: duration <= threshold ? 'pass' : 'fail',
    });
  }

  measureMemoryUsage(): void {
    const currentMemory = (window.performance as any).memory?.usedJSHeapSize || 0;
    const memoryDiff = currentMemory - this.memoryUsage;
    const threshold = PerformanceThresholds.memory.maxHeap;

    this.addMetric({
      name: 'memory-usage',
      value: memoryDiff,
      timestamp: performance.now(),
      threshold,
      status: memoryDiff <= threshold ? 'pass' : 'fail',
    });

    this.memoryUsage = currentMemory;
  }

  measureNetworkRequest(url: string, duration: number): void {
    const threshold = PerformanceThresholds.network.requestTimeout;
    this.addMetric({
      name: `network-request-${url}`,
      value: duration,
      timestamp: performance.now(),
      threshold,
      status: duration <= threshold ? 'pass' : 'fail',
    });
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
  }

  generateReport(): PerformanceReport {
    const totalTests = this.metrics.length;
    const passedTests = this.metrics.filter(m => m.status === 'pass').length;
    const failedTests = totalTests - passedTests;
    const averageResponseTime = this.metrics.reduce((acc, m) => acc + m.value, 0) / totalTests;

    return {
      metrics: this.metrics,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        averageResponseTime,
        memoryUsage: this.memoryUsage,
      },
    };
  }

  clear(): void {
    this.metrics = [];
    this.startTime = performance.now();
    this.memoryUsage = (window.performance as any).memory?.usedJSHeapSize || 0;
  }
}

export const performanceCollector = new PerformanceMetricsCollector();

// Performance monitoring hooks
export const usePerformanceMonitoring = (componentName: string) => {
  const startTime = performance.now();

  return {
    measureLoad: () => {
      const loadTime = performance.now() - startTime;
      performanceCollector.measureComponentLoad(componentName, loadTime);
    },
    measureAnimation: (animationName: string, duration: number) => {
      performanceCollector.measureAnimation(animationName, duration);
    },
    measureInteraction: (interactionName: string, duration: number) => {
      performanceCollector.measureUserInteraction(interactionName, duration);
    },
    measureDataOperation: (operationName: string, duration: number, dataSize: number) => {
      performanceCollector.measureDataOperation(operationName, duration, dataSize);
    },
  };
};

// Performance monitoring decorator
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const startTime = performance.now();
    const result = originalMethod.apply(this, args);
    const duration = performance.now() - startTime;

    if (result instanceof Promise) {
      return result.then(value => {
        performanceCollector.measureDataOperation(propertyKey, duration, args.length);
        return value;
      });
    }

    performanceCollector.measureDataOperation(propertyKey, duration, args.length);
    return result;
  };

  return descriptor;
} 