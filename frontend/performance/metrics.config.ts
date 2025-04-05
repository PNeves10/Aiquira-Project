export const PerformanceThresholds = {
  // Initial Load Performance
  initialLoad: {
    totalLoadTime: 2000, // 2 seconds
    firstContentfulPaint: 1000, // 1 second
    largestContentfulPaint: 1500, // 1.5 seconds
    timeToInteractive: 1800, // 1.8 seconds
  },

  // Component Load Performance
  componentLoad: {
    riskScore: 500, // 500ms
    marketInsights: 800, // 800ms
    recommendations: 1000, // 1 second
    issues: 1200, // 1.2 seconds
  },

  // Animation Performance
  animations: {
    fadeIn: 300, // 300ms
    slideIn: 400, // 400ms
    scale: 200, // 200ms
    transition: 250, // 250ms
  },

  // User Interaction Performance
  interactions: {
    buttonClick: 100, // 100ms
    inputChange: 50, // 50ms
    hover: 50, // 50ms
    scroll: 16, // 16ms (60fps)
  },

  // Data Operations
  dataOperations: {
    smallDataset: 1000, // 1 second
    mediumDataset: 2000, // 2 seconds
    largeDataset: 3000, // 3 seconds
    concurrentRequests: 4000, // 4 seconds
  },

  // Memory Usage
  memory: {
    initialHeap: 50 * 1024 * 1024, // 50MB
    maxHeap: 200 * 1024 * 1024, // 200MB
    garbageCollection: 100, // 100ms
  },

  // Network Performance
  network: {
    requestTimeout: 5000, // 5 seconds
    retryDelay: 1000, // 1 second
    maxRetries: 3,
  },
};

export const AccessibilityThresholds = {
  // WCAG 2.1 Level AA Compliance
  wcag: {
    contrastRatio: 4.5, // Minimum contrast ratio for normal text
    largeTextContrast: 3, // Minimum contrast ratio for large text
    touchTargetSize: 44, // Minimum touch target size in pixels
    textSpacing: 1.5, // Line height
    focusVisible: true, // Focus must be visible
  },

  // Screen Reader Compatibility
  screenReader: {
    ariaLabels: true,
    headingStructure: true,
    formLabels: true,
    errorAnnouncements: true,
  },

  // Keyboard Navigation
  keyboard: {
    tabOrder: true,
    focusTrapping: true,
    skipLinks: true,
    shortcutKeys: true,
  },
};

export const TestEnvironments = {
  development: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001/api',
    timeout: 30000,
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    apiUrl: 'https://staging-api.example.com',
    timeout: 30000,
  },
  production: {
    baseUrl: 'https://example.com',
    apiUrl: 'https://api.example.com',
    timeout: 30000,
  },
}; 