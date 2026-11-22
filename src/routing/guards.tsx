import { Center, Spinner } from '@chakra-ui/react';
import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '../auth/current-user';

function Loading() {
  return (
    <Center py="16">
      <Spinner size="lg" aria-label="Loading" />
    </Center>
  );
}

/** The pages for signed-in users. A guest goes to the sign-in page. */
export function RequireSignedIn() {
  const { data: user, isPending } = useCurrentUser();
  if (isPending) {
    return <Loading />;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** The pages for guests. A signed-in user goes to the lobby. */
export function RequireGuest() {
  const { data: user, isPending } = useCurrentUser();
  if (isPending) {
    return <Loading />;
  }
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
