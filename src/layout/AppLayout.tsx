import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Text,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink, Outlet } from 'react-router';
import { useBackend } from '../api/backend-context';
import { setSignedOut, useCurrentUser } from '../auth/current-user';
import { FakeBackendBadge } from './FakeBackendBadge';

/** The header with the navigation, and the page below it. */
export function AppLayout() {
  const { data: user } = useCurrentUser();
  const { auth } = useBackend();
  const queryClient = useQueryClient();

  // Only the server can revoke the session, because the cookies are HttpOnly. So the user stays
  // signed in until it has answered, and a failure is shown instead of hidden.
  const signOut = useMutation({
    mutationFn: () => auth.logout(),
    onSuccess: () => setSignedOut(queryClient),
  });

  return (
    <Box minH="100vh" bg="bg.subtle">
      <Box as="header" bg="bg" borderBottomWidth="1px">
        <Container>
          <Flex h="14" align="center" justify="space-between" gap="6">
            <HStack gap="3">
              <Link
                asChild
                fontWeight="bold"
                fontSize="lg"
                color="brand.fg"
                textDecoration="none"
              >
                <RouterLink to="/">Chess Platform</RouterLink>
              </Link>
              <FakeBackendBadge />
            </HStack>

            {user && (
              <HStack as="nav" aria-label="Main" gap="5" flex="1">
                <Link asChild>
                  <RouterLink to="/">Lobby</RouterLink>
                </Link>
                <Link asChild>
                  <RouterLink to="/history">History</RouterLink>
                </Link>
              </HStack>
            )}

            {user && (
              <HStack gap="3">
                {signOut.isError && (
                  <Text color="fg.error" fontSize="sm" role="alert">
                    Sign-out failed. Try again.
                  </Text>
                )}
                <Text color="fg.muted">{user.userName}</Text>
                <Button
                  size="sm"
                  variant="outline"
                  loading={signOut.isPending}
                  onClick={() => signOut.mutate()}
                >
                  Sign out
                </Button>
              </HStack>
            )}
          </Flex>
        </Container>
      </Box>

      <Container as="main" py="8">
        <Outlet />
      </Container>
    </Box>
  );
}
