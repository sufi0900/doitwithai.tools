// STEP 1: Completely minimal QueryClient (no persistence)
// lib/react-query/queryClient-minimal.js

import { QueryClient } from '@tanstack/react-query';

let browserQueryClient = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
    console.log('✅ NEW QueryClient created:', browserQueryClient);
  }
  
  return browserQueryClient;
}

export const queryClient = getQueryClient();