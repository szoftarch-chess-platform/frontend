import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { defaultPieces } from 'react-chessboard';
import { Navigate } from 'react-router';
import { useBackend } from '../api/backend-context';
import { ConnectionBanner } from '../game/ConnectionBanner';
import { runLobbyAction, type LobbyAction } from '../game/lobby-actions';
import { useGameStore } from '../game/store';
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
      {/* The band spans the whole window, out of the container of the layout. */}
      <Box
        mx="calc(50% - 50vw)"
        mt="-10"
        py={{ base: '10', lg: '14' }}
        bg="hero.bg"
        color="hero.fg"
      >
        <Container>
          <Grid
            templateColumns={{ base: '1fr', lg: 'auto 1fr' }}
            gap={{ base: '10', lg: '14' }}
            alignItems="center"
            maxW="6xl"
          >
            <HeroBoard />

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

              <Choice
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
              </Choice>

              <Choice
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
              </Choice>
            </Stack>
          </Grid>
        </Container>
      </Box>

      <RecentGames />
    </Stack>
  );
}

function Choice({
  tone,
  piece,
  title,
  text,
  children,
}: {
  tone: 'light' | 'dark';
  piece: 'bN' | 'wK';
  title: ReactNode;
  text: string;
  children: ReactNode;
}) {
  return (
    <Flex
      gap="5"
      align="center"
      wrap="wrap"
      bg="bg"
      color="fg"
      p="5"
      rounded="2xl"
      shadow="lg"
    >
      <Flex
        aria-hidden
        boxSize="16"
        p="1.5"
        rounded="xl"
        bg={tone === 'light' ? 'board.light' : 'board.dark'}
      >
        {defaultPieces[piece]()}
      </Flex>
      <Stack gap="1" flex="1" minW="48">
        <Heading as="h2" size="lg">
          {title}
        </Heading>
        <Text color="fg.muted">{text}</Text>
      </Stack>
      {children}
    </Flex>
  );
}
