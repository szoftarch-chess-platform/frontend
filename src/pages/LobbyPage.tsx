import {
  Alert,
  Badge,
  Button,
  Heading,
  HStack,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import { useBackend } from '../api/backend-context';
import { ConnectionBanner } from '../game/ConnectionBanner';
import { runLobbyAction, type LobbyAction } from '../game/lobby-actions';
import { useGameStore } from '../game/store';
import { HeroBand } from '../layout/HeroBand';
import { PieceCard } from '../layout/PieceCard';
import { HeroBoard } from '../lobby/HeroBoard';
import { RecentGames } from '../lobby/RecentGames';

const RULES = ['10 minutes each', 'Random colors', 'Stockfish as the computer'];

export function LobbyPage() {
  const { gameSocket } = useBackend();
  const connection = useGameStore((store) => store.connection);
  const status = useGameStore((store) => store.status);
  const action = useMutation({
    mutationFn: (lobbyAction: LobbyAction) =>
      runLobbyAction(gameSocket, lobbyAction),
  });

  if (status === 'playing') {
    return <Navigate to="/game" replace />;
  }

  const ready = connection === 'connected' && !action.isPending;
  const pending = (lobbyAction: LobbyAction) =>
    action.isPending && action.variables === lobbyAction;
  const queued = status === 'queued';

  return (
    <Stack gap="10">
      <HeroBand board={<HeroBoard />}>
        <Stack gap="6">
          <Stack gap="4">
            <Heading as="h1" size="5xl" letterSpacing="tight">
              Start a game
            </Heading>
            <HStack gap="2" wrap="wrap">
              {RULES.map((rule) => (
                <Badge
                  key={rule}
                  size="lg"
                  rounded="full"
                  px="3"
                  bg="hero.subtle"
                  color="hero.fg"
                >
                  {rule}
                </Badge>
              ))}
            </HStack>
          </Stack>

          <ConnectionBanner />
          {action.isError && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>
                The game server could not do that. Try again.
              </Alert.Title>
            </Alert.Root>
          )}

          <PieceCard
            tone="light"
            piece="bN"
            title={
              queued ? (
                <HStack gap="2">
                  <Spinner size="sm" />
                  Searching for an opponent…
                </HStack>
              ) : (
                'Play a person'
              )
            }
            text={
              queued
                ? 'The game starts when another player is searching.'
                : 'You play the next player who is searching.'
            }
          >
            {queued ? (
              <Button
                variant="outline"
                rounded="full"
                disabled={!ready}
                loading={pending('leaveQueue')}
                onClick={() => action.mutate('leaveQueue')}
              >
                Stop searching
              </Button>
            ) : (
              <Button
                colorPalette="brand"
                rounded="full"
                disabled={!ready}
                loading={pending('joinQueue')}
                onClick={() => action.mutate('joinQueue')}
              >
                Find an opponent
              </Button>
            )}
          </PieceCard>

          <PieceCard
            tone="dark"
            piece="wK"
            title="Play the computer"
            text="The game starts at once, and only your clock runs."
          >
            <Button
              colorPalette="brand"
              variant="subtle"
              rounded="full"
              disabled={!ready || queued}
              loading={pending('startBotGame')}
              onClick={() => action.mutate('startBotGame')}
            >
              Start the game
            </Button>
          </PieceCard>
        </Stack>
      </HeroBand>

      <RecentGames />
    </Stack>
  );
}
