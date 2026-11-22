import { Button, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router';
import type { CurrentUser } from '../api/types/platform';
import { currentUserQueryKey } from '../auth/current-user';

// The user of the temporary sign-in, taken from the example of `GET /api/users/me` in the
// contract.
const demoUser: CurrentUser = {
  id: '0193c2b4-7d3e-7c2a-9f1e-3b5a6c7d8e9f',
  userName: 'alice',
};

export function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Temporary until the sign-in form exists (step 4). It writes the user into the cache like
  // the real sign-in will (FE-ADR-5).
  const signInAsDemoUser = () => {
    queryClient.setQueryData(currentUserQueryKey, demoUser);
    navigate('/', { replace: true });
  };

  return (
    <Stack gap="4" maxW="sm">
      <Heading as="h1" size="xl">
        Sign in
      </Heading>
      <Text color="fg.muted">The sign-in form comes in step 4.</Text>
      <Button colorPalette="brand" onClick={signInAsDemoUser}>
        Sign in as {demoUser.userName}
      </Button>
      <Text>
        No account yet?{' '}
        <Link asChild colorPalette="brand">
          <RouterLink to="/register">Register</RouterLink>
        </Link>
      </Text>
    </Stack>
  );
}
