# AI Analysis Component Use Cases

## Overview
This guide provides detailed examples and best practices for specific use cases of the AI Analysis component. Each use case includes implementation details, considerations, and tips for optimal usage.

## Use Cases

### 1. Portfolio Analysis Dashboard

#### Implementation
```tsx
import { AIAnalysis } from './components/AIAnalysis';
import { useState, useEffect } from 'react';

function PortfolioDashboard() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [portfolioAssets, setPortfolioAssets] = useState<string[]>([]);

  useEffect(() => {
    // Fetch portfolio assets
    fetchPortfolioAssets().then(setPortfolioAssets);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <AssetList
          assets={portfolioAssets}
          selectedAsset={selectedAsset}
          onSelect={setSelectedAsset}
        />
      </div>
      <div className="md:col-span-2">
        {selectedAsset && <AIAnalysis assetId={selectedAsset} />}
      </div>
    </div>
  );
}
```

#### Best Practices
- Implement lazy loading for analysis components
- Cache analysis results for frequently viewed assets
- Use batch analysis API for initial portfolio overview
- Implement error boundaries for individual asset analysis

### 2. Real-time Market Monitoring

#### Implementation
```tsx
import { AIAnalysis } from './components/AIAnalysis';
import { useInterval } from './hooks/useInterval';

function MarketMonitor({ assetId }: { assetId: string }) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useInterval(async () => {
    const result = await fetchAnalysis(assetId);
    setAnalysis(result);
    setLastUpdate(new Date());
  }, 5 * 60 * 1000); // Update every 5 minutes

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Market Monitor</h2>
        {lastUpdate && (
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
      <AIAnalysis assetId={assetId} />
    </div>
  );
}
```

#### Best Practices
- Implement rate limiting for API calls
- Show loading indicators during updates
- Cache results to prevent unnecessary API calls
- Handle network errors gracefully

### 3. Risk Assessment Report

#### Implementation
```tsx
import { AIAnalysis } from './components/AIAnalysis';
import { ExportButton } from './components/ExportButton';

function RiskReport({ assetId }: { assetId: string }) {
  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    const response = await fetch(`/api/analysis/${assetId}/export?format=${format}`);
    const blob = await response.blob();
    // Handle file download
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Risk Assessment Report</h2>
        <ExportButton onExport={handleExport} />
      </div>
      <AIAnalysis assetId={assetId} />
    </div>
  );
}
```

#### Best Practices
- Implement export progress indicators
- Handle large report generation
- Cache report data for quick exports
- Support multiple export formats

### 4. Historical Analysis Viewer

#### Implementation
```tsx
import { AIAnalysis } from './components/AIAnalysis';
import { DateRangePicker } from './components/DateRangePicker';

function HistoricalAnalysis({ assetId }: { assetId: string }) {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  const [historicalData, setHistoricalData] = useState<HistoricalAnalysis | null>(null);

  useEffect(() => {
    fetchHistoricalData(assetId, dateRange).then(setHistoricalData);
  }, [assetId, dateRange]);

  return (
    <div>
      <div className="mb-4">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      {historicalData && (
        <HistoricalAnalysisChart data={historicalData} />
      )}
      <AIAnalysis assetId={assetId} />
    </div>
  );
}
```

#### Best Practices
- Implement data pagination for large date ranges
- Cache historical data for quick access
- Show loading states during data fetching
- Handle date range validation

### 5. Batch Analysis Tool

#### Implementation
```tsx
import { AIAnalysis } from './components/AIAnalysis';
import { AssetSelector } from './components/AssetSelector';

function BatchAnalysis() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [analysisOptions, setAnalysisOptions] = useState({
    includeHistoricalData: false,
    analysisDepth: 'basic' as const,
  });

  const handleAnalyze = async () => {
    const response = await fetch('/api/analysis/batch', {
      method: 'POST',
      body: JSON.stringify({
        assetIds: selectedAssets,
        options: analysisOptions,
      }),
    });
    const results = await response.json();
    // Handle batch analysis results
  };

  return (
    <div>
      <AssetSelector
        selected={selectedAssets}
        onChange={setSelectedAssets}
      />
      <AnalysisOptions
        value={analysisOptions}
        onChange={setAnalysisOptions}
      />
      <button
        onClick={handleAnalyze}
        disabled={selectedAssets.length === 0}
      >
        Analyze Selected Assets
      </button>
    </div>
  );
}
```

#### Best Practices
- Implement progress tracking for batch operations
- Handle partial failures gracefully
- Show summary statistics for batch results
- Implement result filtering and sorting

## Performance Optimization

### 1. Caching Strategy
```typescript
const analysisCache = new Map<string, {
  data: AIAnalysisResult;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedAnalysis(assetId: string): AIAnalysisResult | null {
  const cached = analysisCache.get(assetId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}
```

### 2. Lazy Loading
```typescript
const LazyAIAnalysis = React.lazy(() => import('./components/AIAnalysis'));

function PortfolioView() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LazyAIAnalysis assetId={selectedAsset} />
    </Suspense>
  );
}
```

### 3. Debounced Updates
```typescript
function useDebouncedAnalysis(assetId: string, delay: number) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const debouncedFetch = useCallback(
    debounce(async (id: string) => {
      const result = await fetchAnalysis(id);
      setAnalysis(result);
    }, delay),
    []
  );

  useEffect(() => {
    debouncedFetch(assetId);
  }, [assetId, debouncedFetch]);

  return analysis;
}
```

## Error Handling

### 1. Error Boundaries
```typescript
class AnalysisErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 2. Retry Logic
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries reached');
}
```

## Accessibility Considerations

### 1. Keyboard Navigation
```typescript
function AnalysisNavigation() {
  return (
    <div role="navigation" aria-label="Analysis navigation">
      <button
        onClick={() => handlePrevious()}
        aria-label="Previous analysis"
      >
        Previous
      </button>
      <button
        onClick={() => handleNext()}
        aria-label="Next analysis"
      >
        Next
      </button>
    </div>
  );
}
```

### 2. Screen Reader Support
```typescript
function AnalysisSummary({ analysis }: { analysis: AIAnalysisResult }) {
  return (
    <div
      role="region"
      aria-label="Analysis summary"
      aria-live="polite"
    >
      <h2>Risk Score: {analysis.riskScore}</h2>
      <p>Market Trend: {analysis.marketInsights.trend}</p>
      <p>Confidence: {analysis.marketInsights.confidence * 100}%</p>
    </div>
  );
}
```

## Testing

### 1. Component Testing
```typescript
describe('AIAnalysis', () => {
  it('displays loading state', () => {
    render(<AIAnalysis assetId="test-123" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays analysis results', async () => {
    render(<AIAnalysis assetId="test-123" />);
    await waitFor(() => {
      expect(screen.getByText('Risk Score')).toBeInTheDocument();
    });
  });
});
```

### 2. Integration Testing
```typescript
describe('Portfolio Dashboard', () => {
  it('loads and displays multiple assets', async () => {
    render(<PortfolioDashboard />);
    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });
  });
});
```

## Support and Resources

### Documentation
- [API Documentation](./api/openapi.yaml)
- [Component Documentation](./AIAnalysis.md)
- [Storybook Examples](./storybook)

### Tools and Utilities
- [Analysis Cache Manager](./utils/cache.ts)
- [Error Tracking](./utils/error.ts)
- [Performance Monitoring](./utils/performance.ts)

### Community
- [GitHub Issues](https://github.com/aiquira/issues)
- [Discord Community](https://discord.gg/aiquira)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/aiquira) 