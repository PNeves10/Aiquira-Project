import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { measurePerformance } from '@/utils/performance';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    measurePerformance();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <Toaster position="top-right" />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
} 