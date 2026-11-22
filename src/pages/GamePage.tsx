import { Heading, Stack, Text } from '@chakra-ui/react';

export function GamePage() {
  return (
    <Stack gap="4">
      <Heading as="h1" size="xl">
        Game
      </Heading>
      <Text color="fg.muted">
        The board, the clocks and the result come in step 7.
      </Text>
    </Stack>
  );
}
