'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * TanStack Query Provider for Next.js App Router
 * 
 * Best practices:
 * - Create a new QueryClient instance for each request in SSR
 * - Use 'use client' directive since QueryClientProvider is a context provider
 * - Enable React Query Devtools for development debugging
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable refetchOnWindowFocus in development to avoid annoying reloads
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Stale time of 1 minute for better performance
            staleTime: 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools should only run in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
