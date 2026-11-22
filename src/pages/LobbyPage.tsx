import { Heading, Stack, Text } from '@chakra-ui/react';

export function LobbyPage() {
  return (
    <Stack gap="4">
      <Heading as="h1" size="xl">
        Lobby
      </Heading>
      <Text color="fg.muted">
        Finding an opponent and playing the bot come in step 6.
      </Text>
    </Stack>
  );
}
