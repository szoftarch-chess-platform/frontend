import { QueryClient } from '@tanstack/react-query';

// A failed query is tried again at most this many times.
const MAX_RETRIES = 2;

/**
 * Whether TanStack Query tries a failed query again (FE-ADR-5). An answer from 400 to 499 is
 * final, because the same request would get the same answer. The refresh after a 401 belongs to
 * the HTTP client, not to the retry of the query. Other errors, such as a lost connection, are tried
 * again.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

/** A new client, so the app and every test get a cache of their own. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
