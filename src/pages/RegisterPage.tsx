import { Heading, Link, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

export function RegisterPage() {
  return (
    <Stack gap="4" maxW="sm">
      <Heading as="h1" size="xl">
        Register
      </Heading>
      <Text color="fg.muted">The registration form comes in step 4.</Text>
      <Text>
        Already registered?{' '}
        <Link asChild colorPalette="brand">
          <RouterLink to="/login">Sign in</RouterLink>
        </Link>
      </Text>
    </Stack>
  );
}
