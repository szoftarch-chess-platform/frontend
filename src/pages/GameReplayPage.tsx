import { Heading, Stack, Text } from '@chakra-ui/react';
import { useParams } from 'react-router';

export function GameReplayPage() {
  const { gameId } = useParams();

  return (
    <Stack gap="4">
      <Heading as="h1" size="xl">
        Finished game
      </Heading>
      <Text fontFamily="mono">{gameId}</Text>
      <Text color="fg.muted">The replay comes in step 8.</Text>
    </Stack>
  );
}
