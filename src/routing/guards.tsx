import { Button, Center, Spinner, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '../auth/current-user';
import { GameConnection } from '../game/GameConnection';

/**
 * The pages for signed-in users, with the socket open on all of them. A guest goes to the sign-in
 * page, which also closes the socket on sign-out.
 */
export function RequireSignedIn() {
  return (
    <WhenUserKnown>
      {(signedIn) =>
        signedIn ? (
          <>
            <GameConnection />
            <Outlet />
          </>
        ) : (
          <Navigate to="/login" replace />
        )
      }
    </WhenUserKnown>
  );
}

/** The pages for guests. A signed-in user goes to the lobby. */
export function RequireGuest() {
  return (
    <WhenUserKnown>
      {(signedIn) => (signedIn ? <Navigate to="/" replace /> : <Outlet />)}
    </WhenUserKnown>
  );
}

/**
 * Renders its children once it is known whether a user is signed in. A failed request is not a
 * sign-out, because the cookies may still be valid, so it offers a retry instead of a redirect.
 */
function WhenUserKnown({
  children,
}: {
  children: (signedIn: boolean) => ReactNode;
}) {
  const {
    data: user,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useCurrentUser();

  if (isPending) {
    return (
      <Center py="16">
        <Spinner size="lg" aria-label="Loading" />
      </Center>
    );
  }
  if (isError) {
    return (
      <Center py="16">
        <Stack align="center" gap="3">
          <Text>Your account could not be loaded.</Text>
          <Button loading={isFetching} onClick={() => refetch()}>
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }
  return children(user !== null);
}
