import { useQuery } from '@tanstack/react-query';
import type { CurrentUser } from '../api/types/platform';

/** The key of the signed-in user in the cache of TanStack Query (FE-ADR-5). */
export const currentUserQueryKey = ['me'] as const;

/**
 * Stub of `GET /api/users/me` until the client of the platform-service exists (step 4). It
 * reports that nobody is signed in. The temporary sign-in of the login page writes a user into
 * the cache instead.
 */
async function fetchCurrentUserStub(): Promise<CurrentUser | null> {
  return null;
}

/**
 * The signed-in user, or `null` for a guest. While the first answer is loading, `isPending` is
 * true.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUserStub,
    staleTime: Infinity,
  });
}
