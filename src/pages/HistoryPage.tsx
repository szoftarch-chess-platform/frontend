import {
  Alert,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  Heading,
  IconButton,
  Pagination,
  Skeleton,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { defaultPieces } from 'react-chessboard';
import {
  Navigate,
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { useBackend } from '../api/backend-context';
import type { GameSummary } from '../api/types/platform';
import type { Color, Uuid } from '../api/types/shared';
import { useCurrentUser } from '../auth/current-user';
import { OutcomeBadge } from '../game/OutcomeBadge';
import { colorOf, outcomeFor, reasonText } from '../game/outcome';
import { HeroBand } from '../layout/HeroBand';
import { parsePageParam } from '../routing/page-param';

// The default page size of `GET /api/games`.
export const HISTORY_PAGE_SIZE = 20;

// How far the list reaches up over the green band.
const OVERLAP = '4rem';

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function historyUrl(page: number): string {
  return page === 1 ? '/history' : `/history?page=${page}`;
}

export function HistoryPage() {
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get('page'));
  const navigate = useNavigate();
  const { games } = useBackend();
  const { data: user } = useCurrentUser();
  const list = useQuery({
    queryKey: ['games', page],
    queryFn: () => games.list(page, HISTORY_PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  const data = list.data;
  // A page past the last one, for example from an old link, opens the last page.
  if (data && !list.isPlaceholderData && data.items.length === 0 && page > 1) {
    const last = Math.max(1, Math.ceil(data.totalCount / HISTORY_PAGE_SIZE));
    return <Navigate to={historyUrl(last)} replace />;
  }

  return (
    <Stack gap="0">
      <HeroBand board={null} overlap={OVERLAP}>
        <Stack gap="4">
          <Heading as="h1" size="5xl" letterSpacing="tight">
            History
          </Heading>
          {data && data.totalCount > 0 && (
            <Badge
              alignSelf="start"
              size="lg"
              rounded="full"
              px="3"
              bg="hero.subtle"
              color="hero.fg"
            >
              {data.totalCount === 1
                ? '1 finished game'
                : `${data.totalCount} finished games`}
            </Badge>
          )}
        </Stack>
      </HeroBand>

      <Box
        position="relative"
        mt={`-${OVERLAP}`}
        maxW="6xl"
        bg="bg"
        color="fg"
        rounded="2xl"
        shadow="lg"
        overflow="hidden"
      >
        {list.isPending && <LoadingRows />}

        {list.isError && !data && (
          <Box p="5">
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>Your games could not be loaded.</Alert.Title>
            </Alert.Root>
          </Box>
        )}

        {data?.totalCount === 0 && <NoGames />}

        {user && data && data.items.length > 0 && (
          <>
            <Box
              as="ol"
              listStyleType="none"
              opacity={list.isPlaceholderData ? 0.5 : 1}
              transition="opacity 0.15s"
              aria-busy={list.isPlaceholderData}
            >
              {data.items.map((game) => (
                <GameRow key={game.id} game={game} userId={user.id} />
              ))}
            </Box>

            {data.totalCount > HISTORY_PAGE_SIZE && (
              <Flex justify="center" borderTopWidth="1px" py="4" px="2">
                <Pagination.Root
                  count={data.totalCount}
                  pageSize={HISTORY_PAGE_SIZE}
                  page={page}
                  onPageChange={(details) => navigate(historyUrl(details.page))}
                >
                  <ButtonGroup variant="ghost" size="sm" gap="1">
                    <Pagination.PrevTrigger asChild>
                      <IconButton aria-label="Previous page" rounded="full">
                        ‹
                      </IconButton>
                    </Pagination.PrevTrigger>
                    <Pagination.Items
                      render={(item) => (
                        <IconButton
                          aria-label={`Page ${item.value}`}
                          rounded="full"
                          colorPalette="brand"
                          variant={{ base: 'ghost', _selected: 'solid' }}
                        >
                          {item.value}
                        </IconButton>
                      )}
                    />
                    <Pagination.NextTrigger asChild>
                      <IconButton aria-label="Next page" rounded="full">
                        ›
                      </IconButton>
                    </Pagination.NextTrigger>
                  </ButtonGroup>
                </Pagination.Root>
              </Flex>
            )}
          </>
        )}
      </Box>
    </Stack>
  );
}

/** A king on a square of the board in the color that the user played, as on the lobby cards. */
function ColorTile({ color, size }: { color: Color; size: string }) {
  return (
    <Flex
      aria-hidden
      boxSize={size}
      flexShrink="0"
      p="1"
      rounded="lg"
      bg={color === 'white' ? 'board.dark' : 'board.light'}
    >
      {defaultPieces[color === 'white' ? 'wK' : 'bK']()}
    </Flex>
  );
}

/** A game that opens its replay, with the color of the user, the opponent, the end and the date. */
function GameRow({ game, userId }: { game: GameSummary; userId: Uuid }) {
  const color = colorOf(game, userId);
  const opponent = color === 'white' ? game.black : game.white;
  const date = dateFormat.format(new Date(game.endedAt));

  return (
    <Box as="li" _notFirst={{ borderTopWidth: '1px' }}>
      <Grid
        asChild
        templateColumns={{ base: 'auto 1fr auto', md: 'auto 1fr auto 6rem' }}
        alignItems="center"
        columnGap={{ base: '4', md: '6' }}
        px={{ base: '4', md: '6' }}
        py="3"
        _hover={{ bg: 'bg.muted' }}
        _focusVisible={{
          outline: '2px solid',
          outlineColor: 'brand.focusRing',
          outlineOffset: '-2px',
        }}
      >
        <RouterLink to={`/history/${game.id}`}>
          <ColorTile color={color} size="11" />
          <Stack gap="0" minW="0">
            <Text fontWeight="semibold" truncate>
              {opponent.name}
            </Text>
            <Text fontSize="sm" color="fg.muted" truncate>
              <VisuallyHidden>You played {color}, </VisuallyHidden>
              {reasonText(game.reason)}
            </Text>
            <Text hideFrom="md" fontSize="sm" color="fg.muted">
              {date}
            </Text>
          </Stack>
          <Text
            hideBelow="md"
            fontSize="sm"
            color="fg.muted"
            fontVariantNumeric="tabular-nums"
          >
            {date}
          </Text>
          <Box justifySelf="end">
            <OutcomeBadge outcome={outcomeFor(game.result, color)} />
          </Box>
        </RouterLink>
      </Grid>
    </Box>
  );
}

function LoadingRows() {
  return (
    <Stack gap="0" aria-label="Loading" aria-busy>
      {Array.from({ length: 5 }, (_, row) => (
        <Flex
          key={row}
          gap="4"
          align="center"
          px={{ base: '4', md: '6' }}
          py="3"
          _notFirst={{ borderTopWidth: '1px' }}
        >
          <Skeleton boxSize="11" rounded="lg" />
          <Stack gap="2" flex="1">
            <Skeleton height="4" width="40%" />
            <Skeleton height="3" width="25%" />
          </Stack>
          <Skeleton height="6" width="16" />
        </Flex>
      ))}
    </Stack>
  );
}

function NoGames() {
  return (
    <Flex gap="5" align="center" wrap="wrap" p={{ base: '5', md: '6' }}>
      <ColorTile color="white" size="16" />
      <Stack gap="1" flex="1" minW="48">
        <Heading as="h2" size="lg">
          No finished games yet
        </Heading>
        <Text color="fg.muted">
          Your games appear here when they end, the games against the computer
          too.
        </Text>
      </Stack>
      <Button asChild colorPalette="brand" rounded="full">
        <RouterLink to="/">Start a game</RouterLink>
      </Button>
    </Flex>
  );
}
