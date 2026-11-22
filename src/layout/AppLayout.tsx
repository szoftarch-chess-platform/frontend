import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Text,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router';
import { currentUserQueryKey, useCurrentUser } from '../auth/current-user';

/** The header with the navigation, and the page below it. */
export function AppLayout() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Temporary sign-out until the auth client exists (step 4). It already clears the whole
  // cache, as FE-ADR-5 decides for the real sign-out.
  const signOut = () => {
    queryClient.setQueryData(currentUserQueryKey, null);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== currentUserQueryKey[0],
    });
    navigate('/login', { replace: true });
  };

  return (
    <Box minH="100vh" bg="bg.subtle">
      <Box as="header" bg="bg" borderBottomWidth="1px">
        <Container>
          <Flex h="14" align="center" justify="space-between" gap="6">
            <Link
              asChild
              fontWeight="bold"
              fontSize="lg"
              color="brand.fg"
              textDecoration="none"
            >
              <RouterLink to="/">Chess Platform</RouterLink>
            </Link>

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
                <Text color="fg.muted">{user.userName}</Text>
                <Button size="sm" variant="outline" onClick={signOut}>
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
