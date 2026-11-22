import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { system } from '../theme';

type AppProvidersProps = {
  queryClient: QueryClient;
  children: ReactNode;
};

/**
 * The providers that every part of the app needs: the theme of Chakra (FE-ADR-7) and the cache of
 * TanStack Query (FE-ADR-5). The router is outside, so the tests can use a memory router instead
 * of the browser history.
 */
export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ChakraProvider>
  );
}
