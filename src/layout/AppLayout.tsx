import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Link,
  Text,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { NavLink, Link as RouterLink, Outlet } from 'react-router';
import { useBackend } from '../api/backend-context';
import { setSignedOut, useCurrentUser } from '../auth/current-user';
import { FakeBackendBadge } from './FakeBackendBadge';
import { ThemeSwitch } from './ThemeSwitch';

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
    <Box minH="100vh" bg="bg.subtle" overflowX="clip">
      <Box as="header" bg="bg" borderBottomWidth="1px">
        <Container>
          <Flex h="16" align="center" gap={{ base: '2', sm: '4', md: '6' }}>
            <HStack gap={{ base: '2', sm: '3' }}>
              <Link
                asChild
                display="flex"
                alignItems="center"
                gap="2.5"
                fontWeight="bold"
                fontSize="lg"
                letterSpacing="tight"
                textDecoration="none"
                _hover={{ textDecoration: 'none' }}
              >
                <RouterLink to="/" aria-label="Chess7ed">
                  <Image src="/logo.png" alt="" boxSize="8" />
                  <Text as="span" hideBelow="sm">
                    Chess7ed
                  </Text>
                </RouterLink>
              </Link>
              <FakeBackendBadge />
            </HStack>

            {user && (
              <HStack as="nav" aria-label="Main" gap="1" flex="1">
                <NavItem to="/" end>
                  Lobby
                </NavItem>
                <NavItem to="/history">History</NavItem>
              </HStack>
            )}

            {user && (
              <HStack gap="3" ms="auto">
                {signOut.isError && (
                  <Text
                    color="fg.error"
                    fontSize="sm"
                    role="alert"
                    hideBelow="md"
                  >
                    Sign-out failed. Try again.
                  </Text>
                )}
                <HStack gap="2" hideBelow="sm">
                  <Avatar.Root size="xs" colorPalette="brand">
                    <Avatar.Fallback name={user.userName} />
                  </Avatar.Root>
                  <Text fontWeight="medium" hideBelow="md">
                    {user.userName}
                  </Text>
                </HStack>
                <Button
                  size={{ base: 'xs', sm: 'sm' }}
                  variant="ghost"
                  rounded="full"
                  colorPalette={signOut.isError ? 'danger' : undefined}
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

      <Container as="main" pt="10" pb="20">
        <Outlet />
      </Container>

      <ThemeSwitch />
    </Box>
  );
}

function NavItem({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      asChild
      px={{ base: '2', sm: '3' }}
      py="1.5"
      rounded="full"
      fontWeight="medium"
      color="fg.muted"
      textDecoration="none"
      _hover={{ bg: 'bg.muted', textDecoration: 'none' }}
      css={{
        '&[aria-current=page]': { bg: 'brand.subtle', color: 'brand.fg' },
      }}
    >
      <NavLink to={to} end={end}>
        {children}
      </NavLink>
    </Link>
  );
}
