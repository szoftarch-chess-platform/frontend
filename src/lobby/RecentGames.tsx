import {
  Box,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router';
import { useBackend } from '../api/backend-context';
import type { GameSummary } from '../api/types/platform';
import type { Uuid } from '../api/types/shared';
import { useCurrentUser } from '../auth/current-user';
import { colorOf, outcomeFor, reasonText } from '../game/outcome';
import { OutcomeBadge } from '../game/OutcomeBadge';

const RECENT_COUNT = 3;

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function RecentGames() {
  const { games } = useBackend();
  const { data: user } = useCurrentUser();
  const recent = useQuery({
    queryKey: ['games', 'recent'],
    queryFn: () => games.list(1, RECENT_COUNT),
  });

  return (
    <Stack gap="4" maxW="6xl">
      <HStack justify="space-between">
        <Heading as="h2" size="lg">
          Recent games
        </Heading>
        <Link asChild colorPalette="brand" fontWeight="medium">
          <RouterLink to="/history">All games</RouterLink>
        </Link>
      </HStack>

      {recent.isError && (
        <Text color="fg.muted">Your recent games could not be loaded.</Text>
      )}
      {recent.data?.items.length === 0 && (
        <Text color="fg.muted">
          Your finished games appear here, the games against the computer too.
        </Text>
      )}
      {user && recent.data && recent.data.items.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: RECENT_COUNT }} gap="4">
          {recent.data.items.map((game) => (
            <GameCard key={game.id} game={game} userId={user.id} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

function GameCard({ game, userId }: { game: GameSummary; userId: Uuid }) {
  const color = colorOf(game, userId);
  const opponent = color === 'white' ? game.black : game.white;
  const outcome = outcomeFor(game.result, color);
  const reason = reasonText(game.reason);

  return (
    <Link
      asChild
      display="block"
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
    >
      <RouterLink to={`/history/${game.id}`}>
        <Box
          bg="bg"
          p="5"
          rounded="xl"
          borderWidth="1px"
          transition="box-shadow 0.15s"
          _hover={{ shadow: 'md' }}
        >
          <Stack gap="2">
            <HStack justify="space-between">
              <OutcomeBadge outcome={outcome} />
              <Text fontSize="sm" color="fg.muted">
                {dateFormat.format(new Date(game.endedAt))}
              </Text>
            </HStack>
            <Text fontWeight="semibold">vs {opponent.name}</Text>
            <Text fontSize="sm" color="fg.muted">
              With {color}
              {reason && `, ${reason}`}
            </Text>
          </Stack>
        </Box>
      </RouterLink>
    </Link>
  );
}
