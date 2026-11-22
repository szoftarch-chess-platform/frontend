import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Backend } from '../api/backend';
import { BackendProvider } from '../api/BackendProvider';
import { system } from '../theme';

type AppProvidersProps = {
  backend: Backend;
  queryClient: QueryClient;
  children: ReactNode;
};

/**
 * The providers that every part of the app needs: the theme of Chakra, the backend and the cache
 * of TanStack Query. The router is outside, so the tests can use a memory router instead of the
 * browser history.
 */
export function AppProviders({
  backend,
  queryClient,
  children,
}: AppProvidersProps) {
  return (
    <ChakraProvider value={system}>
      <BackendProvider backend={backend}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BackendProvider>
    </ChakraProvider>
  );
}
