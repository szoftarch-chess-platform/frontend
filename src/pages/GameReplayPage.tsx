import {
  Alert,
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Link,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router';
import { ApiError } from '../api/api-error';
import { shouldRetry } from '../app/query-client';
import { useBackend } from '../api/backend-context';
import type { GameDetails } from '../api/types/platform';
import { useCurrentUser } from '../auth/current-user';
import { ChessBoard } from '../game/ChessBoard';
import {
  colorOf,
  OUTCOME_TEXT,
  OUTCOME_TOKEN,
  outcomeFor,
  reasonText,
} from '../game/outcome';
import { checkedKing, positionsOf } from '../game/rules';
import { HeroBand } from '../layout/HeroBand';

// A game reaches the history through the message broker, so right after its end it may be missing.
const JUST_ENDED_RETRIES = 5;

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function GameReplayPage() {
  const { gameId = '' } = useParams();
  const { games } = useBackend();
  const justEnded = (useLocation().state as { justEnded?: boolean } | null)
    ?.justEnded;
  const game = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => games.get(gameId),
    staleTime: Infinity,
    retry: (count, error) =>
      (!!justEnded &&
        error instanceof ApiError &&
        error.status === 404 &&
        count < JUST_ENDED_RETRIES) ||
      shouldRetry(count, error),
    retryDelay: 1000,
  });

  if (game.data) {
    return <Replay game={game.data} />;
  }
  return (
    <HeroBand board={null}>
      <Stack gap="4">
        <Heading as="h1" size="3xl" letterSpacing="tight">
          Finished game
        </Heading>
        {game.isError ? (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>
              {game.error instanceof ApiError && game.error.status === 404
                ? 'This game does not exist, or you did not play it.'
                : 'The game could not be loaded.'}
            </Alert.Title>
          </Alert.Root>
        ) : (
          <Spinner aria-label="Loading" />
        )}
        <Link asChild color="hero.fg" fontWeight="medium">
          <RouterLink to="/history">All games</RouterLink>
        </Link>
      </Stack>
    </HeroBand>
  );
}

function Replay({ game }: { game: GameDetails }) {
  const { data: user } = useCurrentUser();
  const positions = positionsOf(game.moves);
  const last = game.moves.length;
  const [ply, setPly] = useState(last);
  const go = (next: number) => setPly(Math.max(0, Math.min(last, next)));

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const step: Record<string, (current: number) => number> = {
        ArrowLeft: (current) => current - 1,
        ArrowRight: (current) => current + 1,
        Home: () => 0,
        End: () => last,
      };
      if (step[event.key]) {
        event.preventDefault();
        setPly((current) =>
          Math.max(0, Math.min(last, step[event.key](current))),
        );
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [last]);

  const color = user ? colorOf(game, user.id) : 'white';
  const opponent = color === 'white' ? game.black : game.white;
  const outcome = outcomeFor(game.result, color);
  const fen = positions[ply];

  return (
    <HeroBand
      asideWidth="24rem"
      board={
        <ChessBoard
          id="replay-board"
          fen={fen}
          size="min(40rem, calc(100vh - 13rem))"
          orientation={color}
          lastMove={game.moves[ply - 1]}
          check={checkedKing(fen)}
        />
      }
    >
      <Stack gap="6">
        <Stack gap="4">
          <Heading as="h1" size="3xl" letterSpacing="tight">
            Game against {opponent.name}
          </Heading>
          <HStack gap="3" wrap="wrap">
            <Badge
              size="lg"
              bg={`outcome.${OUTCOME_TOKEN[outcome]}.bg`}
              color={`outcome.${OUTCOME_TOKEN[outcome]}.fg`}
            >
              {OUTCOME_TEXT[outcome]}
            </Badge>
            <Text>{reasonText(game.reason)}</Text>
          </HStack>
          <Text color="hero.fg" opacity="0.8">
            You played {color}, the game ended on{' '}
            {dateFormat.format(new Date(game.endedAt))}.
          </Text>
        </Stack>

        <Stack gap="4" bg="bg" color="fg" p="5" rounded="2xl" shadow="lg">
          <HStack justify="space-between">
            <Heading as="h2" size="lg">
              Moves
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              Move {ply} of {last}
            </Text>
          </HStack>
          <MoveList moves={game.moves} ply={ply} onSelect={setPly} />
          <HStack gap="2" justify="center">
            <StepButton
              label="First move"
              disabled={ply === 0}
              onClick={() => go(0)}
            >
              «
            </StepButton>
            <StepButton
              label="Previous move"
              disabled={ply === 0}
              onClick={() => go(ply - 1)}
            >
              ‹
            </StepButton>
            <StepButton
              label="Next move"
              disabled={ply === last}
              onClick={() => go(ply + 1)}
            >
              ›
            </StepButton>
            <StepButton
              label="Last move"
              disabled={ply === last}
              onClick={() => go(last)}
            >
              »
            </StepButton>
          </HStack>
        </Stack>

        <HStack gap="3">
          <Button asChild colorPalette="brand" variant="subtle" rounded="full">
            <RouterLink to="/">Back to lobby</RouterLink>
          </Button>
          <Link asChild color="hero.fg" fontWeight="medium">
            <RouterLink to="/history">All games</RouterLink>
          </Link>
        </HStack>
      </Stack>
    </HeroBand>
  );
}

/** The moves in UCI, numbered in pairs of white and black. A move opens its position. */
function MoveList({
  moves,
  ply,
  onSelect,
}: {
  moves: string[];
  ply: number;
  onSelect: (ply: number) => void;
}) {
  if (moves.length === 0) {
    return <Text color="fg.muted">The game ended before the first move.</Text>;
  }
  return (
    <Box maxH="15rem" overflowY="auto">
      <Grid
        templateColumns="2.5rem 1fr 1fr"
        rowGap="1"
        fontVariantNumeric="tabular-nums"
      >
        {Array.from({ length: Math.ceil(moves.length / 2) }, (_, row) => (
          <MoveRow
            key={row}
            row={row}
            moves={moves}
            ply={ply}
            onSelect={onSelect}
          />
        ))}
      </Grid>
    </Box>
  );
}

function MoveRow({
  row,
  moves,
  ply,
  onSelect,
}: {
  row: number;
  moves: string[];
  ply: number;
  onSelect: (ply: number) => void;
}) {
  return (
    <>
      <Text color="fg.muted" alignSelf="center">
        {row + 1}.
      </Text>
      {[row * 2, row * 2 + 1].map((index) =>
        index < moves.length ? (
          <Button
            key={index}
            size="sm"
            variant={ply === index + 1 ? 'subtle' : 'ghost'}
            colorPalette={ply === index + 1 ? 'brand' : undefined}
            justifyContent="flex-start"
            aria-current={ply === index + 1 ? 'step' : undefined}
            onClick={() => onSelect(index + 1)}
          >
            {moves[index]}
          </Button>
        ) : (
          <Box key={index} />
        ),
      )}
    </>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <Button
      aria-label={label}
      variant="outline"
      rounded="full"
      fontSize="xl"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
