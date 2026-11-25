import type { GameDetails } from '../types/platform';
import type { BotPlayer, UserPlayer } from '../types/shared';

// The examples of platform-service.openapi.yaml, typed, so an example that no longer matches a
// type fails the type check. The moves of the bot game are not in the contract and are made up.

/** The password of the example users, from the examples of the sign-in. */
export const EXAMPLE_PASSWORD = 'correct horse battery';

export const exampleUsers = [
  {
    id: '0193c2b4-7d3e-7c2a-9f1e-3b5a6c7d8e9f',
    userName: 'alice',
    email: 'alice@example.com',
    password: EXAMPLE_PASSWORD,
  },
  {
    id: '0193c2b5-1f2e-7d3c-8b4a-5c6d7e8f9a0b',
    userName: 'bob',
    email: 'bob@example.com',
    password: EXAMPLE_PASSWORD,
  },
];

const alice: UserPlayer = {
  kind: 'user',
  userId: exampleUsers[0].id,
  name: 'alice',
};
const bob: UserPlayer = {
  kind: 'user',
  userId: exampleUsers[1].id,
  name: 'bob',
};
const bot: BotPlayer = { kind: 'bot', name: 'Stockfish bot' };

export const exampleGames: GameDetails[] = [
  {
    id: '0193c2cf-3c4d-7e5f-8a6b-7c8d9e0f1a2b',
    variant: 'standard',
    white: bot,
    black: alice,
    result: 'whiteWon',
    reason: 'resignation',
    startedAt: '2026-11-20T15:09:30.000Z',
    endedAt: '2026-11-20T15:10:05.000Z',
    timeControl: { initialMs: 600000 },
    moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'],
  },
  {
    id: '0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f',
    variant: 'standard',
    white: alice,
    black: bob,
    result: 'whiteWon',
    reason: 'checkmate',
    startedAt: '2026-11-20T14:01:40.120Z',
    endedAt: '2026-11-20T14:03:12.345Z',
    timeControl: { initialMs: 600000 },
    moves: ['e2e4', 'e7e5', 'd1h5', 'b8c6', 'f1c4', 'g8f6', 'h5f7'],
  },
];
