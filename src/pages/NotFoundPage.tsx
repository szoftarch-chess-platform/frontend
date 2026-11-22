import { Heading, Link, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

export function NotFoundPage() {
  return (
    <Stack gap="4">
      <Heading as="h1" size="xl">
        Page not found
      </Heading>
      <Text>
        <Link asChild colorPalette="brand">
          <RouterLink to="/">Back to the start</RouterLink>
        </Link>
      </Text>
    </Stack>
  );
}
