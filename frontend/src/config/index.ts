export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 30000,
  },
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 100,
  },
  assets: {
    supportedTypes: ['business', 'property', 'technology'],
    supportedStatuses: ['available', 'under_offer', 'sold'],
    priceRange: {
      min: 0,
      max: 1000000000,
    },
  },
  ai: {
    analysisConfidenceThreshold: 0.7,
    maxDocumentSize: 10 * 1024 * 1024, // 10MB
    supportedDocumentTypes: ['pdf', 'docx', 'txt'],
  },
  auth: {
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const; 