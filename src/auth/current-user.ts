import { useQuery, type QueryClient } from '@tanstack/react-query';
import { useBackend } from '../api/backend-context';

export const currentUserQueryKey = ['me'] as const;

/** The signed-in user, or `null` for a guest. */
export function useCurrentUser() {
  const { auth } = useBackend();
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => auth.currentUser(),
    staleTime: Infinity,
  });
}

/**
 * Forgets every data of the previous user, so the guards show the sign-in page. The query of the
 * user stays, because mounted components observe it, and only its value becomes `null`.
 */
export function setSignedOut(queryClient: QueryClient): void {
  queryClient.setQueryData(currentUserQueryKey, null);
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== currentUserQueryKey[0],
  });
}
